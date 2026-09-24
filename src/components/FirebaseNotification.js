// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging} from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzwsmiPiI1qfjPG-vzVrXzRtowLofvggs",
  authDomain: "connectx-ae161.firebaseapp.com",
  projectId: "connectx-ae161",
  storageBucket: "connectx-ae161.firebasestorage.app",
  messagingSenderId: "1037226835518",
  appId: "1:1037226835518:web:1b56ef0c6b012c2d461b6f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messing=getMessaging(app);
export const analytics = getAnalytics(app);
