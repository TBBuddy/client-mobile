import { Camera, Map as MapLibreMap, Marker } from '@maplibre/maplibre-react-native';
import Constants from 'expo-constants';
import { Map } from 'lucide-react-native';
import type { ReactElement } from 'react';
import { useRef } from 'react';
import { Animated, View } from 'react-native';

import { MapErrorBoundary } from './map-error-boundary';
import { Text } from './tw';

// OSM raster tiles — dikirim sebagai string JSON (MapLibre parse otomatis).
// Koordinat MapLibre selalu [longitude, latitude] — JANGAN dibalik.
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

const OSM_STYLE_JSON = JSON.stringify(OSM_STYLE);

// Warna latar OSM (daratan) — muncul saat tiles belum siap, gantikan hitam.
const OSM_LAND_COLOR = '#f2efe9';

// Expo Go tidak menyertakan native module MapLibre — deteksi di module level
// agar tidak ada percobaan render MapLibreMap sama sekali.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export type OsmMapMarker = {
  id: string;
  lat: number;
  lng: number;
  render: () => ReactElement;
};

type OsmMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: OsmMapMarker[];
  interactive?: boolean;
};

export function OsmMap({
  center,
  zoom = 13,
  markers = [],
  interactive = true,
}: OsmMapProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  function handleFullyRendered() {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  if (isExpoGo) {
    return (
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          borderRadius: 24,
          backgroundColor: OSM_LAND_COLOR,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Map color="#263238" size={28} strokeWidth={1.5} style={{ opacity: 0.25 }} />
        <Text
          style={{
            fontSize: 12,
            color: '#263238',
            opacity: 0.4,
            textAlign: 'center',
            lineHeight: 18,
          }}
        >
          {'Peta tidak tersedia\ndi Expo Go'}
        </Text>
      </View>
    );
  }

  return (
    <MapErrorBoundary>
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          borderRadius: 24,
          backgroundColor: OSM_LAND_COLOR,
        }}
      >
        <Animated.View style={{ flex: 1, opacity }}>
          <MapLibreMap
            style={{ flex: 1 }}
            mapStyle={OSM_STYLE_JSON}
            dragPan={interactive}
            touchZoom={interactive}
            doubleTapZoom={interactive}
            doubleTapHoldZoom={interactive}
            touchRotate={interactive}
            touchPitch={interactive}
            onDidFinishRenderingMapFully={handleFullyRendered}
          >
            <Camera initialViewState={{ center: [center.lng, center.lat], zoom }} />
            {markers.map((m) => (
              <Marker key={m.id} id={m.id} lngLat={[m.lng, m.lat]}>
                {m.render()}
              </Marker>
            ))}
          </MapLibreMap>
        </Animated.View>

        {/* Attribution OSM wajib terlihat — di luar Animated agar selalu visible */}
        <View
          style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.8)',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text className="text-[9px] text-brand-ink" style={{ opacity: 0.7 }}>
            © OpenStreetMap
          </Text>
        </View>
      </View>
    </MapErrorBoundary>
  );
}
