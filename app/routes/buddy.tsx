import { Loader } from '@googlemaps/js-api-loader';
import { useActionData } from '@remix-run/react';

import { useEffect, useRef, useState } from 'react';

import { auth, getRoutes, startRoute } from '../firebase';

import { Header } from '../components/Header';
import { useAuthState } from 'react-firebase-hooks/auth';

const loader = new Loader({
  apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
  version: 'weekly',
  libraries: ['places'],
});

export async function getRoute(
  goo: typeof google,
  origin: string | google.maps.LatLng | google.maps.Place,
  destination: string | google.maps.LatLng | google.maps.Place,
  waypoints?: google.maps.DirectionsWaypoint[]
) {
  var directionsService = new goo.maps.DirectionsService();
  if (waypoints == null) {
    var request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.WALKING,
    };
    return directionsService.route(
      request,
      function (result: any, status: any) {
        if (status == google.maps.DirectionsStatus.OK) {
          return result;
        }
      }
    );
  } else {
    var request2 = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.WALKING,
      waypoints: waypoints,
    };
    return directionsService.route(
      request2,
      function (result: any, status: any) {
        if (status == google.maps.DirectionsStatus.OK) {
          return result;
        }
      }
    );
  }
}

export default function BuddySystem() {
  const [user] = useAuthState(auth);
  const mapRef = useRef<HTMLDivElement>(null);

  const [goo, setGoogle] = useState<typeof google | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    getRoutes().then((routes) => {
      setRoutes(routes);
    });
    loader
      .load()
      .then(async (google) => {
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 29.58343962451892, lng: -98.62006139828749 },
            zoom: 14,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            keyboardShortcuts: false,
            zoomControl: false,
            mapId: '7712e063257c268f',
          });

          setGoogle(google);
          setMap(map);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [mapRef]);

  const viewRoute = async (
    pickup: string | google.maps.LatLng,
    dropoff: string | google.maps.LatLng
  ) => {
    if (!goo) return;
    const directionsRenderer = new goo.maps.DirectionsRenderer();

    directionsRenderer.setMap(map);

    directionsRenderer.setDirections(
      await getRoute(
        google,
        new goo.maps.LatLng(29.42315, -98.49879),
        dropoff,
        [{ location: pickup }]
      )
    );
  };

  return (
    <div className="min-h-screen relative ">
      <Header />
      <main className="relative bg-gray-500 grid grid-cols-2">
        <section className="pt-24 h-full w-full bg-white p-5 shadow-lg space-y-5">
          <h1 className="font-bold text-2xl text-slate-800">Howdy, Buddy</h1>
          <div className="space-y-2 flex flex-col justify-between h-[90%]">
            <div className="h-full">
              {routes && routes.length > 0 ? (
                <ul>
                  {routes.map((route: any) => {
                    return (
                      <div
                        className="border border-slate-200 bg-slate-100 rounded-lg p-5 mb-5"
                        key={route.id}
                      >
                        <div className="grid grid-cols-4 gap-1 p-[2px]">
                          <div className="border border-slate-200 bg-slate-100 rounded-lg p-5  w-full col-span-2">
                            <h1 className="text-lg font-medium">
                              {route.displayName}
                            </h1>
                            <p className="text-sm">{route.start}</p>
                          </div>

                          <button
                            className="border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center"
                            onClick={(e) => {
                              viewRoute(route.start, route.destination);
                            }}
                          >
                            View Route
                          </button>
                          <button
                            className="border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center"
                            onClick={() => {
                              startRoute(route.id, user?.displayName!);
                            }}
                          >
                            Start Route
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </ul>
              ) : (
                <p>No routes</p>
              )}
            </div>
          </div>
        </section>
        <div className="h-full w-full">
          <div className="h-screen w-[50wh]" id="map" ref={mapRef}></div>
        </div>
      </main>
    </div>
  );
}
