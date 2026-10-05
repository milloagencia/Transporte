// Approximate reference capacities for common US vehicles.
// seats = passenger seats (driver not counted).
// cargo = largest cargo area: rear seats folded for cars/SUVs/minivans,
//         bed for pickups (open top), cargo box for vans/trucks/trailers.
// Width is the narrowest point (between wheel wells). Units: inches / lbs.
// These are estimates: drivers can adjust the numbers for their own vehicle.

const sedan = { category: "sedan", seats: 4, cargoLengthIn: 40, cargoWidthIn: 38, cargoHeightIn: 18, payloadLbs: 850, note: "Trunk only" }
const compactSuv = { category: "suv", seats: 4, cargoLengthIn: 68, cargoWidthIn: 40, cargoHeightIn: 30, payloadLbs: 1000 }
const midSuv = { category: "suv", seats: 4, cargoLengthIn: 72, cargoWidthIn: 42, cargoHeightIn: 31, payloadLbs: 1200 }
const suv3 = { category: "suv_3row", seats: 6, cargoLengthIn: 78, cargoWidthIn: 45, cargoHeightIn: 31, payloadLbs: 1400 }
const minivan = { category: "minivan", seats: 7, cargoLengthIn: 100, cargoWidthIn: 48, cargoHeightIn: 45, payloadLbs: 1300 }
const pickup = (lengthIn, widthIn, heightIn, payloadLbs) => ({ category: "pickup", seats: 4, cargoLengthIn: lengthIn, cargoWidthIn: widthIn, cargoHeightIn: heightIn, openTop: true, payloadLbs })
const van = (lengthIn, widthIn, heightIn, payloadLbs) => ({ category: "cargo_van", seats: 1, cargoLengthIn: lengthIn, cargoWidthIn: widthIn, cargoHeightIn: heightIn, payloadLbs })

