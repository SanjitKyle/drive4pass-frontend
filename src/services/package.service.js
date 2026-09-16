import axios from './axios';

export const PackageService = {
  getAll() {
    return axios.get('/ds/package-masters');
  },

  getOne(id) {
    return axios.get(`/ds/package-masters/${id}`);
  },

  create(data) {
    return axios.post('/ds/package-masters', data);
  },

  update(id, data) {
    return axios.post(`/ds/package-masters/${id}`, data);
  },

  remove(id) {
    return axios.get(`/ds/package-masters/delete/${id}`);
  },
};
