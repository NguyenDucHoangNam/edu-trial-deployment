// types/survey.ts

export interface StudentProfile {
  name: string;
  topTraits: string[];
  archetype?: string;
}

export interface ReviewSnippet {
  rating: number;
  count: number;
  quote: string;
}

export interface ClubMatch {
  icon: string; // Emoji or component name
  name: string;
}

export interface AlumniSnippet {
  photoUrl?: string;
  name: string;
  details: string;
}

export interface UniversityRecommendation {
  id: string;
  name: string;
  logoUrl?: string;
  tuition: string;
  tuitionMatch: boolean;
  location: string;
  locationMatch: boolean;
  strength: string;
  review?: ReviewSnippet;
  clubs?: ClubMatch[];
  alumni?: AlumniSnippet;
  websiteUrl: string;
}

export interface MajorRecommendation {
  id: string;
  name: string;
  icon: string; // Emoji or component name
  description: string;
  fitReasons: string[];
  dayInLife?: string;
  prospects: {
    demand: string;
    salary: string;
    jobs: string[];
  };
  skills: {
    name: string;
    trialCourseLink?: string;
    externalResourceLink?: string;
  }[];
  universities: UniversityRecommendation[];
}

export interface SurveyResultsData {
  studentProfile: StudentProfile;
  recommendedMajors: MajorRecommendation[];
}