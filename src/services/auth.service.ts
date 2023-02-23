import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {auth} from '../config/firebase';

const googleAuthProvider = new GoogleAuthProvider();

export const passwordLogin = async (username: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, username, password);
  return userCredential.user;
};

export const googleSignIn = async () => {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  return credential.user;
};

export const logout = async () => {
  await signOut(auth);
};
