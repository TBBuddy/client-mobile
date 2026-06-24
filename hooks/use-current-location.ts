import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

export type LocationState =
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "error"; message: string };

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>({ status: "loading" });
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const start = useCallback(async () => {
    subRef.current?.remove();
    subRef.current = null;
    setState({ status: "loading" });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState({ status: "denied" });
        return;
      }

      // Seed cepat dari last-known biar UI tidak loading lama.
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        setState({
          status: "granted",
          lat: last.coords.latitude,
          lng: last.coords.longitude,
        });
      }

      // Live watch — update tiap ada fix baru, termasuk saat "Set Location"
      // ditekan di emulator selagi app terbuka. Di HP asli: update saat bergerak.
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 20,
        },
        (loc) =>
          setState({
            status: "granted",
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          }),
      );
    } catch (err) {
      setState((prev) =>
        prev.status === "granted"
          ? prev
          : {
              status: "error",
              message:
                err instanceof Error ? err.message : "Gagal mengambil lokasi.",
            },
      );
    }
  }, []);

  useEffect(() => {
    start();
    return () => {
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [start]);

  return { state, retry: start };
}
