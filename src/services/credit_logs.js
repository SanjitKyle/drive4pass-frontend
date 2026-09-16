import axios from './axios';

export const CreditLogs = {
  getPupilCreditsLogs(id) {
    return axios.get(`/ds/pupil-credit-logs/${id}`);
  },

  
};
