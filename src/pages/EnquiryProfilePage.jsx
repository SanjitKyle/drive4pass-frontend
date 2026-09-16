import React, { useState, useEffect } from 'react';
import {
  useParams,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { enquiriesData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { Enquires } from '../services/Enquires';
import { InstructorService } from '../services/instructor.service';
import toast from 'react-hot-toast';
import { getFCMToken } from '../services/getfcmtoken';
import { StorePcm } from '../services/storePcm';
import { Logs } from '../services/logs';
import { NotesService } from '../services/notes.service';
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiBookOpen,
  FiUser,
  FiSettings,
  FiMessageSquare,
  FiActivity,
  FiTrash2,
  FiAlertCircle,
  FiDollarSign,
  FiTag,
  FiCheck,
  FiFileText,
  FiAward,
  FiCompass,
  FiCheckCircle,
  FiSend,
  FiStar,
  FiSave,
} from 'react-icons/fi';
import { BranchService } from '../services/branch.service';
import EnquiryForm from '../components/templates/EnquiryForm';
import AdiTrainingEnquiryForm from '../components/templates/AdiTrainingEnquiryForm';
import IntensiveEnquiryForm from '../components/templates/IntensiveEnquiryForm';

const EnquiryProfilePage = () => {
  const { id } = useParams();
  const {
    allenquies,
    instructors,
    fetchInstructors,
    getAllEnquires,
    branches,
    packages,
    pricing,
    instructorLoading,
  } = useStateContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const stateEnq = location.state && location.state.enquiry;
  const activeType = queryParams.get('type') || (stateEnq && stateEnq.enquiry_type) || 'lessons';
  const navigate = useNavigate();

  // Local state to store live loaded data from API
  const [liveEnquiry, setLiveEnquiry] = useState(null);
  

  const [loading, setLoading] = useState(!stateEnq);

  // Status & Instructor update states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedInstructorName, setSelectedInstructorName] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingInstructor, setSavingInstructor] = useState(false);
  const [sendingResourcePack, setSendingResourcePack] = useState(false);
  const [sendingReviewLink, setSendingReviewLink] = useState(false);
  const [sendingWelcomeMessage, setSendingWelcomeMessage] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assigningInstructor, setAssigningInstructor] = useState(false);
  // Danger Zone delete states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [savingInternalNote, setSavingInternalNote] = useState(false);

  const [showEditEnquiryModal, setShowEditEnquiryModal] = useState(false);
  const [enquiryEditData, setEnquiryEditData] = useState({});
  const [updatingEnquiry, setUpdatingEnquiry] = useState(false);
  const [localInstructors, setLocalInstructors] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [subAreas, setsubAreas] = useState([]);

  const enquiry = React.useMemo(() => {
    return (
      liveEnquiry ||
      location.state?.enquiry ||
      (allenquies && allenquies.find((e) => e._id === id || e.id === id || e.EnquiryID === Number(id))) ||
      enquiriesData.find((e) => e.EnquiryID === Number(id))
    );
  }, [location.state?.enquiry, liveEnquiry, allenquies, id]);
  useEffect(() => {
    getActivities();
    updateSeen();
    fetchEmailLogs();
    fetchInternalNotes();
  }, []);
  useEffect(() => {
    getActivities();
  }, [assigningInstructor]);

  // Inner functions
  const fetchLiveEnquiryDetails = async () => {
    if (activeType === 'intensives') return Enquires.getIntensiveEnquiresById(id);
    if (activeType === 'adi') return Enquires.getAdiTrainingEnquiresById(id);
    return Enquires.getEnquiresById(id);
  };

  async function getActivities() {
    try {
      const res = await Logs.getLogs(id);
      setActivities(res.data);
      console.log('Activities log response:', res);
    } catch (error) {
      console.log('error in fetching activities', error);
    }
  }

  const getEntityModel = () => {
    if (activeType === 'intensives') return 'CourseForm';
    if (activeType === 'adi') return 'AdiTrainingForm';
    if (activeType === 'franchise') return 'FranchiseEnquiry';
    return 'Enquire';
  };

  const fetchInternalNotes = async () => {
    try {
      if (Number(id)) return;
      const entityModel = getEntityModel();
      const res = await NotesService.getInternalNotesByEntity(entityModel, id);
      console.log('Internal notes full response:', res);
      
      // If user meant "log the message from server" literally or as a toast:
      if (res?.message) {
        console.log('Server message:', res.message);
      }
      
      let noteText = '';
      
      // Try to extract the note from various possible response structures
      if (typeof res === 'string') {
        noteText = res;
      } else if (res?.notes && Array.isArray(res.notes) && res.notes.length > 0) {
        noteText = res.notes.map(n => n.note || '').join('\n\n');
      } else if (Array.isArray(res) && res.length > 0) {
        noteText = res.map(n => n.note || '').join('\n\n');
      } else if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        noteText = res.data.map(n => n.note || '').join('\n\n');
      } else if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        noteText = res.data.data.map(n => n.note || '').join('\n\n');
      } else if (res?.data?.note) {
        noteText = res.data.note;
      } else if (res?.data?.data?.note) {
        noteText = res.data.data.note;
      } else if (res?.note) {
        noteText = res.note;
      }
      
      console.log('Extracted note text:', noteText);
      
      if (noteText) {
        setInternalNote(noteText);
      }
    } catch (error) {
      console.error('Error fetching internal notes:', error);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken || Number(id)) return;
      
      let res;
      if (activeType === 'intensives') {
        res = await Enquires.getIntensiveEmailLogs(id, currentToken);
      } else if (activeType !== 'adi' && activeType !== 'franchise') {
        res = await Enquires.getEnquiryEmailLogs(id, currentToken);
      }
      
      if (res?.data?.data) {
        setEmailLogs(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  async function updateSeen() {
    try {
      const isSeen = await Enquires.seenEnquiry(id);
      console.log('updating seen unseen', isSeen)
    } catch (error) {
      console.log('error', error)
    }
  }

  // Initialize values when the enquiry changes
  useEffect(() => {
    if (enquiry) {
      setSelectedStatus(enquiry.EnquiryStatus || enquiry.status || 'New');

      const instId =
        enquiry.instructor_id?._id ||
        enquiry.instructor_id ||
        enquiry.instructor?._id ||
        enquiry.instructor ||
        enquiry.AssignedInstructorID ||
        '';
      setSelectedInstructor(
        typeof instId === 'object' ? instId._id || instId.id || '' : instId
      );
      
      // Initially set from enquiry, but then fetch from API to override
      setInternalNote(enquiry.internal_notes || enquiry.internal_note || '');
      fetchInternalNotes();
    }
  }, [enquiry, id]);

  useEffect(() => {
    const loadInstructors = async () => {
      if (instructors && instructors.length > 0) {
        setLocalInstructors(instructors);
        return;
      }
      try {
        setLocalLoading(true);
        setLocalError('');
        const res = await InstructorService.getAll();

        let dataArray = [];
        if (Array.isArray(res?.data)) {
          dataArray = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          dataArray = res.data.data;
        } else if (Array.isArray(res?.data?.result)) {
          dataArray = res.data.result;
        } else if (Array.isArray(res?.data?.items)) {
          dataArray = res.data.items;
        } else if (Array.isArray(res?.data?.records)) {
          dataArray = res.data.records;
        } else if (Array.isArray(res)) {
          dataArray = res;
        } else if (typeof res?.data === 'object' && res?.data !== null) {
          // As a last resort, check if ANY top-level value in the object is an array
          const possibleArray = Object.values(res.data).find((val) =>
            Array.isArray(val)
          );
          if (possibleArray) dataArray = possibleArray;
        }

        setLocalInstructors(dataArray);

        if (!dataArray || dataArray.length === 0) {
          // No instructors found, or invalid backend route
          setLocalError('No instructors available');
        }
      } catch (e) {
        console.error('Failed to load instructors locally:', e);
        setLocalError(e.message || 'Unknown error');
      } finally {
        setLocalLoading(false);
      }
    };
    loadInstructors();
  }, [instructors]);

  useEffect(() => {
    const fetchEnquiry = async () => {
      // Avoid fetching for numeric mock IDs
      if (Number(id)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetchLiveEnquiryDetails();
        const data = res?.data?.data || res?.data?.enquiry || res?.data;
        if (Array.isArray(data)) {
          setLiveEnquiry(data[0]);
        } else if (data) {
          setLiveEnquiry(data);
        }
      } catch (error) {
        console.error('Error fetching live enquiry details:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchSubArea = async () => {
      try {
        const res = await BranchService.getSubarea();
        console.log('response to get area', res);
        let subareasArray = [];
        if (Array.isArray(res)) subareasArray = res;
        else if (res && typeof res === 'object') {
          if (Array.isArray(res.subareas)) subareasArray = res.subareas;
          else if (Array.isArray(res.data)) subareasArray = res.data;
          else if (Array.isArray(res.data?.subareas)) subareasArray = res.data.subareas;
          else if (Array.isArray(res.data?.data)) subareasArray = res.data.data;
          else {
            const arrayVals = Object.values(res).filter(Array.isArray);
            if (arrayVals.length > 0) subareasArray = arrayVals[0];
          }
        }
        setsubAreas(subareasArray);
      } catch (error) {
        console.log('error', error);
      }
    }

    fetchEnquiry();
    fetchSubArea()
  }, [id]);







  async function getfcmtoken() {
    try {
      const token = await getFCMToken();
      console.log('Token in component:', token);
      const data = {
        token,
        platform: 'web',
        id: selectedInstructor,
      };
      if (token) {
        const res = await StorePcm.storePcmData(data);
        console.log('Response from storing FCM token:', res);
      } else {
        console.warn('FCM token is empty; skipping storage registration.');
      }
      return token;
    } catch (error) {
      console.log('Error getting FCM token in component:', error);
      return null;
    }
  }


  const handleUpdateFullEnquiry = async () => {
    if (Number(id)) {
      toast.error('Updates are not supported on static mock data.');
      return;
    }
    try {
      setUpdatingEnquiry(true);
      const currentToken = localStorage.getItem('authToken');
      
      if (enquiryEditData.internal_notes) {
        const entityModel = getEntityModel();
        await NotesService.saveInternalNote({
          entityId: id,
          entityModel,
          note: enquiryEditData.internal_notes
        });
      }

      const enumFields = ['driving_experience', 'type_of_training', 'licence', 'lesson_preference_time', 'preferred_contact_method', 'source', 'enquiry_status', 'status', 'seen'];
      const payload = { ...enquiryEditData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '—' || payload[key] === '-') {
          delete payload[key];
        } else if (payload[key] === '' && enumFields.includes(key)) {
          delete payload[key];
        }
      });

      let res;
      if (activeType === 'adi') {
        res = await Enquires.updateAdiTrainingEnquiry(id, payload, currentToken);
        if (payload.status) {
          await Enquires.updateAdiTrainingEnquiryStatus(id, {
            status: payload.status,
            enquiry_status: payload.status,
            EnquiryStatus: payload.status
          }, currentToken);
        }
      } else if (activeType === 'intensives') {
        res = await Enquires.updateIntensiveEnquiry(id, payload, currentToken);
        if (payload.status) {
          await Enquires.updateIntensiveEnquiryStatus(id, {
            status: payload.status,
            enquiry_status: payload.status,
            EnquiryStatus: payload.status
          }, currentToken);
        }
      } else {
        res = await Enquires.updateFullEnquiry(id, payload, currentToken);
        if (payload.status) {
          await Enquires.updateEnquiry(id, {
            status: payload.status,
            enquiry_status: payload.status,
            EnquiryStatus: payload.status
          }, currentToken);
        }
      }
      console.log('Full Enquiry update response:', res);
      
      // Removed as it's now handled above

      const logMessage = `Updated the enquiry details.`;
      await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );

      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires(activeType || 'lessons');
      toast.success('Enquiry updated successfully!');
      setShowEditEnquiryModal(false);
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast.error('Failed to update enquiry.');
    } finally {
      setUpdatingEnquiry(false);
    }
  };

  const handleSaveInternalNote = async () => {
    if (Number(id)) {
      toast.error('Updates are not supported on static mock data.');
      return;
    }
    try {
      setSavingInternalNote(true);
      const entityModel = getEntityModel();
      await NotesService.saveInternalNote({
        entityId: id,
        entityModel,
        note: internalNote
      });

      const currentToken = localStorage.getItem('authToken');
      const updatedEnquiry = { ...enquiry, internal_notes: internalNote };
      
      if (activeType === 'adi') {
        await Enquires.updateAdiTrainingEnquiry(id, updatedEnquiry, currentToken);
      } else if (activeType === 'intensives') {
        await Enquires.updateIntensiveEnquiry(id, updatedEnquiry, currentToken);
      } else {
        await Enquires.updateFullEnquiry(id, updatedEnquiry, currentToken);
      }
      
      const logMessage = `Updated internal notes.`;
      await Logs.createLogs({ activity: logMessage, enquire_id: id }, currentToken);
      
      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      toast.success('Internal notes saved successfully!');
    } catch (error) {
      console.error('Error saving internal notes:', error);
      toast.error('Failed to save internal notes.');
    } finally {
      setSavingInternalNote(false);
    }
  };

  const handleSaveStatus = async (overrideStatus = null) => {
    if (Number(id)) {
      toast.error('Updates are not supported on static mock data.');
      return;
    }
    try {
      setSavingStatus(true);
      const statusToSave = overrideStatus || selectedStatus;
      const payload = {
        status: statusToSave,
        enquiry_status: statusToSave,
        EnquiryStatus: statusToSave,
      };
      const currentToken = localStorage.getItem('authToken');

      let res;
      if (activeType === 'adi') {
        res = await Enquires.updateAdiTrainingEnquiryStatus(id, payload, currentToken);
      } else if (activeType === 'franchise') {
        res = await Enquires.updateFranchiseEnquiryStatus(id, payload, currentToken);
      } else if (activeType === 'intensives') {
        res = await Enquires.updateIntensiveEnquiryStatus(id, payload, currentToken);
      } else {
        res = await Enquires.updateEnquiry(id, payload, currentToken);
      }
      
      console.log('Status update response:', res);

      const logMessage = `Changed the status of Enquiry to "${statusToSave}".`;
      const responseToCreateLogs = await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      setAssigningInstructor(true);
      // Refresh local enquiry view state
      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires(activeType || 'lessons');
      if (!overrideStatus) toast.success('Status updated successfully!');
      
      // useful if called programmatically
    } catch (error) {
      console.error('Error saving status changes:', error);
      if (!overrideStatus) toast.error('Failed to save status changes.');
      throw error;
    } finally {
      setSavingStatus(false);
      setAssigningInstructor(false);
    }
  };

  const handleConvertToInstructor = async () => {
    try {
      await handleSaveStatus('Converted to instructor');
      toast.success('Successfully converted to instructor!');
    } catch (err) {
      console.error(err);
      toast.error('Conversion failed.');
    }
  };

  const handleSaveInstructor = async () => {
    if (Number(id)) {
      toast.error('Updates are not supported on static mock data.');
      return;
    }
    try {
      setSavingInstructor(true);
      const payload = {
        instructor_id: selectedInstructor || null,
      };
      console.log('payload', payload);
      const currentToken = localStorage.getItem('authToken');

      const currentLiveInstId =
        typeof liveEnquiry.instructor === 'object'
          ? liveEnquiry.instructor?._id || liveEnquiry.instructor?.id
          : liveEnquiry.instructor;
      if (
        selectedInstructor === currentLiveInstId ||
        selectedInstructor === liveEnquiry.instructor_id
      ) {
        console.log('inst');
        alert('Already this instructor is assigned');
        return;
      }
      console.log('instructor', liveEnquiry?.instructor);

      let res;
      if (activeType === 'adi') {
        res = await Enquires.assignAdiTrainingEnquiryInstructor(id, payload, currentToken);
      } else if (activeType === 'intensives') {
        res = await Enquires.assignIntensiveEnquiryInstructor(id, payload, currentToken);
      } else {
        res = await Enquires.AssignInstructor(id, payload);
      }
      console.log('Instructor assignment response:', res);

      const allInstructors =
        instructors?.length > 0 ? instructors : localInstructors;
      const instructor = allInstructors.find(
        (inst) => inst._id === selectedInstructor
      );
      const logMessage = ` Assigned  "${instructor?.name || 'Instructor'}" to enquiry "${enquiry.FullName || enquiry.name || enquiry.full_name || enquiry.EnquiryID}".`;
      const responseToCreateLogs = await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      console.log('responseToCreateLogs', responseToCreateLogs);

      setAssigningInstructor(true);

      // Refresh local enquiry view state
      const refreshed = await fetchLiveEnquiryDetails();
      console.log(
        'Refreshed enquiry details after instructor assignment:',
        refreshed
      );

      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires(activeType || 'lessons');
      toast.success('Instructor assigned successfully!');
    } catch (error) {
      const currentToken = localStorage.getItem('authToken');

      console.error('Error assigning instructor:', error);
      if (error.response.data.error === 'SenderId mismatch') {
        toast.error('Instructor Assigned But Failed to send notification');
        const allInstructors =
          instructors?.length > 0 ? instructors : localInstructors;
        const instructor = allInstructors.find(
          (inst) => inst._id === selectedInstructor
        );
        const logMessage = ` Assigned  "${instructor?.name || 'Instructor'}" to enquiry "${enquiry.FullName || enquiry.name || enquiry.full_name || enquiry.EnquiryID}".`;
        const responseToCreateLogs = await Logs.createLogs(
          { activity: logMessage, enquire_id: id },
          currentToken
        );
        console.log('responseToCreateLogs', responseToCreateLogs);
        setAssigningInstructor(true);
      }
    } finally {
      setSavingInstructor(false);
      setAssigningInstructor(false);
    }
  };

  const handleSendResourcePack = async () => {
    try {
      setSendingResourcePack(true);
      const currentToken = localStorage.getItem('authToken');
      
      let res;
      if (activeType === 'intensives') {
        res = await Enquires.sendIntensiveResourcePack(id, currentToken);
      } else if (activeType === 'franchise') {
        toast.error('Resource pack sending is not configured for Franchise enquiries.');
        setSendingResourcePack(false);
        return;
      } else {
        res = await Enquires.sendEnquiryResourcePack(id, currentToken);
      }
      
      console.log('Resource Pack API Response:', res);
      
      const logMessage = `Sent Resource Pack to student.`;
      await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      
      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      await fetchEmailLogs();
      
      const responseMessage = res?.data?.message || 'Resource pack sent successfully!';
      toast.success(responseMessage);
    } catch (error) {
      console.error('Error sending resource pack:', error);
      console.log('Resource Pack Error Details:', error.response?.data || error);
      const errorMsg = error?.response?.data?.message || 'Failed to send resource pack.';
      toast.error(errorMsg);
    } finally {
      setSendingResourcePack(false);
    }
  };

  const handleSendReviewLink = async () => {
    try {
      setSendingReviewLink(true);
      const currentToken = localStorage.getItem('authToken');
      
      let res;
      if (activeType === 'intensives') {
        res = await Enquires.sendIntensiveReviewLink(id, currentToken);
      } else if (activeType === 'franchise' || activeType === 'adi') {
        toast.error('Review link sending is not configured for this enquiry type.');
        setSendingReviewLink(false);
        return;
      } else {
        res = await Enquires.sendEnquiryReviewLink(id, currentToken);
      }
      
      console.log('Review Link API Response:', res);
      
      const logMessage = `Sent Review Link to student.`;
      await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      
      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      await fetchEmailLogs();
      
      const responseMessage = res?.data?.message || 'Review link sent successfully!';
      toast.success(responseMessage);
    } catch (error) {
      console.error('Error sending review link:', error);
      console.log('Review Link Error Details:', error.response?.data || error);
      const errorMsg = error?.response?.data?.message || 'Failed to send review link.';
      toast.error(errorMsg);
    } finally {
      setSendingReviewLink(false);
    }
  };

  const handleSendWelcomeMessage = async () => {
    try {
      setSendingWelcomeMessage(true);
      const currentToken = localStorage.getItem('authToken');
      
      let res;
      if (activeType === 'intensives') {
        res = await Enquires.sendIntensiveWelcomeMessage(id, currentToken);
      } else if (activeType === 'franchise' || activeType === 'adi') {
        toast.error('Welcome message sending is not configured for this enquiry type.');
        setSendingWelcomeMessage(false);
        return;
      } else {
        res = await Enquires.sendEnquiryWelcomeMessage(id, currentToken);
      }
      
      console.log('Welcome Message API Response:', res);
      
      const logMessage = `Sent Welcome Message to student.`;
      await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      
      const refreshed = await fetchLiveEnquiryDetails();
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      await fetchEmailLogs();
      
      const responseMessage = res?.data?.message || 'Welcome message sent successfully!';
      toast.success(responseMessage);
    } catch (error) {
      console.error('Error sending welcome message:', error);
      console.log('Welcome Message Error Details:', error.response?.data || error);
      const errorMsg = error?.response?.data?.message || 'Failed to send welcome message.';
      toast.error(errorMsg);
    } finally {
      setSendingWelcomeMessage(false);
    }
  };

  const handleDeleteEnquiry = async () => {
    // Prevent deleting mock data
    if (Number(id)) {
      toast.success('Mock enquiry deleted successfully (simulated).');
      navigate(-1);
      return;
    }
    try {
      setDeleting(true);
      let type = activeType;
      if (!type) {
        if (liveEnquiry?.enquiry_type) type = liveEnquiry.enquiry_type;
        else if (location.state?.enquiry?.enquiry_type) type = location.state.enquiry.enquiry_type;
      }
      
      if (type === 'adi') {
        await Enquires.deleteAdiTrainingEnquiry(id);
      } else if (type === 'intensives') {
        await Enquires.deleteIntensiveEnquiry(id);
      } else if (type === 'franchise') {
        await Enquires.deleteFranchiseEnquiry(id);
      } else {
        await Enquires.deleteEnquiry(id);
      }
      
      if (getAllEnquires) await getAllEnquires(type || 'lessons');
      toast.success('Enquiry deleted successfully!');
      navigate('/enquiries', { replace: true, state: { filterType: type || 'lessons' } });
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry.');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Render a clean loading indicator if we're fetching live details and don't have any cached details to show
  if (loading && !enquiry) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Loading Enquiry Details...
          </p>
        </div>
      </div>
    );
  }

  // 🔒 Safety check
  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-transparent space-y-4">
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          Enquiry not found or still loading...
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const filterededInstructors = localInstructors.filter((inst) => {
    const trainingType = enquiry.type_of_training || enquiry.LessonType || enquiry.lesson_type || '';
    const transmissionType = inst.transmission_type || '';
    return trainingType.toLowerCase().includes(transmissionType.toLowerCase()) || transmissionType.toLowerCase() === "both";
  });

  console.log('filtered', filterededInstructors);
  const filterAreaCode = subAreas.find((b) => {
    // Grab the value no matter which property name the backend uses.
    // Give precedence to postcode over area, in case the database accidentally has area="Ainsworth" stored alongside postcode="SK8".
    const rawArea = enquiry.postcode || enquiry.Postcode || enquiry.area || enquiry.Area || enquiry.service_provided_area;

    // If it's STILL empty after checking all those, return false
    if (!rawArea) return false;

    // Remove spaces and lowercase (e.g., "OL11 2AB" -> "ol112ab")
    const searchArea = rawArea.toLowerCase().replace(/\s+/g, '');

    // 1. Check if the rawArea exactly matches the subarea's name or title
    if (b.name && b.name.toLowerCase().replace(/\s+/g, '') === searchArea) return true;
    if (b.title && b.title.toLowerCase().replace(/\s+/g, '') === searchArea) return true;

    // 2. Clean the database postcodes (e.g., -> ["ol11", "ol12", "ol16", "700064"])
    const postcodesArray = b.postcode
      ? b.postcode.split(',').map(p => p.toLowerCase().replace(/\s+/g, '')).filter(p => p.length > 0)
      : [];

    // Check if the searchArea STARTS WITH any of the postcodes in the array, or vice versa
    return postcodesArray.some(dbPostcode => searchArea.startsWith(dbPostcode) || dbPostcode.startsWith(searchArea));
  });

  // Let's log rawArea so we know what we found
  console.log('My raw enquiry Area/Postcode was:', enquiry.postcode || enquiry.Postcode || enquiry.area || enquiry.Area || enquiry.service_provided_area);
  console.log('filtering match data:', filterAreaCode);
  const packageInfo = typeof enquiry.package_id === 'object' ? enquiry.package_id : packages?.find(p => p._id === enquiry.package_id);
  const packageName = packageInfo?.package_name || packageInfo?.name || enquiry.package_name || enquiry.InterestedPackage || enquiry.interested_package || '—';

  const priceInfo = typeof enquiry.pricing_id === 'object' ? enquiry.pricing_id : pricing?.find(p => p._id === enquiry.pricing_id);
  const priceVal = priceInfo?.price || enquiry.price || enquiry.EstimatedPrice || enquiry.estimated_price || enquiry.package_id?.price;
  const priceDisplay = (priceVal !== undefined && priceVal !== '—' && priceVal !== null && priceVal !== '') ? `£${priceVal}` : '—';

  const areaInfo = typeof enquiry.area_id === 'object' ? enquiry.area_id : branches?.find(b => b._id === enquiry.area_id);
  
  let areaName = '—';
  if (areaInfo?.name) {
    areaName = areaInfo.name;
  } else if (filterAreaCode) {
    areaName = filterAreaCode.name || filterAreaCode.title;
  } else {
    areaName = enquiry.postcode || enquiry.Postcode || enquiry.area || enquiry.Area || enquiry.service_provided_area || '—';
  }

  // Robust mapping to support both live database fields and mock static data
  const displayData = {
    FullName: enquiry.FullName || enquiry.name || enquiry.full_name || '—',
    EnquiryID: enquiry.EnquiryID || enquiry.id || enquiry._id || '—',
    CreatedAt:
      enquiry.CreatedAt ||
      (enquiry.createdAt
        ? new Date(enquiry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '') ||
      '—',
    Phone: enquiry.Phone || enquiry.phone || enquiry.mobile || '—',
    Email: enquiry.Email || enquiry.email || '—',
    EnquiryStatus: enquiry.EnquiryStatus || enquiry.status || '—',
    Area: areaName,
    ActualPostcode: enquiry.postcode || enquiry.Postcode || '—',
    LessonType:
      enquiry.LessonType ||
      enquiry.lesson_type ||
      enquiry.lessonType ||
      enquiry.type_of_training ||
      '—',
    Transmission:
      enquiry.Transmission ||
      enquiry.transmission ||
      enquiry.preferred_transmission ||
      '—',
    PreferredTime:
      enquiry.PreferredTime ||
      enquiry.preferred_time ||
      enquiry.preferredTime ||
      enquiry.lesson_preference_time ||
      '—',
    StartTimeline:
      enquiry.StartTimeline ||
      enquiry.start_timeline ||
      enquiry.startTimeline ||
      (enquiry.preferred_start_date
        ? new Date(enquiry.preferred_start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '') ||
      '—',
    InterestedPackage: packageName,
    EstimatedPrice: priceDisplay,
    Zone: enquiry.Zone || enquiry.zone || '—',
    Notes: enquiry.Notes || enquiry.notes || enquiry.additional_message || '—',
    Priority: enquiry.Priority || enquiry.priority || '—',
    Source: enquiry.Source || enquiry.source || '—',
    AssignedTo:
      enquiry.AssignedTo ||
      enquiry.assigned_to ||
      enquiry.instructor_id?.name ||
      '—',
    FollowUpDate:
      enquiry.FollowUpDate ||
      (enquiry.follow_up_date
        ? new Date(enquiry.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '') ||
      '—',
    LastContactedAt:
      enquiry.LastContactedAt ||
      (enquiry.last_contacted_at
        ? new Date(enquiry.last_contacted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '') ||
      '—',
    // Live database custom fields
    DrivingExperience: enquiry.driving_experience || '—',
    HasLicence: enquiry.licence || '—',
    PreferredContactMethod: enquiry.preferred_contact_method || '—',
    Duration: enquiry.duration || '—',
    Price: enquiry.price || '—',
  };

  const isGiven = (val) =>
    val && val !== '—' && val !== '-' && val.toString().trim() !== '';

  const hasCoursePrefs =
    isGiven(displayData.LessonType) ||
    isGiven(displayData.Transmission) ||
    isGiven(displayData.StartTimeline) ||
    isGiven(displayData.PreferredTime) ||
    isGiven(displayData.InterestedPackage) ||
    isGiven(displayData.EstimatedPrice);
  const hasScheduleContact =
    isGiven(displayData.Area) ||
    isGiven(displayData.ActualPostcode) ||
    isGiven(displayData.Zone) ||
    isGiven(displayData.PreferredContactMethod);
  const hasProfileLead =
    isGiven(displayData.DrivingExperience) ||
    isGiven(displayData.HasLicence) ||
    isGiven(displayData.Priority) ||
    isGiven(displayData.Source);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen transition-colors duration-300">
      {/* BACK */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#1e293b] px-4 py-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/40 shadow-sm hover:shadow-md active:scale-95 transition-all select-none"
        >
          <FiArrowLeft className="text-sm transition-transform group-hover:-translate-x-0.5" />
          Back to Enquiries
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/10">
            {displayData.FullName
              ? displayData.FullName.charAt(0).toUpperCase()
              : 'E'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {displayData.FullName}
              </h1>
              <StatusBadge status={displayData.EnquiryStatus} />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Enquiry ID #{displayData.EnquiryID} · Received{' '}
              {displayData.CreatedAt}
            </p>
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-bold flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={`tel:${displayData.Phone}`}
                className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <FiPhone className="text-slate-400" /> {displayData.Phone}
              </a>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">
                |
              </span>
              <a
                href={`mailto:${displayData.Email}`}
                className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <FiMail className="text-slate-400" /> {displayData.Email}
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const rawEditData = { 
                ...enquiry, 
                ...displayData,
                Postcode: enquiry.postcode || enquiry.Postcode || enquiry.area || enquiry.Area || enquiry.service_provided_area || ''
              };
              Object.keys(rawEditData).forEach(key => {
                if (rawEditData[key] === '—' || rawEditData[key] === '-') {
                  rawEditData[key] = '';
                }
              });
              setEnquiryEditData(rawEditData);
              setShowEditEnquiryModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <FiSettings className="text-sm" /> Edit Enquiry
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* BASIC INFO */}
          <Card
            title="Enquiry Details"
            icon={<FiFileText className="text-indigo-500" />}
          >
            <div className="space-y-6">
              {activeType === 'adi' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(enquiry).map(([key, val]) => {
                    if (typeof val === 'object' || !val || ['_id', 'createdAt', 'updatedAt', '__v', 'enquiry_type', 'seen'].includes(key)) return null;
                    const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return <DetailRow key={key} label={formattedLabel} value={String(val)} />;
                  })}
                </div>
              ) : (
                <>
                  {/* Render Course Preferences if present */}
                  {hasCoursePrefs && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Course Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {isGiven(displayData.LessonType) && (
                      <DetailRow
                        label="Entry Type"
                        value={displayData.LessonType}
                        icon={<FiBookOpen />}
                      />
                    )}
                    {isGiven(displayData.Transmission) && (
                      <DetailRow
                        label="Transmission Type"
                        value={displayData.Transmission}
                        icon={<FiSettings />}
                      />
                    )}
                    {isGiven(displayData.StartTimeline) && (
                      <DetailRow
                        label="Preferred Start Date / Timeline"
                        value={displayData.StartTimeline}
                        icon={<FiCalendar />}
                      />
                    )}
                    {isGiven(displayData.PreferredTime) && (
                      <DetailRow
                        label="Preferred Time Slot"
                        value={displayData.PreferredTime}
                        icon={<FiClock />}
                      />
                    )}
                    {isGiven(displayData.InterestedPackage) && (
                      <DetailRow
                        label="Interested Package"
                        value={displayData.InterestedPackage}
                        icon={<FiTag />}
                      />
                    )}

                  </div>
                </div>
              )}

              {/* Divider if course preferences and either schedule/contact or profile/lead are present */}
              {hasCoursePrefs && (hasScheduleContact || hasProfileLead) && (
                <hr className="border-slate-100 dark:border-slate-800/60" />
              )}

              {/* Render Schedule & Contact if present */}
              {hasScheduleContact && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Schedule & Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {isGiven(displayData?.Area) && (
                      <DetailRow
                        label="Area"
                        value={displayData.Area}
                        icon={<FiMapPin />}
                      />
                    )}
                    {isGiven(displayData?.ActualPostcode) && (
                      <DetailRow
                        label="Postcode"
                        value={displayData.ActualPostcode}
                        icon={<FiMapPin />}
                      />
                    )}
                    <DetailRow
                      label="Duration"
                      value={displayData.Duration || ''}
                      icon={<FiClock />}
                    />
                    <DetailRow
                      label="Price"
                      value={displayData.Price || ''}
                      icon={<FiDollarSign />}
                    />
                    {isGiven(displayData?.Zone) && (
                      <DetailRow
                        label="Zone"
                        value={displayData.Zone}
                        icon={<FiCompass />}
                      />
                    )}
                    {isGiven(displayData.PreferredContactMethod) && (
                      <DetailRow
                        label="Contact Preference"
                        value={displayData.PreferredContactMethod}
                        icon={<FiPhone />}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Divider if schedule/contact and profile/lead are present */}
              {hasScheduleContact && hasProfileLead && (
                <hr className="border-slate-100 dark:border-slate-800/60" />
              )}

              {/* Render Profile & Lead Info if present */}
              {hasProfileLead && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Student Profile & Lead Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {isGiven(displayData.DrivingExperience) && (
                      <DetailRow
                        label="Driving Experience"
                        value={displayData.DrivingExperience}
                        icon={<FiAward />}
                      />
                    )}
                    {isGiven(displayData.HasLicence) && (
                      <DetailRow
                        label="Has Licence?"
                        value={displayData.HasLicence}
                        icon={<FiCheck />}
                      />
                    )}
                    {isGiven(displayData.Priority) && (
                      <DetailRow
                        label="Priority"
                        value={displayData.Priority}
                        icon={<FiAlertCircle />}
                      />
                    )}
                    {isGiven(displayData.Source) && (
                      <DetailRow
                        label="Lead Source"
                        value={displayData.Source}
                        icon={<FiTag />}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Fallback if no details at all are present */}
              {!hasCoursePrefs && !hasScheduleContact && !hasProfileLead && (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                  No enquiry details provided.
                </div>
              )}
                </>
              )}
            </div>
          </Card>

          {/* NOTES */}
          <Card
            title="Notes & Special Requests"
            icon={<FiMessageSquare className="text-amber-500" />}
          >
            <div className="relative text-sm text-slate-600 dark:text-slate-350 whitespace-pre-line leading-relaxed bg-amber-50/10 dark:bg-amber-950/10 border border-amber-200/10 dark:border-amber-900/10 p-5 rounded-2xl">
              <span className="absolute right-4 top-2 text-4xl font-serif text-amber-500/10 select-none">
                “
              </span>
              {displayData.Notes && displayData.Notes !== '—'
                ? displayData.Notes
                : 'No notes or special requests added yet.'}
            </div>
          </Card>

          {/* INTERNAL NOTES */}
          <Card
            title="Internal notes"
          >
            <div className="pt-2">
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add private notes visible only to admins..."
                className="w-full bg-[#18181b]/5 dark:bg-[#18181b]/50 border border-slate-200 dark:border-[#2d2d35] rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-[#4d4d5a] resize-none h-32 transition-colors"
              />
              <button
                onClick={handleSaveInternalNote}
                disabled={savingInternalNote}
                className="w-full mt-3 bg-slate-800 dark:bg-[#18181b] hover:bg-slate-700 dark:hover:bg-[#27272a] text-slate-100 dark:text-slate-200 font-semibold text-[13px] py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-700 dark:border-[#2d2d35]"
              >
                {savingInternalNote ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="text-sm" /> Save notes
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* ACTIVITY */}
          {activeType !== 'adi' && (
            <Card
              title="Activity Timeline"
              icon={<FiActivity className="text-teal-500" />}
            >
            {activities && activities.length > 0 ? (
              <div className="relative pl-6 pr-2 space-y-6 max-h-[420px] overflow-y-auto custom-scrollbar before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-850">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="relative group animate-fadeIn"
                  >
                    {/* Timeline node */}
                    <div className="absolute -left-[20px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-white dark:border-[#1e293b] bg-teal-500 group-hover:scale-125 transition-transform" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <FiClock className="text-[9px]" />
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50/55 dark:bg-slate-900/35 border border-slate-100/30 dark:border-slate-800/30 p-3 rounded-xl hover:bg-slate-100/40 dark:hover:bg-slate-900/60 transition-colors">
                        {activity.activity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                No activity logs found for this enquiry.
              </div>
            )}
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-8">

            <Card
              title="Update Status"
              icon={<FiCheckCircle className="text-teal-500" />}
            >
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Lead Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer shadow-xs"
                  >
                    {activeType === 'franchise' ? (
                      <>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Under review">Under review</option>
                        <option value="Waiting list">Waiting list</option>
                        <option value="No response">No response</option>
                        {selectedStatus === 'Converted to instructor' && (
                          <option value="Converted to instructor" disabled>Converted to instructor</option>
                        )}
                      </>
                    ) : (
                      <>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Booked">Booked</option>
                        <option value="Waiting list">Waiting list</option>
                        <option value="No Response">No Response</option>
                        <option value="Test-Only Enquiry">Test-Only Enquiry</option>
                        <option value="Passed to Office">Passed to Office</option>
                        <option value="Quoted / Price Given">Quoted / Price Given</option>
                        <option value="Call Back Later">Call Back Later</option>
                        <option value="Lost">Lost</option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveStatus(null)}
                  disabled={savingStatus}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {savingStatus ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Status...
                    </>
                  ) : (
                    'Save Status'
                  )}
                </button>
                
                {activeType === 'franchise' && selectedStatus !== 'Converted to instructor' && (
                  <button
                    type="button"
                    onClick={handleConvertToInstructor}
                    disabled={savingStatus}
                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
                  >
                    Convert to Instructor
                  </button>
                )}
              </div>
            </Card>
          {/* INSTRUCTOR ASSIGNMENT */}
          {activeType !== 'adi' && (
            <Card
              title="Assign Instructor"
              icon={<FiUser className="text-indigo-500" />}
            >
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Instructor
                </label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-xs"
                >
                  <option value="">Unassigned</option>
                  {(() => {
                    if (localError) {
                      return (
                        <option value="" disabled>
                          {localError}
                        </option>
                      );
                    }
                    if (localLoading || instructorLoading) {
                      return (
                        <option value="" disabled>
                          Loading instructors...
                        </option>
                      );
                    }
                    if (
                      !Array.isArray(filterededInstructors) ||
                      filterededInstructors.length === 0
                    ) {
                      return (
                        <option value="" disabled>
                          No instructors available
                        </option>
                      );
                    }
                    return filterededInstructors?.length > 0 ? filterededInstructors.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name || inst.Name || 'Unnamed Instructor'}
                      </option>
                    )) : localInstructors.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name || inst.Name || "Unnamed Instructors"}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveInstructor}
                disabled={savingInstructor}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {savingInstructor ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Assignment...
                  </>
                ) : (
                  'Save Assignment'
                )}
              </button>
            </div>
            </Card>
          )}

          {/* STUDENT EMAILS */}
          {activeType !== 'adi' && (
            <Card
              title="Student emails"
              icon={<FiMail className="text-purple-500" />}
            >
            <div className="space-y-1 pt-1">
              {/* Welcome Email */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 gap-2">
                <div className="flex items-center gap-3">
                  <FiFileText className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Welcome email</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${liveEnquiry?.is_welcome_message_sent || emailLogs.some(log => log.email_type === 'welcome_message' && log.status === 'success') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-[#322c3f] dark:text-slate-300'}`}>
                    {liveEnquiry?.is_welcome_message_sent || emailLogs.some(log => log.email_type === 'welcome_message' && log.status === 'success') ? 'Sent' : 'Not sent'}
                  </span>
                </div>
                <button 
                  onClick={handleSendWelcomeMessage}
                  disabled={sendingWelcomeMessage}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-[#bda4ff] dark:hover:bg-[#a98af7] text-indigo-900 dark:text-[#1a1233] text-[11px] font-bold rounded-full transition-all active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {sendingWelcomeMessage ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-900 dark:border-[#1a1233] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend className="text-[11px]" />
                  )}
                  {sendingWelcomeMessage ? 'Sending...' : 'Send'}
                </button>
              </div>

              {/* Resource Pack */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 gap-2">
                <div className="flex items-center gap-3">
                  <FiBookOpen className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Resource pack</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${liveEnquiry?.is_resource_pack_sent || emailLogs.some(log => log.email_type === 'resource_pack' && log.status === 'success') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-[#322c3f] dark:text-slate-300'}`}>
                    {liveEnquiry?.is_resource_pack_sent || emailLogs.some(log => log.email_type === 'resource_pack' && log.status === 'success') ? 'Sent' : 'Not sent'}
                  </span>
                </div>
                <button 
                  onClick={handleSendResourcePack}
                  disabled={sendingResourcePack}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-[#bda4ff] dark:hover:bg-[#a98af7] text-indigo-900 dark:text-[#1a1233] text-[11px] font-bold rounded-full transition-all active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {sendingResourcePack ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-900 dark:border-[#1a1233] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend className="text-[11px]" />
                  )}
                  {sendingResourcePack ? 'Sending...' : 'Send'}
                </button>
              </div>

              {/* Review Request */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 gap-2">
                <div className="flex items-center gap-3">
                  <FiStar className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Review request</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${liveEnquiry?.is_review_link_sent || emailLogs.some(log => log.email_type === 'review_link' && log.status === 'success') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-[#322c3f] dark:text-slate-300'}`}>
                    {liveEnquiry?.is_review_link_sent || emailLogs.some(log => log.email_type === 'review_link' && log.status === 'success') ? 'Sent' : 'Not sent'}
                  </span>
                </div>
                <button 
                  onClick={handleSendReviewLink}
                  disabled={sendingReviewLink}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-[#bda4ff] dark:hover:bg-[#a98af7] text-indigo-900 dark:text-[#1a1233] text-[11px] font-bold rounded-full transition-all active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {sendingReviewLink ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-900 dark:border-[#1a1233] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend className="text-[11px]" />
                  )}
                  {sendingReviewLink ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
            </Card>
          )}

          {/* DANGER ZONE (DELETE) */}
          <Card
            title="Danger Zone"
            icon={<FiTrash2 className="text-rose-500" />}
          >
            <div className="pt-1 space-y-4">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
                Once deleted, this enquiry record is permanently removed from
                the system and cannot be recovered.
              </p>

              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all"
                >
                  Delete Enquiry
                </button>
              ) : (
                <div className="space-y-2.5 p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/20 dark:border-rose-900/20 rounded-2xl animate-fadeIn">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
                    Are you absolutely sure?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteEnquiry}
                      disabled={deleting}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold uppercase py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={deleting}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 text-[11px] font-extrabold uppercase py-2.5 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* EDIT ENQUIRY MODAL */}
      {showEditEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 w-full max-w-4xl space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FiSettings className="text-indigo-500" /> Edit Enquiry Details
            </h2>
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              {(() => {
                if (activeType === 'adi') {
                  return (
                    <AdiTrainingEnquiryForm 
                      enquiryValues={enquiryEditData} 
                      onChange={(data) => setEnquiryEditData(data)}
                    />
                  );
                }
                if (activeType === 'intensives') {
                  return (
                    <IntensiveEnquiryForm 
                      enquiryValues={enquiryEditData} 
                      onChange={(data) => setEnquiryEditData(data)}
                      branches={branches}
                      packages={packages}
                      pricing={pricing}
                    />
                  );
                }
                return (
                  <EnquiryForm 
                    enquiryValues={enquiryEditData} 
                    onChange={(data) => setEnquiryEditData(data)}
                    branches={branches}
                    packages={packages}
                    pricing={pricing}
                  />
                );
              })()}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
              <button 
                onClick={() => setShowEditEnquiryModal(false)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateFullEnquiry} 
                disabled={updatingEnquiry}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {updatingEnquiry ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnquiryProfilePage;

/* ================= SMALL COMPONENTS ================= */

const Card = ({ title, icon, children }) => (
  <div className="premium-card bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm space-y-4 transition-all duration-300">
    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
      <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
      {icon && <span className="text-sm">{icon}</span>}
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailRow = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1.5 py-3 border-b border-slate-100/50 dark:border-slate-800/40 last:border-b-0 last:pb-0">
    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
      {icon && <span className="text-indigo-500 text-[12px]">{icon}</span>}
      {label}
    </span>
    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate pl-1">
      {(!value || value === '—' || value === '-') ? '' : value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    new: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    contacted:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    booked:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    converted:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    waiting:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    'no response':
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
    'passed to office':
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    quoted:
      'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25',
    lost: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    'follow-up':
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    'not interested':
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
  };

  const key = String(status || 'new')
    .toLowerCase()
    .trim();

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border select-none ${styles[key] || styles.new}`}
    >
      {status}
    </span>
  );
};
