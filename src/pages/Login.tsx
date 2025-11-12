import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const methods = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit } = methods;

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const onSubmit = async (data: LoginForm) => {
    const ok = await login(data.email, data.password);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      // show error later
      console.error("Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold">Sign in to your account</h2>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@company.com" {...{ name: "email", id: "email", "aria-label": "email" }} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your password" {...{ name: "password", id: "password", "aria-label": "password" }} />
              </FormControl>
            </FormItem>

            <div className="pt-2">
              <Button type="submit" className="w-full">Sign in</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
