import {create} from 'zustand';
import * as busService from '../services/bus.service';
import {Bus, FirebaseBus} from '../models/Bus';

interface State {
  buses: Bus[];

  getBusesLoading: boolean;
  createBusLoading: boolean;
  updateBusLoading: boolean;
  deleteBusLoading: boolean;

  getBuses: () => Promise<void>;
  createBus: (bus: FirebaseBus) => Promise<void>;
  updateBus: (id: string, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
}

export const useBusStore = create<State>(set => ({
  buses: [],

  getBusesLoading: false,
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
}));
