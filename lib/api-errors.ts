import { NextResponse } from "next/server"
import { ValidationError } from "@/lib/validation"

/** Turns a ValidationError into a 400 response with its code; rethrows anything else. */
export function validationResponse(e: unknown) {
  if (e instanceof ValidationError) return NextResponse.json({ error: e.code }, { status: 400 })
  throw e
}
