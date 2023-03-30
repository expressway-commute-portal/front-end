import {create} from 'zustand';
import {User as FirebaseUser} from 'firebase/auth';
import * as authService from '../services/auth.service';

interface State {
  firebaseUserDetails: FirebaseUser | null;

  googleSignInLoading: boolean;

  googleSignIn: () => Promise<FirebaseUser>;
  logout: () => void;
}

export const useAuthStore = create<State>(set => ({
  firebaseUserDetails: null,

  googleSignInLoading: false,

  googleSignIn: async () => {
    set({googleSignInLoading: true});
    try {
      const user = await authService.googleSignIn();
      set({firebaseUserDetails: user});
      return user;
    } finally {
      set({googleSignInLoading: false});
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({firebaseUserDetails: null});
    } catch (e) {
      console.error(e.message);
    }
  },
}));
