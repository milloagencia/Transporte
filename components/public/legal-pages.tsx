import Link from "next/link"
import { PAGES, type Lang, type PageKey } from "@/lib/seo-content"
import SiteShell from "./site-shell"

// About, Terms and Privacy. IMPORTANT: Terms and Privacy are a starting draft written to match how the
// platform works today; they must be reviewed by a lawyer before the public launch.

export const UPDATED = "2026-10-05"

function Page({ lang, page, title, children }: { lang: Lang; page: PageKey; title: string; children: React.ReactNode }) {
  const other: Lang = lang === "es" ? "en" : "es"
  return (
    <SiteShell lang={lang} altHref={PAGES[page][other]}>
      <article className="mx-auto max-w-3xl px-4 py-12 leading-relaxed text-gray-800 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {children}
      </article>
    </SiteShell>
  )
}

const contact = (lang: Lang) => <Link href={PAGES.contact[lang]} className="text-blue-700 underline">{lang === "es" ? "formulario de contacto" : "contact form"}</Link>

export function AboutPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <Page lang={lang} page="about" title={es ? "Quiénes somos" : "About us"}>
      <p className="text-lg">
        {es
          ? "Collage Transport es una plataforma creada en Nebraska para conectar a personas y negocios que necesitan transporte con conductores que ya están haciendo ese viaje."
          : "Collage Transport is a platform created in Nebraska to connect people and businesses who need transport with drivers who are already making that trip."}
      </p>
      <h2>{es ? "Por qué existe" : "Why it exists"}</h2>
      <p>
        {es
          ? "Todos los días salen carros, pickups y vans entre Omaha, Lincoln, Grand Island, Kearney y el resto del estado con asientos vacíos o espacio de carga libre. Al mismo tiempo, mucha gente necesita viajar a otra ciudad o mandar algo y no encuentra una opción económica. Nosotros juntamos las dos cosas."
          : "Every day, cars, pickups and vans travel between Omaha, Lincoln, Grand Island, Kearney and the rest of the state with empty seats or free cargo space. At the same time, many people need to travel or send something and can't find an affordable option. We bring both together."}
      </p>
      <h2>{es ? "Cómo cuidamos la confianza" : "How we build trust"}</h2>
      <ul>
        <li>{es ? "Los conductores envían licencia, seguro e inspección del vehículo, y nuestro equipo los revisa antes de que puedan publicar viajes." : "Drivers submit their license, insurance and vehicle inspection, and our team reviews them before they can post trips."}</li>
        <li>{es ? "Las direcciones exactas, el correo y el teléfono solo se comparten cuando el viaje está confirmado." : "Exact addresses, email and phone are only shared once the trip is confirmed."}</li>
        <li>{es ? "Clientes y conductores se califican después de cada viaje; los comentarios los revisa una persona antes de publicarse." : "Customers and drivers rate each other after every trip; comments are reviewed by a person before being published."}</li>
        <li>{es ? "Las cuentas que no cumplen las reglas se suspenden." : "Accounts that break the rules are suspended."}</li>
      </ul>
      <h2>{es ? "Bilingüe de verdad" : "Truly bilingual"}</h2>
      <p>
        {es
          ? "Toda la plataforma funciona en español y en inglés, porque Nebraska también se mueve en español."
          : "The whole platform works in English and Spanish, because Nebraska also moves in Spanish."}
      </p>
      <h2>{es ? "En qué etapa estamos" : "Where we are"}</h2>
      <p>
        {es
          ? "Estamos en etapa de lanzamiento en Nebraska. Si tienes preguntas o quieres trabajar con nosotros como conductor o empresa, escríbenos por el "
          : "We are in our launch phase in Nebraska. If you have questions or want to work with us as a driver or business, write to us through the "}
        {contact(lang)}.
      </p>
    </Page>
  )
}

