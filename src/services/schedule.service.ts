import {collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';
import {FirebaseSchedule, Schedule} from '../models/Schedule';

export async function getSchedulesByTripId(tripId: string) {
  const snap = await getDocs(
    query(collection(db, FirestoreCollections.Schedule), where('tripId', '==', tripId)),
  );
  const schedules: Schedule[] = snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as FirebaseSchedule),
  }));
  return schedules;
}
