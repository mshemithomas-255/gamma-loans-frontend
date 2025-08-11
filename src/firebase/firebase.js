// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: "m-finance-fed5d.firebaseapp.com",
  projectId: "m-finance-fed5d",
  storageBucket: "m-finance-fed5d.appspot.com",
  messagingSenderId: "1058147132548",
  appId: "1:1058147132548:web:96662487050fe85a368ed1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
