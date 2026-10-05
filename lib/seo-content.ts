// Public, indexable content (landing, cities, services) in English and Spanish.
// Distances are approximate driving miles.

export type Lang = "en" | "es"

export const SITE_URL = (process.env.AUTH_URL ?? "https://app.collagetaxi.com").replace(/\/$/, "")
export const BRAND = "Collage Transport"

export const PAGES = {
  about: { en: "/about", es: "/es/sobre-nosotros" },
  contact: { en: "/contact", es: "/es/contacto" },
  terms: { en: "/terms", es: "/es/terminos" },
  privacy: { en: "/privacy", es: "/es/privacidad" },
  pricing: { en: "/pricing", es: "/es/precios" },
  services: { en: "/services", es: "/es/servicios" },
} as const
export type PageKey = keyof typeof PAGES

export const paths = {
  page: (l: Lang, key: PageKey) => PAGES[key][l],
  home: (l: Lang) => (l === "es" ? "/es" : "/"),
  city: (l: Lang, slug: string) => (l === "es" ? `/es/nebraska/${slug}` : `/nebraska/${slug}`),
  service: (l: Lang, key: ServiceKey) => (l === "es" ? `/es/servicios/${SERVICES[key].slug.es}` : `/services/${SERVICES[key].slug.en}`),
}

// ---------------------------------------------------------------- Cities

export type City = {
  slug: string
  name: string
  county: string
  routes: { to: string; miles: number }[]
  intro: Record<Lang, string>
}

