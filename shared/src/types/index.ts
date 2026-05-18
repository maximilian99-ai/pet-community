// ==============================
// Core Domain Types
// ==============================

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
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

// ==============================
// API Response Types
// ==============================

export interface AuthResponse {
  token: string;
  user: Omit<User, 'createdAt'> & { email: string };
}

export interface PostsResponse {
  posts: Post[];
  total: number;
}

export interface ProfileResponse {
  user: User;
  pets: Pet[];
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

// ==============================
// API Request Types
// ==============================

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  image?: string;
  petId?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  image?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  image?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  bio?: string;
}
