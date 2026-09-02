import {
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  firebaseConfig,
} from "./firebase";


let studentCreatorApp;


const existingApp =
  getApps().find(
    (app) =>
      app.name ===
      "StudentCreator"
  );


if (existingApp) {
  studentCreatorApp =
    existingApp;
} else {
  studentCreatorApp =
    initializeApp(
      firebaseConfig,
      "StudentCreator"
    );
}


const studentCreatorAuth =
  getAuth(
    studentCreatorApp
  );


export {
  studentCreatorAuth,
};