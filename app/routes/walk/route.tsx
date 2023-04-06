import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate, useOutletContext } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import AlertButton from '~/components/AlertButton';
import {
  auth,
  endRoute,
  getRouteFromUid,
  isRouteFinished,
  isRouteStarted,
  sendAlert,
  startWalking,
} from '~/firebase';
import {
  useWatchLocation,
  getAddressFromLatLon,
  getRoute,
} from '~/utils/mapUtils';

export default function Route() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [location] = useWatchLocation();

  const [user] = useAuthState(auth);
  const [route, setRouteId] = useState<any>(null);

  const [buddyName, setBuddyName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [alertMode, setAlertMode] = useState(false);
  const [alertCountdown, setAlertCountdown] = useState(-1);
  const [alertPlace, setAlertPlace] = useState<google.maps.GeocoderResult>();

  const { goo, map, directionsRenderer } = useOutletContext<{
    goo?: typeof google;
    map?: google.maps.Map;
    directionsRenderer?: google.maps.DirectionsRenderer;
  }>();

  useEffect(() => {
    async function getEta() {
      if (!goo || !map || !route) return;
      if (!directionsRenderer) return;

      directionsRenderer.setMap(map);
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: '#818CF8',
        },
      });

      const direction = await getRoute(
        goo,
        new google.maps.LatLng(route.origin.latitude, route.origin.longitude),
        new google.maps.LatLng(
          route.destination.latitude,
          route.destination.longitude
        )
      );

      directionsRenderer.setDirections(direction);
    }

    getEta();
  }, [goo, map, route, directionsRenderer]);

  useEffect(() => {
    async function getRoute() {
      if (!user) return;

      const route = await getRouteFromUid(user.uid);
      if (!route) {
        navigate('/walk');
        return;
      }

      setRouteId(route);
      if (route.walking && !searchParams.get('started') && !alertMode) {
        searchParams.set('started', 'true');
        setSearchParams(searchParams);
      }
    }
    getRoute();
  }, [user, navigate, searchParams, setSearchParams, alertMode]);

  useEffect(() => {
    if (!route) return;

    var interval = setInterval(() => {
      isRouteStarted(route.id).then((isStarted) => {
        setBuddyName(isStarted.buddyName);
        setPhotoUrl(isStarted.buddyPhoto);
      });
      isRouteFinished(route.id).then((finished) => {
        if (finished) clearInterval(interval);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [route]);

  useEffect(() => {
    if (!goo || !map) return;

    if (alertCountdown != -1) {
      setAlertMode(true);
      var intervalId = setInterval(() => {
        setAlertCountdown(alertCountdown - 1);
      }, 1000);

      if (alertCountdown === 0) {
        setAlertMode(false);
        // searchParams.delete('started');
        // setSearchParams(searchParams);
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
  }, [alertCountdown, goo, map, location, searchParams, setSearchParams]);

  useEffect(() => {
    if (alertCountdown === 0 && alertPlace && route) {
      sendAlert(route.id, alertPlace.formatted_address!);
    }
  }, [alertPlace, alertCountdown, route]);

  const onArrive = () => {
    console.log(route.id);
    endRoute(route.id);
    directionsRenderer?.setMap(null);

    navigate('/walk');
  };

  const cancelCountdown = () => {
    setAlertMode(false);
    setAlertPlace(undefined);
    setAlertCountdown(-1);
  };

  if (!route) {
    return (
      <div className="w-full h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
        <div className="grow flex flex-col items-center justify-center space-y-4">
          <h1 className="text-3xl font-medium text-center">
            Loading routes...
          </h1>
        </div>
      </div>
    );
  }

  if (!buddyName || !photoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
        <div className="grow flex flex-col items-center justify-center space-y-4">
          <h1 className="text-xl text-center">
            You will be notified when someone is on the way.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <>
      {alertCountdown !== 0 && !searchParams.has('started') ? (
        <div className="w-full h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
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
              searchParams.set('started', 'true');
              setSearchParams(searchParams);
              startWalking(route.id);
            }}
          >
            Press here when buddy has arrived
          </button>
        </div>
      ) : null}
      {alertCountdown !== 0 && !alertMode && searchParams.has('started') ? (
        <div className="h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
          <div className="grow flex flex-col items-center space-y-4 w-full">
            <h1 className="text-3xl font-medium text-center">
              Your safety is our highest priority.
            </h1>
            <h2 className="text-center">
              If you ever feel like you are in danger, alert the police here.
            </h2>

            <AlertButton
              onFinished={() => {
                setAlertCountdown(0);
              }}
            >
              Hold to Alert
            </AlertButton>
          </div>
          <div className="space-y-8 w-full">
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
                  {route.originName}
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
                  {route.destinationName}
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
        <div className="w-full h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
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
        <div className="w-full h-full flex flex-col items-center p-5 overflow-y-auto space-y-4">
          <div className="grow flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-medium text-center">
              The authorities have been contacted
            </h1>
            <h2 className="text-3xl font-medium text-center">Location sent:</h2>
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
    </>
  );
}
