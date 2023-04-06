import {
  Form,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, hasRoute } from '~/firebase/firebase';
import {
  getPlaceDetails,
  getPredictions,
  useWatchLocation,
} from '~/utils/mapUtils';

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { goo, map } = useOutletContext<{
    goo?: typeof google;
    map?: google.maps.Map;
    directionsRenderer?: google.maps.DirectionsRenderer;
  }>();

  const [user] = useAuthState(auth);
  const [userLocation] = useWatchLocation();

  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);
  const [pickupValue, setPickupValue] = useState(
    searchParams.get('originName') ?? ''
  );
  const [dropoffValue, setDropoffValue] = useState(
    searchParams.get('destinationName') ?? ''
  );

  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService>();
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();
  const [places, setPlaces] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    async function checkRoute() {
      if (await hasRoute(user?.uid ?? '')) {
        navigate('/walk/route');
      }
    }

    checkRoute();
  }, [user, navigate]);

  useEffect(() => {
    if (!map || !goo) return;
    setAutocompleteService(new google.maps.places.AutocompleteService());
  }, [map, goo]);

  const onFocus = async () => {
    if (!goo || !map) return;
    if (!sessionToken)
      setSessionToken(new goo.maps.places.AutocompleteSessionToken());
  };

  const onPickupUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setPickupValue(e.target.value);

    if (!goo || !map) return;
    if (!autocompleteService || !sessionToken || !userLocation) return;

    setPlaces(
      await getPredictions(
        goo,
        map,
        autocompleteService,
        e.target.value,
        sessionToken,
        new goo.maps.LatLng(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        )
      )
    );
  };

  const onDropoffUpdate: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setDropoffValue(e.target.value);

    if (!goo || !map) return;
    if (!autocompleteService || !sessionToken || !userLocation) return;

    setPlaces(
      await getPredictions(
        goo,
        map,
        autocompleteService,
        e.target.value,
        sessionToken,
        new goo.maps.LatLng(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        )
      )
    );
  };

  if (!user) return null;

  return (
    <Form
      className="flex flex-col h-full overflow-y-auto"
      action="/walk/details"
      method="get"
    >
      <input
        hidden
        name="origin"
        defaultValue={searchParams.get('origin') ?? ''}
      />
      <input
        hidden
        name="destination"
        defaultValue={searchParams.get('destination') ?? ''}
      />

      <div className="space-y-5 pb-5">
        <h1 className="font-bold text-2xl text-slate-800">
          Howdy, {user.displayName}
        </h1>
        <div>
          <div className="relative">
            <input
              className="outline-[#f7a0a4] border border-slate-200 bg-slate-100 rounded-t-lg p-5 w-full placeholder:text-slate-500"
              name="originName"
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
            {pickupValue === '' && userLocation ? (
              <button
                className="fill-indigo-400 absolute right-4 top-4 w-8 h-8"
                onClick={async (e) => {
                  e.preventDefault();

                  setPickupValue('Current Location');
                  searchParams.set(
                    'origin',
                    `${userLocation.coords.latitude}, ${userLocation.coords.longitude}`
                  );
                  searchParams.set('originName', 'Current Location');
                  setSearchParams(searchParams);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
                </svg>
              </button>
            ) : null}
          </div>
          <input
            className="outline-[#f7a0a4] focus:border-t border-b border-l border-r border-slate-200 bg-slate-100 rounded-b-lg p-5 w-full placeholder:text-slate-500"
            name="destinationName"
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

                      const details = await getPlaceDetails(
                        goo!,
                        place.place_id,
                        map!,
                        sessionToken!
                      );

                      const coords = `${details?.geometry?.location?.lat()},${details?.geometry?.location?.lng()}`;

                      if (pickupFocused) {
                        setPickupValue(details?.name ?? '');
                        searchParams.set('origin', coords);
                        searchParams.set('originName', details?.name ?? '');
                        setSearchParams(searchParams);
                        setPickupFocused(false);
                      }
                      if (dropoffFocused) {
                        setDropoffValue(details?.name ?? '');
                        searchParams.set('destination', coords);
                        searchParams.set(
                          'destinationName',
                          details?.name ?? ''
                        );
                        setSearchParams(searchParams);
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
      </div>
      <div className="pt-4 border-t border-t-slate-300 mt-auto pb-5">
        <button
          className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
          type="submit"
        >
          Details
        </button>
      </div>
    </Form>
  );
}
