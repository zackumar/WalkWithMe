// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
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
} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U",
  authDomain: "rowdybuddy.firebaseapp.com",
  projectId: "rowdybuddy",
  storageBucket: "rowdybuddy.appspot.com",
  messagingSenderId: "3773405946",
  appId: "1:3773405946:web:9ea86ff9a57a1af3b7c743",
  measurementId: "G-T085NK33L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
    // const docs = await getDocs(q);
    // if (docs.docs.length === 0) {
    //   await addDoc(collection(db, 'users'), {
    //     uid: user.uid,
    //     name: user.displayName,
    //     authProvider: 'google',
    //     email: user.email,
    //   });
    // }
  } catch (err) {
    console.error(err);
  }
};

export const logout = () => {
  signOut(auth);
};

//gets all routes
export async function getRoutes(){
  const routes: any = [];
  const q = query(
    collection(db, 'routes'), 
    orderBy('timestamp', 'asc')
  );
  const docs = await getDocs(q);

  docs.forEach((doc:any) => {
    routes.push({ id: doc.id, ...doc.data() });
  });


    return routes;
}

//deletes route that's ID is passed in
export async function deleteRoute(routeId: string){
  await deleteDoc(doc(db, 'routes', routeId));
}

//adds a route given a start point, a midway point, and a destination
export async function addRoute(start:{lat:number, lon:number}, waypoints:{lat:number, lon:number}[], destination:{lat:number, lon:number}){
  await addDoc(collection(db, 'routes'), {
    start: start, 
    waypoints: waypoints, 
    destination: destination, 
    timestamp: serverTimestamp(),
  });
}