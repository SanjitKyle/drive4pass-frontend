import axios from './axios';

export const PricingService = {
  getAll() {
    return axios.get('/ds/price-masters');
  },

  create(data) {
    console.log('data to add pricing',data)
    return axios.post('/ds/price-masters', data);
  },

  update(id, data) {
    console.log('data to upate',data)
    return axios.post(`/ds/price-masters/${id}`, data);
  },

  remove(id) {
    console.log('id',id)
    return axios.get(`/ds/price-masters/delete/${id}`);
  },
};
