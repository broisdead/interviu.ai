"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a group title.");
      return;
    }

    if (!jd.trim()) {
      alert("Please paste the job description.");
      return;
    }

    if (!difficulty) {
      alert("Please select a difficulty.");
      return;
    }

    if (!deadline) {
      alert("Please select a deadline.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          jd,
          difficulty,
          deadline,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create group");
      }

      router.push(`/hiring-group/${result.hiringGroupId}`);

    } catch (error) {
      console.error("Create group error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex justify-center p-10 text-white">
      <div className="w-full max-w-3xl bg-zinc-900/70 border border-zinc-800 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-3xl font-semibold mb-8">
          Create Hiring Group
        </h1>

        <div className="space-y-6">

          {/* Title */}
          <input
            type="text"
            placeholder="Group Title (e.g. Data Scientist - Growth)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          />

          {/* Difficulty */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Select Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4"
            >
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Deadline (Now Required) */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Deadline *
            </label>
            <input
              type="date"
              min={today}
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4"
            />
          </div>

          {/* JD */}
          <textarea
            placeholder="Paste Job Description..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="w-full h-60 bg-zinc-800 border border-zinc-700 rounded-xl p-4 resize-none"
          />

          {/* Submit Button */}
          <button
            onClick={handleCreate}
            disabled={
              loading ||
              !title.trim() ||
              !jd.trim() ||
              !difficulty ||
              !deadline
            }
            className="w-full bg-white text-black py-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Generating Assessment..." : "Create Hiring Group"}
          </button>

        </div>
      </div>
    </div>
  );
}
