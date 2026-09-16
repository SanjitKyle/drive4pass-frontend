import axios from './axios';

export const bookingService = {
    getAll(instructor_id) {
        console.log('id here ', instructor_id)
        return axios.get(`/ds/bookings/${instructor_id}`);
    },

    getAllOFAllInstructos() {
        return axios.get(`/ds/bookings`);
    },

    create(data) {
        console.log('data to create booking', data)
        return axios.post(`/ds/bookings`, data);
    },

    update(id, data) {
        console.log('data to update booking', id, data);
        return axios.post(`/ds/bookings/update/${id}`, data);
    },

    getPupilBooking(pupil_id) {
        return axios.get(`/ds/bookings/pupil/${pupil_id}`)
    },

    remove(id) {
        return axios.post(`/ds/bookings/delete/${id}`);
    }
};
