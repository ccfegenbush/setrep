"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function signUp() {
    const trimmedEmail = email.trim(); // Remove leading/trailing spaces
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      alert("Email and password are required!");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    if (error) {
      console.error("Signup error:", error.message, error.status, error.code);
      alert(`Signup failed: ${error.message}`);
    } else {
      alert("Check your email for confirmation!");
    }
  }

  async function signIn() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      alert("Email and password are required!");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    if (error) {
      console.error("Signin error:", error.message, error.status, error.code);
      alert(`Signin failed: ${error.message}`);
    } else {
      router.push("/workout");
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">SetRep Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2 p-2 border rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 p-2 border rounded w-full"
      />
      <div className="mt-4 space-x-2">
        <button
          onClick={signIn}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In
        </button>
        <button
          onClick={signUp}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
}
