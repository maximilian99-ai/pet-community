export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  image?: string;
  userId: string;
  createdAt: string;
}

export interface Log {
  id: string;
  petId: string;
  type: 'feeding' | 'walk' | 'health' | 'play' | 'other';
  content: string;
  date: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string | null;
  author: User | null;
  postId: string;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  postId: string;
}

export interface Post {
  id: string;
  authorId: string | null;
  author: User | null;
  petId?: string;
  pet?: Pet;
  title: string;
  content: string;
  image?: string;
  likes: Like[];
  comments: Comment[];
  badges?: Badge[];
  likesCount?: number;
  commentsCount?: number;
  badgesCount?: number;
  _count?: {
    likes: number;
    comments: number;
    badges: number;
  };
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'createdAt'> & { email: string };
}

