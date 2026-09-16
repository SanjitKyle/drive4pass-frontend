import axios from './axios';

export const BranchService = {
  getAll() {
    return axios.get('/ds/areas');
  },

  getOne(id) {
    return axios.get(`/ds/areas/${id}`);
  },

  createBranch(data) {
    console.log('data',data)
    return axios.post('/ds/areas',data);
  },
  getSubarea()
  {
    return axios.get("/ds/subareas");
  },

  update(id, data) {
    return axios.post(`/ds/areas/${id}`, data);
  },

  remove(id) {
    return axios.post(`/ds/areas/delete/${id}`);
  },
};
