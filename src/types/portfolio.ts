// Shape of src/data/portfolio.json. The components read the JSON directly and
// infer their types from it; this file is the human-readable schema.

export interface Meta {
  title: string;
  description: string;
  keywords: string[];
  author: string;
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
  /** square photo used on the About ID card */
  profilePicture: string;
  /** transparent cut-out PNG composited in the hero */
  portrait: string;
  /** cycled through the hero's role slot */
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
  /** key into each section's icon map: github | linkedin | instagram | google | discord | telegram */
  icon: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  score: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  logo: string;
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

export interface Project {
  id: string;
  /** url-safe name; matches public/projects/<slug>/ */
  slug?: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  images: string[];
  markdownFile?: string;
  tags: string[];
  category: string;
  date: string;
  /** short label shown in the work index, e.g. "Design + Frontend" */
  role?: string;
  year?: string;
  githubUrl: string;
  liveUrl: string;
  /** present only when the project has its own case-study route */
  pageUrl?: string;
  featured: boolean;
  status: string;
}

export interface Skill {
  name: string;
  /** basename in public/images/skills/<icon>.png */
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
  /** full path, unlike Skill.icon */
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
  /** empty string renders the card as unverified */
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
  /** 1–5, rendered as chamfered ticks */
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

/**
 * Any entry whose `id` contains "placeholder" is filtered out before render,
 * so templates can sit in the JSON without appearing on the site.
 */
export interface PortfolioData {
  meta: Meta;
  basics: Basics;
  socialLinks: SocialLink[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
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
