
const API_URL = "http://localhost:5000/api/auth";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await authFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return response.json();
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await authFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

export const logout = async (): Promise<AuthResponse> => {
  const response = await authFetch("/logout", {
    method: "POST",
  });

  return response.json();
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await authFetch("/me", {
    method: "GET",
  });

  return response.json();
};
