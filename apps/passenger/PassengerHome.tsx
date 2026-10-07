import { useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { mobileApiRequest } from "@collage/shared"

type Language = "es" | "en"
type User = { id: string; role: string }
type Trip = {
  id: string
  operationalStatus: string
  driverId: string
  requesterId: string
  driver: { id: string; name: string | null }
  requester: { id: string; name: string | null }
  driverLocations: { latitude: number; longitude: number; accuracyM: number | null; createdAt: string }[]
}

const ACTIVE_STATUSES = ["on_the_way", "arrived", "in_trip"]
const TEXT = {
  es: {
    title: "Mis viajes",
    loading: "Cargando viajes…",
    empty: "No tienes viajes activos para seguir.",
    refresh: "Actualizar",
    select: "Selecciona un viaje",
    driver: "Chofer",
    accepted: "Aceptado",
    on_the_way: "En camino",
    arrived: "Llegó",
    in_trip: "En viaje",
    completed: "Completado",
    cancelled: "Cancelado",
    waiting: "El chofer todavía no comparte su ubicación.",
    privacy: "Solo puedes ver la ubicación del chofer de tu propio viaje activo.",
    noEta: "ETA de carretera no disponible.",
    updated: "Última actualización",
    error: "No se pudieron cargar los viajes.",
  },
  en: {
    title: "My trips",
    loading: "Loading trips…",
    empty: "You have no active trips to track.",
    refresh: "Refresh",
    select: "Select a trip",
    driver: "Driver",
    accepted: "Accepted",
    on_the_way: "On the way",
    arrived: "Arrived",
    in_trip: "In trip",
    completed: "Completed",
    cancelled: "Cancelled",
    waiting: "The driver is not sharing a location yet.",
    privacy: "You can only view the driver location for your own active trip.",
    noEta: "Road ETA is not available.",
    updated: "Last update",
    error: "Could not load trips.",
  },
} as const

export function PassengerHome({ user, language }: { user: User; language: Language }) {
  const text = TEXT[language]
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedId), [trips, selectedId])

  useEffect(() => {
    let active = true
    let refreshing = false
    async function refresh() {
      if (refreshing) return
      refreshing = true
      try {
        const response = await mobileApiRequest<Trip[]>("/api/v1/trips")
        if (!active) return
        const passengerTrips = response.filter((trip) => trip.requesterId === user.id)
        setTrips(passengerTrips)
        setSelectedId((current) => current || passengerTrips[0]?.id || "")
        setMessage("")
      } catch {
        if (active) setMessage(text.error)
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
  }, [text.error, user.id])

  const location = selectedTrip && ACTIVE_STATUSES.includes(selectedTrip.operationalStatus)
    ? selectedTrip.driverLocations[0]
    : undefined

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{text.title}</Text>
        <Pressable accessibilityRole="button" onPress={() => {
          setLoading(true)
          mobileApiRequest<Trip[]>("/api/v1/trips")
            .then((data) => setTrips(data.filter((trip) => trip.requesterId === user.id)))
            .catch(() => setMessage(text.error))
            .finally(() => setLoading(false))
        }}>
          <Text style={styles.link}>{text.refresh}</Text>
        </Pressable>
      </View>
      <Text style={styles.info}>{text.privacy}</Text>
      {loading && <Text style={styles.info}>{text.loading}</Text>}
      {!loading && trips.length === 0 && <Text style={styles.info}>{text.empty}</Text>}
      {trips.length > 0 && (
        <>
          <Text style={styles.label}>{text.select}</Text>
          <View style={styles.tripList}>
            {trips.map((trip) => (
              <Pressable key={trip.id} onPress={() => setSelectedId(trip.id)} style={[styles.tripChoice, selectedId === trip.id && styles.tripChoiceSelected]}>
                <Text style={styles.tripText}>
                  {text[trip.operationalStatus as keyof typeof text] ?? trip.operationalStatus} · {trip.driver.name ?? text.driver}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {selectedTrip && (
        <View style={styles.card}>
          <Text style={styles.tripTitle}>{text.driver}: {selectedTrip.driver.name ?? "—"}</Text>
          <Text style={styles.status}>{text[selectedTrip.operationalStatus as keyof typeof text] ?? selectedTrip.operationalStatus}</Text>
          {location ? (
            <>
              <MapView
                accessibilityLabel={text.driver}
                initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                style={styles.map}
              >
                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={selectedTrip.driver.name ?? text.driver} />
              </MapView>
              <Text style={styles.note}>
                {text.updated}: {new Date(location.createdAt).toLocaleTimeString(language === "es" ? "es" : "en")}
              </Text>
            </>
          ) : (
            <Text style={styles.info}>{text.waiting}</Text>
          )}
          <Text style={styles.note}>{text.noEta}</Text>
        </View>
      )}
      {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 14, padding: 18, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { color: "#0f172a", fontSize: 22, fontWeight: "700" },
  link: { color: "#1d4ed8", fontWeight: "600" },
  info: { color: "#475569", lineHeight: 21 },
  label: { color: "#334155", fontWeight: "600" },
  tripList: { gap: 8 },
  tripChoice: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, backgroundColor: "white" },
  tripChoiceSelected: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  tripText: { color: "#0f172a" },
  card: { gap: 12, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, backgroundColor: "white" },
  tripTitle: { color: "#0f172a", fontWeight: "700" },
  status: { color: "#475569" },
  map: { width: "100%", height: 320, borderRadius: 8 },
  note: { color: "#64748b", fontSize: 13 },
  message: { color: "#9a3412", lineHeight: 21 },
})
