import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { assessment, answers, candidate, assessmentId } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key missing" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an expert hiring evaluator. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Assessment:
${JSON.stringify(assessment)}

Candidate Answers:
${JSON.stringify(answers)}

Return JSON:
{
  "scores": [
    {
      "questionId": 1,
      "score": number,
      "reasoning": ""
    }
  ],
  "totalScore": number,
  "recommendation": "Strong Hire | Hire | Borderline | No Hire"
}
`
        }
      ],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse scoring JSON" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 🔥 Save candidate result to Supabase
    const { error } = await supabase.from("candidates").insert([
      {
        assessment_id: assessmentId,
        name: candidate.name,
        email: candidate.email,
        experience: candidate.experience,
        total_score: parsed.totalScore,
        recommendation: parsed.recommendation,
        detailed_scores: parsed.scores,
      },
    ]);

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: "Failed to save candidate" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score" },
      { status: 500 }
    );
  }
}