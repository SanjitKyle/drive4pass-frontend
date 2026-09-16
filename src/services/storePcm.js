import axios from './axios';

export const StorePcm = {
  storePcmData(data) {

    const token = localStorage.getItem('authToken');
    console.log('token before storing ', token);

    return axios.post(
      '/ds/message/save-token',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};