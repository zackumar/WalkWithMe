// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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