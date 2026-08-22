import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAKo-5D1XuH0u29tqjkh5Iug5xYvKCdgZ0",
  authDomain: "dayflow-6684d.firebaseapp.com",
  projectId: "dayflow-6684d",
  storageBucket: "dayflow-6684d.firebasestorage.app",
  messagingSenderId: "394720930977",
  appId: "1:394720930977:web:60c2ea9669043384c8d4e0",
  measurementId: "G-2QPWMYM9KQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const useFirebase = true;

console.log('🔥 Firebase Client initialized successfully with static credentials!');
export default auth;
