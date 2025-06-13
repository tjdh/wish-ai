"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const SignupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirm: z.string().min(6),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords must match",
  });

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = SignupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((er) => {
        const field = er.path[0] as string;
        fieldErrors[field] = er.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) throw error;

      router.push("/confirm-email");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          setErrors({ submit: "An account with this email already exists. Please sign in instead." });
        } else if (error.message.includes("Invalid email")) {
          setErrors({ submit: "Please enter a valid email address." });
        } else if (error.message.includes("Password")) {
          setErrors({ submit: "Password must be at least 6 characters long." });
        } else {
          setErrors({ submit: error.message || "Something went wrong. Please try again." });
        }
      } else {
        setErrors({ submit: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>}
        </div>

        {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
