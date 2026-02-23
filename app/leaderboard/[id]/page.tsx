"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("assessment_id", id)
        .order("total_score", { ascending: false });

      if (error) {
        console.error(error);
        router.push("/dashboard");
        return;
      }

      setCandidates(data || []);
    };

    fetchCandidates();
  }, [id, router]);

  if (!candidates.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex justify-center p-10">
      <div className="w-full max-w-5xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl text-white">

        <h1 className="text-3xl font-semibold mb-10">
          Leaderboard
        </h1>

        <div className="space-y-6">
          {candidates.map((item, index) => (
            <div
              key={item.id}
              className="p-6 bg-zinc-800 border border-zinc-700 rounded-xl"
            >
              <div className="flex justify-between mb-2">
                <h2 className="text-lg font-medium">
                  #{index + 1} {item.name}
                </h2>
                <span className="font-semibold">
                  {item.total_score}
                </span>
              </div>

              <p className="text-sm text-zinc-400">
                {item.email} • {item.experience} yrs exp
              </p>

              <p className="mt-2 font-medium">
                {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}