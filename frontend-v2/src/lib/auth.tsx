import { configureAuth } from "react-query-auth";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthResponse, RegisterAuthResponse, User } from "@/types/api";
import { api } from "./api-client";

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("token");

  if (!token) return null;
  try {
    const response = await api.get("/user/");
    const user = response as User;
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    localStorage.removeItem("token");
    return null;
  }
};

export const loginInputSchema = z.object({
  username: z.string().min(1, "Username must be atleast 1 character long"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithUsernameAndPassword = (
  data: LoginInput
): Promise<AuthResponse> => {
  localStorage.removeItem("token");
  return api.post("/login/", data);
};

export const registerInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  password: z.string().min(5, "Password must be at least 8 characters long"),
  password2: z.string().min(5, "Password Confirmation must be at least 8 characters long"),
}).refine((data) => data.password === data.password2, {
  message: "Passwords must match",
  path: ["password2"],
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput
): Promise<RegisterAuthResponse> => {
  return api.post("/register/", data);
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithUsernameAndPassword(data);
    localStorage.setItem("token", response.token);
    const user = await getUser();
    return user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    localStorage.setItem("token", response.token);
    const user = await getUser();
    return user;
  },
  logoutFn: async (): Promise<void> => {
    console.log("Logging out the current user.");
    try {
      await api.post("/logout/");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
};

export const useUpdateUserSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: FormData;
    }): Promise<User> => {
      console.log(data);
      return api.patch(`/user/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authenticated-user"] });
    },
  });
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export const useAuthLogin = () => {
  const login = useLogin();
  const queryClient = useQueryClient();

  return {
    ...login,
    mutate: async (data: LoginInput) => {
      const user = await login.mutateAsync(data);
      await queryClient.invalidateQueries({ queryKey: ["authenticated-user"] });
      return user;
    },
  };
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  console.log("Trying to hit a protected route.");
  const user = useUser();
  if (!user.data) {
    return <Navigate to="login" replace />;
  }
  return children;
};