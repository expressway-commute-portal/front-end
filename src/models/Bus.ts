import {Timestamp} from 'firebase/firestore';

export interface Bus {
  id: string;
  name: string;
  regNumber: string;

  contactNumbers: string[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseBus = Omit<Bus, 'id'>;
