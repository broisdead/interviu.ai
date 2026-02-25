import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // ✅ Accept difficulty from frontend
    const { title, jd, difficulty } = await req.json();

    if (!title || !jd) {
      return NextResponse.json(
        { error: "Title and JD are required" },
        { status: 400 }
      );
    }

    const selectedDifficulty = difficulty || "Intermediate";

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key missing" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // =====================================
    // STEP 1: CREATE HIRING GROUP
    // =====================================
    const { data: group, error: groupError } = await supabase
      .from("hiring_groups")
      .insert([
        {
          title,
          job_description: jd,
        },
      ])
      .select()
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: "Failed to create hiring group" },
        { status: 500 }
      );
    }

    // =====================================
    // STEP 2: ROLE ANALYSIS
    // =====================================
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

    // =====================================
    // STEP 3: GENERATE ASSESSMENT
    // =====================================
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
Experience Level: ${analysis.experienceLevel}
Difficulty: ${selectedDifficulty}
Core Skills: ${analysis.coreSkills.join(", ")}
Secondary Skills: ${analysis.secondarySkills.join(", ")}

Generate a 30-minute assessment.

Rules:
- 1 MCQ per core skill
- 1 ShortAnswer per secondary skill
- 1 CaseStudy combining at least 2 core skills
- If difficulty is Advanced → increase analytical depth and complexity
- If Foundational → focus on core conceptual understanding
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

    // =====================================
    // STEP 4: SAVE ASSESSMENT LINKED TO GROUP
    // =====================================
    const { error: assessmentError } = await supabase
      .from("assessments")
      .insert([
        {
          role: parsed.role,
          time_limit: parsed.timeLimit,
          questions: parsed.questions,
          hiring_group_id: group.id,
          difficulty: selectedDifficulty, // 🔥 Save difficulty
        },
      ]);

    if (assessmentError) {
      return NextResponse.json(
        { error: "Failed to save assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hiringGroupId: group.id,
      message: "Hiring group created successfully",
    });

  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate hiring group" },
      { status: 500 }
    );
  }
}
