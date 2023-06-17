import {create} from 'zustand';
import {City, FirebaseCity} from '../models/City';
import * as cityService from '../services/city.service';

interface State {
  cities: City[];
  departureCities: City[];
  arrivalCities: City[];

  getCities: () => Promise<void>;
  getPredefinedCities: () => Promise<void>;
  createCity: (city: FirebaseCity) => Promise<void>;
  updateCity: (id: string, city: Partial<City>) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  getDepartureCitiesByName: (name: string) => Promise<void>;
  getArrivalCitiesByName: (name: string) => Promise<void>;
  clearDepartureCities: () => void;
  clearArrivalCities: () => void;

  getCitiesLoading: boolean;
  createCityLoading: boolean;
  updateCityLoading: boolean;
  deleteCityLoading: boolean;
  getDepartureCitiesByNameLoading: boolean;
  getArrivalCitiesByNameLoading: boolean;
}

export const useCityStore = create<State>(set => ({
  cities: [],
  departureCities: [],
  arrivalCities: [],

  getCitiesLoading: false,
  createCityLoading: false,
  updateCityLoading: false,
  deleteCityLoading: false,
  getArrivalCitiesByNameLoading: false,
  getDepartureCitiesByNameLoading: false,

  getCities: async () => {
    set({getCitiesLoading: true});
    try {
      const cities = await cityService.getAll();
      set({cities});
    } finally {
      set({getCitiesLoading: false});
    }
  },
  getPredefinedCities: async () => {
    set({getCitiesLoading: true});
    try {
      const cities = await cityService.getByPredefinedNames();
      set({departureCities: cities, arrivalCities: cities});
    } finally {
      set({getCitiesLoading: false});
    }
  },
  createCity: async (city: FirebaseCity) => {
    set({createCityLoading: true});
    try {
      await cityService.create(city);
    } finally {
      set({createCityLoading: false});
    }
  },
  updateCity: async (id: string, city: Partial<City>) => {
    set({updateCityLoading: true});
    try {
      await cityService.update(id, city);
    } finally {
      set({updateCityLoading: false});
    }
  },
  deleteCity: async (id: string) => {
    set({deleteCityLoading: true});
    try {
      await cityService.deleteById(id);
    } finally {
      set({deleteCityLoading: false});
    }
  },

  getDepartureCitiesByName: async name => {
    set({getDepartureCitiesByNameLoading: true});
    const cities = await cityService.getAllByName(name);
    set({departureCities: cities, getDepartureCitiesByNameLoading: false});
  },
  getArrivalCitiesByName: async name => {
    set({getArrivalCitiesByNameLoading: true});
    const cities = await cityService.getAllByName(name);
    set({arrivalCities: cities, getArrivalCitiesByNameLoading: false});
  },

  clearDepartureCities: () => set({departureCities: []}),
  clearArrivalCities: () => set({arrivalCities: []}),
}));
