import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ASHAVisit } from "@/models/index";

export async function GET(req: NextRequest) {
  const ashaPhone = req.nextUrl.searchParams.get("ashaPhone");
  try {
    await dbConnect();
    const query = ashaPhone ? { ashaWorkerPhone: ashaPhone } : {};
    const visits = await ASHAVisit.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ visits });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await dbConnect();
    const visit = await ASHAVisit.create(body);
    return NextResponse.json({ visit }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
