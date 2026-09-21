// Shape of src/data/portfolio.json; components infer types from the JSON, this is the human-readable schema.
// Projects and education live in the content tables instead: see src/types/content.ts and db/schema.sql.

export type { EducationRow as Education, ProjectRow as Project } from './content';

export interface Meta {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  siteUrl: string;
  ogImage: string;
  ogAlt: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
}

export interface Basics {
  name: string;
  headline: string;
  tagline: string;
  email: string;
  location: Location;
  profilePicture: string;
  portrait: string;
  roles: string[];
  resumeUrl: string;
  availability: string;
  bio: string;
}

export interface SocialLink {
  id: string;
  name: string;
  username: string;
  url: string;
  icon: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  type: string;
  description: string;
  highlights: string[];
  technologies: string[];
  logo: string;
  url: string;
}

export interface Skill {
  name: string;
  icon: string;
  level: number;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: Skill[];
}

export interface TechStackItem {
  name: string;
  icon: string;
}

export interface Skills {
  categories: SkillCategory[];
  techStack: TechStackItem[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
  credentialUrl: string;
  credentialId?: string;
  badge: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  date: string;
  authors: string[];
  abstract: string;
  doi: string;
  url: string;
  tags: string[];
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  logo: string;
}

export interface Workshop {
  id: string;
  name: string;
  organizer: string;
  date: string;
  description: string;
  certificateUrl: string;
}

export interface Interest {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
  level: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

/** Root shape of portfolio.json. */
export interface PortfolioData {
  meta: Meta;
  basics: Basics;
  socialLinks: SocialLink[];
  experience: Experience[];
  skills: Skills;
  certifications: Certification[];
  awards: Award[];
  publications: Publication[];
  volunteering: Volunteering[];
  workshops: Workshop[];
  interests: Interest[];
  languages: Language[];
  testimonials: Testimonial[];
}
