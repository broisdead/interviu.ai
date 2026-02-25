"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("hiring_groups")
        .select(`
          id,
          title,
          created_at,
          assessments (
            id,
            candidates (count)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      setGroups(data || []);
      setLoading(false);
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading hiring groups...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-10 text-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-semibold">
            Hiring Groups
          </h1>

          <button
            onClick={() => router.push("/create-group")}
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            + Create Group
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {groups.map((group) => {
            const candidateCount =
              group.assessments?.[0]?.candidates?.[0]?.count || 0;

            return (
              <div
                key={group.id}
                className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition cursor-pointer"
                onClick={() => router.push(`/hiring-group/${group.id}`)}
              >
                <h2 className="text-lg font-medium mb-3">
                  {group.title}
                </h2>

                <p className="text-sm text-zinc-400 mb-2">
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </p>

                <p className="text-sm text-zinc-400">
                  Candidates: {candidateCount}
                </p>
              </div>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center text-zinc-500 mt-20">
            No hiring groups yet. Create your first one.
          </div>
        )}
      </div>
    </div>
  );
}
