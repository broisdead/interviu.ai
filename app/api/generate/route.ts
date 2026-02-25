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

    // =============================
    // STEP 1: STRUCTURED ROLE ANALYSIS
    // =============================
    const analysisCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert hiring analyst. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Analyze this job description and extract structured hiring metadata:

${jd}

Return ONLY JSON:

{
  "role": "",
  "seniority": "",
  "domain": "",
  "experienceLevel": "Junior | Mid | Senior",
  "coreSkills": [],
  "secondarySkills": []
}
`
        }
      ]
    });

    const analysisText =
      analysisCompletion.choices[0]?.message?.content || "";

    const analysisMatch = analysisText.match(/\{[\s\S]*\}/);

    if (!analysisMatch) {
      return NextResponse.json(
        { error: "Failed to parse role analysis" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(analysisMatch[0]);

    // Determine difficulty
    let difficulty = "Intermediate";
    if (analysis.experienceLevel === "Senior") {
      difficulty = "Advanced";
    }
    if (analysis.experienceLevel === "Junior") {
      difficulty = "Foundational";
    }

    // =============================
    // STEP 2: SKILL-MAPPED QUESTION GENERATION
    // =============================
    const generationCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter designing structured assessments. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Role: ${analysis.role}
Domain: ${analysis.domain}
Experience Level: ${analysis.experienceLevel}
Difficulty: ${difficulty}
Core Skills: ${analysis.coreSkills.join(", ")}
Secondary Skills: ${analysis.secondarySkills.join(", ")}

Generate a 30-minute assessment.

Rules:
- 1 MCQ per core skill
- 1 ShortAnswer per secondary skill
- 1 CaseStudy combining at least 2 core skills
- Increase complexity if difficulty is Advanced
- Questions must test reasoning, not memorization

Return ONLY JSON:

{
  "role": "${analysis.role}",
  "timeLimit": 30,
  "questions": [
    {
      "id": 1,
      "type": "MCQ | ShortAnswer | CaseStudy",
      "text": "",
      "options": [],
      "idealAnswer": "",
      "maxScore": 10,
      "skill": ""
    }
  ]
}
`
        }
      ]
    });

    const generationText =
      generationCompletion.choices[0]?.message?.content || "";

    const generationMatch = generationText.match(/\{[\s\S]*\}/);

    if (!generationMatch) {
      return NextResponse.json(
        { error: "Failed to parse assessment generation" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(generationMatch[0]);

    // =============================
    // SAVE TO SUPABASE
    // =============================
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
      analysis
    });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}
