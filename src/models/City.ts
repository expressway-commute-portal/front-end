import {Timestamp} from 'firebase/firestore';

export interface City {
  id: string;
  name: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseCity = Omit<City, 'id'>;
