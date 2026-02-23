import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { jd } = await req.json();

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
            "You are an expert recruiter. Always return ONLY valid JSON. No markdown. No extra text.",
        },
        {
          role: "user",
          content: `
From this job description:

${jd}

1. Extract role title
2. Generate a 30-minute assessment
3. Include:
   - 3 MCQs
   - 3 ShortAnswer
   - 1 CaseStudy

Return ONLY JSON:

{
  "role": "",
  "timeLimit": 30,
  "questions": [
    {
      "id": 1,
      "type": "MCQ | ShortAnswer | CaseStudy",
      "text": "",
      "options": [],
      "idealAnswer": "",
      "maxScore": 10
    }
  ]
}
`
        }
      ],
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to extract JSON from AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 🔥 Insert into Supabase
    const { data, error } = await supabase
      .from("assessments")
      .insert([
        {
          role: parsed.role,
          time_limit: parsed.timeLimit,
          questions: parsed.questions,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      assessment: parsed,
    });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}