"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signUp() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required!");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    setIsLoading(false);
    if (error) {
      setError(`Signup failed: ${error.message}`);
    } else {
      alert("Check your email for confirmation!");
    }
  }

  async function signIn() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required!");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    setIsLoading(false);
    if (error) {
      setError(`Signin failed: ${error.message}`);
    } else {
      router.push("/workout");
    }
  }

  return (
    <div className="min-h-screen bg-whoop-dark flex items-center justify-center">
      <div className="bg-whoop-card rounded-2xl p-8 max-w-md w-full shadow-lg shadow-glow border border-whoop-cyan/30">
        <h1 className="text-3xl font-bold text-whoop-green tracking-tight mb-8 text-center">
          SetRep
        </h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-whoop-gray font-semibold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray disabled:bg-whoop-gray/50"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-whoop-gray font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray disabled:bg-whoop-gray/50"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-6">{error}</p>}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={signIn}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:scale-100 disabled:shadow-none"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <button
              onClick={signUp}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:scale-100 disabled:shadow-none"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