export function TermsPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <Page lang={lang} page="terms" title={es ? "Términos de uso" : "Terms of use"}>
      <p className="text-sm text-gray-500">{es ? "Última actualización" : "Last updated"}: {UPDATED}</p>
      <h2>1. {es ? "Qué es Collage Transport" : "What Collage Transport is"}</h2>
      <p>{es
        ? "Collage Transport es un mercado en línea que pone en contacto a personas o negocios que necesitan transporte de pasajeros o de carga (\"clientes\") con conductores y empresas que ofrecen ese transporte (\"conductores\"). Collage Transport no es una empresa de transporte ni presta el servicio de transporte: el acuerdo de transporte es entre el cliente y el conductor."
        : "Collage Transport is an online marketplace that connects people or businesses who need passenger or cargo transport (\"customers\") with drivers and companies that offer it (\"drivers\"). Collage Transport is not a transportation company and does not provide transport services: the transport agreement is between the customer and the driver."}</p>
      <h2>2. {es ? "Cuentas" : "Accounts"}</h2>
      <ul>
        <li>{es ? "Debes tener al menos 18 años y dar información verdadera." : "You must be at least 18 and provide truthful information."}</li>
        <li>{es ? "Eres responsable de lo que se haga con tu cuenta y de mantener seguro el acceso a tu correo." : "You are responsible for activity on your account and for keeping access to your email secure."}</li>
        <li>{es ? "Podemos suspender o cerrar cuentas que incumplan estos términos, tengan pagos pendientes o pongan en riesgo a otros usuarios." : "We may suspend or close accounts that break these terms, have pending payments or put other users at risk."}</li>
      </ul>
      <h2>3. {es ? "Obligaciones de los conductores" : "Driver obligations"}</h2>
      <ul>
        <li>{es ? "Tener licencia de conducir vigente, seguro adecuado para el tipo de transporte que ofreces y el vehículo en buen estado." : "Hold a valid driver's license, insurance suitable for the transport you offer, and a vehicle in good condition."}</li>
        <li>{es ? "Cumplir todas las leyes y permisos que apliquen a tu actividad (por ejemplo, registros estatales o federales para transporte comercial)." : "Comply with all laws and permits that apply to your activity (for example, state or federal registrations for commercial transport)."}</li>
        <li>{es ? "Publicar información real de capacidad, fechas y precio, y cumplir los acuerdos que aceptes." : "Post accurate capacity, dates and prices, and honor the agreements you accept."}</li>
      </ul>
      <p>{es ? "La verificación que hace nuestro equipo es una revisión de documentos; no garantiza la conducta futura de ningún conductor." : "The verification done by our team is a document review; it does not guarantee any driver's future conduct."}</p>
      <h2>4. {es ? "Obligaciones de los clientes" : "Customer obligations"}</h2>
      <ul>
        <li>{es ? "Describir con honestidad lo que se transporta: peso, medidas y si necesita refrigeración." : "Honestly describe what is being transported: weight, dimensions and refrigeration needs."}</li>
        <li>{es ? "No enviar artículos ilegales, peligrosos, armas, drogas, animales sin acuerdo previo ni nada prohibido por la ley." : "Not ship illegal or dangerous items, weapons, drugs, animals without prior agreement, or anything prohibited by law."}</li>
        <li>{es ? "Estar a tiempo en el punto acordado." : "Be on time at the agreed place."}</li>
      </ul>
      <h2>5. {es ? "Precios, pagos y comisión" : "Prices, payments and fees"}</h2>
      <p>{es
        ? "El precio lo acuerdan cliente y conductor en la plataforma. Collage Transport cobra una comisión por cada acuerdo (actualmente 10%), que se informa antes de pagar. Los precios estimados que mostramos son solo de referencia."
        : "The price is agreed between customer and driver on the platform. Collage Transport charges a fee on each agreement (currently 10%), shown before payment. Estimated prices we show are for reference only."}</p>
      <h2>6. {es ? "Cancelaciones" : "Cancellations"}</h2>
      <p>{es
        ? "Las cancelaciones pueden tener penalidades según cuánto falte para el viaje y quién cancela. Las reglas vigentes se muestran en cada acuerdo antes de confirmarlo."
        : "Cancellations may carry penalties depending on how close the trip is and who cancels. Current rules are shown in each agreement before confirming."}</p>
      <h2>7. {es ? "Calificaciones y comentarios" : "Ratings and comments"}</h2>
      <p>{es
        ? "Las calificaciones deben ser honestas y sobre el viaje. Revisamos los comentarios antes de publicarlos y podemos no publicar los que tengan insultos, datos personales, discriminación o información falsa."
        : "Ratings must be honest and about the trip. We review comments before publishing and may decline those with insults, personal data, discrimination or false information."}</p>
      <h2>8. {es ? "Responsabilidad" : "Liability"}</h2>
      <p>{es
        ? "En la medida permitida por la ley, Collage Transport no es responsable por daños, pérdidas, retrasos o accidentes ocurridos durante el transporte, que son responsabilidad de las partes del acuerdo y de sus seguros. Esto no limita derechos que la ley no permita limitar."
        : "To the extent permitted by law, Collage Transport is not liable for damage, loss, delays or accidents during transport, which are the responsibility of the parties to the agreement and their insurers. This does not limit rights that the law does not allow to be limited."}</p>
      <h2>9. {es ? "Cambios y contacto" : "Changes and contact"}</h2>
      <p>{es ? "Podemos actualizar estos términos; la fecha de arriba indica la última versión. Para cualquier pregunta usa nuestro " : "We may update these terms; the date above shows the latest version. For any question use our "}{contact(lang)}.</p>
      <p>{es ? "Estos términos se rigen por las leyes del estado de Nebraska, EE. UU." : "These terms are governed by the laws of the State of Nebraska, USA."}</p>
    </Page>
  )
}

