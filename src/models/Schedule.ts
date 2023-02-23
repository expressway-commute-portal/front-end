import {Timestamp} from 'firebase/firestore';
import {Bus} from './Bus';
import {Trip} from './Trip';

export interface Schedule {
  id: string;
  departureTime: Timestamp;
  arrivalTime: Timestamp;
  tripId: string;
  busId?: string;

  transitTimes: {
    cityId: string;
    departureTime: Timestamp;
  }[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ScheduleWithRelations = Schedule & {trip?: Trip; bus?: Bus};

export type FirebaseSchedule = Omit<Schedule, 'id'>;
