import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA66dkKe1DqGXm8LhcOAjdIkQ_f21jJSKY",
  authDomain: "meme-higher-lower.firebaseapp.com",
  projectId: "meme-higher-lower",
  storageBucket: "meme-higher-lower.firebasestorage.app",
  messagingSenderId: "461091057554",
  appId: "1:461091057554:web:23826ec1c26dcffeb19b4b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
