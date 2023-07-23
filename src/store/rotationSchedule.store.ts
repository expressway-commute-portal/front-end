import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {
  CreateFirebaseRotationSchedule,
  RotationSchedule,
  RotationScheduleWithRelations,
} from '../models/RotationSchedule';
import {useRouteStore} from './route.store';
import * as rotationScheduleService from '../services/rotationSchedule.service';

interface State {
  rotationSchedules: RotationSchedule[];
  rotationSchedulesWithRelations: RotationScheduleWithRelations[];
  filteredRotationSchedulesWithRelations: RotationSchedule[];

  getRotationSchedulesLoading: boolean;
  createRotationScheduleLoading: boolean;
  updateRotationScheduleLoading: boolean;
  deleteRotationScheduleLoading: boolean;

  getRotationSchedules: () => Promise<number>;
  createRotationSchedule: (schedule: CreateFirebaseRotationSchedule) => Promise<void>;
  updateRotationSchedule: (id: string, schedule: Partial<RotationSchedule>) => Promise<void>;
  deleteRotationSchedule: (id: string) => Promise<void>;

  getRotationSchedulesWithRelations: () => Promise<void>;

  filter: (routeId: string, enabled: boolean) => void;

  clearRotationSchedules: () => void;
}

export const useRotationScheduleStore = create<State>()(
  devtools((set, get) => ({
    rotationSchedules: [],
    rotationSchedulesWithRelations: [],
    filteredRotationSchedulesWithRelations: [],

    getRotationSchedulesLoading: false,
    createRotationScheduleLoading: false,
    updateRotationScheduleLoading: false,
    deleteRotationScheduleLoading: false,

    getRotationSchedules: async () => {
      set({getRotationSchedulesLoading: true});
      try {
        const searchRoutes = useRouteStore.getState().searchRoutes;
        if (searchRoutes.length) {
          const rotationSchedules = await rotationScheduleService.findAllByRouteIds(
            searchRoutes.map(t => t.id),
          );
          set({rotationSchedules});
          return rotationSchedules.length;
        } else {
          return 0;
        }
      } finally {
        set({getRotationSchedulesLoading: false});
      }
    },
    createRotationSchedule: async (schedule: CreateFirebaseRotationSchedule) => {
      set({createRotationScheduleLoading: true});
      try {
        const id = await rotationScheduleService.create(schedule);
        const createdRotationSchedule = await rotationScheduleService.getByIdWithRelations(id);
        if (createdRotationSchedule) {
          set({
            rotationSchedulesWithRelations: [
              ...get().rotationSchedulesWithRelations,
              createdRotationSchedule,
            ],
          });
        }
      } finally {
        set({createRotationScheduleLoading: false});
      }
    },
    updateRotationSchedule: async (id: string, rotationSchedule: Partial<RotationSchedule>) => {
      set({updateRotationScheduleLoading: true});
      try {
        await rotationScheduleService.update(id, rotationSchedule);
        const updatedSchedule = await rotationScheduleService.getByIdWithRelations(id);
        if (updatedSchedule) {
          set(state => ({
            rotationSchedulesWithRelations: state.rotationSchedulesWithRelations.map(s =>
              s.id === id ? updatedSchedule : s,
            ),
          }));
        }
      } finally {
        set({updateRotationScheduleLoading: false});
      }
    },
    deleteRotationSchedule: async (id: string) => {
      set({deleteRotationScheduleLoading: true});
      try {
        await rotationScheduleService.deleteById(id);
        set(state => ({
          rotationSchedulesWithRelations: state.rotationSchedulesWithRelations.filter(
            s => s.id !== id,
          ),
        }));
      } finally {
        set({deleteRotationScheduleLoading: false});
      }
    },
    getRotationSchedulesWithRelations: async () => {
      set({getRotationSchedulesLoading: true});
      try {
        const schedules = await rotationScheduleService.getAllWithRelations();
        set({rotationSchedulesWithRelations: schedules});
      } finally {
        set({getRotationSchedulesLoading: false});
      }
    },

    filter: (routeId: string, enabled: boolean) => {
      const rotationSchedules = get().rotationSchedulesWithRelations;
      const filteredSchedules = rotationSchedules.filter(
        s => (!routeId || s.routeId === routeId) && s.enabled === enabled,
      );
      set({filteredRotationSchedulesWithRelations: filteredSchedules});
    },
    clearRotationSchedules: () => {
      set({rotationSchedules: []});
    },
  })),
);
