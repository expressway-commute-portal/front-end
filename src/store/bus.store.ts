import {create} from 'zustand';
import * as busService from '../services/bus.service';
import {Bus, FirebaseBus} from '../models/Bus';
import {devtools} from 'zustand/middleware';

interface State {
  buses: Bus[];

  selectedBus: Bus | undefined;

  getBusesLoading: boolean;
  getBusByIdLoading: boolean;
  createBusLoading: boolean;
  updateBusLoading: boolean;
  deleteBusLoading: boolean;

  getBuses: () => Promise<void>;
  getBusById: (id: string) => Promise<void>;
  createBus: (bus: FirebaseBus) => Promise<void>;
  updateBus: (id: string, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
}

export const useBusStore = create<State>()(
  devtools(set => ({
    buses: [],

    selectedBus: undefined,

    getBusesLoading: false,
    getBusByIdLoading: false,
    createBusLoading: false,
    updateBusLoading: false,
    deleteBusLoading: false,

    getBuses: async () => {
      set({getBusesLoading: true});
      try {
        const buses = await busService.getAll();
        set({buses});
      } finally {
        set({getBusesLoading: false});
      }
    },
    getBusById: async (id: string) => {
      set({getBusByIdLoading: true});
      try {
        const bus = await busService.getById(id);
        set({selectedBus: bus});
      } finally {
        set({getBusByIdLoading: false});
      }
    },
    createBus: async (bus: FirebaseBus) => {
      set({createBusLoading: true});
      try {
        await busService.create(bus);
      } finally {
        set({createBusLoading: false});
      }
    },
    updateBus: async (id: string, bus: Partial<Bus>) => {
      set({updateBusLoading: true});
      try {
        await busService.update(id, bus);
      } finally {
        set({updateBusLoading: false});
      }
    },
    deleteBus: async (id: string) => {
      set({deleteBusLoading: true});
      try {
        await busService.deleteById(id);
      } finally {
        set({deleteBusLoading: false});
      }
    },
  })),
);
