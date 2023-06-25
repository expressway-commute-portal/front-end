import {create} from 'zustand';
import * as tripService from '../services/trip.service';
import {FirebaseTrip, Trip} from '../models/Trip';
import {devtools} from 'zustand/middleware';

interface State {
  trips: Trip[];
  trip: Trip | undefined;

  getTripsLoading: boolean;
  createTripLoading: boolean;
  updateTripLoading: boolean;
  deleteTripLoading: boolean;

  getTrips: () => Promise<void>;
  createTrip: (trip: FirebaseTrip) => Promise<void>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTripByCityIds: (departureCityId: string, arrivalCityId: string) => Promise<void>;
}

export const useTripStore = create<State>()(
  devtools(set => ({
    trips: [],
    trip: undefined,

    getTripsLoading: false,
    createTripLoading: false,
    updateTripLoading: false,
    deleteTripLoading: false,

    getTrips: async () => {
      set({getTripsLoading: true});
      try {
        const trips = await tripService.getAll();
        set({trips});
      } finally {
        set({getTripsLoading: false});
      }
    },

    createTrip: async (trip: FirebaseTrip) => {
      set({createTripLoading: true});
      try {
        await tripService.create(trip);
      } finally {
        set({createTripLoading: false});
      }
    },

    updateTrip: async (id: string, trip: Partial<Trip>) => {
      set({updateTripLoading: true});
      try {
        await tripService.update(id, trip);
      } finally {
        set({updateTripLoading: false});
      }
    },

    deleteTrip: async (id: string) => {
      set({deleteTripLoading: true});
      try {
        await tripService.deleteById(id);
      } finally {
        set({deleteTripLoading: false});
      }
    },

    getTripByCityIds: async (departureCityId, arrivalCityId) => {
      set({getTripsLoading: true});
      const trip = await tripService.getTripByCityIds(departureCityId, arrivalCityId);
      set({trip, getTripsLoading: false});
    },
  })),
);
