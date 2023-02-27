import {GoogleAuthProvider, signInWithPopup, signOut} from 'firebase/auth';
import {auth} from '../config/firebase';

const googleAuthProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  return credential.user;
};

export const logout = async () => {
  await signOut(auth);
};
