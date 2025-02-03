import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { useLogin, loginInputSchema } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useLogin({
    onSuccess,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof loginInputSchema>>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginInputSchema>) {
    console.log("User submitted login data.");
    try {
      await login.mutateAsync(data);

      toast({
        title: "Welcome",
        description: "Login successful"
      });

      const from = location.state?.from?.pathname || "/";
      console.log("Redirecting to: ", from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Invalid username or password";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage + " could not be logged in!",
      });

      form.setValue("password", "");
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoComplete="username"
                    placeholder="Username"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-1 pt-4">
            <Button type="submit" className="w-full">Sign In</Button>
          </div>
        </form>
      </Form>
      <div className="flex justify-center gap-1 pt-2 text-center text-sm">
        <p className="text-muted-foreground">Don't have an account?</p>
        <Link to="/register" replace>
          Create an Account
        </Link>
      </div>
    </div>
  );
};
