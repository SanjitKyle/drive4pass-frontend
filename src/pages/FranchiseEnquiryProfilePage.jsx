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
  FiZap,
  FiStar,
  FiSave,
  FiEdit,
  FiUserCheck,
  FiX,
} from 'react-icons/fi';
import { BranchService } from '../services/branch.service';
import FranchiseEnquiryForm from '../components/templates/FranchiseEnquiryForm';
import InstructorForm from '../components/templates/InstructorForm';

const FranchiseEnquiryProfilePage = () => {
  const { id } = useParams();
  const {
    allenquies,
    instructors,
    fetchInstructors,
    getAllEnquires,
    branches,
    instructorLoading,
    addInstructor,
  } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();
  async function updateSeen() {
    try {
      const isSeen = await Enquires.seenEnquiry(id);
      console.log('updating seen unseen', isSeen)


    } catch (error) {
      console.log('error', error)
    }

  }
  // Local state to store live loaded data from API
  const [liveEnquiry, setLiveEnquiry] = useState(null);
  const [loading, setLoading] = useState(!location.state?.enquiry);

  // Status & Instructor update states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedInstructorName, setSelectedInstructorName] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingInstructor, setSavingInstructor] = useState(false);
  const [activities, setActivities] = useState([]);
  const [assigningInstructor, setAssigningInstructor] = useState(false);
  // Danger Zone delete states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showEditEnquiryModal, setShowEditEnquiryModal] = useState(false);
  const [enquiryEditData, setEnquiryEditData] = useState({});
  const [updatingEnquiry, setUpdatingEnquiry] = useState(false);

  const [showConvertToInstructorModal, setShowConvertToInstructorModal] = useState(false);
  const [convertingToInstructor, setConvertingToInstructor] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [savingInternalNote, setSavingInternalNote] = useState(false);

  async function getActivities() {
    try {
      const res = await Logs.getLogs(id);
      setActivities(res.data);
      console.log('Activities log response:', res);
    } catch (error) {
      console.log('error in fetching activities', error);
    }
  }
  const fetchInternalNotes = async () => {
    try {
      if (Number(id)) return;
      const res = await NotesService.getInternalNotesByEntity('FranchiseEnquiry', id);
      console.log('Internal notes full response:', res);
      
      let noteText = '';
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
      
      if (noteText) {
        setInternalNote(noteText);
      }
    } catch (error) {
      console.error('Error fetching internal notes:', error);
    }
  };

  useEffect(() => {
    getActivities();
    updateSeen();
    fetchInternalNotes();
  }, []);
  useEffect(() => {
    getActivities();
  }, [assigningInstructor]);
  const [localInstructors, setLocalInstructors] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [subAreas, setsubAreas] = useState([])

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
        const res = await Enquires.getFranchiseEnquiresById(id);
        const data = res?.data?.data || res?.data?.enquiry || res?.data;
        if (Array.isArray(data)) {
          setLiveEnquiry({ ...data[0], enquiry_type: 'franchise' });
        } else if (data) {
          setLiveEnquiry({ ...data, enquiry_type: 'franchise' });
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



  const contextEnq = allenquies ? allenquies.find((e) => e._id === id || e.id === id || e.EnquiryID === Number(id)) : null;

  const stateEnquiry = location.state ? location.state.enquiry : null;

  const enquiry =
    liveEnquiry ||
    stateEnquiry ||
    contextEnq ||
    enquiriesData.find((e) => e.EnquiryID === Number(id));

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
    }
  }, [enquiry]);

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
        await NotesService.saveInternalNote({
          entityId: id,
          entityModel: 'FranchiseEnquiry',
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

      const res = await Enquires.updateFranchiseEnquiry(id, payload, currentToken);
      console.log('Franchise Enquiry update response:', res);

      const logMessage = `Updated the enquiry details.`;
      await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );

      const refreshed = await Enquires.getFranchiseEnquiresById(id);
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires('franchise');
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
      await NotesService.saveInternalNote({
        entityId: id,
        entityModel: 'FranchiseEnquiry',
        note: internalNote
      });

      // The backend Franchise update route returns "Enquiry not found", so we skip syncing 
      // the note to the franchise enquiry document itself to prevent the error popup.
      // The note is successfully saved in the Notes API and fetched on load, so it works fine!
      
      const currentToken = localStorage.getItem('authToken');
      const logMessage = `Updated internal notes.`;
      await Logs.createLogs({ activity: logMessage, enquire_id: id }, currentToken);
      
      const refreshed = await Enquires.getFranchiseEnquiresById(id);
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      toast.success('Internal notes saved successfully!');
    } catch (error) {
      console.error('Error saving internal notes:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to save internal notes.';
      toast.error(msg);
    } finally {
      setSavingInternalNote(false);
    }
  };

  const handleSaveStatus = async () => {
    if (Number(id)) {
      toast.error('Updates are not supported on static mock data.');
      return;
    }
    try {
      setSavingStatus(true);
      const payload = {
        status: selectedStatus,
      };
      const currentToken = localStorage.getItem('authToken');

      const res = await Enquires.updateFranchiseEnquiryStatus(id, payload, currentToken);
      console.log('Status update response:', res);

      const logMessage = `Changed the status of Enquiry to "${selectedStatus}".`;
      const responseToCreateLogs = await Logs.createLogs(
        { activity: logMessage, enquire_id: id },
        currentToken
      );
      setAssigningInstructor(true);
      // Refresh local enquiry view state
      const refreshed = await Enquires.getFranchiseEnquiresById(id);
      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires('franchise');
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error saving status changes:', error);
      toast.error('Failed to save status changes.');
    } finally {
      setSavingStatus(false);
      setAssigningInstructor(false);
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
      const res = await Enquires.AssignInstructor(id, payload);
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
      const refreshed = await Enquires.getFranchiseEnquiresById(id);
      console.log(
        'Refreshed enquiry details after instructor assignment:',
        refreshed
      );

      if (refreshed?.data?.data) {
        setLiveEnquiry(refreshed.data.data);
      }
      if (getAllEnquires) await getAllEnquires('franchise');
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

  const handleDeleteEnquiry = async () => {
    // Prevent deleting mock data
    if (Number(id)) {
      toast.success('Mock enquiry deleted successfully (simulated).');
      window.history.back();
      return;
    }
    try {
      setDeleting(true);
      await Enquires.deleteFranchiseEnquiry(id);
      if (getAllEnquires) await getAllEnquires('franchise');
      toast.success('Enquiry deleted successfully!');
      navigate('/enquiries', { replace: true });
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry.');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleConvertInstructor = async () => {
    try {
      const formState = window.__instructorFormValues || {};
      
      if (!formState.licence_copy) {
        toast.error("Please upload licence");
        return;
      }

      setConvertingToInstructor(true);
      const formData = new FormData();
      
      formData.append("name", formState.name || "");
      formData.append("email", formState.email || "");
      formData.append("mobile", formState.mobile || "");
      formData.append("password", formState.password || "");
      formData.append("school_id", "69524353687858bc38b14330");
      formData.append("branch_id", "696233c450d46e1336df3c4e");
      formData.append("instructor_bio", formState.instructor_bio || "");
      formData.append("full_address", formState.full_address || "");
      formData.append("driving_details", formState.driving_details || "");
      formData.append("driving_lichence_number", formState.driving_licence_number || "");
      formData.append("licence_expiry_date", formState.licence_expiry_date || "");
      formData.append("pdi_badge_number", formState.badge_number || "");
      formData.append("badge_expiry_date", formState.badge_expiry_date || "");
      formData.append("experience", formState.driving_experience || "");
      if (formState.transmission_type) formData.append("transmission_type", formState.transmission_type);
      formData.append("entry_type", formState.entry_type || "");
      formData.append("work_type", formState.work_type || "");
      formData.append("type", formState.type || "");
      formData.append("start_date", formState.start_date || "");
      formData.append("franchise_start_date", formState.franchise_start_date || "");
      formData.append("car_make", formState.car_make || "");
      formData.append("car_model", formState.car_model || "");
      formData.append("car_reg", formState.car_reg || "");
      formData.append("status", formState.status || "1");
      formData.append("contract_signed", formState.contract_signed || "No");

      let areas = [];
      if (formState.service_areas) {
        areas = formState.service_areas.split(',').map(a => a.trim()).filter(a => a !== "");
      }
      formData.append("service_provided_area", JSON.stringify(areas));

      if (formState.licence_copy) {
        formData.append("upload_licence_copy", formState.licence_copy);
      }

      await addInstructor(formData);
      
      // Update status to Converted to Instructor
      const token = localStorage.getItem('authToken');
      await Enquires.updateFranchiseEnquiryStatus(id, { status: 'Converted to instructor' }, token);
      
      toast.success('Instructor created successfully!');
      setShowConvertToInstructorModal(false);
      if (getAllEnquires) await getAllEnquires('franchise');
    } catch (error) {
      console.error('Error creating instructor:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to convert to instructor.';
      toast.error(msg);
    } finally {
      setConvertingToInstructor(false);
    }
  };

  // Render a clean loading indicator if we're fetching live details and don't have any cached details to show
  if (loading && !enquiry) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/30 dark:bg-[#1e293b]">
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/30 dark:bg-[#1e293b] space-y-4">
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          Enquiry not found or still loading...
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold"
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
  // Robust mapping to support both live database fields and mock static data
  const getDynamicName = (obj) => {
    if (!obj) return null;
    const nameKey = Object.keys(obj).find(key => 
      key.toLowerCase().includes('name') && 
      typeof obj[key] === 'string' && 
      obj[key].trim() !== ''
    );
    return nameKey ? obj[nameKey] : null;
  };

  const displayData = {
    FullName: enquiry.FullName || enquiry.Name || enquiry.name || enquiry.full_name || (enquiry.first_name ? `${enquiry.first_name} ${enquiry.last_name || ''}`.trim() : null) || (enquiry.FirstName ? `${enquiry.FirstName} ${enquiry.LastName || ''}`.trim() : null) || (enquiry.firstName ? `${enquiry.firstName} ${enquiry.lastName || ''}`.trim() : null) || getDynamicName(enquiry) || '—',
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
    Postcode: filterAreaCode ? (filterAreaCode.name || filterAreaCode.title) : (enquiry.postcode || enquiry.Postcode || enquiry.area || enquiry.Area || enquiry.service_provided_area || '—'),
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
    InterestedPackage:
      enquiry.InterestedPackage ||
      enquiry.interested_package ||
      enquiry.package_name ||
      enquiry.package_id?.package_name ||
      '—',
    EstimatedPrice:
      enquiry.EstimatedPrice ||
      (enquiry.estimated_price !== undefined
        ? `£${enquiry.estimated_price}`
        : '') ||
      (enquiry.price !== undefined ? `£${enquiry.price}` : '') ||
      (enquiry.package_id?.price !== undefined
        ? `£${enquiry.package_id.price}`
        : '') ||
      '—',
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
  };

  const isGiven = (val) =>
    val && val !== '—' && val !== '-' && val.toString().trim() !== '';

  const hasCoursePrefs =
    isGiven(displayData.LessonType) ||
    isGiven(displayData.Transmission) ||
    isGiven(displayData.StartTimeline) ||
    isGiven(displayData.PreferredTime);
  const hasScheduleContact =
    isGiven(displayData.Postcode) ||
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
            {displayData.FullName && displayData.FullName !== '—'
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
            onClick={() => setShowConvertToInstructorModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <FiUser className="text-sm" /> Convert into Instructor
          </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(enquiry).map(([key, val]) => {
                  if (typeof val === 'object' || !val || ['_id', 'createdAt', 'updatedAt', '__v', 'enquiry_type', 'seen'].includes(key)) return null;
                  const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return <DetailRow key={key} label={formattedLabel} value={String(val)} />;
                })}
              </div>
            </div>
          </Card>


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
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Under review">Under review</option>
                    <option value="Waiting list">Waiting list</option>
                    <option value="No response">No response</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSaveStatus}
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
              </div>
            </Card>
          {/* INTERNAL NOTES */}
          <Card
            title="Internal notes"
          >
            <div className="space-y-3 pt-1">
              <textarea
                rows="4"
                placeholder="Add private notes visible only to admins..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              ></textarea>
              <button
                type="button"
                onClick={handleSaveInternalNote}
                disabled={savingInternalNote}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-[#151a23] dark:hover:bg-[#0f1319] border border-transparent dark:border-white/5 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {savingInternalNote ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="text-[13px]" /> Save notes
                  </>
                )}
              </button>
            </div>
          </Card>

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
              <FranchiseEnquiryForm 
                enquiryValues={enquiryEditData} 
                onChange={(data) => setEnquiryEditData(data)}
              />
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

      {/* CONVERT TO INSTRUCTOR MODAL */}
      {showConvertToInstructorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 w-full max-w-4xl space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FiUser className="text-emerald-500" /> Convert to Instructor
            </h2>
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              <InstructorForm 
                instructorValues={{
                  name: displayData.FullName !== '—' ? displayData.FullName : '',
                  email: displayData.Email !== '—' ? displayData.Email : '',
                  mobile: displayData.Phone !== '—' ? displayData.Phone : '',
                  transmission_type: displayData.Transmission !== '—' ? displayData.Transmission : '',
                  service_areas: displayData.Postcode !== '—' ? displayData.Postcode : '',
                  type: enquiry.instructor_type || enquiry.Type || enquiry.type || '',
                }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
              <button 
                onClick={() => setShowConvertToInstructorModal(false)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConvertInstructor} 
                disabled={convertingToInstructor}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {convertingToInstructor ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : 'Create Instructor'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FranchiseEnquiryProfilePage;

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
    'waiting list':
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    'no response':
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
    'test-only enquiry':
      'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/25',
    'passed to office':
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    'quoted / price given':
      'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25',
    'call back later':
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
    lost: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
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
