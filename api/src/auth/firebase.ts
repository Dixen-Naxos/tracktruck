import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountPath) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT ..env var must point to a Firebase service account JSON file",
  );
}

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
if (!storageBucket) {
  throw new Error(
    "FIREBASE_STORAGE_BUCKET ..env var must be set to the Cloud Storage bucket name",
  );
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

export const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
  storageBucket,
});

export const firebaseAuth = getAuth(firebaseApp);
