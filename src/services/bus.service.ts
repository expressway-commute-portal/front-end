import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { FirestoreCollections } from "../models";
import { Bus, FirebaseBus } from "../models/Bus";

export const getAll = async () => {
  const snap = await getDocs(query(collection(db, FirestoreCollections.Bus)));
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Bus[];
};

export const getById = async (id: string) => {
  const snapshot = await getDoc(doc(db, FirestoreCollections.Bus, id));
  if (snapshot.exists()) {
    return {...snapshot.data(), id: snapshot.id} as Bus;
  }
};

export const create = async (bus: FirebaseBus) => {
  const document = {
    ...bus,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.Bus), document as any);
};

export const update = async (id: string, bus: Partial<Bus>) => {
  const document: Partial<Bus> = {
    ...bus,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.Bus, id), document as any);
};

export const deleteById = async (id: string) => {
  await deleteDoc(doc(db, FirestoreCollections.Bus, id));
};
