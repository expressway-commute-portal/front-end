import {Timestamp} from 'firebase/firestore';

export interface User {
  id: string;
  uid: string;
  role: 'admin' | 'user';

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseUser = Omit<User, 'id'>;
