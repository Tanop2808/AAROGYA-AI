import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { runAITriage, fallbackTriage } from "@/lib/triage";

export async function POST(req: NextRequest) {
  const { symptoms } = await req.json();

  if (!symptoms || symptoms.length === 0) {
    return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
  }

  let result;
  try {
    result = await runAITriage(symptoms);
  } catch (err) {
    console.error("AI triage failed, using fallback:", err);

    const idMap: Record<string, string> = {
      "Fever": "fever",
      "Chest Pain": "chest",
      "Breathlessness": "breath",
      "Cough": "cough",
      "Cold / Runny Nose": "cold",
      "Headache": "headache",
      "Vomiting": "vomit",
      "Diarrhea": "diarrhea",
      "Skin Rash": "rash",
      "Joint Pain": "pain",
      "Weakness": "weakness",
      "Stomach Pain": "stomach",
      "Eye Problem": "eyes",
      "Back Pain": "back",
      "Dizziness": "dizzy",
      "Swelling": "swelling",
      "Chills / Shivering": "chills",
      "Body Ache": "body_ache",
      "Excessive Sweating": "sweat",
      "Burning Urination": "urine_burn",
      "Nausea": "nausea",
      "Unconsciousness": "unconscious",
      "Seizures": "seizure",
      "Unusual Bleeding": "bleed",
    };

    const selectedIds: string[] = [];
    for (const s of symptoms) {
      for (const [name, id] of Object.entries(idMap)) {
        if (s.includes(name)) {
          selectedIds.push(id);
          break;
        }
      }
    }

    result = fallbackTriage(selectedIds);
  }

  // Save consultation to DB
  try {
    await dbConnect();
    const Consultation = (await import("@/models/Consultation")).default;
    await Consultation.create({
      patientPhone: "unknown",
      patientName: "Unknown",
      symptoms,
      urgency: result.urgency,
      triageResult: result,
      status: "pending",
    });
  } catch (err) {
    console.error("Failed to save consultation:", err);
  }

  return NextResponse.json(result);
}