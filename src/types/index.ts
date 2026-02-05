export interface Municipality {
  id: number;
  name: string;
  created_at: string;
}

export interface Comment {
  id: string;
  municipality_id: number;
  content: string;
  like_count: number;
  client_hash: string;
  created_at: string;
  municipality?: Municipality;
}

export interface Like {
  id: string;
  comment_id: string;
  client_hash: string;
  created_at: string;
}

export type SortType = "newest" | "oldest" | "likes" | "random";
