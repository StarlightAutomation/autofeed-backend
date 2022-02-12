import axios from "axios";

export const state = () => ({
  config: undefined,
  schedules: [],
});

export const getters = {
  config: state => state.config,
  schedules: state => state.schedules,
};

export const actions = {
  getConfig ({ commit }) {
    return new Promise((resolve, reject) => {
      axios.get('/api/config').then((res) => {
        commit('SET_CONFIG', res.data);
        resolve(res.data);
      }).catch(reject);
    });
  }
};

export const mutations = {
  SET_CONFIG (state, config) {
    state.config = config;
    state.schedules = config.schedules;
  },
};
