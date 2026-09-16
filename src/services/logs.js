import axios from './axios';

export const Logs = {
    getLogs(enquireId) {
        return axios.get(`https://api.drive4pass.co.uk/api/ds/logs/enquire/${enquireId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
    },
    createLogs(data, token) {
        return axios.post(
            'https://api.drive4pass.co.uk/api/ds/logs',
            data ,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    }

};
