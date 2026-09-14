import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  httpsCallable,
} from "firebase/functions";

import {
  auth,
  functions,
} from "./firebase";


const studentLoginCallable =
  httpsCallable(
    functions,
    "studentLogin"
  );

const studentAliasAvailableCallable =
  httpsCallable(
    functions,
    "studentAliasAvailable"
  );

const resetStudentPasswordCallable =
  httpsCallable(
    functions,
    "resetStudentPassword"
  );


async function signInStudentWithCode({
  studentCode,
  password,
}) {
  const response = await studentLoginCallable({ studentCode });
  const { authEmail, uid } = response.data || {};
  if (typeof authEmail !== "string" || !authEmail ||
      typeof uid !== "string" || !uid) {
    throw new Error("student-login-invalid-response");
  }
  const result = await signInWithEmailAndPassword(auth, authEmail, password);
  if (result.user.uid !== uid) {
    await signOut(auth);
    throw new Error("student-login-identity-mismatch");
  }
  return result;
}


async function isStudentAliasAvailable(
  kind,
  value
) {
  const response =
    await studentAliasAvailableCallable({
      kind,
      value,
    });

  return response.data?.available ===
    true;
}


async function resetStudentPassword({
  studentUid,
  newPassword,
}) {
  const response =
    await resetStudentPasswordCallable({
      studentUid,
      newPassword,
    });

  return response.data;
}


export {
  isStudentAliasAvailable,
  resetStudentPassword,
  signInStudentWithCode,
};
