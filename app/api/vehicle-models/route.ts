import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/** Public reference catalog of vehicle capacities. */
export async function GET() {
  const models = await db.vehicleModel.findMany({ orderBy: [{ make: "asc" }, { model: "asc" }, { variant: "asc" }] })
  return NextResponse.json(models)
}