export const VEHICLE_CATALOG = [
  // Sedans
  { make: "Toyota", model: "Camry", ...sedan },
  { make: "Toyota", model: "Corolla", ...sedan, cargoLengthIn: 38 },
  { make: "Honda", model: "Accord", ...sedan },
  { make: "Honda", model: "Civic", ...sedan, cargoLengthIn: 38 },
  { make: "Nissan", model: "Altima", ...sedan },
  { make: "Hyundai", model: "Elantra", ...sedan, cargoLengthIn: 38 },
  { make: "Tesla", model: "Model 3", ...sedan },
  // SUVs
  { make: "Toyota", model: "RAV4", ...compactSuv },
  { make: "Honda", model: "CR-V", ...compactSuv },
  { make: "Chevrolet", model: "Equinox", ...compactSuv },
  { make: "Nissan", model: "Rogue", ...compactSuv },
  { make: "Ford", model: "Escape", ...compactSuv },
  { make: "Hyundai", model: "Tucson", ...compactSuv },
  { make: "Jeep", model: "Grand Cherokee", ...midSuv },
  { make: "Subaru", model: "Outback", ...midSuv, cargoHeightIn: 28 },
  { make: "Toyota", model: "Highlander", ...suv3 },
  { make: "Ford", model: "Explorer", ...suv3 },
  { make: "Honda", model: "Pilot", ...suv3, seats: 7 },
  { make: "Chevrolet", model: "Traverse", ...suv3, seats: 7 },
  { make: "Chevrolet", model: "Tahoe", ...suv3, seats: 7, cargoLengthIn: 95, cargoWidthIn: 48, cargoHeightIn: 37, payloadLbs: 1600 },
  { make: "Chevrolet", model: "Suburban", ...suv3, seats: 7, cargoLengthIn: 110, cargoWidthIn: 48, cargoHeightIn: 37, payloadLbs: 1600 },
  { make: "Ford", model: "Expedition", ...suv3, seats: 7, cargoLengthIn: 95, cargoWidthIn: 48, cargoHeightIn: 37, payloadLbs: 1600 },
  // Minivans
  { make: "Honda", model: "Odyssey", ...minivan },
  { make: "Toyota", model: "Sienna", ...minivan, payloadLbs: 1200 },
  { make: "Chrysler", model: "Pacifica", ...minivan },
  { make: "Kia", model: "Carnival", ...minivan },
  // Pickups (open bed)
  { make: "Ford", model: "F-150", variant: "5.5 ft bed", ...pickup(67, 50, 21, 1700) },
  { make: "Ford", model: "F-150", variant: "6.5 ft bed", ...pickup(78, 50, 21, 1800) },
  { make: "Chevrolet", model: "Silverado 1500", variant: "5.8 ft bed", ...pickup(70, 50, 22, 1700) },
  { make: "Chevrolet", model: "Silverado 1500", variant: "6.6 ft bed", ...pickup(79, 50, 22, 1800) },
  { make: "GMC", model: "Sierra 1500", variant: "5.8 ft bed", ...pickup(70, 50, 22, 1700) },
  { make: "Ram", model: "1500", variant: "5.7 ft bed", ...pickup(67, 51, 20, 1700) },
  { make: "Ram", model: "1500", variant: "6.4 ft bed", ...pickup(76, 51, 20, 1800) },
  { make: "Toyota", model: "Tundra", variant: "5.5 ft bed", ...pickup(66, 49, 21, 1600) },
  { make: "Toyota", model: "Tacoma", variant: "5 ft bed", ...pickup(60, 41, 19, 1200) },
  { make: "Toyota", model: "Tacoma", variant: "6 ft bed", ...pickup(73, 41, 19, 1200) },
  { make: "Nissan", model: "Frontier", variant: "5 ft bed", ...pickup(60, 42, 18, 1200) },
  // Cargo vans
  { make: "Ford", model: "Transit", variant: "130 WB low roof", ...van(112, 51, 56, 3000) },
  { make: "Ford", model: "Transit", variant: "148 WB medium roof", ...van(143, 51, 72, 3200) },
  { make: "Ram", model: "ProMaster", variant: "136 WB low roof", ...van(120, 60, 65, 3600) },
  { make: "Ram", model: "ProMaster", variant: "159 WB high roof", ...van(146, 60, 76, 3600) },
  { make: "Mercedes-Benz", model: "Sprinter", variant: "144 WB high roof", ...van(128, 53, 79, 3500) },
  { make: "Chevrolet", model: "Express 2500", variant: "Cargo", ...van(146, 52, 53, 3200) },
  { make: "Ford", model: "Transit Connect", variant: "Cargo", ...van(87, 48, 52, 1500) },
  { make: "Ram", model: "ProMaster City", variant: "Cargo", ...van(87, 48, 52, 1800) },
  { make: "Nissan", model: "NV200", variant: "Cargo", ...van(82, 48, 53, 1480) },
  // Passenger vans
  { make: "Ford", model: "Transit", variant: "Passenger 15", category: "passenger_van", seats: 14, cargoLengthIn: 30, cargoWidthIn: 51, cargoHeightIn: 56, payloadLbs: 3500, note: "Space behind last row" },
  // Box trucks
  { make: "Box truck", model: "12 ft", category: "box_truck", seats: 2, cargoLengthIn: 144, cargoWidthIn: 86, cargoHeightIn: 84, payloadLbs: 3000 },
  { make: "Box truck", model: "16 ft", category: "box_truck", seats: 2, cargoLengthIn: 192, cargoWidthIn: 92, cargoHeightIn: 90, payloadLbs: 5000 },
  { make: "Box truck", model: "20 ft", category: "box_truck", seats: 2, cargoLengthIn: 240, cargoWidthIn: 96, cargoHeightIn: 96, payloadLbs: 7000 },
  { make: "Box truck", model: "26 ft", category: "box_truck", seats: 2, cargoLengthIn: 312, cargoWidthIn: 96, cargoHeightIn: 96, payloadLbs: 10000 },
  // Trailers (towed)
  { make: "Trailer", model: "Enclosed 6x12", category: "trailer", seats: 0, cargoLengthIn: 144, cargoWidthIn: 72, cargoHeightIn: 72, payloadLbs: 2000 },
  { make: "Trailer", model: "Enclosed 7x14", category: "trailer", seats: 0, cargoLengthIn: 168, cargoWidthIn: 84, cargoHeightIn: 78, payloadLbs: 4500 },
  { make: "Trailer", model: "Flatbed / car hauler 18 ft", category: "trailer", seats: 0, cargoLengthIn: 216, cargoWidthIn: 83, cargoHeightIn: null, openTop: true, payloadLbs: 7000 },
]
