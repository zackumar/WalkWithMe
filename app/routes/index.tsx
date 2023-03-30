import { Form } from '@remix-run/react';
import type { ChangeEventHandler, FormEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  addRoute,
  auth,
  endRoute,
  isRouteFinished,
  isRouteStarted,
  sendAlert,
  signInWithGoogle,
  startWalking,
} from '~/firebase';
import {
  getRoute,
  useGoogleMap,
  secondsToEta,
  useWatchLocation,
  getPredictions,
  getPlaceDetails,
  getAddressFromLatLon,
} from '~/utils/mapUtils';

import { Header } from '../components/Header';

export default function Index() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [goo, map] = useGoogleMap(mapRef);
  const [location, available, granted] = useWatchLocation();

  const [user] = useAuthState(auth);
  const [pickupValue, setPickupValue] = useState('');
  const [dropoffValue, setDropoffValue] = useState('');
  const [places, setPlaces] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);
  const [routeId, setRouteId] = useState<string | null>(null);

  const [isRequestPage, setIsRequestPage] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [started, setRouteStarted] = useState(false);
  const [buddyName, setBuddyName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [eta, setEta] = useState('');

  const [walking, setWalking] = useState(false);
  const [intervalRunning, setIntervalRunning] = useState(false);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  const [alertMode, setAlertMode] = useState(false);
  const [alertCountdown, setAlertCountdown] = useState(-1);
  const [alertPlace, setAlertPlace] = useState<google.maps.GeocoderResult>();

  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService>();
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();

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
            scaledSize: new google.maps.Size(30, 30)
          },
          map: map,
        })
      );
    }

    map.panTo({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });

    if (marker) {
      marker.setPosition({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, goo, map, marker]);

  useEffect(() => {
    if (!routeId) return;

    if (intervalRunning) {
      var interval = setInterval(() => {
        isRouteStarted(routeId).then((isStarted) => {
          setRouteStarted(isStarted.isStarted);
          setBuddyName(isStarted.buddyName);
          setPhotoUrl(isStarted.buddyPhoto);
        });
        isRouteFinished(routeId).then((finished) => {
          if (finished) clearInterval(interval);
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [routeId, intervalRunning]);

  useEffect(() => {
    if (!goo || !map) return;

    if (alertCountdown != -1) {
      setAlertMode(true);
      var intervalId = setInterval(() => {
        setAlertCountdown(alertCountdown - 1);
      }, 1000);

      if (alertCountdown === 0) {
        setAlertMode(false);
        setWalking(false);
        setRouteStarted(true);
        clearInterval(intervalId);

        if (!location?.coords.latitude || !location?.coords.longitude) return;
        getAddressFromLatLon(
          goo,
          new google.maps.LatLng(
            location.coords.latitude,
            location.coords.longitude
          ),
          map
        ).then((place) => {
          setAlertPlace(place[0]);
        });
      }
    }

    return () => clearInterval(intervalId);
  }, [
    alertCountdown,
    goo,
    map,
    location?.coords.latitude,
    location?.coords.longitude,
  ]);

  useEffect(() => {
    if (alertCountdown === 0 && alertPlace && routeId) {
      sendAlert(routeId, alertPlace.formatted_address!);
    }
  }, [alertPlace, alertCountdown, routeId]);

  useEffect(() => {
    if (!map || !goo) return;
    setDirectionsRenderer(new goo.maps.DirectionsRenderer());
    setAutocompleteService(new google.maps.places.AutocompleteService());

    
  }, [map, goo]);

  const onFocus = async () => {
    if (!goo || !map) return;
    if (!sessionToken)
      setSessionToken(new goo.maps.places.AutocompleteSessionToken());
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!isRequestPage) {
      if (!goo || !map) return;
      if (!directionsRenderer) return;

      directionsRenderer.setMap(map);

      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: '#818CF8',
        },
      });

      const route = await getRoute(goo, pickupValue, dropoffValue);

      setEta(secondsToEta(route.routes[0].legs[0].duration?.value ?? 0));

      directionsRenderer.setDirections(
        await getRoute(goo, pickupValue, dropoffValue)
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

  const onPickupUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!goo || !map) return;
    setPickupValue(e.target.value);

    if (!autocompleteService || !sessionToken || !location) return;

    setPlaces(
      await getPredictions(
        goo,
        map,
        autocompleteService,
        e.target.value,
        sessionToken,
        new goo.maps.LatLng(location.coords.latitude, location.coords.longitude)
      )
    );
  };

  const onDropoffUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!goo || !map) return;
    setDropoffValue(e.target.value);

    if (!autocompleteService || !sessionToken || !location) return;

    setPlaces(
      await getPredictions(
        goo,
        map,
        autocompleteService,
        e.target.value,
        sessionToken,
        new goo.maps.LatLng(location.coords.latitude, location.coords.longitude)
      )
    );
  };

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
    setPhotoUrl('');
    setWalking(false);
    setIntervalRunning(false);
    setAlertMode(false);
    setAlertPlace(undefined);
    setAlertCountdown(-1);
    directionsRenderer?.setMap(null);
  };

  const cancelCountdown = () => {
    setAlertMode(false);
    setAlertPlace(undefined);
    setAlertCountdown(-1);
  };

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
          {!(granted || location) ? (
            <div className="flex flex-col h-full p-5">
              <div className="grow flex flex-col justify-center items-center">
                <h1 className="font-bold text-2xl text-slate-800 text-center">
                  Location services are disabled. Please enable them to get
                  started!
                </h1>
              </div>
            </div>
          ) : null}
          {!user && (granted || location) ? (
            <div className="flex flex-col h-full p-5">
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

          {!started &&
          !walking &&
          user &&
          (granted || location) &&
          alertCountdown !== 0 ? (
            <Form
              className="flex flex-col h-full overflow-y-scroll"
              onSubmit={onSubmit}
            >
              <div className="space-y-5 pb-5">
                <h1 className="font-bold text-2xl text-slate-800">
                  Howdy, Runner
                </h1>
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
                        onFocus();
                        setPickupFocused(true);
                        setDropoffFocused(false);
                      }}
                    ></input>
                    {!isRequestPage && pickupValue === '' ? (
                      <button
                        className="fill-indigo-400 absolute right-4 top-4 w-8 h-8"
                        onClick={async (e) => {
                          e.preventDefault();

                          if (!location) return;
                          setPickupValue(
                            `${location.coords.latitude}, ${location.coords.longitude}`
                          );
                        }}
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
                      onFocus();
                      setPlaces([]);
                      setDropoffFocused(true);
                      setPickupFocused(false);
                    }}
                  ></input>
                </div>
                {(dropoffFocused || pickupFocused) && places.length > 0 ? (
                  <ul className="grow space-y-2">
                    {places.map((place: any) => {
                      return (
                        <li key={place.place_id}>
                          <button
                            className="hover:bg-indigo-100 rounded-s flex flex-col justify-start w-full p-2"
                            onClick={async (e) => {
                              e.preventDefault();

                              if (pickupFocused) {
                                setPickupValue(
                                  (
                                    await getPlaceDetails(
                                      goo!,
                                      place.place_id,
                                      map!,
                                      sessionToken!
                                    )
                                  )?.formatted_address ?? ''
                                );
                                setPickupFocused(false);
                              }
                              if (dropoffFocused) {
                                setDropoffValue(
                                  (
                                    await getPlaceDetails(
                                      goo!,
                                      place.place_id,
                                      map!,
                                      sessionToken!
                                    )
                                  )?.formatted_address ?? ''
                                );
                                setDropoffFocused(false);
                              }
                            }}
                          >
                            <h1 className="font-medium text-left">
                              {place.structured_formatting.main_text}
                            </h1>
                            <p className="text-left text-slate-600">
                              {place.structured_formatting.secondary_text}
                            </p>
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
                    </div>
                    <p>
                      <span className="text-lg font-medium">ETA:</span>{' '}
                      {eta ? eta : 'Calculating...'}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="pt-4 border-t border-t-slate-300 mt-auto pb-5">
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
            </Form>
          ) : null}
          {started && !walking && alertCountdown !== 0 ? (
            <div className="w-full h-full flex flex-col items-center p-5 overflow-y-scroll space-y-4">
              <div className="grow flex flex-col items-center justify-center space-y-4">
                <img
                  className="rounded-full"
                  src={photoUrl}
                  alt={buddyName}
                  width="150"
                  height="150"
                />
                <h1 className="text-3xl font-medium text-center">
                  Your Buddy, {buddyName}, is on their way to pick you up!
                </h1>
              </div>
              <button
                className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full "
                onClick={() => {
                  setWalking(true);
                  startWalking(routeId!);
                }}
              >
                Press here when buddy has arrived
              </button>
            </div>
          ) : null}
          {walking && !alertMode ? (
            <div className="w-full h-full flex flex-col items-center p-5 overflow-y-scroll space-y-4">
              <div className="grow flex flex-col items-center space-y-4">
                <h1 className="text-3xl font-medium text-center">
                  Your safety is our highest priority.
                </h1>
                <h2 className="text-center">
                  If you ever feel like you are in danger, alert the police
                  here.
                </h2>
                <button
                  className="rounded-full p-3 font-semibold hover:bg-red-500 bg-red-400 text-white w-full"
                  onClick={() => {
                    setAlertCountdown(5);
                  }}
                >
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
                  </div>
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
          {alertMode ? (
            <div className="w-full h-full flex flex-col items-center p-5 overflow-y-scroll space-y-4">
              <div className="grow flex flex-col items-center space-y-4">
                <h1 className="text-4xl font-medium text-center">
                  You are in Alert Mode
                </h1>
                <h1 className="text-3xl font-medium text-center">
                  The authorities will be contacted in
                </h1>
                <h1 className="text-8xl font-medium text-center">
                  {alertCountdown}
                </h1>
              </div>
              <button
                className="rounded-full p-3 font-semibold hover:bg-red-500 bg-red-400 text-white w-full"
                onClick={cancelCountdown}
              >
                Cancel
              </button>
              <div className="space-y-8">
                <div className="space-y-6"></div>
              </div>
            </div>
          ) : null}
          {alertCountdown === 0 ? (
            <div className="w-full h-full flex flex-col items-center p-5 overflow-y-scroll space-y-4">
              <div className="grow flex flex-col items-center space-y-4">
                <h1 className="text-4xl font-medium text-center">
                  The authorities have been contacted
                </h1>
                <h2 className="text-3xl font-medium text-center">
                  Location sent:
                </h2>
                <h2 className="text-3xl font-medium text-center">
                  {alertPlace ? alertPlace.formatted_address : 'Loading...'}
                </h2>
              </div>
              <button
                className="rounded-full p-3 font-semibold hover:bg-red-500 bg-red-400 text-white w-full"
                onClick={onArrive}
              >
                Done
              </button>
              <div className="space-y-8">
                <div className="space-y-6"></div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
