import { PrismaClient } from "@prisma/client"
import { VEHICLE_CATALOG } from "./vehicle-catalog.mjs"
import { seedDemo, clearDemo } from "./demo-data.mjs"

const db = new PrismaClient()

async function main() {
  for (const v of VEHICLE_CATALOG) {
    const data = {
      make: v.make,
      model: v.model,
      variant: v.variant ?? "",
      category: v.category,
      seats: v.seats,
      cargoLengthIn: v.cargoLengthIn,
      cargoWidthIn: v.cargoWidthIn,
      cargoHeightIn: v.cargoHeightIn ?? null,
      openTop: v.openTop ?? false,
      payloadLbs: v.payloadLbs,
      note: v.note ?? null,
    }
    await db.vehicleModel.upsert({
      where: { make_model_variant: { make: data.make, model: data.model, variant: data.variant } },
      update: data,
      create: data,
    })
  }
  console.log(`Vehicle catalog: ${VEHICLE_CATALOG.length} models`)

  // Production builds must never create or delete demo accounts.
  if (process.env.NODE_ENV === "production") {
    console.log("Demo data: skipped during production build")
  } else {
    if (process.env.DEMO_DATA === "on") console.log("Demo data:", await seedDemo(db))
    if (process.env.DEMO_DATA === "off") console.log("Demo users removed:", await clearDemo(db))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
