// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC08T62DUAZ8cvUXwXL8aNWVHoEvsccHd4",
  authDomain: "messagedrive4pass.firebaseapp.com",
  projectId: "messagedrive4pass",
  storageBucket: "messagedrive4pass.firebasestorage.app",
  messagingSenderId: "798903974665",
  appId: "1:798903974665:web:ce01e481d662293bd971d8",
  measurementId: "G-P4K2CYDXDL"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);