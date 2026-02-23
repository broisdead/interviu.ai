"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAssessment = async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setAssessment(data);
    };

    fetchAssessment();
  }, [id, router]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    if (!candidate.name || !candidate.email) {
      alert("Please fill in your name and email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment,
          answers,
          candidate,
          assessmentId: id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Scoring failed");
      }

      router.push(`/leaderboard/${id}`);
    } catch (error) {
      console.error("Scoring error:", error);
      alert("Something went wrong while scoring.");
    } finally {
      setLoading(false);
    }
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading test...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex justify-center p-10">
      <div className="w-full max-w-4xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl text-white">

        <h1 className="text-2xl font-semibold mb-8">
          {assessment.role} Test
        </h1>

        {/* Candidate Info */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Full Name"
            value={candidate.name}
            onChange={(e) =>
              setCandidate({ ...candidate, name: e.target.value })
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={candidate.email}
            onChange={(e) =>
              setCandidate({ ...candidate, email: e.target.value })
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="Years of Experience"
            value={candidate.experience}
            onChange={(e) =>
              setCandidate({ ...candidate, experience: e.target.value })
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3"
          />
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {assessment.questions.map((q: any) => (
            <div
              key={q.id}
              className="p-6 bg-zinc-800 border border-zinc-700 rounded-xl"
            >
              <p className="mb-4">{q.text}</p>

              {q.type === "MCQ" ? (
                q.options?.map((option: string, index: number) => (
                  <label key={index} className="block mb-2">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      onChange={(e) =>
                        handleAnswerChange(q.id, e.target.value)
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))
              ) : (
                <textarea
                  onChange={(e) =>
                    handleAnswerChange(q.id, e.target.value)
                  }
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl p-3 h-28"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-10 w-full bg-white text-black font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Scoring..." : "Submit Test"}
        </button>
      </div>
    </div>
  );
}