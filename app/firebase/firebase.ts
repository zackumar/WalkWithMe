// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  orderBy,
  deleteDoc,
  query,
  where,
  doc,
  serverTimestamp,
  getDocs,
  updateDoc,
  getDoc,
  GeoPoint,
} from 'firebase/firestore';
import { firebaseConfig } from '~/config';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, inMemoryPersistence);

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const logout = () => {
  signOut(auth);
};

//gets all routes
export async function getRoutes() {
  const routes: any = [];
  const q = query(collection(db, 'routes'), orderBy('timestamp', 'asc'));
  const docs = await getDocs(q);

  docs.forEach((doc: any) => {
    routes.push({ id: doc.id, ...doc.data() });
  });

  return routes;
}

export async function doesRouteExist(routeId: string) {
  const docRef = doc(db, 'routes', routeId);
  const docSnap = await getDoc(docRef);

  return docSnap.exists();
}

export async function deleteRoute(routeId: string) {
  await deleteDoc(doc(db, 'routes', routeId));
}

export async function getUser(uid: string) {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const docs = await getDocs(q);
  return docs.docs[0].data();
}

export async function getRouteFromUid(uid: string) {
  const q = query(collection(db, 'routes'), where('userId', '==', uid));
  const docs = await getDocs(q);
  return docs.empty
    ? undefined
    : ({ id: docs.docs[0].id, ...docs.docs[0].data() } as any);
}

export async function hasRoute(uid: string) {
  const q = query(collection(db, 'routes'), where('userId', '==', uid));
  const docs = await getDocs(q);

  return docs.docs.length > 0;
}

export async function startRoute(routeId: string, uid: string) {
  const user = await getUser(uid);

  await updateDoc(doc(db, 'routes', routeId), {
    started: true,
    buddyName: user?.name,
    buddyPhoto: user?.photoURL,
  });
}

export async function startWalking(routeId: string) {
  await updateDoc(doc(db, 'routes', routeId), {
    walking: true,
  });
}

export async function endRoute(routeId: string) {
  await updateDoc(doc(db, 'routes', routeId), {
    finished: true,
  });
}

export async function isRouteStarted(routeId: string) {
  const data = (await getDoc(doc(db, 'routes', routeId))).data();

  return {
    isStarted: data?.started,
    buddyName: data?.buddyName,
    buddyPhoto: data?.buddyPhoto,
  };
}

export async function isRouteFinished(routeId: string) {
  const data = (await getDoc(doc(db, 'routes', routeId))).data();
  return !!data?.finished;
}

export async function sendAlert(
  routeId: string,
  currentLoc: google.maps.LatLng,
  currentLocName: string
) {
  await updateDoc(doc(db, 'routes', routeId), {
    alert: true,
    currentLoc: new GeoPoint(currentLoc.lat(), currentLoc.lng()),
    currentLocName,
  });
}

export async function addRoute(
  userId: string,
  displayName: string,
  start: google.maps.LatLng | string,
  destination: google.maps.LatLng | string,
  waypoints?: google.maps.LatLng | string
) {
  return await addDoc(
    collection(db, 'routes'),
    waypoints
      ? {
          userId,
          displayName,
          start:
            typeof start === 'string'
              ? start
              : { lat: start.lat(), lng: start.lng() },
          waypoints:
            typeof waypoints === 'string'
              ? waypoints
              : { lat: waypoints.lat(), lng: waypoints.lng() },
          destination:
            typeof destination === 'string'
              ? destination
              : { lat: destination.lat(), lng: destination.lng() },
          timestamp: serverTimestamp(),
          userPhoto: (await getUser(userId)).photoURL,
        }
      : {
          userId,
          displayName,
          start:
            typeof start === 'string'
              ? start
              : { lat: start.lat(), lng: start.lng() },

          destination:
            typeof destination === 'string'
              ? destination
              : { lat: destination.lat(), lng: destination.lng() },
          timestamp: serverTimestamp(),
          userPhoto: (await getUser(userId)).photoURL,
        }
  );
}
