import type { TripRequest } from "@prisma/client"
import type { RequestRow } from "@/components/board/requests-board"
import type { RatingSummary } from "@/lib/ratings"

/** Converts a request from the database into a row for the requests board. */
export function toRequestRow(r: TripRequest & { requester: { name: string | null } }, meId: string | undefined, ratings: Map<string, RatingSummary>): RequestRow {
  return {
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    from: r.windowFrom.toISOString(),
    to: r.windowTo.toISOString(),
    originCity: r.originCity, originState: r.originState, destCity: r.destCity, destState: r.destState,
    serviceType: r.serviceType === "cargo" ? "cargo" : "people",
    passengerCount: r.passengerCount, cargoWeightLbs: r.cargoWeightLbs,
    cargoLengthIn: r.cargoLengthIn, cargoWidthIn: r.cargoWidthIn, cargoHeightIn: r.cargoHeightIn,
    cargoPieces: r.cargoPieces, cargoDesc: r.cargoDesc, coldChainRequired: r.coldChainRequired,
    budget: r.budgetProposed, requesterName: r.requester.name ?? "Usuario", requesterId: r.requesterId,
    ratingAvg: ratings.get(r.requesterId)?.avg ?? null, ratingCount: ratings.get(r.requesterId)?.count ?? 0,
    mine: r.requesterId === meId,
  }
}
