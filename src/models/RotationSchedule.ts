import {DocumentData, FirestoreDataConverter, Timestamp, WithFieldValue} from 'firebase/firestore';
import {Route} from './Route';

export interface BaseRotationSchedule {
  routeId: string;
  contactNumbers: string[];

  enabled: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseRotationSchedule extends BaseRotationSchedule {
  timeTable: {
    departureTime: Timestamp;
    arrivalTime?: Timestamp;
  }[];
}

export type TimeTable = {
  departureTime: Date;
  arrivalTime?: Date;
};

export interface RotationSchedule extends BaseRotationSchedule {
  id: string;

  timeTable: TimeTable[];
}

export type CreateFirebaseRotationSchedule = Partial<RotationSchedule>;

export type RotationScheduleWithRelations = RotationSchedule & {route?: Route};

export const rotationScheduleConverter: FirestoreDataConverter<RotationSchedule> = {
  toFirestore: (obj: WithFieldValue<RotationSchedule>): DocumentData => {
    return obj;
  },
  fromFirestore: (snapshot, options?): RotationSchedule => {
    const documentData = snapshot.data(options) as FirebaseRotationSchedule;
    return {
      ...documentData,
      id: snapshot.id,
      timeTable: (documentData.timeTable || []).map(timeTable => ({
        departureTime: timeTable.departureTime.toDate(),
        arrivalTime: timeTable.arrivalTime ? timeTable.arrivalTime.toDate() : undefined,
      })),
    };
  },
};
