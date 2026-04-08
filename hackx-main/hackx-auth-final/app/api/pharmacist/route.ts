import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pharmacist } from "@/models/index";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const phone = req.nextUrl.searchParams.get("phone");
    if (phone) {
      const pharmacist = await Pharmacist.findOne({ phone }).select("-password");
      return NextResponse.json({ pharmacist: pharmacist || null });
    } else {
      const pharmacies = await Pharmacist.find({}).select("-password");
      return NextResponse.json({ pharmacies });
    }
  } catch (err: any) {
    console.error("GET /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, password, ...rest } = body;
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const existing = await Pharmacist.findOne({ phone });
    if (existing) return NextResponse.json({ error: "Phone already registered" }, { status: 400 });

    const hashedPassword = await hashPassword(password);
    const pharmacist = await Pharmacist.create({ phone, password: hashedPassword, ...rest, stock: [] });

    // Return without password hash
    const { password: _pw, ...safeData } = pharmacist.toObject();
    return NextResponse.json({ pharmacist: safeData });
  } catch (err: any) {
    console.error("POST /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, password, ...updates } = body; // never allow password update via this route
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    const pharmacist = await Pharmacist.findOneAndUpdate(
      { phone },
      { $set: updates },
      { new: true }
    ).select("-password");
    return NextResponse.json({ pharmacist });
  } catch (err: any) {
    console.error("PATCH /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
