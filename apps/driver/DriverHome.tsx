import { useEffect, useMemo, useRef, useState } from "react"
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import { mobileApiPatch, mobileApiRequest } from "@collage/shared"

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

const TEXT = {
  es: {
    title: "Mis viajes activos",
    loading: "Cargando viajes…",
    empty: "No tienes viajes activos habilitados para seguimiento.",
    notDriver: "Esta cuenta no tiene el rol de chofer aprobado.",
    refresh: "Actualizar",
    select: "Selecciona un viaje",
    passenger: "Pasajero",
    accepted: "Aceptado",
    on_the_way: "En camino",
    arrived: "Llegó",
    in_trip: "En viaje",
    go: "Voy en camino",
    arrive: "Marcar que llegué",
    begin: "Iniciar viaje",
    share: "Compartir mi ubicación",
    stop: "Dejar de compartir",
    permission: "Permite el acceso a la ubicación mientras usas la app para iniciar el seguimiento.",
    denied: "No se concedió el permiso de ubicación. Puedes activarlo en los ajustes del teléfono.",
    privacy: "Tu ubicación se comparte solo durante este viaje y mientras esta app esté en primer plano. El historial se conserva 30 días.",
    foreground: "El seguimiento se detuvo al salir de la app. Mantén esta pantalla abierta durante la prueba.",
    gpsError: "No se pudo obtener o enviar la ubicación. Comprueba tu conexión y el permiso del teléfono.",
    location: "Tu posición",
    waiting: "Esperando ubicación GPS…",
    noEta: "La ETA de carretera no está habilitada.",
    error: "No se pudieron cargar los viajes.",
  },
  en: {
    title: "My active trips",
    loading: "Loading trips…",
    empty: "You have no active trips enabled for tracking.",
    notDriver: "This account does not have the approved driver role.",
    refresh: "Refresh",
    select: "Select a trip",
    passenger: "Passenger",
    accepted: "Accepted",
    on_the_way: "On the way",
    arrived: "Arrived",
    in_trip: "In trip",
    go: "I'm on my way",
    arrive: "Mark as arrived",
    begin: "Start trip",
    share: "Share my location",
    stop: "Stop sharing",
    permission: "Allow location access while using the app to start tracking.",
    denied: "Location permission was not granted. You can enable it in your phone settings.",
    privacy: "Your location is shared only during this trip while this app is in the foreground. History is retained for 30 days.",
    foreground: "Tracking stopped when the app left the foreground. Keep this screen open for the test.",
    gpsError: "Could not get or send location. Check your connection and phone permission.",
    location: "Your position",
    waiting: "Waiting for GPS location…",
    noEta: "Road ETA is not enabled.",
    error: "Could not load trips.",
  },
} as const

const ACTIVE_STATUSES = ["on_the_way", "arrived", "in_trip"]

