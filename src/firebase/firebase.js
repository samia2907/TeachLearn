// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCYzx0CZeYbXPrMTB8IlHt1Mzud2F71If8",
  authDomain: "techminds-63e30.firebaseapp.com",
  projectId: "techminds-63e30",
  storageBucket: "techminds-63e30.firebasestorage.app",
  messagingSenderId: "668739566202",
  appId: "1:668739566202:web:350f1a7240efd92df459c3",
  measurementId: "G-DMF76JP5QV"
};

const app = initializeApp(
  firebaseConfig
);

const auth = getAuth(app);

const db = getFirestore(
  app,
  "default"
);

const functions = getFunctions(
  app,
  "europe-west1"
);


/* FUNCTIONS EMULATOR */

if (import.meta.env.DEV) {
  try {
    connectFunctionsEmulator(
      functions,
      "127.0.0.1",
      5001
    );
  } catch (error) {
    console.log(
      "Functions emulator already connected."
    );
  }
}


export {
  app,
  auth,
  db,
  functions,
};

export default app;