export type ActiveTab =
  | 'home'
  | 'about'
  | 'solutions'
  | 'technology'
  | 'case-studies'
  | 'blog'
  | 'careers'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'admin';

export interface Solution {
  id: string;
  type: 'product' | 'service';
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  iconName: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: { value: string; label: string }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
}

export interface CareerOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  experience: string;
  description: string;
  requirements: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
