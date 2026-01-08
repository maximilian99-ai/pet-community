export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
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

export interface Post {
  id: string;
  authorId: string;
  author: User;
  petId?: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  author: User;
  postId: string;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
