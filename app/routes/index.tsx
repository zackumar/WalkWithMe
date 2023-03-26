import { Loader } from '@googlemaps/js-api-loader';
import { Form } from '@remix-run/react';
import { useEffect, useRef } from 'react';

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

export default function Index() {
  const mapRef = useRef<HTMLDivElement>(null);

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

          const svgMarker = {
            path: 'M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z',
            fillColor: '#f7a0a4',
            fillOpacity: 0.9,
            strokeWeight: 0,
            rotation: 0,
            scale: 2,
            anchor: new google.maps.Point(15, 30),
          };

          const marker = new google.maps.Marker({
            position: { lat: 29.58343962451892, lng: -98.62006139828749 },
            icon: svgMarker,
            map: map,
          });

          const directionsRenderer = new google.maps.DirectionsRenderer();

          directionsRenderer.setMap(map);

          directionsRenderer.setDirections(
            await getRoute(
              google,
              'UTSA',
              '201 springtree trail, cibolo, tx 78108'
            )
          );
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [mapRef]);

  return (
    <main className="relative min-h-screen bg-gray-500">
      <div className="fixed top-0 left-0 right-0 md:relative">
        <div
          className="h-[50vh] w-screen md:h-screen"
          id="map"
          ref={mapRef}
        ></div>
      </div>
      <section className="absolute bottom-10 left-10 h-3/4 w-96 bg-white rounded-xl p-5 shadow-lg space-y-5">
        <h1 className="font-bold text-2xl text-slate-800">Howdy, Runner</h1>
        <Form className="flex flex-col justify-between h-[90%]">
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
          <div className="pt-4 border-t border-t-slate-300">
            <button className="rounded-full p-3 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full">
              Details
            </button>
          </div>
        </Form>
      </section>
    </main>
  );
}
