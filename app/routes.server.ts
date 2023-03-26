import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
    apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
    version: 'weekly',
    libraries: ['places'],
  });

export async function getRoute(origin: string | google.maps.LatLng | google.maps.Place, destination: string | google.maps.LatLng | google.maps.Place, waypoints: google.maps.DirectionsWaypoint[]) {
    const goo = loader.load();
    var directionsService = new google.maps.DirectionsService();
    if (waypoints == null) {
        var request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING,
        };
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                return result;
            }
        })
    } else {
        var request2 = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING,
            waypoints: waypoints
        };
        directionsService.route(request2, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                return result;
            }
        })
    }
    
}