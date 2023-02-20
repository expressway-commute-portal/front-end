import {Timestamp} from 'firebase/firestore';

export interface Schedule {
  id: string;
  departureTime: Timestamp;
  arrivalTime: Timestamp;
  tripId: string;
  busId: string;

  transitTimes: {
    cityId: string;
    departureTime: Timestamp;
  }[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseSchedule = Omit<Schedule, 'id'>;
