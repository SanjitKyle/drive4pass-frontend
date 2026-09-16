import axios from './axios';

export const NotesService = {
  saveInternalNote(data) {
    return axios.post('/ds/internal-notes', data);
  },
  getInternalNotesByEntity(entityModel, entityId) {
    return axios.get(`/ds/internal-notes/${entityModel}/${entityId}`);
  }
};
