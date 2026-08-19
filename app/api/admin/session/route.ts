import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) });
}