export const CITIES: City[] = [
  {
    slug: "omaha", name: "Omaha", county: "Douglas County",
    routes: [{ to: "Lincoln", miles: 55 }, { to: "Grand Island", miles: 145 }, { to: "Norfolk", miles: 115 }, { to: "Des Moines, IA", miles: 135 }, { to: "Kansas City, MO", miles: 185 }, { to: "Sioux City, IA", miles: 95 }],
    intro: {
      en: "Omaha is Nebraska's largest city and the starting point of many trips along I-80 and I-29. Drivers leaving Omaha for Lincoln, Grand Island, Des Moines or Kansas City often have empty seats or space in a pickup bed or van. Collage Transport connects them with people who need a ride or need to send boxes, furniture or merchandise.",
      es: "Omaha es la ciudad más grande de Nebraska y el punto de salida de muchos viajes por la I-80 y la I-29. Conductores que salen de Omaha hacia Lincoln, Grand Island, Des Moines o Kansas City muchas veces llevan asientos vacíos o espacio libre en la caja de la pickup o en la van. Collage Transport los conecta con personas que necesitan que las lleven o mandar cajas, muebles o mercancía.",
    },
  },
  {
    slug: "lincoln", name: "Lincoln", county: "Lancaster County",
    routes: [{ to: "Omaha", miles: 55 }, { to: "Grand Island", miles: 95 }, { to: "Kearney", miles: 135 }, { to: "Columbus", miles: 75 }, { to: "Kansas City, MO", miles: 200 }],
    intro: {
      en: "Lincoln, the state capital and home of the University of Nebraska, has constant traffic to Omaha and west along I-80. Students, workers and families moving between cities can share a ride, and anyone moving furniture or appliances can find a driver with the right pickup truck, van or trailer.",
      es: "Lincoln, la capital del estado y sede de la Universidad de Nebraska, tiene viajes constantes hacia Omaha y hacia el oeste por la I-80. Estudiantes, trabajadores y familias que se mueven entre ciudades pueden compartir el viaje, y quien necesite mover muebles o electrodomésticos encuentra un conductor con la pickup, van o tráiler adecuado.",
    },
  },
  {
    slug: "grand-island", name: "Grand Island", county: "Hall County",
    routes: [{ to: "Kearney", miles: 43 }, { to: "Lincoln", miles: 95 }, { to: "Omaha", miles: 145 }, { to: "Hastings", miles: 25 }, { to: "Columbus", miles: 65 }],
    intro: {
      en: "Grand Island sits in central Nebraska on the I-80 corridor and has a large working community, including many Spanish-speaking families. Trips to Kearney, Hastings, Lincoln and Omaha are common, for work, appointments or visiting family, and so is moving goods between these cities.",
      es: "Grand Island está en el centro de Nebraska, en el corredor de la I-80, y tiene una gran comunidad trabajadora, con muchas familias hispanas. Son muy comunes los viajes a Kearney, Hastings, Lincoln y Omaha por trabajo, citas o para visitar a la familia, y también mover mercancía entre estas ciudades.",
    },
  },
  {
    slug: "kearney", name: "Kearney", county: "Buffalo County",
    routes: [{ to: "Grand Island", miles: 43 }, { to: "North Platte", miles: 96 }, { to: "Lincoln", miles: 135 }, { to: "Omaha", miles: 185 }],
    intro: {
      en: "Kearney, home of the University of Nebraska at Kearney, is a regular stop on I-80 between eastern and western Nebraska. Drivers heading east to Grand Island, Lincoln or Omaha, or west to North Platte, can carry passengers or cargo on the same trip.",
      es: "Kearney, sede de la Universidad de Nebraska en Kearney, es una parada habitual en la I-80 entre el este y el oeste de Nebraska. Conductores que van hacia Grand Island, Lincoln u Omaha, o hacia North Platte, pueden llevar pasajeros o carga en el mismo viaje.",
    },
  },
  {
    slug: "norfolk", name: "Norfolk", county: "Madison County",
    routes: [{ to: "Omaha", miles: 115 }, { to: "Columbus", miles: 50 }, { to: "Sioux City, IA", miles: 80 }, { to: "Lincoln", miles: 115 }],
    intro: {
      en: "Norfolk is the main city of northeast Nebraska. Many residents travel to Omaha, Lincoln or Sioux City for work, shopping, flights or medical appointments. Sharing the trip lowers the cost for everyone, and drivers with space can also carry packages or small loads.",
      es: "Norfolk es la ciudad principal del noreste de Nebraska. Muchos de sus residentes viajan a Omaha, Lincoln o Sioux City por trabajo, compras, vuelos o citas médicas. Compartir el viaje baja el costo para todos, y los conductores con espacio también pueden llevar paquetes o cargas pequeñas.",
    },
  },
  {
    slug: "columbus", name: "Columbus", county: "Platte County",
    routes: [{ to: "Omaha", miles: 85 }, { to: "Lincoln", miles: 75 }, { to: "Norfolk", miles: 50 }, { to: "Grand Island", miles: 65 }],
    intro: {
      en: "Columbus is an industrial city in east-central Nebraska, connected to Omaha and Lincoln by US-30 and US-81. Workers commuting between cities and businesses moving parts or merchandise can find drivers already making the same trip.",
      es: "Columbus es una ciudad industrial del centro-este de Nebraska, conectada con Omaha y Lincoln por la US-30 y la US-81. Trabajadores que se mueven entre ciudades y negocios que necesitan mover piezas o mercancía pueden encontrar conductores que ya hacen ese mismo viaje.",
    },
  },
  {
    slug: "north-platte", name: "North Platte", county: "Lincoln County",
    routes: [{ to: "Kearney", miles: 96 }, { to: "Grand Island", miles: 140 }, { to: "Denver, CO", miles: 255 }, { to: "Scottsbluff", miles: 175 }],
    intro: {
      en: "North Platte, on I-80 in west-central Nebraska and home of the Union Pacific Bailey Yard, is a natural stop for long trips to Kearney, Grand Island or Denver. Long distances make shared rides and shared cargo space especially useful here.",
      es: "North Platte, en la I-80 en el oeste-centro de Nebraska y sede del patio ferroviario Bailey Yard de Union Pacific, es una parada natural en viajes largos a Kearney, Grand Island o Denver. Por las distancias, compartir el viaje o el espacio de carga es especialmente útil aquí.",
    },
  },
  {
    slug: "scottsbluff", name: "Scottsbluff", county: "Scotts Bluff County",
    routes: [{ to: "North Platte", miles: 175 }, { to: "Denver, CO", miles: 200 }, { to: "Cheyenne, WY", miles: 100 }],
    intro: {
      en: "Scottsbluff is the main city of the Nebraska Panhandle, closer to Cheyenne and Denver than to Omaha. For long trips across the state or to Colorado and Wyoming, finding a driver who is already going is often the cheapest way to travel or send cargo.",
      es: "Scottsbluff es la ciudad principal del Panhandle de Nebraska, más cerca de Cheyenne y Denver que de Omaha. Para viajes largos por el estado o hacia Colorado y Wyoming, encontrar un conductor que ya va para allá suele ser la forma más barata de viajar o mandar carga.",
    },
  },
]

