import { Hospital } from "lucide-react-native";

import type { NearbyFacility } from "../services/repository/types";
import { OsmMap, type OsmMapMarker } from "./osm-map";
import { Pressable, View } from "./tw";

type FacilitiesMapProps = {
  center: { lat: number; lng: number };
  facilities: NearbyFacility[];
  onSelect: (id: string) => void;
};

export function FacilitiesMap({
  center,
  facilities,
  onSelect,
}: FacilitiesMapProps) {
  const markers: OsmMapMarker[] = [
    {
      id: "__me__",
      lat: center.lat,
      lng: center.lng,
      render: () => (
        <View
          style={{
            height: 16,
            width: 16,
            borderRadius: 999,
            backgroundColor: "#263238",
            borderWidth: 3,
            borderColor: "#FFFFFF",
          }}
        />
      ),
    },
    ...facilities.map<OsmMapMarker>((f) => ({
      id: f.id,
      lat: f.latitude,
      lng: f.longitude,
      render: () => (
        <Pressable
          onPress={() => onSelect(f.id)}
          style={{
            height: 40,
            width: 40,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: f.isTbServiceAvailable ? "#A3E7E2" : "#FFFFFF",
            borderWidth: f.isTbServiceAvailable ? 3 : 2,
            borderColor: f.isTbServiceAvailable ? "#FFFFFF" : "#263238",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 4,
          }}
        >
          <Hospital color="#263238" size={20} strokeWidth={2} />
        </Pressable>
      ),
    })),
  ];

  return <OsmMap center={center} markers={markers} />;
}
