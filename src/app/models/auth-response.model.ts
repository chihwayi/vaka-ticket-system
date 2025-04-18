export interface AuthResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
  }
  
  export interface AuthRequest {
    username: string;
    password: string;
  }
