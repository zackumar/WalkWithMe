// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, query, orderBy, addDoc, deleteDoc, getDocs, doc, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
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
const analytics = getAnalytics(app);

//gets all routes
export async function getRoutes(routeId: string){
  const routes:any = [];
  const q = query(
    collection(db, 'routes'), 
    orderBy('timestemp', 'asc')
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