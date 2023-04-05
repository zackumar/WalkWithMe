import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import {
  Form,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import invariant from 'tiny-invariant';
import { auth, hasRoute } from '~/firebase';
import { addRoute } from '~/firebase.server';
import { Geopoint } from '~/utils/jsonToFirestore';
import { getRoute, secondsToEta } from '~/utils/mapUtils';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const uid = formData.get('uid') as string;
  const displayName = formData.get('displayName') as string;
  const origin = formData.get('origin') as string;
  const destination = formData.get('destination') as string;
  const originName = formData.get('originName') as string;
  const destinationName = formData.get('destinationName') as string;
  const eta = formData.get('eta') as unknown as number;

  invariant(uid, 'Uid is required');
  invariant(displayName, 'Display name is required');
  invariant(origin, 'Origin is required');
  invariant(destination, 'Destination is required');
  invariant(originName, 'Origin name is required');
  invariant(destinationName, 'Destination name is required');
  invariant(eta, 'ETA is required');

  const originSplit = origin.split(',');
  const originGeopoint = new Geopoint(
    parseFloat(originSplit[0]),
    parseFloat(originSplit[1])
  );
  const destinationSplit = destination.split(',');
  const destinationGeopoint = new Geopoint(
    parseFloat(destinationSplit[0]),
    parseFloat(destinationSplit[1])
  );

  await addRoute(
    uid,
    displayName,
    originGeopoint,
    originName,
    destinationGeopoint,
    destinationName
  );

  return redirect('/walk/route');
};

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;

  if (!searchParams.has('origin') && !searchParams.has('destination')) {
    return redirect('/walk');
  } else if (!searchParams.has('origin') && searchParams.has('destination')) {
    return redirect('/walk?destination=' + searchParams.get('destination'));
  } else if (searchParams.has('origin') && !searchParams.has('destination')) {
    return redirect('/walk?origin=' + searchParams.get('origin'));
  }

  if (!searchParams.has('originName') || !searchParams.has('destinationName')) {
    return redirect('/walk');
  }

  return null;
};

export default function Details() {
  const [searchParams] = useSearchParams();

  const { goo, map, directionsRenderer } = useOutletContext<{
    goo?: typeof google;
    map?: google.maps.Map;
    directionsRenderer?: google.maps.DirectionsRenderer;
  }>();
  const navigate = useNavigate();

  const [user] = useAuthState(auth);

  const [eta, setEta] = useState<number>();

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
    async function getEta() {
      if (!goo || !map) return;
      if (!directionsRenderer) return;

      directionsRenderer.setMap(map);
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: '#818CF8',
        },
      });

      const route = await getRoute(
        goo,
        searchParams.get('origin') ?? '',
        searchParams.get('destination') ?? ''
      );

      setEta(route.routes[0].legs[0].duration?.value ?? 0);

      directionsRenderer.setDirections(route);
    }

    getEta();
  }, [goo, map, searchParams, directionsRenderer]);

  if (!user) return null;

  return (
    <Form className="flex flex-col h-full overflow-y-auto" method="post">
      <input hidden name="eta" defaultValue={eta} />
      <input hidden name="uid" defaultValue={user.uid} />
      <input hidden name="displayName" defaultValue={user.displayName ?? ''} />
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
              defaultValue={searchParams.get('originName') || ''}
              onClick={() => {
                navigate(
                  '/walk?destination=' +
                    searchParams.get('destination') +
                    '&destinationName=' +
                    searchParams.get('destinationName')
                );
              }}
            ></input>
          </div>
          <input
            className="outline-[#f7a0a4] focus:border-t border-b border-l border-r border-slate-200 bg-slate-100 rounded-b-lg p-5 w-full placeholder:text-slate-500"
            name="destinationName"
            type="text"
            placeholder="Drop off"
            required
            defaultValue={searchParams.get('destinationName') || ''}
            onClick={() => {
              navigate(
                '/walk?origin=' +
                  searchParams.get('origin') +
                  '&originName=' +
                  searchParams.get('originName')
              );
            }}
          ></input>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Trip</h2>
          <div className="grid grid-cols-6 flex-row w-full relative before:absolute before:top-5 before:h-7 before:w-1.5 before:left-[9px] before:bg-gradient-to-b before:from-[#818CF8] before:to-[#F9B8BB]">
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
              {searchParams.get('originName') || 'Pickup'}
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
              {searchParams.get('destinationName') || 'Drop off'}
            </p>
            <p className="col-span-1 text-xs text-right font-semibold">
              Drop-off
            </p>
          </div>
          <p>
            <span className="text-lg font-medium">ETA:</span>{' '}
            {typeof eta !== 'undefined' ? secondsToEta(eta) : 'Calculating...'}
          </p>
        </div>
      </div>
      <div className="pt-4 border-t border-t-slate-300 mt-auto pb-5">
        <button
          className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
          type="submit"
        >
          Request Walk
        </button>
      </div>
    </Form>
  );
}
