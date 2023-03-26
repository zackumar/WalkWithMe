import { Loader } from '@googlemaps/js-api-loader';
import { ActionArgs, json } from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import { useEffect, useRef } from 'react';

const loader = new Loader({
  apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
  version: 'weekly',
  libraries: ['places'],
});

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const submitType = formData.get('submit');
  const pickup = formData.get('pickup');
  const destination = formData.get('destination');

  if (submitType === 'details') {
    return json({
      route: {
        pickup,
        destination,
      },
    });
  }

  return null;
};

export default function Index() {
  const data = useActionData();

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loader
      .load()
      .then((google) => {
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
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [mapRef]);

  return (
    <div className="min-h-screen relative ">
      <header className="absolute inset-x-0 top-0 z-10 flex flex-row justify-between p-5 bg-white">
        <Link className="flex flex-row items-center space-x-2" to="/">
          <span
            className="h-5 w-5 rounded-full 
        bg-sky-400"
          ></span>
          <p className="text-lg font-semibold text-black">RowdyBuddy</p>
        </Link>
      </header>
      <main className="relative bg-gray-500">
        <div className="fixed top-0 left-0 right-0 md:relative ">
          <div className="h-screen w-screen" id="map" ref={mapRef}></div>
        </div>
        <section className="absolute bottom-10 left-10 h-3/4 w-96 bg-white rounded-xl p-5 shadow-lg space-y-5">
          <h1 className="font-bold text-2xl text-slate-800">Howdy, Runner</h1>
          <Form className="flex flex-col justify-between h-[90%]" method="post">
            <div>
              <input
                className="border border-slate-200 bg-slate-100 rounded-t-lg p-5 w-full placeholder:text-slate-500"
                name="pickup"
                type="text"
                placeholder="Pickup"
                required
              ></input>
              <input
                className="border border-t-0 border-slate-200 bg-slate-100 rounded-b-lg p-5 w-full placeholder:text-slate-500"
                name="destination"
                type="text"
                placeholder="Drop off"
                required
              ></input>
            </div>
            {data ? (
              <div className="space-y-6">
                <h2 className='text-xl font-semibold'>Your Trip</h2>
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
                  <p className='col-span-4 text-base overflow-hidden text-ellipsis whitespace-nowrap block text-start'>123 Sesame St.</p>
                  <p className='col-span-1 text-xs text-right font-semibold'>Pick up</p>
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
                  <p className='col-span-4 overflow-hidden text-ellipsis whitespace-nowrap block text-start'>501 W Cesar E Chavez Blvd, San Antonio</p>
                  <p className='col-span-1 text-xs text-right font-semibold'>Drop-off</p>
                  {/* {data.route.destination} */}
                </div>
                {/* {data.route.pickup} to {data.route.destination} */}
              </div>
            ) : null}
            <div className="pt-4 border-t border-t-slate-300">
              <button
                className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
                name="submit"
                value="details"
                type="submit"
              >
                Details
              </button>
            </div>
          </Form>
        </section>
      </main>
    </div>
  );
}
