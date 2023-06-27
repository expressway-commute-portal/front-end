import {create} from 'zustand';
import {User} from '../models/User';
import * as userService from '../services/user.service';
import {devtools} from 'zustand/middleware';

export interface UserState {
  loggedInUser: User | undefined;

  getLoggedInUser: (uid: string) => Promise<void>;
  findAndWatchUser: (uid: string) => () => void;

  getLoggedInUserLoading: boolean;
}

export const useUserStore = create<UserState>()(
  devtools(set => ({
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
    findAndWatchUser: (uid: string) => {
      return userService.findAndWatchByUID(uid, set);
    },
  })),
);
