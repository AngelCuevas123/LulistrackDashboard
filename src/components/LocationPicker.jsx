import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_CENTER = [-102, 23];

function LocationPicker({ latitude, longitude, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasInitialLocation = latitude !== "" && longitude !== "" &&
      Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
    const initialCenter = hasInitialLocation
      ? [Number(longitude), Number(latitude)]
      : DEFAULT_CENTER;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: initialCenter,
      zoom: hasInitialLocation ? 15 : 4.5,
      attributionControl: true
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker({
      color: "#213A81",
      draggable: true
    });

    markerRef.current = marker;

    if (hasInitialLocation) {
      marker.setLngLat(initialCenter).addTo(map);
    }

    map.on("click", (event) => {
      marker.setLngLat(event.lngLat).addTo(map);
      onChangeRef.current?.({
        latitude: Number(event.lngLat.lat.toFixed(7)),
        longitude: Number(event.lngLat.lng.toFixed(7))
      });
    });

    marker.on("dragend", () => {
      const point = marker.getLngLat();
      onChangeRef.current?.({
        latitude: Number(point.lat.toFixed(7)),
        longitude: Number(point.lng.toFixed(7))
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (latitude === "" || longitude === "") {
      if (marker.getElement().isConnected) marker.remove();
      return;
    }

    const point = [Number(longitude), Number(latitude)];
    marker.setLngLat(point);
    if (!marker.getElement().isConnected) marker.addTo(map);
  }, [latitude, longitude]);

  return (
    <div className="location-picker">
      <div ref={containerRef} className="location-picker-map" />
      <div className="location-picker-hint">
        <MapPinIcon />
        Selecciona el punto exacto donde debe llegar el repartidor.
      </div>
    </div>
  );
}

function MapPinIcon() {
  return <span aria-hidden="true">⌖</span>;
}

export default LocationPicker;