export function PrivacyPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <Page lang={lang} page="privacy" title={es ? "Política de privacidad" : "Privacy policy"}>
      <p className="text-sm text-gray-500">{es ? "Última actualización" : "Last updated"}: {UPDATED}</p>
      <h2>{es ? "Qué datos recogemos" : "What data we collect"}</h2>
      <ul>
        <li>{es ? "Cuenta: correo electrónico, nombre o nombre de empresa, teléfono (opcional), idioma y tipo de cuenta." : "Account: email, name or company name, phone (optional), language and account type."}</li>
        <li>{es ? "Conductores: datos de licencia, seguro, inspección y número USDOT (si lo das), y datos del vehículo." : "Drivers: license, insurance and inspection details, USDOT number (if provided), and vehicle details."}</li>
        <li>{es ? "Viajes: ciudades, ZIP, fechas, medidas y peso de la carga, precios, propuestas, acuerdos y calificaciones." : "Trips: cities, ZIP codes, dates, cargo size and weight, prices, proposals, agreements and ratings."}</li>
        <li>{es ? "Técnicos: dirección IP (para frenar abusos como el envío masivo de correos) y registros del servidor." : "Technical: IP address (to stop abuse such as mass emails) and server logs."}</li>
      </ul>
      <h2>{es ? "Para qué los usamos" : "How we use it"}</h2>
      <ul>
        <li>{es ? "Para que puedas entrar (te enviamos un enlace por correo; no usamos contraseñas)." : "To let you sign in (we email you a link; we don't use passwords)."}</li>
        <li>{es ? "Para mostrar viajes compatibles, gestionar acuerdos y enviarte avisos que tú activaste." : "To show compatible trips, manage agreements and send alerts you turned on."}</li>
        <li>{es ? "Para verificar conductores, moderar comentarios y mantener la plataforma segura." : "To verify drivers, moderate comments and keep the platform safe."}</li>
      </ul>
      <h2>{es ? "Qué ven los demás usuarios" : "What other users see"}</h2>
      <p>{es
        ? "Tu nombre (o el de tu empresa), tus calificaciones y comentarios aprobados, y la ciudad y ZIP aproximados de tus viajes. Tu correo y teléfono solo los ve la otra persona de un acuerdo cuando el viaje está pagado. Nunca mostramos tus documentos de conductor."
        : "Your name (or business name), your ratings and approved comments, and the approximate city and ZIP of your trips. Your email and phone are only shown to the other party of an agreement once the trip is paid. We never show your driver documents."}</p>
      <h2>{es ? "Con quién los compartimos" : "Who we share it with"}</h2>
      <p>{es
        ? "No vendemos tus datos. Usamos proveedores que guardan o procesan datos por nosotros: alojamiento web (Hostinger), base de datos (Neon) y correo electrónico (Titan). Podemos compartir datos si la ley lo exige."
        : "We don't sell your data. We use providers that store or process data for us: web hosting (Hostinger), database (Neon) and email (Titan). We may share data if required by law."}</p>
      <h2>{es ? "Cookies" : "Cookies"}</h2>
      <p>{es
        ? "Solo usamos cookies necesarias: la de tu sesión y la de tu idioma. No usamos cookies de publicidad."
        : "We only use necessary cookies: your session and your language. We don't use advertising cookies."}</p>
      <h2>{es ? "Tus derechos" : "Your rights"}</h2>
      <p>{es
        ? "Puedes ver y cambiar tus datos en tu perfil, darte de baja de cualquier alerta desde el enlace del correo, y pedirnos una copia o el borrado de tu cuenta por el "
        : "You can see and change your data in your profile, unsubscribe from any alert using the link in the email, and ask us for a copy or deletion of your account through the "}{contact(lang)}.
        {es
          ? " Al borrar una cuenta quitamos el nombre, correo y teléfono; guardamos los acuerdos pagados el tiempo que exija la ley."
          : " When an account is deleted we remove the name, email and phone; we keep paid agreements as long as required by law."}</p>
      <h2>{es ? "Menores" : "Children"}</h2>
      <p>{es ? "La plataforma no es para menores de 18 años." : "The platform is not for people under 18."}</p>
    </Page>
  )
}
