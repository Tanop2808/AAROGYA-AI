import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  try {
    await dbConnect();
    const query = phone ? { phone } : {};
    const patients = phone
      ? await Patient.findOne(query)
      : await Patient.find(query).limit(50);
    return NextResponse.json(phone ? { patient: patients } : { patients });
  } catch (err) {
    return NextResponse.json({ error: "DB error", details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await dbConnect();
    const existing = await Patient.findOne({ phone: body.phone });
    if (existing) return NextResponse.json({ patient: existing });
    const patient = await Patient.create(body);
    return NextResponse.json({ patient }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "DB error", details: String(err) }, { status: 500 });
  }
}
