import {logEvent} from 'firebase/analytics';
import {GoogleAuthProvider, getAdditionalUserInfo, signInWithPopup, signOut} from 'firebase/auth';
import {analytics, auth} from '../config/firebase';

const googleAuthProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  const info = getAdditionalUserInfo(credential);
  if (info?.isNewUser) {
    logEvent(analytics, 'sign_up', {method: 'google', user_id: credential.user.uid});
  }
  return credential.user;
};

export const logout = async () => {
  await signOut(auth);
};