// ---------------------------------------------------------------- Services

export type ServiceKey = "rides" | "cargo" | "moving"

export const SERVICES: Record<ServiceKey, {
  slug: Record<Lang, string>
  title: Record<Lang, string>
  description: Record<Lang, string>
  h1: Record<Lang, string>
  body: Record<Lang, string[]>
  bullets: Record<Lang, string[]>
}> = {
  rides: {
    slug: { en: "rideshare", es: "viajes-compartidos" },
    title: { en: "Shared rides between Nebraska cities", es: "Viajes compartidos entre ciudades de Nebraska" },
    description: {
      en: "Find a driver going your way: Omaha, Lincoln, Grand Island, Kearney and more. Agree on the price and share the cost of the trip.",
      es: "Encuentra un conductor que va para donde tú vas: Omaha, Lincoln, Grand Island, Kearney y más. Acuerden el precio y compartan el costo del viaje.",
    },
    h1: { en: "Shared rides between cities in Nebraska", es: "Viajes compartidos entre ciudades de Nebraska" },
    body: {
      en: [
        "Many drivers travel between Nebraska cities every day with empty seats. Collage Transport lets them publish their trip, and lets you post where and when you need to go.",
        "You can accept the price the driver asks or make a counteroffer. The exact pick-up address is only shared once the trip is confirmed.",
      ],
      es: [
        "Muchos conductores viajan todos los días entre ciudades de Nebraska con asientos vacíos. En Collage Transport ellos publican su viaje, y tú publicas a dónde y cuándo necesitas ir.",
        "Puedes aceptar el precio que pide el conductor o hacer una contraoferta. La dirección exacta de recogida solo se comparte cuando el viaje está confirmado.",
      ],
    },
    bullets: {
      en: ["Exclusive trip or shared with other passengers", "Price agreed between you and the driver", "Verified drivers (license, insurance and vehicle inspection)", "Available in English and Spanish"],
      es: ["Viaje exclusivo o compartido con otros pasajeros", "Precio acordado entre tú y el conductor", "Conductores verificados (licencia, seguro e inspección del vehículo)", "Disponible en español e inglés"],
    },
  },
  cargo: {
    slug: { en: "cargo-delivery", es: "envio-de-carga" },
    title: { en: "Send packages and cargo across Nebraska", es: "Envío de paquetes y carga en Nebraska" },
    description: {
      en: "Send boxes, furniture, appliances or merchandise with a driver who is already making the trip. Pickups, vans, box trucks and refrigerated options.",
      es: "Manda cajas, muebles, electrodomésticos o mercancía con un conductor que ya hace el viaje. Pickups, vans, camiones de caja y opciones refrigeradas.",
    },
    h1: { en: "Cargo and package delivery between Nebraska cities", es: "Envío de carga y paquetes entre ciudades de Nebraska" },
    body: {
      en: [
        "Tell us the weight and size of what you need to send. Collage Transport checks which drivers have a vehicle where it fits — a sedan trunk, a pickup bed, a cargo van or a box truck.",
        "For food or products that must stay cold, you can ask for a vehicle with a cooler or active refrigeration.",
      ],
      es: [
        "Dinos el peso y las medidas de lo que necesitas mandar. Collage Transport revisa qué conductores tienen un vehículo donde cabe: el maletero de un carro, la caja de una pickup, una van de carga o un camión de caja.",
        "Para comida o productos que deben ir fríos, puedes pedir un vehículo con nevera o refrigeración activa.",
      ],
    },
    bullets: {
      en: ["We check that your cargo fits (length × width × height and weight)", "Pickups, cargo vans, box trucks and trailers", "Refrigerated transport available", "Shared space = lower cost"],
      es: ["Revisamos que tu carga quepa (largo × ancho × alto y peso)", "Pickups, vans de carga, camiones de caja y tráileres", "Transporte refrigerado disponible", "Espacio compartido = menor costo"],
    },
  },
  moving: {
    slug: { en: "moving-help", es: "ayuda-con-mudanzas" },
    title: { en: "Moving help with a pickup truck or van in Nebraska", es: "Ayuda con mudanzas en pickup o van en Nebraska" },
    description: {
      en: "Moving an apartment, a sofa or a fridge? Find a driver with a pickup truck, cargo van or box truck in Omaha, Lincoln and across Nebraska.",
      es: "¿Te mudas o necesitas mover un sofá o un refrigerador? Encuentra un conductor con pickup, van de carga o camión de caja en Omaha, Lincoln y todo Nebraska.",
    },
    h1: { en: "Moving help: pickups, vans and box trucks", es: "Ayuda con mudanzas: pickups, vans y camiones" },
    body: {
      en: [
        "Small moves don't always need a moving company. Post what you need to move and drivers with the right vehicle can send you an offer.",
        "From a single appliance to a two-bedroom apartment, you choose between exclusive trips or sharing the space with other loads to save money.",
      ],
      es: [
        "Una mudanza pequeña no siempre necesita una compañía de mudanzas. Publica lo que necesitas mover y los conductores con el vehículo adecuado te mandan su oferta.",
        "Desde un electrodoméstico hasta un apartamento de dos cuartos: tú eliges un viaje exclusivo o compartir el espacio con otras cargas para ahorrar.",
      ],
    },
    bullets: {
      en: ["Pickups, cargo vans and 12–26 ft box trucks", "Local moves and moves between cities", "Negotiate the price before confirming", "Drivers verified by our team"],
      es: ["Pickups, vans de carga y camiones de caja de 12 a 26 pies", "Mudanzas locales y entre ciudades", "Negocia el precio antes de confirmar", "Conductores verificados por nuestro equipo"],
    },
  },
}

