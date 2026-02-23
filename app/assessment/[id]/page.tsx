"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<any>(null);

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

  if (!assessment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl mb-4">{assessment.role}</h1>
      <p className="mb-8">
        Time Limit: {assessment.time_limit} minutes
      </p>

      {assessment.questions.map((q: any) => (
        <div key={q.id} className="mb-6">
          <p>{q.text}</p>
        </div>
      ))}

      <button
        onClick={() => router.push(`/test/${id}`)}
        className="mt-6 bg-white text-black px-6 py-3 rounded-xl"
      >
        Start Test
      </button>
    </div>
  );
}