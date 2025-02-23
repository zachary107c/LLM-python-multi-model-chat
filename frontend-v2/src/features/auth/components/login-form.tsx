import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { useLogin, loginInputSchema } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useLogin({ onSuccess });
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
      const from = location.state?.from?.pathname || "/";
      console.log("Redirecting to: ", from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
  
      let errorMessage = "Invalid username or password";
  
      if ((error as any).response?.data) {
        console.log("Error response had data:", (error as any).response.data);
        const responseErrors = (error as any).response.data;
        if (responseErrors.non_field_errors) {
          errorMessage = responseErrors.non_field_errors.join(", ");
        } else {
          errorMessage = responseErrors.detail || errorMessage;
        }
      } else {
        console.log("Error response did not have data.");
      }
  
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || "Failed to Log In!",
      });
  
      form.setValue("password", "");
    }
  }

  const placeholders: Record<string, string> = {
    username: "Username",
    password: "Password",
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center h-full">
      <Card className="overflow-hidden w-[40vw]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your bruh. account
                  </p>
                </div>
                {Object.keys(placeholders).map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName as keyof z.infer<typeof loginInputSchema>}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type={fieldName.includes("password") ? "password" : "text"}
                            autoComplete={fieldName}
                            placeholder={placeholders[fieldName]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors[fieldName as keyof z.infer<typeof loginInputSchema>]?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                ))}
                <div className="flex justify-end">
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </div>
              </div>
              <div className="flex justify-center gap-1 pt-2 text-center text-sm">
                <p className="text-muted-foreground">Don't have an account?</p>
                <Link to="/register" replace>
                  Create an Account
                </Link>
              </div>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="bruh_shell.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] grayscale"
            />
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: 'hsl(var(--primary))', mixBlendMode: 'overlay', opacity: 0.5 }}></div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking 'Sign In', you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};