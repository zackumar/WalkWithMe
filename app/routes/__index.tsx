import { Outlet } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { useGoogleMap, useWatchLocation } from '~/utils/mapUtils';

import { Header } from '../components/Header';

export default function Index() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [goo, map] = useGoogleMap(mapRef);

  const [userLocation] = useWatchLocation();
  const [marker, setMarker] = useState<google.maps.Marker>();

  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!goo || !map) return;
    setDirectionsRenderer(
      new google.maps.DirectionsRenderer({
        map,
      })
    );
  }, [goo, map]);

  useEffect(() => {
    if (!goo || !map || !userLocation) return;
    if (!marker) {
      setMarker(
        new google.maps.Marker({
          position: {
            lat: userLocation.coords.latitude,
            lng: userLocation.coords.longitude,
          },
          icon: {
            url: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='Layer_2' data-name='Layer 2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: %23818CF8; %7D .cls-2 %7B fill: %23fff; %7D %3C/style%3E%3C/defs%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Ccircle class='cls-2' cx='50' cy='50' r='50'/%3E%3Ccircle class='cls-1' cx='50' cy='50' r='40'/%3E%3C/g%3E%3C/svg%3E",
            scaledSize: new google.maps.Size(30, 30),
          },
          map: map,
        })
      );
    }

    // map.panTo({
    //   lat: userLocation.coords.latitude,
    //   lng: userLocation.coords.longitude,
    // });

    if (marker) {
      marker.setPosition({
        lat: userLocation.coords.latitude,
        lng: userLocation.coords.longitude,
      });
    }
  }, [userLocation, goo, map, marker]);

  return (
    <div className="min-h-screen relative ">
      <Header />
      <main className="relative">
        <div
          className="h-[50vh] md:h-screen w-screen"
          id="map"
          ref={mapRef}
        ></div>

        <section className="md:absolute md:left-10 md:bottom-10 md:h-3/4 md:w-96 z-10 relative w-screen h-[50vh] p-5 pt-2 bg-white rounded-xl shadow-lg space-y-5">
          <div className="md:hidden w-full flex flex-row justify-center">
            <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
          </div>
          <Outlet context={{ goo, map, directionsRenderer }} />
        </section>
      </main>
    </div>
  );
}
