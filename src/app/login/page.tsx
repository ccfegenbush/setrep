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
    if (error) setError(`Signup failed: ${error.message}`);
    else alert("Check your email for confirmation!");
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
    if (error) setError(`Signin failed: ${error.message}`);
    else router.push("/workout");
  }

  return (
    <div className="min-h-screen bg-whoop-dark flex items-center justify-center">
      <div className="bg-whoop-card rounded-xl p-6 max-w-md w-full shadow-lg">
        <h1 className="text-xl font-semibold text-whoop-green mb-4 text-center">
          SetRep
        </h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-3">
            <label
              htmlFor="email"
              className="block text-whoop-gray text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-whoop-dark text-whoop-white rounded-lg focus:outline-none focus:ring-1 focus:ring-whoop-green placeholder-whoop-gray text-sm disabled:bg-whoop-gray/50"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="password"
              className="block text-whoop-gray text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-whoop-dark text-whoop-white rounded-lg focus:outline-none focus:ring-1 focus:ring-whoop-green placeholder-whoop-gray text-sm disabled:bg-whoop-gray/50"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={signIn}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-medium rounded-lg hover:scale-102 transition-transform disabled:bg-whoop-gray disabled:scale-100 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <button
              onClick={signUp}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-medium rounded-lg hover:scale-102 transition-transform disabled:bg-whoop-gray disabled:scale-100 text-sm"
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
