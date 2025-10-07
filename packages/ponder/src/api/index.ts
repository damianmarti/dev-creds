import { ponder } from "ponder:registry";
import { graphql, count, sql, gte, eq, and, like } from "ponder";
import { developer, developerSkill } from "ponder:schema";

ponder.use("/", graphql());
ponder.use("/graphql", graphql());

ponder.get("/skills", async (c) => {
  const skills = await c.db
    .selectDistinct({
      skill: developerSkill.skill,
    })
    .from(developerSkill)
    .orderBy(developerSkill.skill);

  return c.json({
    data: skills.map((s) => s.skill),
  });
});

ponder.get("/builders", async (c) => {
  const skills = c.req.queries("skills");
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");
  const searchParam = c.req.query("search");

  const normalizedSkills =
    skills !== undefined && skills.length > 0
      ? skills.map((skill: string) => skill.toLowerCase())
      : [];
  const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default to 20 items per page
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0; // Default to first page
  const search = searchParam ? searchParam.toLowerCase() : "";

  let builders;

  let totalCount = 0;

  if (normalizedSkills.length > 0) {
    // Build WHERE conditions
    const skillsCondition = sql`${developer.githubUser} IN (
            SELECT ${developerSkill.githubUser}
            FROM ${developerSkill}
            WHERE ${developerSkill.skill} IN (${sql.join(
      normalizedSkills.map((skill) => sql`${skill}`),
      sql`, `
    )})
            GROUP BY ${developerSkill.githubUser}
            HAVING COUNT(DISTINCT ${developerSkill.skill}) = ${
      normalizedSkills.length
    }
        )`;

    const whereConditions = search
      ? and(skillsCondition, like(developer.githubUser, `%${search}%`))
      : skillsCondition;

    // Get total count for pagination metadata
    const countResult = await c.db
      .select({ count: count() })
      .from(developer)
      .where(whereConditions);
    totalCount = countResult[0]?.count || 0;

    // Find developers who have ALL the specified skills with pagination, ordered by matched skills score
    const developersWithScore = await c.db
      .select({
        githubUser: developer.githubUser,
        name: developer.name,
        bio: developer.bio,
        location: developer.location,
        website: developer.website,
        twitter: developer.twitter,
        attestationsCount: developer.attestationsCount,
        verifiedAttestationsCount: developer.verifiedAttestationsCount,
        colaboratorAttestationsCount: developer.colaboratorAttestationsCount,
        score: developer.score,
        updatedAt: developer.updatedAt,
        matchedSkillsScore:
          sql<number>`COALESCE(SUM(${developerSkill.score}), 0)`.as(
            "matchedSkillsScore"
          ),
      })
      .from(developer)
      .leftJoin(
        developerSkill,
        and(
          eq(developerSkill.githubUser, developer.githubUser),
          sql`${developerSkill.skill} IN (${sql.join(
            normalizedSkills.map((skill) => sql`${skill}`),
            sql`, `
          )})`
        )
      )
      .where(whereConditions)
      .groupBy(developer.githubUser)
      .orderBy(sql`COALESCE(SUM(${developerSkill.score}), 0) DESC`)
      .limit(limit)
      .offset(offset);

    // Fetch all skills for each developer
    const githubUsers = developersWithScore.map((d) => d.githubUser);
    const allSkills =
      githubUsers.length > 0
        ? await c.db
            .select()
            .from(developerSkill)
            .where(
              sql`${developerSkill.githubUser} IN (${sql.join(
                githubUsers.map((user) => sql`${user}`),
                sql`, `
              )})`
            )
            .orderBy(developerSkill.score)
        : [];

    // Group skills by developer
    const skillsByDeveloper: Record<string, typeof allSkills> = {};
    allSkills.forEach((skill) => {
      if (!skillsByDeveloper[skill.githubUser]) {
        skillsByDeveloper[skill.githubUser] = [];
      }
      skillsByDeveloper[skill.githubUser]?.push(skill);
    });

    // Add skills to each developer
    builders = developersWithScore.map((dev) => ({
      ...dev,
      skills: skillsByDeveloper[dev.githubUser] || [],
    }));
  } else {
    // Get total count for all developers
    const countResult = search
      ? await c.db
          .select({ count: count() })
          .from(developer)
          .where(like(developer.githubUser, `%${search}%`))
      : await c.db.select({ count: count() }).from(developer);
    totalCount = countResult[0]?.count || 0;

    // If no skills specified, return all developers with pagination, ordered by total score
    const developersData = search
      ? await c.db
          .select()
          .from(developer)
          .where(like(developer.githubUser, `%${search}%`))
          .orderBy(sql`${developer.score} DESC`)
          .limit(limit)
          .offset(offset)
      : await c.db.query.developer.findMany({
          limit: limit,
          offset: offset,
          orderBy: (developer, { desc }) => [desc(developer.score)],
        });

    // Fetch all skills for each developer
    const githubUsers = developersData.map((d) => d.githubUser);
    const allSkills =
      githubUsers.length > 0
        ? await c.db
            .select()
            .from(developerSkill)
            .where(
              sql`${developerSkill.githubUser} IN (${sql.join(
                githubUsers.map((user) => sql`${user}`),
                sql`, `
              )})`
            )
            .orderBy(developerSkill.score)
        : [];

    // Group skills by developer
    const skillsByDeveloper: Record<string, typeof allSkills> = {};
    allSkills.forEach((skill) => {
      if (!skillsByDeveloper[skill.githubUser]) {
        skillsByDeveloper[skill.githubUser] = [];
      }
      skillsByDeveloper[skill.githubUser]?.push(skill);
    });

    // Add skills to each developer
    builders = developersData.map((dev) => ({
      ...dev,
      skills: skillsByDeveloper[dev.githubUser] || [],
    }));
  }

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = offset > 0;

  return c.json({
    data: builders,
    pagination: {
      totalCount,
      totalPages,
      currentPage,
      limit,
      offset,
      hasNextPage,
      hasPreviousPage,
    },
  });
});
