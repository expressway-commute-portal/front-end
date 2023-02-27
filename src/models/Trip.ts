import {Timestamp} from 'firebase/firestore';

export interface Trip {
  id: string;

  departureCity: {
    id: string;
    name: string;
  };

  arrivalCity: {
    id: string;
    name: string;
  };

  price: string;

  transitCityIds: string[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseTrip = Omit<Trip, 'id'>;
