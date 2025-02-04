import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/hooks/use-toast";
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

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useRegister({ onSuccess });
  const { toast } = useToast();
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

      toast({
        title: "Success",
        description: "Successfully registered user",
      });

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error encountered when registering";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage + " could not be registered",
      });

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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-[25vw]"
        >
          {Object.keys(placeholders).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as keyof z.infer<typeof registerInputSchema>}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type={
                        fieldName.includes("password") ? "password" : "text"
                      }
                      autoComplete={fieldName}
                      placeholder={placeholders[fieldName]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {
                      form.formState.errors[
                        fieldName as keyof z.infer<typeof registerInputSchema>
                      ]?.message
                    }
                  </FormMessage>
                </FormItem>
              )}
            />
          ))}
          <div className="flex justify-end gap-1 pt-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
      <div className="flex justify-center gap-1 pt-2 text-center text-sm">
        <p className="text-muted-foreground">Already have an account?</p>
        <Link to="/login" replace>
          Login
        </Link>
      </div>
    </div>
  );
};
