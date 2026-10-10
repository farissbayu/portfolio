export interface PersonalInformation {
  name: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  period: string;
  location: string;
  responsibilities: string[];
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface Project {
  name: string;
  role: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  link?: string;
}

export interface Achievement {
  title: string;
  year: number;
  role: string;
  technology: string;
}

export interface Education {
  institution: string;
  location: string;
  degree?: string;
  program?: string;
  period: string;
  gpa?: string;
  details?: string[];
}

export interface Skills {
  frontend: string[];
  backend: string[];
  database: string[];
  ai_and_llm: string[];
  infrastructure: string[];
}

export interface Portfolio {
  personal_information: PersonalInformation;
  profile: string;
  work_experience: WorkExperience[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
  skills: Skills;
}
