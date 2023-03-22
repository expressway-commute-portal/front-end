import {DocumentData, FirestoreDataConverter, Timestamp, WithFieldValue} from 'firebase/firestore';

export interface City {
  id: string;
  name: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseCity = Omit<City, 'id'>;

export const cityConverter: FirestoreDataConverter<City> = {
  toFirestore: (obj: WithFieldValue<City>): DocumentData => {
    return obj;
  },
  fromFirestore: (snapshot, options): City => {
    const documentData = snapshot.data(options) as FirebaseCity;
    return {
      id: snapshot.id,
      ...documentData,
    };
  },
};
