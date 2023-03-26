import { Loader } from '@googlemaps/js-api-loader';
import { Form } from '@remix-run/react';
import type { ChangeEventHandler, FormEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Header } from '../components/Header';
import {
  addRoute,
  auth,
  endRoute,
  isRouteFinished,
  isRouteStarted,
  signInWithGoogle,
  startWalking,
} from '~/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const loader = new Loader({
  apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
  version: 'weekly',
  libraries: ['places'],
});

export async function getPlaces(
  goog: typeof google,
  locQuery: string,
  map: google.maps.Map
) {
  return new Promise((resolve, reject) => {
    const request = {
      query: locQuery,
    };

    const service = new goog.maps.places.PlacesService(map);

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(new Error(`PlacesServiceStatus is ${status}`));
      }
    });
  });
}

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

export default function Index() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [user] = useAuthState(auth);

  const [pickupValue, setPickupValue] = useState('');
  const [dropoffValue, setDropoffValue] = useState('');

  const [goo, setGoogle] = useState<typeof google | null>(null);

  const [places, setPlaces] = useState([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);

  const [routeId, setRouteId] = useState<string | null>(null);

  const onPickupUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!goo || !map) return;
    setPickupValue(e.target.value);

    getPlaces(goo, e.target.value, map).then((places) => {
      setPlaces(places as []);
    });
  };

  const onDropoffUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!goo || !map) return;
    setDropoffValue(e.target.value);

    getPlaces(goo, e.target.value, map).then((places) => {
      setPlaces(places as []);
    });
  };

  const [isRequestPage, setIsRequestPage] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [started, setRouteStarted] = useState(false);
  const [buddyName, setBuddyName] = useState('');

  const [walking, setWalking] = useState(false);
  const [intervalRunning, setIntervalRunning] = useState(false);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!isRequestPage) {
      if (!goo) return;
      if (!directionsRenderer) return;

      directionsRenderer.setMap(map);

      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: '#818CF8',
        },
      });

      directionsRenderer.setDirections(
        await getRoute(google, pickupValue, dropoffValue)
      );

      setIsRequestPage(true);
      setPlaces([]);
      setDropoffFocused(false);
      setPickupFocused(false);
    } else {
      setRouteId(
        (
          await addRoute(
            user?.uid!,
            user?.displayName!,
            pickupValue,
            dropoffValue
          )
        ).id
      );
      setIsRequested(true);
      setIntervalRunning(true);
    }
  };

  useEffect(() => {
    if (!routeId) return;

    if (intervalRunning) {
      var interval = setInterval(() => {
        isRouteStarted(routeId).then((isStarted) => {
          setRouteStarted(isStarted.isStarted);
          setBuddyName(isStarted.buddyName);
        });
        isRouteFinished(routeId).then((finished) => {
          if (finished) clearInterval(interval);
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [routeId, intervalRunning]);

  useEffect(() => {
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPickupValue(
          `${position.coords.latitude}, ${position.coords.longitude}`
        );
      });
    }
  };

  useEffect(() => {
    if (!map || !goo) return;

    setDirectionsRenderer(new goo.maps.DirectionsRenderer());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const svgMarker = {
          path: 'M25 50C38.8071 50 50 38.8071 50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 38.8071 11.1929 50 25 50ZM25.5 37C32.4036 37 38 31.4036 38 24.5C38 17.5964 32.4036 12 25.5 12C18.5964 12 13 17.5964 13 24.5C13 31.4036 18.5964 37 25.5 37Z',
          fillColor: '#ff0000',
          fillOpacity: 0.9,
          strokeWeight: 0,
          rotation: 0,
          scale: 0.5,
          anchor: new google.maps.Point(15, 30),
        };

        map.panTo(
          new goo.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
        );

        new google.maps.Marker({
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          icon: svgMarker,
          map: map,
        });
      });
    }
  }, [map, goo]);

  const onArrive = () => {
    endRoute(routeId!);
    setRouteId('');
    setPickupValue('');
    setDropoffValue('');
    setPlaces([]);
    setPickupFocused(false);
    setDropoffFocused(false);
    setIsRequestPage(false);
    setIsRequested(false);
    setRouteStarted(false);
    setBuddyName('');
    setWalking(false);
    setIntervalRunning(false);
    directionsRenderer?.setMap(null);
  };

  return (
    <div className="min-h-screen relative ">
      <Header />
      <main className="relative bg-gray-500">
        <div className="top-0 left-0 right-0 relative">
          <div className="h-screen w-screen" id="map" ref={mapRef}></div>
        </div>
        <section className="absolute inset-2 top-1/2 md:top-[unset] md:left-10 md:bottom-10 md:h-3/4 md:w-96 bg-white rounded-xl p-5 shadow-lg space-y-5">
          {!user ? (
            <div className="flex flex-col h-full">
              <div className="grow flex flex-col justify-center items-center">
                <h1 className="font-bold text-2xl text-slate-800 text-center">
                  Howdy Runner! Please log in to get started!
                </h1>
              </div>
              <button
                className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
                onClick={signInWithGoogle}
              >
                Log in
              </button>
            </div>
          ) : null}
          {!started && user ? (
            <>
              {' '}
              <h1 className="font-bold text-2xl text-slate-800">
                Howdy, Runner
              </h1>
              <Form
                className="space-y-2 flex flex-col justify-between h-[90%]"
                onSubmit={onSubmit}
              >
                <div>
                  <div className="relative">
                    <input
                      className="border border-slate-200 bg-slate-100 rounded-t-lg p-5 w-full placeholder:text-slate-500"
                      name="pickup"
                      type="text"
                      placeholder="Pickup"
                      required
                      value={pickupValue}
                      onChange={onPickupUpdate}
                      onFocus={() => {
                        setPlaces([]);
                        setPickupFocused(true);
                        setDropoffFocused(false);
                      }}
                    ></input>
                    {!isRequestPage ? (
                      <button
                        className="fill-indigo-400 absolute right-4 top-4 w-8 h-8"
                        onClick={getCurrentLocation}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  <input
                    className="border border-t-0 border-slate-200 bg-slate-100 rounded-b-lg p-5 w-full placeholder:text-slate-500"
                    name="dropoff"
                    type="text"
                    placeholder="Drop off"
                    required
                    value={dropoffValue}
                    onChange={onDropoffUpdate}
                    onFocus={() => {
                      setPlaces([]);
                      setDropoffFocused(true);
                      setPickupFocused(false);
                    }}
                  ></input>
                </div>
                {(dropoffFocused || pickupFocused) && places.length > 0 ? (
                  <ul className="grow overflow-y-scroll p-2">
                    {places.map((place: any) => {
                      return (
                        <li key={place.place_id}>
                          <button
                            className="hover:bg-indigo-100 rounded-sm"
                            onClick={() => {
                              console.log(pickupFocused, dropoffFocused);
                              if (pickupFocused) {
                                setPickupValue(place.formatted_address);
                                setPickupFocused(false);
                              }
                              if (dropoffFocused) {
                                setDropoffValue(place.formatted_address);
                                setDropoffFocused(false);
                              }
                            }}
                          >
                            {place.formatted_address}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {isRequestPage ? (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Your Trip</h2>
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
                        {pickupValue}
                      </p>
                      <p className="col-span-1 text-xs text-right font-semibold">
                        Pick up
                      </p>
                      {/* {data.route.pickup} */}
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
                        {dropoffValue}
                      </p>
                      <p className="col-span-1 text-xs text-right font-semibold">
                        Drop-off
                      </p>
                      {/* {data.route.destination} */}
                    </div>
                    {/* {data.route.pickup} to {data.route.destination} */}
                  </div>
                ) : null}
                <div className="pt-4 border-t border-t-slate-300">
                  {!isRequested ? (
                    <button
                      className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
                      name="submit"
                      value="details"
                      type="submit"
                      disabled={isRequested}
                    >
                      {!isRequestPage ? 'Details' : null}
                      {isRequestPage && !isRequested ? 'Request Walk' : null}
                    </button>
                  ) : null}
                  {isRequested ? (
                    <p className="text-center">
                      You will be notified when someone is on the way.
                    </p>
                  ) : null}
                </div>
              </Form>{' '}
            </>
          ) : null}
          {/* {started && !walking  */}
          {started && !walking ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="grow flex flex-col items-center justify-center">
                <h1 className="text-3xl font-medium text-center">
                  Your Buddy, {buddyName}, is on their way to pick you up!
                </h1>
              </div>
              <button
                className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
                onClick={() => {
                  setWalking(true);
                  startWalking(routeId!);
                }}
              >
                Press here when buddy has arrived
              </button>
            </div>
          ) : null}

          {/* {walking  */}
          {walking ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="grow flex flex-col items-center space-y-4">
                <h1 className="text-3xl font-medium text-center">
                  Your safety is our highest priority.
                </h1>
                <h2 className="text-center">
                  If you ever feel like you are in danger, alert the police
                  here.
                </h2>
                <button className="rounded-full p-3 font-semibold hover:bg-red-500 bg-red-400 text-white w-full">
                  Alert
                </button>
              </div>
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Your Trip</h2>
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
                      {pickupValue}
                    </p>
                    <p className="col-span-1 text-xs text-right font-semibold">
                      Pick up
                    </p>
                    {/* {data.route.pickup} */}
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
                      {dropoffValue}
                    </p>
                    <p className="col-span-1 text-xs text-right font-semibold">
                      Drop-off
                    </p>
                    {/* {data.route.destination} */}
                  </div>
                  {/* {data.route.pickup} to {data.route.destination} */}
                </div>
                <button
                  className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
                  onClick={onArrive}
                >
                  Arrived to Destination
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
