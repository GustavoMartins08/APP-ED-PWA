
export type NewsSource = 'Reddit' | 'LinkedIn' | 'YouTube' | 'Web';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source: NewsSource;
  timestamp: string;
  imageUrl: string;
  content?: string;
  keyPoints?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  savedArticles: string[];
}

export interface NewsletterEdition {
  id: string;
  title: string;
  date: string;
  coverImage: string;
  synthesis: string;
  pdfUrl?: string;
  items: NewsItem[];
}

export interface Editorial {
  id: string;
  monthYear: string;
  theme: string;
  imageUrl: string;
  summary?: string;
  pdfUrl?: string; // URL para o arquivo PDF do dossiê
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  platform: string;
  imageUrl: string;
  category: string;
}

export interface Columnist {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  bio: string;
}

export interface NewsletterSubscription {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
}

export interface AdvertiserInquiry {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  email: string;
  interestArea: string;
  message?: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  timestamp: string;
}
