"use client"

import { useEffect, useRef, useState } from "react"
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl"

type LiveTrip = {
  id: string
  operationalStatus: string
  driver: { id: string; name: string | null }
  requester: { id: string; name: string | null }
  driverLocations: {
    latitude: number
    longitude: number
    accuracyM: number | null
    createdAt: string
  }[]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""

function locationAge(createdAt?: string) {
  if (!createdAt) return "Sin ubicación"
  const timestamp = new Date(createdAt).getTime()
  if (!Number.isFinite(timestamp)) return "Hora desconocida"
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return `hace ${seconds} s`
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  return `hace ${Math.floor(seconds / 3600)} h`
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Aceptado",
    on_the_way: "En camino",
    arrived: "Llegó",
    in_trip: "En viaje",
  }
  return labels[status] ?? status
}

export default function LiveTrips() {
  const [trips, setTrips] = useState<LiveTrip[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const markersRef = useRef<MapboxMarker[]>([])

  useEffect(() => {
    let active = true
    let refreshing = false
    async function refresh() {
      if (refreshing) return
      refreshing = true
      try {
        const response = await fetch("/api/v1/admin/live", { cache: "no-store" })
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "No autorizado" : "No se pudo actualizar")
        const data = await response.json()
        if (active) {
          setTrips(Array.isArray(data) ? data : [])
          setError("")
        }
      } catch {
        if (active) setError("No se pudo cargar el seguimiento en vivo. Se volverá a intentar automáticamente.")
      } finally {
        refreshing = false
        if (active) setLoading(false)
      }
    }
    void refresh()
    const interval = setInterval(() => void refresh(), 10_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return
    let active = true
    let map: MapboxMap | undefined
    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!active || !mapContainer.current) return
      mapboxgl.accessToken = MAPBOX_TOKEN
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-99.9, 41.5],
        zoom: 5,
      })
      mapRef.current = map
      map.on("load", () => { if (active) setMapReady(true) })
      map.on("error", () => { if (active) setMapError(true) })
    }).catch(() => { if (active) setMapError(true) })
    return () => {
      active = false
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    let active = true
    import("mapbox-gl").then(({ Marker, Popup }) => {
      if (!active || !mapRef.current) return
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = trips.flatMap((trip) => {
        const location = trip.driverLocations[0]
        if (!location) return []
        const marker = new Marker({ color: "#2563eb" })
          .setLngLat([location.longitude, location.latitude])
          .setPopup(new Popup({ offset: 20 }).setText(
            `${trip.driver.name ?? "Chofer"} · ${statusLabel(trip.operationalStatus)} · ${locationAge(location.createdAt)}`,
          ))
          .addTo(mapRef.current!)
        return [marker]
      })
    }).catch(() => { if (active) setMapError(true) })
    return () => { active = false }
  }, [mapReady, trips])

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="live-trips-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="live-trips-title" className="text-xl font-semibold">Seguimiento en vivo</h2>
          <p className="text-sm text-gray-600">Viajes activos y antigüedad de la última ubicación. Actualización automática cada 10 segundos.</p>
        </div>
        <span className="text-sm text-gray-600" aria-live="polite">{loading ? "Cargando…" : `${trips.length} viajes`}</span>
      </div>

      {error && <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {!MAPBOX_TOKEN ? (
        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
          El mapa está desactivado porque falta NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN. La lista de viajes sigue disponible.
        </p>
      ) : (
        <>
          {mapError && (
            <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              No se pudo cargar Mapbox. Puedes consultar la lista de viajes y ubicaciones debajo.
            </p>
          )}
          <div ref={mapContainer} className="h-80 w-full overflow-hidden rounded-lg border bg-gray-100" aria-label="Mapa de viajes activos" />
        </>
      )}

      {trips.length === 0 ? (
        <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">{loading ? "Cargando viajes…" : "No hay viajes activos en este momento."}</p>
      ) : (
        <ul className="divide-y rounded-lg border" aria-label="Lista de viajes activos">
          {trips.map((trip) => {
            const location = trip.driverLocations[0]
            const stale = location && Date.now() - new Date(location.createdAt).getTime() > 60_000
            return (
              <li key={trip.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{trip.driver.name ?? "Chofer"} · {statusLabel(trip.operationalStatus)}</p>
                  <p className="text-sm text-gray-600">Pasajero: {trip.requester.name ?? "Sin nombre"} · Viaje {trip.id.slice(-8)}</p>
                </div>
                <p className={`text-sm ${stale ? "font-medium text-amber-700" : "text-gray-600"}`}>
                  {location ? `${locationAge(location.createdAt)}${stale ? " · ubicación desactualizada" : ""}` : "Aún no comparte ubicación"}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
