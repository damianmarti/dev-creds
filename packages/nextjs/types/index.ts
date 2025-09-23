type Attestation = {
  id: string;
  attester: string;
  uid: string;
  githubUser: string;
  skills: string[];
  description: string;
  evidences: string[];
  timestamp: number;
};

type Skill = {
  skill: string;
  count: number;
  score: number;
};

type AttestationsData = {
  attestations: {
    items: Attestation[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

type SkillsData = {
  developerSkills: {
    items: Skill[];
  };
};

type Developer = {
  githubUser: string;
  description: string | null;
  skills: {
    items: {
      skill: string;
      count: number;
      score: number;
    }[];
  };
  attestations: {
    items: {
      id: string;
    }[];
  };
};

type SearchData = {
  developers: {
    items: Developer[];
  };
};

export type { Attestation, Skill, AttestationsData, SkillsData, Developer, SearchData };
