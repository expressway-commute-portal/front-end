import {Timestamp} from 'firebase/firestore';

export interface User {
  id: string;
  uid: string;
  role: 'ADMIN' | 'USER';

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseUser = Omit<User, 'id'>;
