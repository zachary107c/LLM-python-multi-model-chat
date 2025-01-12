import { api } from "@/lib/api-client";

interface LoginResponse {
  token: string;
  expiry: string;
  // add any other expected response fields
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return api.post("/login/", credentials);
};