import {create} from 'zustand';
import * as scheduleService from '../services/schedule.service';
import {Schedule} from '../models/Schedule';
import {useTripStore} from './trip.store';

interface State {
  schedules: Schedule[];
  getSchedulesLoading: boolean;

  getSchedules: () => Promise<void>;
}

export const useScheduleStore = create<State>(set => ({
  schedules: [],
  getSchedulesLoading: false,

  getSchedules: async () => {
    set({getSchedulesLoading: true});
    const trip = useTripStore.getState().trip;
    if (trip) {
      const schedules = await scheduleService.getSchedulesByTripId(trip.id);
      set({schedules});
    }
    set({getSchedulesLoading: false});
  },
}));
