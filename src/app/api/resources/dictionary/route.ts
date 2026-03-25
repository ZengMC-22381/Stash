import { NextResponse } from "next/server"
import { RESOURCE_DICTIONARY } from "@/lib/resource-definition"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({ dictionary: RESOURCE_DICTIONARY })
}
