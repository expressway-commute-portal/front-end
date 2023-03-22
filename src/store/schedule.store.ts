import {create} from 'zustand';
import * as scheduleService from '../services/schedule.service';
import {CreateFirebaseSchedule, Schedule, ScheduleWithRelations} from '../models/Schedule';
import {useTripStore} from './trip.store';

interface State {
  schedules: Schedule[];
  schedulesWithRelations: ScheduleWithRelations[];

  getSchedulesLoading: boolean;
  createScheduleLoading: boolean;
  updateScheduleLoading: boolean;

  getSchedules: () => Promise<void>;
  createSchedule: (schedule: CreateFirebaseSchedule) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;

  getSchedulesWithRelations: () => Promise<void>;
}

export const useScheduleStore = create<State>((set, get) => ({
  schedules: [],
  schedulesWithRelations: [],

  getSchedulesLoading: false,
  createScheduleLoading: false,
  updateScheduleLoading: false,

  getSchedules: async () => {
    set({getSchedulesLoading: true});
    try {
      const trip = useTripStore.getState().trip;
      if (trip) {
        const schedules = await scheduleService.getSchedulesByTripId(trip.id);
        set({schedules});
      }
    } finally {
      set({getSchedulesLoading: false});
    }
  },
  createSchedule: async (schedule: CreateFirebaseSchedule) => {
    set({createScheduleLoading: true});
    try {
      const id = await scheduleService.create(schedule);
      const createdSchedule = await scheduleService.getByIdWithRelations(id);
      if (createdSchedule) {
        set({schedulesWithRelations: [...get().schedulesWithRelations, createdSchedule]});
      }
    } finally {
      set({createScheduleLoading: false});
    }
  },
  updateSchedule: async (id: string, schedule: Partial<Schedule>) => {
    set({updateScheduleLoading: true});
    try {
      await scheduleService.update(id, schedule);
      set(state => ({
        schedulesWithRelations: state.schedulesWithRelations.map(s =>
          s.id === id ? {...s, ...schedule} : s,
        ),
      }));
    } finally {
      set({updateScheduleLoading: false});
    }
  },
  getSchedulesWithRelations: async () => {
    set({getSchedulesLoading: true});
    try {
      const schedules = await scheduleService.getAllWithRelations();
      set({schedulesWithRelations: schedules});
    } finally {
      set({getSchedulesLoading: false});
    }
  },
}));
