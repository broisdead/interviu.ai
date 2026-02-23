"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jd.trim()) {
      alert("Please paste a job description.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to generate assessment");
      }

      if (!result.id) {
        throw new Error("Assessment ID not returned");
      }

      // ✅ Redirect using real database UUID
      router.push(`/assessment/${result.id}`);

    } catch (error) {
      console.error("Dashboard error:", error);
      alert("Something went wrong while generating assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex justify-center items-center p-10">
      <div className="w-full max-w-3xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl text-white">

        <h1 className="text-3xl font-semibold mb-6">
          Generate AI Assessment
        </h1>

        <p className="text-zinc-400 mb-6">
          Paste a job description below to automatically generate a
          structured, role-specific AI assessment.
        </p>

        <textarea
          placeholder="Paste job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          className="w-full h-60 bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full bg-white text-black font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Assessment"}
        </button>

      </div>
    </div>
  );
}