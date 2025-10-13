type Attestation = {
  id: string;
  attester: string;
  uid: string;
  githubUser: string;
  skills: string[];
  description: string;
  evidences: string[];
  evidencesVerified: boolean[];
  evidencesCollaborator: boolean[];
  timestamp: number;
  verified?: boolean;
};

type Skill = {
  skill: string;
  count: number;
  verifiedCount: number;
  collaboratorCount: number;
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
  name: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  attestationsCount: number;
  verifiedAttestationsCount: number;
  colaboratorAttestationsCount: number;
  score: number;
  updatedAt: number;
  skills: {
    items: {
      skill: string;
      count: number;
      verifiedCount: number;
      collaboratorCount: number;
      score: number;
    }[];
  };
  attestations: {
    items: {
      id: string;
      attester: string;
      githubUser: string;
      uid: string;
      skills: string[];
      description: string;
      evidences: string[];
      timestamp: number;
      evidencesVerified: boolean[];
      evidencesCollaborator: boolean[];
    }[];
  };
};

type DeveloperResult = {
  githubUser: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  attestationsCount: number;
  verifiedAttestationsCount: number;
  colaboratorAttestationsCount: number;
  score: number;
  updatedAt: number;
  matchedSkillsScore: number;
  skills: {
    skill: string;
    count: number;
    verifiedCount: number;
    collaboratorCount: number;
    score: number;
  }[];
};

type DeveloperResultPage = {
  data: DeveloperResult[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type SearchData = {
  developers: {
    items: Developer[];
  };
};

export type {
  Attestation,
  Skill,
  AttestationsData,
  SkillsData,
  Developer,
  SearchData,
  DeveloperResult,
  DeveloperResultPage,
};
