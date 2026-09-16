import axios from 'axios';

const currentToken = localStorage.getItem('authToken');

export const Enquires = {

    getAllEnquires() {
        return axios.get('https://api.drive4pass.co.uk/api/en/enquiries', { params: { t: new Date().getTime() } });
    },
    getIntensiveEnquires() {
        return axios.get('https://api.drive4pass.co.uk/api/en/course-forms', { params: { t: new Date().getTime() } });
    },
    getAdiTrainingEnquires() {
        return axios.get('https://api.drive4pass.co.uk/api/en/adi-training-forms', { params: { t: new Date().getTime() } });
    },
    getFranchiseEnquires() {
        return axios.get('https://api.drive4pass.co.uk/api/en/franchise-enquiries', { params: { t: new Date().getTime() } });
    },
    createEnquiry(data) {
        return axios.post('https://api.drive4pass.co.uk/api/en/enquiries', data);
    },
    createAdiTrainingEnquiry(data) {
        return axios.post('https://api.drive4pass.co.uk/api/en/adi-training-forms', data);
    },
    createIntensiveEnquiry(data) {
        return axios.post('https://api.drive4pass.co.uk/api/en/course-forms', data);
    },
    createFranchiseEnquiry(data) {
        return axios.post('https://api.drive4pass.co.uk/api/en/franchise-enquiries', data);
    },
    getIntensiveEnquiresById(id) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/course-forms/${id}`, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    },
    getAdiTrainingEnquiresById(id) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/adi-training-forms/${id}`, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    },
    getEnquiresById(id) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/enquiries/${id}`, {
            params: { t: new Date().getTime() },
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    },
    getFranchiseEnquiresById(id) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/franchise-enquiries/${id}`, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    },
    updateFullEnquiry(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendEnquiryResourcePack(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/send-resource-pack`, { enquiry_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendEnquiryReviewLink(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/send-review-link`, { enquiry_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendEnquiryWelcomeMessage(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/send-welcome-message`, { enquiry_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateEnquiry(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/updatestatus/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateAdiTrainingEnquiryStatus(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/adi-training-forms/updatestatus/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateAdiTrainingEnquiry(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/adi-training-forms/update/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    assignAdiTrainingEnquiryInstructor(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/adi-training-forms/assign/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateIntensiveEnquiryStatus(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-forms/update-status/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateIntensiveEnquiry(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-forms/update/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendIntensiveResourcePack(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-form/send-resource-pack`, { course_form_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendIntensiveReviewLink(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-form/send-review-link`, { course_form_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    sendIntensiveWelcomeMessage(id, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-form/send-welcome-message`, { course_form_id: id }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    getIntensiveEmailLogs(id, token) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/course-form/${id}/email-logs`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    getEnquiryEmailLogs(id, token) {
        return axios.get(`https://api.drive4pass.co.uk/api/en/enquiries/${id}/email-logs`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateFranchiseEnquiryStatus(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/franchise-enquiries/update-status/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateFranchiseEnquiry(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/franchise-enquiries/update/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    assignIntensiveEnquiryInstructor(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-forms/assign/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    updateEnquiryStatus(id, data, token) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/update-enquiry-status/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    AssignInstructor(id, data) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/instructorassign/${id}`, data, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    },
    deleteEnquiry(id) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/delete/${id}`);
    },
    deleteAdiTrainingEnquiry(id) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/adi-training-forms/delete/${id}`);
    },
    deleteIntensiveEnquiry(id) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/course-forms/delete/${id}`);
    },
    deleteFranchiseEnquiry(id) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/franchise-enquiries/delete/${id}`);
    },
    seenEnquiry(id) {
        return axios.post(`https://api.drive4pass.co.uk/api/en/enquiries/seen/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });
    }

};
