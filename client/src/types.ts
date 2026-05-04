// ── Shared types ────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthData {
  token: string;
  expiresIn: number;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}
