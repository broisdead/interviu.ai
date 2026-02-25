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

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading group...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-10 text-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold">
            {group.title}
          </h1>
          <p className="text-zinc-400 mt-2">
            Created on {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Candidate Test Link */}
        {assessment && (
          <div className="mb-10">
            <p className="text-sm text-zinc-400 mb-2">
              Candidate Test Link:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl break-all">
              {typeof window !== "undefined" &&
                `${window.location.origin}/test/${assessment.id}`}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <h2 className="text-2xl font-semibold mb-6">
          Leaderboard
        </h2>

        {candidates.length === 0 ? (
          <div className="text-zinc-500">
            No candidates yet.
          </div>
        ) : (
          <div className="space-y-6">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    #{index + 1} {candidate.name}
                  </h3>
                  <span className="font-semibold">
                    {candidate.total_score}
                  </span>
                </div>

                <p className="text-sm text-zinc-400">
                  {candidate.email} • {candidate.experience} yrs
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