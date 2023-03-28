import { Loader } from '@googlemaps/js-api-loader';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

const loader = new Loader({
  apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
  version: 'weekly',
  libraries: ['places'],
});

export const DIRECTION_OPTIONS = {
  polylineOptions: {
    strokeColor: '#818CF8',
  },
};

export async function getRoute(
  goo: typeof google,
  origin: string | google.maps.LatLng | google.maps.Place,
  destination: string | google.maps.LatLng | google.maps.Place,
  waypoints?: google.maps.DirectionsWaypoint[]
) {
  var directionsService = new goo.maps.DirectionsService();

  const request = waypoints
    ? {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: waypoints,
      }
    : {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      };

  return directionsService.route(request, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      console.log(result);
      return result;
    }
  });
}

export async function getPlaces(
  goo: typeof google,
  locQuery: string,
  map: google.maps.Map,
  location?: google.maps.LatLng
) {
  return new Promise((resolve, reject) => {
    const request = location
      ? {
          query: locQuery,
          location: location,
          rankby: google.maps.places.RankBy.DISTANCE,
        }
      : {
          query: locQuery,
        };

    const service = new goo.maps.places.PlacesService(map);

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results ?? []);
      } else {
        reject(new Error(`PlacesServiceStatus is ${status}`));
      }
    });
  }) as Promise<google.maps.places.PlaceResult[]>;
}

export async function getLocation(): Promise<GeolocationPosition | null> {
  if (!navigator.geolocation) return null;
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export function useGoogleMap(mapRef: RefObject<HTMLDivElement>) {
  const [goo, setGoogle] = useState<typeof google>();
  const [map, setMap] = useState<google.maps.Map>();
  const [loaded, setLoaded] = useState(false);

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

          setGoogle(google);
          setMap(map);
          setLoaded(true);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [mapRef]);

  return [goo, map, loaded] as const;
}

export function secondsToEta(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const hours = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
  const mins = m > 0 ? m + (m == 1 ? ' minute' : ' minutes') : '';

  return hours + mins;
}