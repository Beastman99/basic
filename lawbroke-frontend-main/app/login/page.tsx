"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useState } from "react";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // store auth
      localStorage.setItem("lawbroke_token", data.token);
      localStorage.setItem("lawbroke_user", JSON.stringify(data.user));

      setMessage("Login successful. Redirecting…");
      setTimeout(() => (window.location.href = "/"), 800);
    } catch (err) {
      console.error(err);
      setError("Server error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="w-full max-w-md rounded-lg border dark:border-gray-700 shadow p-6 dark:bg-gray-900">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Log in
          </h1>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded border dark:bg-gray-800 dark:text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded border dark:bg-gray-800 dark:text-white"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold transition"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
