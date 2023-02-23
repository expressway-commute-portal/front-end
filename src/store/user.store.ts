import {create} from 'zustand';
import {User} from '../models/User';
import * as userService from '../services/user.service';

interface State {
  loggedInUser: User | undefined;

  getLoggedInUser: (uid: string) => Promise<void>;

  getLoggedInUserLoading: boolean;
}

export const useUserStore = create<State>(set => ({
  loggedInUser: undefined,

  getLoggedInUserLoading: false,

  getLoggedInUser: async uid => {
    set({getLoggedInUserLoading: true});
    try {
      const user = await userService.findByUID(uid);
      set({loggedInUser: user});
    } finally {
      set({getLoggedInUserLoading: false});
    }
  },
}));
