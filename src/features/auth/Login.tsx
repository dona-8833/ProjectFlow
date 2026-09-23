import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, BarChart3 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const supabase = createClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("root", {
        type: "manual",
        message: error.message,
      });
      return;
    }

    navigate("/app/dashboard", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f3f1] p-4 text-[#1f1f1f]">
      <div className="w-full max-w-[430px]">
        <div className="rounded-[18px] border border-[#d8d8d5] bg-[#efefed] px-5 py-4 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
          <div className="mb-4 flex items-center justify-center gap-2 rounded-md border border-[#d5d5d2] bg-[#f5f5f4] p-1.5 text-[13px] text-[#202020]">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-[#1b1b1b] px-3 py-1.5 text-white shadow-sm"
            >
              <span className="text-sm">⎋</span>
              <span>Sign in</span>
            </button>
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[#2b2b2b] transition hover:bg-white/60"
            >
              <span className="text-sm">✦</span>
              <span>Create account</span>
            </Link>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1d1d1d] text-lg text-white shadow-sm">
              <BarChart3 className="size-4" />
            </div>
          </div>

          <div className="mt-3 text-center">
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#171717]">
              ProjectFlow
            </h1>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#1d1d1d]">
              Welcome back
            </h2>
            <p className="mt-2 text-[13px] text-[#5f5f5b]">
              Enter your credentials to access your workspace.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#d8d8d5] bg-[#efefed] px-5 py-4 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-[#2d2d2d]"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="elena@projectflow.io"
                autoComplete="email"
                className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-[#2d2d2d]">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="text-[#4f4f4b] hover:text-[#1a1a1a]"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 pr-10 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d5d59] hover:text-[#1c1c1c]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full justify-center rounded-lg bg-[#1a1a1a] text-[15px] font-medium text-white transition hover:bg-[#2d2d2d]"
            >
              {isSubmitting ? "Signing in..." : "Sign in to workspace"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>

            <div className="pt-1 text-center text-[13px] text-[#5a5a55]">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#1f1f1f] underline-offset-2 hover:underline"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-[12px] text-[#6f6f6a]">
          By signing in, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </div>
      </div>
    </main>
  );
}