// ---------------------------------------------------------------- Landing copy

export const LANDING = {
  en: {
    title: "Rides and cargo between Nebraska cities | Collage Transport",
    description: "Share rides and send cargo between Omaha, Lincoln, Grand Island, Kearney and all of Nebraska. Drivers with empty space, fair prices you negotiate. In English and Spanish.",
    h1: "Rides and cargo between Nebraska cities",
    lead: "Drivers who already travel between cities offer their empty seats and cargo space. You post what you need, agree on the price, and travel or ship for less.",
    ctaRequest: "I need a ride or to ship something",
    ctaDrive: "I'm a driver",
    how: "How it works",
    steps: [
      ["Post your trip", "Drivers post their route, date and vehicle. Passengers and senders post where they need to go and what they need to move."],
      ["We check that it fits", "Seats, size and weight of the cargo, refrigeration and dates are matched automatically."],
      ["Agree on the price", "Accept the price or make a counteroffer. Exact addresses are shared only after confirmation."],
    ],
    servicesTitle: "What you can do",
    citiesTitle: "Cities we serve",
    faqTitle: "Frequently asked questions",
    beta: "Collage Transport is in its launch phase in Nebraska.",
    faq: [
      ["How much does a trip cost?", "The driver proposes a price and you can accept it or make a counteroffer. Sharing the trip or the cargo space usually costs less than a private service."],
      ["Are the drivers verified?", "Yes. To publish trips, drivers must submit their license, insurance and vehicle inspection, which our team reviews."],
      ["What can I send?", "Boxes, packages, furniture, appliances and merchandise. You enter the weight and size and we show you the drivers whose vehicle can carry it, including refrigerated options."],
      ["Which areas do you cover?", "Trips that start or end in Nebraska: Omaha, Lincoln, Grand Island, Kearney, Norfolk, Columbus, North Platte, Scottsbluff and nearby cities in Iowa, Kansas, Missouri, Colorado and South Dakota."],
      ["Is it available in Spanish?", "Yes, the whole platform works in English and Spanish."],
    ],
  },
  es: {
    title: "Viajes y envíos de carga entre ciudades de Nebraska | Collage Transport",
    description: "Comparte viajes y manda carga entre Omaha, Lincoln, Grand Island, Kearney y todo Nebraska. Conductores con espacio libre y precios que tú negocias. En español e inglés.",
    h1: "Viajes y envíos de carga entre ciudades de Nebraska",
    lead: "Conductores que ya viajan entre ciudades ofrecen sus asientos vacíos y su espacio de carga. Tú publicas lo que necesitas, acuerdan el precio y viajas o envías por menos.",
    ctaRequest: "Necesito un viaje o mandar algo",
    ctaDrive: "Soy conductor",
    how: "Cómo funciona",
    steps: [
      ["Publica tu viaje", "Los conductores publican su ruta, fecha y vehículo. Pasajeros y quienes envían publican a dónde van y qué necesitan mover."],
      ["Revisamos que quepa", "Asientos, medidas y peso de la carga, refrigeración y fechas se comparan automáticamente."],
      ["Acuerden el precio", "Acepta el precio o haz una contraoferta. Las direcciones exactas se comparten solo después de confirmar."],
    ],
    servicesTitle: "Qué puedes hacer",
    citiesTitle: "Ciudades donde trabajamos",
    faqTitle: "Preguntas frecuentes",
    beta: "Collage Transport está en etapa de lanzamiento en Nebraska.",
    faq: [
      ["¿Cuánto cuesta un viaje?", "El conductor propone un precio y tú puedes aceptarlo o hacer una contraoferta. Compartir el viaje o el espacio de carga normalmente cuesta menos que un servicio privado."],
      ["¿Los conductores están verificados?", "Sí. Para publicar viajes, los conductores deben enviar su licencia, seguro e inspección del vehículo, y nuestro equipo los revisa."],
      ["¿Qué puedo mandar?", "Cajas, paquetes, muebles, electrodomésticos y mercancía. Escribes el peso y las medidas y te mostramos los conductores cuyo vehículo lo puede llevar, incluso refrigerado."],
      ["¿Qué zonas cubren?", "Viajes que salen o llegan a Nebraska: Omaha, Lincoln, Grand Island, Kearney, Norfolk, Columbus, North Platte, Scottsbluff y ciudades cercanas de Iowa, Kansas, Missouri, Colorado y Dakota del Sur."],
      ["¿Está en español?", "Sí, toda la plataforma funciona en español y en inglés."],
    ],
  },
} as const

export const UI = {
  en: { signIn: "Sign in", start: "Get started", services: "Services", cities: "Cities", popularRoutes: "Popular routes from", miles: "mi", from: "from", ridesIn: "Rides and cargo in", other: "Español", otherHref: "/es", footer: "Rides and cargo between Nebraska cities.", home: "Home", postRequest: "Post a request", becomeDriver: "Become a driver", cityCta: "Need a ride or to send something from", },
  es: { signIn: "Iniciar sesión", start: "Empezar", services: "Servicios", cities: "Ciudades", popularRoutes: "Rutas populares desde", miles: "mi", from: "desde", ridesIn: "Viajes y carga en", other: "English", otherHref: "/", footer: "Viajes y envíos de carga entre ciudades de Nebraska.", home: "Inicio", postRequest: "Publicar una solicitud", becomeDriver: "Hazte conductor", cityCta: "¿Necesitas un viaje o mandar algo desde", },
} as const
