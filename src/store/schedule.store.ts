import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import * as scheduleService from '../services/schedule.service';
import {CreateFirebaseSchedule, Schedule, ScheduleWithRelations} from '../models/Schedule';
import {useRouteStore} from './route.store';
import {deleteById} from '../services/schedule.service';

interface State {
  schedules: Schedule[];
  schedulesWithRelations: ScheduleWithRelations[];
  filteredSchedulesWithRelations: ScheduleWithRelations[];

  getSchedulesLoading: boolean;
  createScheduleLoading: boolean;
  updateScheduleLoading: boolean;
  deleteScheduleLoading: boolean;

  getSchedules: () => Promise<number>;
  createSchedule: (schedule: CreateFirebaseSchedule) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  getSchedulesWithRelations: () => Promise<void>;

  filter: (busName: string, routeId: string, enabled: boolean) => void;

  clearSchedules: () => void;
}

export const useScheduleStore = create<State>()(
  devtools((set, get) => ({
    schedules: [],
    schedulesWithRelations: [],
    filteredSchedulesWithRelations: [],

    getSchedulesLoading: false,
    createScheduleLoading: false,
    updateScheduleLoading: false,
    deleteScheduleLoading: false,

    getSchedules: async () => {
      set({getSchedulesLoading: true});
      try {
        const searchRoutes = useRouteStore.getState().searchRoutes;
        if (searchRoutes.length) {
          const schedules = await scheduleService.getSchedulesByRouteIds(
            searchRoutes.map(t => t.id),
          );
          set({schedules});
          return schedules.length;
        } else {
          return 0;
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
        const updatedSchedule = await scheduleService.getByIdWithRelations(id);
        if (updatedSchedule) {
          set(state => ({
            schedulesWithRelations: state.schedulesWithRelations.map(s =>
              s.id === id ? updatedSchedule : s,
            ),
          }));
        }
      } finally {
        set({updateScheduleLoading: false});
      }
    },
    deleteSchedule: async (id: string) => {
      set({deleteScheduleLoading: true});
      try {
        await scheduleService.deleteById(id);
        set(state => ({
          schedulesWithRelations: state.schedulesWithRelations.filter(s => s.id !== id),
        }));
      } finally {
        set({deleteScheduleLoading: false});
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

    filter: (busName: string, routeId: string, enabled: boolean) => {
      const schedules = get().schedulesWithRelations;
      const filteredSchedules = schedules.filter(
        s =>
          (!busName || s.bus?.name.toLowerCase().includes(busName.toLowerCase())) &&
          (!routeId || s.routeId === routeId) &&
          s.enabled === enabled,
      );
      set({filteredSchedulesWithRelations: filteredSchedules});
    },
    clearSchedules: () => {
      set({schedules: []});
    },
  })),
);
