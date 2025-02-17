import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister, registerInputSchema } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useRegister({ onSuccess });
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof registerInputSchema>>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password2: "",
    },
  });

  async function onSubmit(data: z.infer<typeof registerInputSchema>) {
    try {
      await registering.mutateAsync(data);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      if ((error as any).response?.data) {
        const errorData = (error as any).response.data;
        Object.keys(errorData).forEach((key) => {
          form.setError(key as keyof z.infer<typeof registerInputSchema>, {
            type: "manual",
            message: errorData[key].join(", "),
          });
        });
      }
      form.setValue("password", "");
      form.setValue("password2", "");
    }
  }

  const placeholders: Record<string, string> = {
    username: "Username",
    email: "Email",
    first_name: "First Name",
    last_name: "Last Name",
    password: "Password",
    password2: "Password Confirmation",
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <Card className="overflow-hidden w-[50vw]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome to bruh.</h1>
                  <p className="text-balance text-muted-foreground">
                    Let's create your bruh. account
                  </p>
                </div>
                {Object.keys(placeholders).map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={
                      fieldName as keyof z.infer<typeof registerInputSchema>
                    }
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type={
                              fieldName.includes("password")
                                ? "password"
                                : "text"
                            }
                            autoComplete={fieldName}
                            placeholder={placeholders[fieldName]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors[
                              fieldName as keyof z.infer<
                                typeof registerInputSchema
                              >
                            ]?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-1 pt-4">
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </div>
              <div className="flex justify-center gap-1 pt-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?
                </p>
                <Link to="/login" replace>
                  Login
                </Link>
              </div>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="bs.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] grayscale"
            />
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: "hsl(var(--primary))",
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
