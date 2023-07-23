import {create} from 'zustand';
import * as routeService from '../services/route.service';
import {FirebaseRoute, Route} from '../models/Route';
import {devtools} from 'zustand/middleware';

interface State {
  routes: Route[];
  route: Route | undefined;

  searchRoutes: Route[];

  getRoutesLoading: boolean;
  createRouteLoading: boolean;
  updateRouteLoading: boolean;
  deleteRouteLoading: boolean;

  getRoutes: () => Promise<void>;
  createRoute: (route: FirebaseRoute) => Promise<void>;
  updateRoute: (id: string, route: Partial<Route>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  // getTripByCityIds: (departureCityId: string, arrivalCityId: string) => Promise<void>;
  getRoutesByCityIds: (departureCityId: string, arrivalCityId: string) => Promise<void>;
}

export const useRouteStore = create<State>()(
  devtools(set => ({
    routes: [],
    route: undefined,

    searchRoutes: [],

    getRoutesLoading: false,
    createRouteLoading: false,
    updateRouteLoading: false,
    deleteRouteLoading: false,

    getRoutes: async () => {
      set({getRoutesLoading: true});
      try {
        const routes = await routeService.getAll();
        set({routes: routes});
      } finally {
        set({getRoutesLoading: false});
      }
    },

    createRoute: async (route: FirebaseRoute) => {
      set({createRouteLoading: true});
      try {
        await routeService.create(route);
      } finally {
        set({createRouteLoading: false});
      }
    },

    updateRoute: async (id: string, route: Partial<Route>) => {
      set({updateRouteLoading: true});
      try {
        await routeService.update(id, route);
      } finally {
        set({updateRouteLoading: false});
      }
    },

    deleteRoute: async (id: string) => {
      set({deleteRouteLoading: true});
      try {
        await routeService.deleteById(id);
      } finally {
        set({deleteRouteLoading: false});
      }
    },

    /* getTripByCityIds: async (departureCityId, arrivalCityId) => {
      set({getTripsLoading: true});
      const trip = await routeService.getTripByCityIds(departureCityId, arrivalCityId);
      set({trip, getTripsLoading: false});
    }, */

    getRoutesByCityIds: async (departureCityId, arrivalCityId) => {
      set({getRoutesLoading: true});
      const routes = await routeService.getRoutesByCityIds(departureCityId, arrivalCityId);
      set({searchRoutes: routes, getRoutesLoading: false});
    },
  })),
);
