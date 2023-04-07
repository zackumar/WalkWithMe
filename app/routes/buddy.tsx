import { Header } from '../components/Header';
import {
  deleteRoute,
  doesRouteExist,
  getRoutes,
  startRoute,
} from '../firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { RouteCard } from '~/components/Route';
import { useOptionalUser } from '~/utils/auth';
import {
  DIRECTION_OPTIONS,
  getRoute,
  secondsToEta,
  useGoogleMap,
  useWatchLocation,
} from '~/utils/mapUtils';

export default function BuddySystem() {
  const user = useOptionalUser();

  const mapRef = useRef<HTMLDivElement>(null);
  const [goo, map] = useGoogleMap(mapRef);

  const [location, available, granted] = useWatchLocation();

  const [routes, setRoutes] = useState<any>([]);

  const [buddyLocation, setBuddyLocation] = useState([0, 0]);

  useEffect(() => {
    if (!location) return;
    setBuddyLocation([location.coords.latitude, location.coords.longitude]);
  }, [location]);

  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!goo || !map || !location) return;
    if (!marker) {
      setMarker(
        new google.maps.Marker({
          position: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
          icon: {
            url: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='Layer_2' data-name='Layer 2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: %23818CF8; %7D .cls-2 %7B fill: %23fff; %7D %3C/style%3E%3C/defs%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Ccircle class='cls-2' cx='50' cy='50' r='50'/%3E%3Ccircle class='cls-1' cx='50' cy='50' r='40'/%3E%3C/g%3E%3C/svg%3E",
            scaledSize: new google.maps.Size(30, 30),
          },
          map: map,
        })
      );
    }

    if (marker) {
      marker.setPosition({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, goo, map, marker]);

  const [routeId, setRouteId] = useState('');
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  const [eta, setEta] = useState('');

  const [alertMarkers, setAlertMarkers] = useState<
    { routeId: string; marker: google.maps.Marker }[]
  >([]);

  useEffect(() => {
    setInterval(() => {
      if (!routeId) {
        getRoutes().then((routes) => {
          setRoutes(routes);
          console.log(routes);
          alertMarkers.map((alertMarker) => alertMarker.marker.setMap(null));
          routes.forEach((route: any) => {
            if (route.alert) {
              const marker = new google.maps.Marker({
                position: {
                  lat: route.currentLoc.latitude,
                  lng: route.currentLoc.longitude,
                },
                icon: {
                  url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_6_2)'%3E%3Cpath d='M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100Z' fill='white'/%3E%3Cpath d='M50.5 93C73.9721 93 93 73.9721 93 50.5C93 27.0279 73.9721 8 50.5 8C27.0279 8 8 27.0279 8 50.5C8 73.9721 27.0279 93 50.5 93Z' fill='%23FF0000'/%3E%3Cpath d='M50 22V54' stroke='white' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M50 81L50 77' stroke='white' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_6_2'%3E%3Crect width='100' height='100' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A",
                  scaledSize: new google.maps.Size(40, 40),
                },
                map: map,
                zIndex: 1000,
                title: 'Alert',
              });
              setAlertMarkers((prev) => [
                ...prev,
                { routeId: route.id, marker },
              ]);
            }
          });
        });
      } else {
        doesRouteExist(routeId).then((exists) => {
          if (!exists) {
            directionsRenderer?.setMap(null);
            setRouteId('');
          }
        });
      }
    }, 2000);
  }, [routeId, directionsRenderer, map, alertMarkers]);

  useEffect(() => {
    if (!goo || !map) return;
    setDirectionsRenderer(new goo.maps.DirectionsRenderer());
  }, [goo, map]);

  const viewRoute = async (
    pickup: string | google.maps.LatLng,
    dropoff: string | google.maps.LatLng
  ) => {
    if (!goo || !map || !directionsRenderer || !(granted || location)) return;

    directionsRenderer.setMap(map);
    directionsRenderer.setOptions(DIRECTION_OPTIONS);

    const route = await getRoute(
      goo,
      new goo.maps.LatLng(buddyLocation[0], buddyLocation[1]),
      dropoff,
      [{ location: pickup }]
    );

    setEta(
      secondsToEta(
        route.routes[0].legs.reduce((acc, leg) => {
          return acc + (leg.distance?.value ?? 0);
        }, 0)
      )
    );
    directionsRenderer.setDirections(route);
  };

  return (
    <div className="min-h-screen relative ">
      <Header />
      <main className="relative md:grid md:grid-cols-2 lg:grid-cols-3 flex flex-col h-screen w-screen">
        <section className="relative md:pt-24 md:w-full md:h-full h-[50vh] bg-white p-5 shadow-lg space-y-5 col-span-1 overflow-y-auto">
          <div className="md:hidden w-full flex flex-row justify-center">
            <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
          </div>
          {!(granted || location) ? (
            <h1 className="font-bold text-2xl text-slate-800">
              Please enable location services to continue
            </h1>
          ) : null}
          {!user && (granted || location) ? (
            <h1 className="font-bold text-2xl text-slate-800">
              Please login to continue
            </h1>
          ) : null}
          {!routeId && (granted || location) && user ? (
            <>
              <h1 className="font-bold text-2xl text-slate-800">
                Howdy, Buddy
              </h1>
              <div className="space-y-2 flex flex-col justify-between">
                {routes && routes.length > 0 ? (
                  <ul>
                    {routes.map((route: any) => {
                      const origin = new google.maps.LatLng(
                        route.origin.latitude,
                        route.origin.longitude
                      );
                      const destination = new google.maps.LatLng(
                        route.destination.latitude,
                        route.destination.longitude
                      );

                      return (
                        <RouteCard
                          key={route.id}
                          route={route}
                          onViewRoute={() => {
                            viewRoute(origin, destination);
                          }}
                          onStartRoute={() => {
                            viewRoute(origin, destination);
                            startRoute(route.id, user?.user_id!);
                            setRouteId(route.id);
                          }}
                          onDeleteRoute={() => {
                            deleteRoute(route.id);
                          }}
                        />
                      );
                    })}
                  </ul>
                ) : (
                  <p>No routes</p>
                )}
              </div>
            </>
          ) : null}
          {routeId ? (
            <>
              <h1 className="text-4xl font-semibold mb-10">
                Your Runner:{' '}
                {
                  routes.filter((route: any) => {
                    return route.id === routeId;
                  })[0].displayName
                }
              </h1>
              <img
                className="rounded-full"
                src={
                  routes.filter((route: any) => {
                    return route.id === routeId;
                  })[0].userPhoto
                }
                alt={
                  routes.filter((route: any) => {
                    return route.id === routeId;
                  })[0].displayName
                }
                width="150"
                height="150"
              />
              <div className="space-y-2 flex flex-col justify-between h-[90%]">
                <div className="h-full">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Your Trip</h2>
                    <div className="grid grid-cols-6 w-full relative before:absolute before:top-5 before:h-7 before:w-1.5 before:left-[9px]  before:bg-red-500 before:bg-gradient-to-b before:from-[#F9B8BB] before:to-[#818CF8]">
                      <svg
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                      >
                        <circle cx="25" cy="25" r="25" fill="#F9B8BB" />
                        <circle cx="25.5" cy="24.5" r="12.5" fill="white" />
                      </svg>
                      <p className="col-span-4 overflow-hidden text-ellipsis whitespace-nowrap block text-start">
                        You
                      </p>
                      <p className="col-span-1 text-xs text-right font-semibold">
                        Start
                      </p>
                    </div>
                    <div className="grid grid-cols-6 flex-row w-full relative before:absolute before:top-5 before:h-7 before:w-1.5 before:left-[9px]  before:bg-red-500 before:bg-gradient-to-b before:from-[#818CF8] before:to-[#F9B8BB]">
                      <svg
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                      >
                        <circle cx="25" cy="25" r="25" fill="#818CF8" />
                        <circle cx="25.5" cy="24.5" r="12.5" fill="white" />
                      </svg>
                      <p className="col-span-4 text-base overflow-hidden text-ellipsis whitespace-nowrap block text-start">
                        {
                          routes.filter((route: any) => {
                            return route.id === routeId;
                          })[0].originName
                        }
                      </p>
                      <p className="col-span-1 text-xs text-right font-semibold">
                        Pick up
                      </p>
                    </div>
                    <div className="grid grid-cols-6 w-full">
                      <svg
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                      >
                        <circle cx="25" cy="25" r="25" fill="#F9B8BB" />
                        <circle cx="25.5" cy="24.5" r="12.5" fill="white" />
                      </svg>
                      <p className="col-span-4 overflow-hidden text-ellipsis whitespace-nowrap block text-start">
                        {
                          routes.filter((route: any) => {
                            return route.id === routeId;
                          })[0].destinationName
                        }
                      </p>
                      <p className="col-span-1 text-xs text-right font-semibold">
                        Drop-off
                      </p>
                    </div>
                    <p>
                      <span className="text-lg font-medium">ETA:</span>{' '}
                      {eta ? eta : 'Calculating...'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
        <div
          className="-order-1 md:order-1 md:h-full h-[50vh] md:w-full md:col-span:1 lg:col-span-2"
          id="map"
          ref={mapRef}
        ></div>
      </main>
    </div>
  );
}
