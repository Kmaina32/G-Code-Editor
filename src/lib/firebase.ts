// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGv0sX5kHoJP46ZxswterpgLDSGf6FGfc",
  authDomain: "studio-5343699768-cba64.firebaseapp.com",
  projectId: "studio-5343699768-cba64",
  storageBucket: "studio-5343699768-cba64.appspot.com",
  messagingSenderId: "147228161673",
  appId: "1:147228161673:web:b9a439314f6b461e383858"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
