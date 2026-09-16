import axios from './axios';

export const Sellservice = {
  getPupilSell(id) {
    return axios.get(`/ds/sales/pupil/${id}`);
  },

  create(data) {
    console.log('data to add pricing',data)
    return axios.post('/ds/price-masters', data);
  },

  update(id, data) {
    return axios.post(`/ds/price-masters/${id}`, data);
  },

  remove(id) {
    console.log('id',id)
    return axios.get(`/ds/price-masters/delete/${id}`);
  },
};
