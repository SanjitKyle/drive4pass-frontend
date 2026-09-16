import axios from './axios';

export const InstructorService = {
  getAll() {
    return axios.get("/ds/instructor-masters");
  },
  approveInstructor(id) {
    console.log('calling approove', id)
    return axios.get(`/ds/instructor-masters/status/${id}`, { "businessName": "Drive4Pass" })
  },

  getOne(id) {
    return axios.get(`/ds/instructor-masters/${id}`);
  },

  notifyCredentials(id) {
    return axios.post(`/ds/instructors/notify-credentials/${id}`);
  },

  create(data) {
    return axios.post(
      "https://api.drive4pass.co.uk/api/instructor-signup", 
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  update(id, data) {
    return axios.post(
      `/ds/instructor-masters/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  instructorWorkingDays(instructor_id) {
    return axios.get(`/ds/instructor-working-days/${instructor_id}`)
  },

  instructorWorkingDayCreateAndUpdate(data) {
    console.log('data', data)
    return axios.post(
      `/ds/instructor-working-days/upsert`, data
    );
  },

  instructorGaps(instructor_id) {
    return axios.get(`/ds/gaps/instructor/${instructor_id}`);
  },

  createGap(data) {
    return axios.post('/ds/gaps', data);
  },

  updateGap(id, data) {
    return axios.post(`/ds/gaps/${id}`, data);
  },

  deleteGap(id) {
    return axios.get(`/ds/gaps/delete/${id}`);
  },

  instructorAway(instructor_id) {
    return axios.get(`/ds/away/instructor/${instructor_id}`);
  },

  createAway(data) {
    return axios.post('/ds/away', data);
  },

  updateAway(id, data) {
    return axios.post(`/ds/away/${id}`, data);
  },

  deleteAway(id) {
    return axios.get(`/ds/away/delete/${id}`);
  },

  remove(id) {
    return axios.get(`/ds/instructor-masters/delete/${id}`);
  },

  addFranchiseFees(data) {
    return axios.post('/ds/franchise-fees', data);
  },

  getFranchiseFees(instructorId) {
    return axios.get(`/ds/franchise-fees/instructor/${instructorId}`);
  },

  addPdiFeesAmount(data) {
    return axios.post('/ds/pdi-fees-amount', data);
  },

  getPdiFeesAmount(instructorId) {
    return axios.get(`/ds/pdi-fees-amount/instructor/${instructorId}`);
  },

  getAllLeaves() {
    return axios.get('/ds/instructor-leaves');
  },

  getInstructorLeaves(instructorId) {
    return axios.get(`/ds/instructor-leaves/instructor/${instructorId}`);
  },

  createLeave(data) {
    return axios.post('/ds/instructor-leaves', data);
  },

  updateLeave(id, data) {
    return axios.post(`/ds/instructor-leaves/update/${id}`, data);
  },

  deleteLeave(id) {
    return axios.get(`/ds/instructor-leaves/delete/${id}`);
  }
};