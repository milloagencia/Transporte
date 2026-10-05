import { ImageResponse } from "next/og"

export const alt = "Collage Transport — rides and cargo between Nebraska cities"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #1d4ed8, #2563eb 60%, #3b82f6)", color: "white" }}>
        <div style={{ fontSize: 40, opacity: 0.85 }}>Collage Transport</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>Rides & cargo between Nebraska cities</div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.9 }}>Viajes y envíos de carga · Omaha · Lincoln · Grand Island · Kearney</div>
      </div>
    ),
    size,
  )
}
