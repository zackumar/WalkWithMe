import type { ActionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigate } from '@remix-run/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '~/firebase';
import { secondsToEta } from '~/utils/mapUtils';
import invariant from 'tiny-invariant';
import { addRoute } from '~/firebase.server';

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const uid = formData.get('uid') as string;
  const displayName = formData.get('displayName') as string;
  const pickup = formData.get('pickup') as string;
  const dropoff = formData.get('dropoff') as string;
  const eta = formData.get('eta') as unknown as number;

  invariant(uid, 'Uid is required');
  invariant(displayName, 'Display name is required');
  invariant(pickup, 'Pickup is required');
  invariant(dropoff, 'Dropoff is required');
  invariant(eta, 'ETA is required');

  await addRoute(uid, displayName, pickup, dropoff);

  return json({
    origin: pickup,
    destination: dropoff,
    eta,
  });
}

export default function Request() {
  const { origin, destination, eta } = useActionData();

  const navigate = useNavigate();

  const [user] = useAuthState(auth);
  if (!user) return null;

  return (
    <Form className="flex flex-col h-full overflow-y-auto">
      <div className="space-y-5 pb-5">
        <h1 className="font-bold text-2xl text-slate-800">
          Howdy, {user.displayName}
        </h1>
        <div>
          <div className="relative">
            <input
              className="outline-[#f7a0a4] border border-slate-200 bg-slate-100 rounded-t-lg p-5 w-full placeholder:text-slate-500"
              name="pickup"
              type="text"
              placeholder="Pickup"
              required
              defaultValue={origin || ''}
              onClick={() => {
                navigate('/?destination=' + destination);
              }}
            ></input>
          </div>
          <input
            className="outline-[#f7a0a4] focus:border-t border-b border-l border-r border-slate-200 bg-slate-100 rounded-b-lg p-5 w-full placeholder:text-slate-500"
            name="dropoff"
            type="text"
            placeholder="Drop off"
            required
            defaultValue={destination || ''}
            onClick={() => {
              navigate('/?origin=' + origin);
            }}
          ></input>
        </div>
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
              {origin || 'Pickup'}
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
              {destination || 'Drop off'}
            </p>
            <p className="col-span-1 text-xs text-right font-semibold">
              Drop-off
            </p>
          </div>
          <p>
            <span className="text-lg font-medium">ETA:</span>{' '}
            {secondsToEta(eta)}
          </p>
        </div>
      </div>
      <div className="pt-4 border-t border-t-slate-300 mt-auto pb-5">
        <p className="text-center">
          You will be notified when someone is on the way.
        </p>
      </div>
    </Form>
  );
}
