import { Loader } from '@googlemaps/js-api-loader';
import type { ActionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import type { ChangeEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, getRoutes } from '../firebase';

const loader = new Loader({
  apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
  version: 'weekly',
  libraries: ['places'],
});

// export async function getRoutes() {
//   const routes: any = [];
//   const q = query(
//     collection(db, 'routes'),
//     orderBy('timestamp')
//   );
//   const docs = await getDocs(q);
//   docs.forEach((doc) => {
//     routes.push(doc);
//   });
//   console.log(routes);
//   return routes;
// }

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

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const submitType = formData.get('submit');
  const pickup = formData.get('pickup') as string;
  const dropoff = formData.get('dropoff') as string;

  if (submitType === 'details') {
    return json({
      route: {
        pickup,
        dropoff,
      },
    });
  }

  return null;
};

export default function BuddySystem() {
  const data = useActionData();
  console.log(data);
  const mapRef = useRef<HTMLDivElement>(null);

  const [pickupValue, setPickupValue] = useState('');
  const [dropoffValue, setDropoffValue] = useState('');

  const [goo, setGoogle] = useState<typeof google | null>(null);

  const [places, setPlaces] = useState([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);

  const [routes, setRoutes] = useState([]);

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

  useEffect(() => {
    if (!data) return;

    const effect = async () => {
      if (!goo) return;
      const directionsRenderer = new goo.maps.DirectionsRenderer();

      directionsRenderer.setMap(map);

      directionsRenderer.setDirections(
        await getRoute(google, data.route.pickup, data.route.dropoff)
      );
    };

    effect();
  }, [goo, map, data]);

  return (
    <div className="min-h-screen relative ">
      <header className="absolute inset-x-0 top-0 z-10 flex flex-row justify-between p-5 bg-white shadow-sm">
        <Link className="flex flex-row items-center space-x-2" to="/">
          <span
            className="h-5 w-5 rounded-full 
        bg-[#818CF8]"
          ></span>
          <p className="text-lg font-semibold text-black">RowdyBuddy</p>
        </Link>
      </header>
      <main className="relative bg-gray-500 grid grid-cols-2">
        <section className="pt-24 h-full w-full bg-white p-5 shadow-lg space-y-5">
          <h1 className="font-bold text-2xl text-slate-800">Howdy, Buddy</h1>
          <Form
            className="space-y-2 flex flex-col justify-between h-[90%]"
            method="post"
          >
            <div>
              {/* <input
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
                }}
              ></input>
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
                }}
              ></input> */}
            </div>
            <div className='h-full'>
              {routes && routes.length > 0 ? (
                <ul>
                  {routes.map((route: any) => {
                    return (
                      <div className='border border-slate-200 bg-slate-100 rounded-lg p-5 mb-5'>
                        <div className='grid grid-cols-4 gap-1 p-[2px]'>
                          <p className='border border-slate-200 bg-slate-100 rounded-lg p-5  w-full col-span-2'>{route.start}</p>
                          <button className='border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center'>View Route</button>
                          <button className='border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center'>Select Route</button>
                        </div>
                      </div>
                    );
                  })}
                </ul>
              ) : (
                <p>No routes</p>
              )}
              {/* <div className='grid grid-cols-4 gap-1 p-[2px]'>
                <p className='border border-slate-200 bg-slate-100 rounded-lg p-5  w-full col-span-2'>John Smith</p>
                <button className='border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center'>View Route</button>
                <button className='border border-slate-200 bg-slate-100 rounded-lg p-5 w-full col-span-1 text-center'>Select Route</button>
              </div> */}
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
            {data ? (
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
        <div className="h-full w-full">
          <div className="h-screen w-[50wh]" id="map" ref={mapRef}></div>
        </div>
      </main>
    </div>
  );
}
