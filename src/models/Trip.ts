import {Timestamp} from 'firebase/firestore';

export type Prices = {
  price: string;
  serviceType: string;
};

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

  routeNumber: string;

  price: string;
  prices: Prices[];

  transitCityIds: string[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseTrip = Omit<Trip, 'id'>;