export function DriverHome({ user, language }: { user: User; language: Language }) {
  const text = TEXT[language]
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [sharingTripId, setSharingTripId] = useState("")
  const [position, setPosition] = useState<Location.LocationObjectCoords | null>(null)
  const [message, setMessage] = useState("")
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedId), [trips, selectedId])
  const sharingTrip = trips.find((trip) => trip.id === sharingTripId)
  const sendingRef = useRef(false)

  useEffect(() => {
    let active = true
    let refreshing = false
    async function refresh() {
      if (refreshing) return
      refreshing = true
      try {
        const response = await mobileApiRequest<Trip[]>("/api/v1/trips")
        if (!active) return
        const driverTrips = response.filter((trip) => trip.driverId === user.id)
        setTrips(driverTrips)
        setSelectedId((current) => current || driverTrips[0]?.id || "")
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

  useEffect(() => {
    if (!sharingTripId || !sharingTrip || !ACTIVE_STATUSES.includes(sharingTrip.operationalStatus)) return
    let active = true
    let subscription: Location.LocationSubscription | undefined
    let lastSentAt = 0
    async function watch() {
      try {
        const nextSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5_000, distanceInterval: 5 },
          async (current) => {
            if (!active) return
            setPosition(current.coords)
            if (sendingRef.current || Date.now() - lastSentAt < 5_000) return
            sendingRef.current = true
            lastSentAt = Date.now()
            try {
              await mobileApiRequest(`/api/v1/trips/${sharingTripId}/location`, {
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
                accuracyM: current.coords.accuracy ?? undefined,
              })
            } catch {
              if (active) setMessage(text.gpsError)
            } finally {
              sendingRef.current = false
            }
          },
        )
        if (active) subscription = nextSubscription
        else nextSubscription.remove()
      } catch {
        if (active) {
          setMessage(text.gpsError)
          setSharingTripId("")
        }
      }
    }
    void watch()
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        active = false
        subscription?.remove()
        setSharingTripId("")
        setMessage(text.foreground)
      }
    })
    return () => {
      active = false
      subscription?.remove()
      appStateSubscription.remove()
    }
  }, [sharingTrip, sharingTripId, text.foreground, text.gpsError])

  async function updateStatus(status: string) {
    if (!selectedTrip) return
    setBusy(true)
    setMessage("")
    try {
      await mobileApiPatch(`/api/v1/trips/${selectedTrip.id}/status`, { status })
      const response = await mobileApiRequest<Trip[]>("/api/v1/trips")
      const driverTrips = response.filter((trip) => trip.driverId === user.id)
      setTrips(driverTrips)
      setMessage("")
    } catch {
      setMessage(text.error)
    } finally {
      setBusy(false)
    }
  }

  async function startSharing() {
    if (!selectedTrip || !ACTIVE_STATUSES.includes(selectedTrip.operationalStatus)) return
    setBusy(true)
    setMessage(text.permission)
    try {
      let permission = await Location.getForegroundPermissionsAsync()
      if (permission.status !== "granted") permission = await Location.requestForegroundPermissionsAsync()
      if (permission.status !== "granted") {
        setMessage(text.denied)
        return
      }
      setMessage("")
      setPosition(null)
      setSharingTripId(selectedTrip.id)
    } catch {
      setMessage(text.denied)
    } finally {
      setBusy(false)
    }
  }

  const nextStatus = selectedTrip?.operationalStatus === "accepted"
    ? "on_the_way"
    : selectedTrip?.operationalStatus === "on_the_way"
      ? "arrived"
      : selectedTrip?.operationalStatus === "arrived"
        ? "in_trip"
        : null
  const nextLabel = nextStatus === "on_the_way"
    ? text.go
    : nextStatus === "arrived"
      ? text.arrive
      : nextStatus === "in_trip"
        ? text.begin
        : ""

  if (user.role !== "driver") {
    return <View style={styles.container}><Text style={styles.info}>{text.notDriver}</Text></View>
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{text.title}</Text>
        <Pressable accessibilityRole="button" onPress={() => {
          setLoading(true)
          mobileApiRequest<Trip[]>("/api/v1/trips")
            .then((data) => setTrips(data.filter((trip) => trip.driverId === user.id)))
            .catch(() => setMessage(text.error))
            .finally(() => setLoading(false))
        }}>
          <Text style={styles.link}>{text.refresh}</Text>
        </Pressable>
      </View>
      <Text style={styles.privacy}>{text.privacy}</Text>
      {loading && <Text style={styles.info}>{text.loading}</Text>}
      {!loading && trips.length === 0 && <Text style={styles.info}>{text.empty}</Text>}
      {trips.length > 0 && (
        <>
          <Text style={styles.label}>{text.select}</Text>
          <View style={styles.tripList}>
            {trips.map((trip) => (
              <Pressable key={trip.id} onPress={() => setSelectedId(trip.id)} style={[styles.tripChoice, selectedId === trip.id && styles.tripChoiceSelected]}>
                <Text style={styles.tripText}>{text[trip.operationalStatus as keyof typeof text] ?? trip.operationalStatus} · {trip.id.slice(-6)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {selectedTrip && (
        <View style={styles.card}>
          <Text style={styles.tripTitle}>{text.passenger}: {selectedTrip.requester.name ?? "—"}</Text>
          <Text style={styles.status}>{text[selectedTrip.operationalStatus as keyof typeof text] ?? selectedTrip.operationalStatus}</Text>
          {!!nextStatus && (
            <Pressable disabled={busy} onPress={() => void updateStatus(nextStatus)} style={styles.button}>
              <Text style={styles.buttonText}>{nextLabel}</Text>
            </Pressable>
          )}
          {ACTIVE_STATUSES.includes(selectedTrip.operationalStatus) && (
            <Pressable disabled={busy} onPress={() => {
              if (sharingTripId === selectedTrip.id) setSharingTripId("")
              else void startSharing()
            }} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>{sharingTripId === selectedTrip.id ? text.stop : text.share}</Text>
            </Pressable>
          )}
          {position ? (
            <MapView
              accessibilityLabel={text.location}
              initialRegion={{ latitude: position.latitude, longitude: position.longitude, latitudeDelta: 0.015, longitudeDelta: 0.015 }}
              style={styles.map}
            >
              <Marker coordinate={{ latitude: position.latitude, longitude: position.longitude }} title={text.location} />
            </MapView>
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
  privacy: { color: "#475569", lineHeight: 21 },
  info: { color: "#475569", paddingVertical: 8 },
  label: { color: "#334155", fontWeight: "600" },
  tripList: { gap: 8 },
  tripChoice: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, backgroundColor: "white" },
  tripChoiceSelected: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  tripText: { color: "#0f172a" },
  card: { gap: 12, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, backgroundColor: "white" },
  tripTitle: { color: "#0f172a", fontWeight: "700" },
  status: { color: "#475569" },
  button: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#2563eb", paddingHorizontal: 12 },
  secondaryButton: { backgroundColor: "#0f766e" },
  buttonText: { color: "white", fontWeight: "700" },
  map: { width: "100%", height: 260, borderRadius: 8 },
  note: { color: "#64748b", fontSize: 13 },
  message: { color: "#9a3412", lineHeight: 21 },
})
