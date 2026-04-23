import { getStorage } from "firebase-admin/storage";
import { firebaseApp } from "../auth/firebase.js";

export const dashcamBucket = getStorage(firebaseApp).bucket();
