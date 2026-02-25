"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HiringGroupPage() {
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // Fetch hiring group
      const { data: groupData } = await supabase
        .from("hiring_groups")
        .select("*")
        .eq("id", id)
        .single();

      setGroup(groupData);

      // Fetch assessment
      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("*")
        .eq("hiring_group_id", id)
        .single();

      setAssessment(assessmentData);

      // Fetch candidates
      if (assessmentData) {
        const { data: candidateData } = await supabase
          .from("candidates")
          .select("*")
          .eq("assessment_id", assessmentData.id)
          .order("total_score", { ascending: false });

        setCandidates(candidateData || []);
      }
    };

    fetchData();
  }, [id]);

  const handleCopy = () => {
    if (!assessment) return;

    const link = `${window.location.origin}/test/${assessment.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading hiring group...
      </div>
    );
  }

  const testLink =
    typeof window !== "undefined" && assessment
      ? `${window.location.origin}/test/${assessment.id}`
      : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-10 text-white">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold">
            {group.title}
          </h1>

          <div className="mt-3 text-zinc-400 space-y-1">
            <p>
              Created: {new Date(group.created_at).toLocaleDateString()}
            </p>

            {group.deadline && (
              <p className="text-red-400">
                Deadline: {new Date(group.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* TEST LINK SECTION */}
        {assessment && (
          <div className="mb-12 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              Candidate Test Link
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex-1 bg-zinc-800 border border-zinc-700 p-4 rounded-xl break-all text-sm">
                {testLink}
              </div>

              <button
                onClick={handleCopy}
                className="bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        <h2 className="text-2xl font-semibold mb-6">
          Leaderboard
        </h2>

        {candidates.length === 0 ? (
          <div className="text-zinc-500">
            No candidates have taken the test yet.
          </div>
        ) : (
          <div className="space-y-6">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    #{index + 1} {candidate.name}
                  </h3>
                  <span className="font-semibold text-lg">
                    {candidate.total_score}
                  </span>
                </div>

                <p className="text-sm text-zinc-400">
                  {candidate.email} • {candidate.experience} yrs experience
                </p>

                <p className="mt-2 font-medium">
                  {candidate.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
