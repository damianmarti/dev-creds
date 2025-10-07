import { gql, request } from "graphql-request";
import { PONDER_GRAPHQL_URL } from "~~/scaffold.config";
import { AttestationsData, Developer, DeveloperResultPage, SearchData, SkillsData } from "~~/types";

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

export const fetchDevelopersForTable = async ({
  pageSize,
  offset,
  skills,
  search,
}: {
  pageSize: number;
  offset?: number;
  skills?: string[];
  search?: string;
}): Promise<DeveloperResultPage> => {
  const response = await fetch(
    `${PONDER_GRAPHQL_URL}/builders?limit=${pageSize}&offset=${offset}${skills !== undefined && skills.length > 0 ? `&skills=${skills?.join("&skills=")}` : ""}${search !== undefined && search.length > 0 ? `&search=${search}` : ""}`,
  );
  const data = await response.json();
  return data;
};

export const fetchSkills = async (): Promise<string[]> => {
  const response = await fetch(`${PONDER_GRAPHQL_URL}/skills`);
  const data = await response.json();
  return data.data;
};
