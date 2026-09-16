import axios from './axios';

export const LearnerService = {
  getAll() {
    return axios.get('/ds/pupils');
  },

  getOne(id) {
    return axios.get(`/ds/pupils/${id}`);
  },

  create(data) {
    return axios.post('/ds/pupils', data);
  },

  update(id, data) {
    return axios.post(`/ds/pupils/${id}`, data);
  },

  remove(id) {
    return axios.get(`/ds/pupils/delete/${id}`);
  },

  changePassword(data) {
    return axios.post('/ds/pupils/changepassword', data);
  }
};
