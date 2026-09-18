import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const supabase = createClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { data: isAvailable, error: rpcError } = await supabase.rpc(
      "check_username_available",
      { username_to_check: data.username },
    );
    if (rpcError || !isAvailable) {
      setError("username", {
        type: "manual",
        message:
          "This username is not available right now. Please choose another one.",
      });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: data.username,
        },
      },
    });

    if (error) {
      setError("root", {
        type: "manual",
        message: error.message,
      });
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f3f1] p-4 text-[#1f1f1f]">
      <div className="w-full max-w-[430px]">
        <div className="rounded-[18px] border border-[#d8d8d5] bg-[#efefed] px-5 py-4 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
          <div className="mb-4 flex items-center justify-center gap-2 rounded-md border border-[#d5d5d2] bg-[#f5f5f4] p-1.5 text-[13px] text-[#202020]">
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[#2b2b2b] transition hover:bg-white/60"
            >
              <span className="text-sm">⎋</span>
              <span>Sign in</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-[#1b1b1b] px-3 py-1.5 text-white shadow-sm"
            >
              <span className="text-sm">✦</span>
              <span>Create account</span>
            </button>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1d1d1d] text-lg text-white shadow-sm">
              ☰
            </div>
          </div>

          <div className="mt-3 text-center">
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#171717]">
              ProjectFlow
            </h1>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#1d1d1d]">
              Create your account
            </h2>
            <p className="mt-2 text-[13px] text-[#5f5f5b]">
              Start organizing your work with a cleaner workflow.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#d8d8d5] bg-[#efefed] px-5 py-4 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[13px] font-medium text-[#2d2d2d]"
              >
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Elena Petrova"
                autoComplete="name"
                className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-[13px] font-medium text-[#2d2d2d]"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="elenap"
                autoComplete="username"
                className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

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
                placeholder="you@projectflow.io"
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
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-[#2d2d2d]"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  autoComplete="new-password"
                  className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 pr-10 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-[13px] font-medium text-[#2d2d2d]"
              >
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  autoComplete="new-password"
                  className="h-11 rounded-md border-[#d4d4d1] bg-[#f5f5f4] px-3 pr-10 text-[14px] text-[#171717] placeholder:text-[#7d7d7a] focus-visible:border-[#2d2d2d] focus-visible:ring-0"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d5d59] hover:text-[#1c1c1c]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword.message}
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
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>

            <div className="pt-1 text-center text-[13px] text-[#5a5a55]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#1f1f1f] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-[12px] text-[#6f6f6a]">
          By creating an account, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </div>
      </div>
    </main>
  );
}
