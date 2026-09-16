import axios from './axios';

export const MoneyService = {

  create(data) {
    return axios.post("/ds/money", data);
  },

  update(id, data) {
    return axios.post(
      `/ds/money/${id}`,
      data,
    );
  },
  get(id) {
    return axios.get(`/ds/money/instructor/${id}`);
  },
  getPupilSMoney(id)
  {
    return axios.get(`/ds/money/pupil/${id}`)
  }
};