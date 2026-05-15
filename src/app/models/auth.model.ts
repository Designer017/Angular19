/**
 * Login Request Model
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login Response Model
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserInfo;
  expiresIn: number;
}

/**
 * User Information Model
 */
export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

/**
 * Authentication State Model
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
