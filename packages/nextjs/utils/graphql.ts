import { gql, request } from "graphql-request";
import { DeveloperForTable } from "~~/components/BuildersTable";
import { PONDER_GRAPHQL_URL } from "~~/scaffold.config";
import { AttestationsData, Developer, SearchData, SkillsData } from "~~/types";

type DeveloperResponse = {
  developer: Developer;
};

export const fetchAttestations = async (pageSize: number = 20, cursor?: string) => {
  const AttestationsQuery = gql`
    query Attestations($limit: Int!, $after: String) {
      attestations(limit: $limit, after: $after, orderBy: "timestamp", orderDirection: "desc") {
        items {
          id
          attester
          uid
          githubUser
          skills
          description
          evidences
          timestamp
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  const variables: any = { limit: pageSize };
  if (cursor) variables.after = cursor;

  const data = await request<AttestationsData>(PONDER_GRAPHQL_URL, AttestationsQuery, variables);
  return data;
};

export const fetchUserAttestations = async (
  githubUser: string,
  pageSize: number = 10,
  cursor?: string,
): Promise<AttestationsData> => {
  const attestationsQuery = gql`
    query UserAttestations($githubUser: String!, $limit: Int!, $after: String) {
      attestations(
        where: { githubUser: $githubUser }
        limit: $limit
        after: $after
        orderBy: "timestamp"
        orderDirection: "desc"
      ) {
        items {
          id
          attester
          uid
          skills
          description
          evidences
          evidencesVerified
          evidencesCollaborator
          timestamp
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  const variables: any = {
    githubUser: githubUser.toLowerCase(),
    limit: pageSize,
  };

  if (cursor) {
    variables.after = cursor;
  }

  const data = await request<AttestationsData>(PONDER_GRAPHQL_URL, attestationsQuery, variables);

  return data;
};

export const fetchUserSkills = async (githubUser: string): Promise<SkillsData> => {
  const skillsQuery = gql`
    query UserSkills($githubUser: String!) {
      developerSkills(where: { githubUser: $githubUser }, orderBy: "score", orderDirection: "desc") {
        items {
          skill
          count
          verifiedCount
          collaboratorCount
          score
        }
      }
    }
  `;

  const data = await request<SkillsData>(PONDER_GRAPHQL_URL, skillsQuery, {
    githubUser: githubUser.toLowerCase(),
  });

  return data;
};

export const fetchDeveloper = async (githubUser: string): Promise<Developer> => {
  const developerQuery = gql`
    query Developer($githubUser: String!) {
      developer(githubUser: $githubUser) {
        githubUser
        name
        bio
        location
        website
        twitter
        attestationsCount
        verifiedAttestationsCount
        colaboratorAttestationsCount
        score
        updatedAt
        skills(orderBy: "count", orderDirection: "desc") {
          items {
            skill
            count
            score
          }
        }
        attestations(orderBy: "timestamp", orderDirection: "desc", limit: 5) {
          items {
            id
            attester
            uid
            skills
            description
            evidences
            evidencesVerified
            evidencesCollaborator
            timestamp
          }
        }
      }
    }
  `;

  const data = await request<DeveloperResponse>(PONDER_GRAPHQL_URL, developerQuery, {
    githubUser: githubUser.toLowerCase(),
  });

  return data.developer;
};

export const searchDevelopers = async (githubUsername: string): Promise<SearchData> => {
  const searchQuery = gql`
    query SearchDevelopers($githubUser: String!) {
      developers(where: { githubUser_contains: $githubUser }) {
        items {
          githubUser
          skills {
            items {
              skill
              count
              score
            }
          }
          attestations {
            items {
              id
            }
          }
        }
      }
    }
  `;

  const data = await request<SearchData>(PONDER_GRAPHQL_URL, searchQuery, {
    githubUser: githubUsername.toLowerCase(),
  });

  return data;
};

type DevPage = {
  developers: DeveloperForTable[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
};

export const fetchDevelopersForTable = async (pageSize: number = 20, cursor?: string): Promise<DevPage> => {
  const DevelopersForTable = gql`
    query DevelopersForTable($limit: Int!, $after: String, $since: Int!) {
      developers(limit: $limit, after: $after, orderBy: "githubUser", orderDirection: "asc") {
        items {
          githubUser
          skills {
            items {
              skill
            }
          }
          attestations(where: { timestamp_gte: $since }) {
            totalCount
            items {
              attester
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const THIRTY_DAYS = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const variables: { limit: number; since: number; after?: string } = { limit: pageSize, since: THIRTY_DAYS };
  if (cursor) variables.after = cursor;

  const data = await request<any>(PONDER_GRAPHQL_URL, DevelopersForTable, variables);

  const items = data?.developers?.items ?? [];

  const developers: DeveloperForTable[] = items.map((d: any) => {
    const username = (d.githubUser ?? "").trim();

    const skills: string[] = Array.from(new Set((d.skills?.items ?? []).map((s: any) => s?.skill).filter(Boolean)));

    const attesters: string[] = Array.from(
      new Set((d.attestations?.items ?? []).map((a: any) => a?.attester).filter(Boolean)),
    );

    const monthlyTotal = d?.attestations?.totalCount ?? 0;

    return {
      name: username,
      username,
      avatar: `https://github.com/${username}.png`,
      githubUrl: `https://github.com/${username}`,
      monthlyAttestations: monthlyTotal,
      skills,
      attestations: {
        total: monthlyTotal,
        verified: 0,
      },
      topCollaborators: attesters,
    };
  });

  developers.sort((a, b) =>
    b.attestations.total !== a.attestations.total
      ? b.attestations.total - a.attestations.total
      : a.username.localeCompare(b.username),
  );

  return {
    developers,
    pageInfo: data?.developers?.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
};
