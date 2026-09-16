import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { enquiriesData as initialEnquiries } from '../data/dummy';
import { BranchService } from '../services/branch.service';
import { PackageService } from '../services/package.service';
import { PricingService } from '../services/pricing.service';
import { InstructorService } from '../services/instructor.service';
import { LearnerService } from '../services/Learner';
import { bookingService } from '../services/booking.service';
import { MoneyService } from '../services/money.service';
import { Sellservice } from '../services/sale.service';
import { CreditLogs } from '../services/credit_logs';
import { Enquires } from '../services/Enquires'; // force cache bust
import axiosInstance from '../services/axios';

const StateContext = createContext();

const initialState = {
    chat: false,
    cart: false,
    userProfile: false,
    notification: false,
};

export const ContextProvider = ({ children }) => {
    const [screenSize, setScreenSize] = useState(undefined);
    const [currentColor, setCurrentColor] = useState(localStorage.getItem('colorMode') || '#03C9D7');
    const [currentMode, setCurrentMode] = useState(localStorage.getItem('themeMode') || 'Light');
    const [themeSettings, setThemeSettings] = useState(false);
    const [activeMenu, setActiveMenu] = useState(true);
    const [isClicked, setIsClicked] = useState(initialState);
    const [enquiries, setEnquiries] = useState(initialEnquiries);
    const [branches, setBranches] = useState([]);
    const [branchLoading, setBranchLoading] = useState(false);
    const [packages, setPackages] = useState([]);
    const [packageLoading, setPackageLoading] = useState(false);
    const [pricing, setPricing] = useState([]);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [instructorLoading, setInstructorLoading] = useState(false);
    const [instructorWorkingDays, setInstructorWorkingDays] = useState([]);
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [IsUpdate, setIsUpdate] = useState(false);
    const [IsBooked, setIsBooked] = useState(false);
    const [allenquies, setallenquies] = useState([]);
    const [UnRead, setUnRead] = useState(0)


    const [notifications, setNotifications] = useState([]);
    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get(
                '/ds/notification/get-notification'
            );
            console.log('notifications', response);
            let rawData = [];
            if (response && response.data && Array.isArray(response.data)) {
                rawData = response.data;
            } else if (Array.isArray(response)) {
                rawData = response;
            }

            // Filter by last 15 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 15);
            
            const recentNotifications = rawData.filter(d => {
                const dDate = new Date(d.createdAt || d.created_at || Date.now());
                return dDate >= cutoffDate;
            });

            // Compute Unread count based on recent notifications
            const isUnRead = recentNotifications.filter((d) => !d.is_read);
            console.log('unread', isUnRead.length);
            setUnRead(isUnRead.length);

            // Sort recent notifications
            const sortedData = [...recentNotifications].reverse();
            if (sortedData[0] && (sortedData[0].createdAt || sortedData[0].created_at)) {
                sortedData.sort((a,b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
            }

            setNotifications(sortedData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, []);

    const setMode = (e) => {
        setCurrentMode(e.target.value);
        localStorage.setItem('themeMode', e.target.value);
    };
    const setColor = (color) => {
        setCurrentColor(color);
        localStorage.setItem('colorMode', color);
    };
    const handleClick = (clicked) =>
        setIsClicked({ ...initialState, [clicked]: true });

    const unreadEnquiriesCount = allenquies?.filter(
        (e) => e.seen === false || e.seen === 'false'
    ).length || 0;

    console.log("unseen",unreadEnquiriesCount)
    const markAsViewed = (id) => {
        setEnquiries((prev) =>
            prev.map((e) =>
                e.EnquiryID === id
                    ? { ...e, isViewed: true }
                    : e
            )
        );
    };
    const getPupilSell = useCallback(async (id) => {
        try {
            const res = await Sellservice.getPupilSell(id);
            return res.data;
        } catch (error) {
            console.log('error', error);
            return null;
        }
    }, []);
    const getPupilCreditsLog = useCallback(async (id) => {
        try {
            const res = await CreditLogs.getPupilCreditsLogs(id);
            return res.data;
        } catch (error) {
            console.log('error', error);
            return null;
        }
    }, []);
    // Fetch all learners
    const fetchLearners = useCallback(async () => {
        setLoading(true);

        try {
            const res = await LearnerService.getAll();
            console.log('learner', res.data);
            let dataArray = [];
            if (Array.isArray(res?.data)) {
                dataArray = res.data;
            } else if (Array.isArray(res)) {
                dataArray = res;
            }
            
            const sortedData = dataArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLearners(sortedData);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }, []);
    // Add a new learner
    const addLearner = useCallback(
        async (data) => {
            try {
                const res = await LearnerService.create(data);
                console.log('response to add', res);
                toast.success('Learner added successfully');
                fetchLearners();
            } catch (err) {
                console.error(err);
                toast.error('Failed to add learner');
            }
        },
        [fetchLearners]
    );

    // Update a learner
    const updateLearner = useCallback(
        async (id, data) => {
            try {
                const res = await LearnerService.update(id, data);
                console.log('response to update pupil', res);
                toast.success('Learner updated successfully');
                fetchLearners();
            } catch (err) {
                toast.error('Failed to update learner');
            }
        },
        [fetchLearners]
    );

    // Delete a learner
    const deleteLearner = useCallback(
        async (id) => {
            try {
                const res = await LearnerService.remove(id);
                console.log('learned deleted', res);

                setLearners((prev) =>
                    prev.filter((l) => l._id !== id)
                );

                toast.success('Learner deleted successfully');
            } catch (err) {
                toast.error('Failed to delete learner');
            }
        },
        []
    );

    const fetchBranches = useCallback(async () => {
        setBranchLoading(true);

        try {
            const res = await BranchService.getAll();
            console.log('branches data', res);
            const dataArray = Array.isArray(res) ? res : (res.branches || res.areas || res.data || []);
            const sortedData = dataArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBranches(sortedData);
        } catch (err) {
            console.error(err);
        }

        setBranchLoading(false);
    }, []);

    const addBranch = useCallback(
        async (data) => {
            try {
                const branchData = {
                    ...data,
                    code: data.areacode || data.code || `AREA-${Math.floor(Math.random() * 10000)}`,
                    address: data.address || 'N/A',
                    contact_email: data.contact_email || 'admin@drive4pass.com',
                    phone: data.phone || '00000000000',
                    branch_timezones: data.branch_timezones || 'Europe/London'
                };
                
                console.log('Sending branch data to backend:', branchData);
                
                const res = await BranchService.createBranch(branchData);
                console.log('creating branch', res);

                fetchBranches();

                toast.success('Branch created successfully');
            } catch (err) {
                toast.error('Failed to add branch');
            }
        },
        [fetchBranches]
    );

    const updateBranch = useCallback(
        async (id, data) => {
            try {
                await BranchService.update(id, data);

                fetchBranches();

                toast.success('Branch updated successfully');
            } catch (err) {
                toast.error('Failed to update branch');
            }
        },
        [fetchBranches]
    );

    const deleteBranch = useCallback(
        async (id) => {
            try {
                const res = await BranchService.remove(id);
                console.log('deleting branches', res);

                fetchBranches();

                toast.success('Branch deleted successfully');
            } catch (err) {
                toast.error('Failed to delete branch');
            }
        },
        [fetchBranches]
    );

    const fetchPackages = useCallback(async () => {
        setPackageLoading(true);

        try {
            const res = await PackageService.getAll();
            const dataArray = Array.isArray(res) ? res : (res.data || res.packages || []);
            const sortedData = dataArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPackages(sortedData);
        } catch (err) {
            console.error(err);
        }

        setPackageLoading(false);
    }, []);

    const addPackage = useCallback(
        async (data) => {
            try {
               const res= await PackageService.create(data);
                console.log('response to add package', res);
                fetchPackages();
                toast.success('Package created successfully');
            } catch (err) {
                toast.error('Failed to create package');
            }
        },
        [fetchPackages]
    );

    const updatePackage = useCallback(
        async (id, data) => {
            try {
                await PackageService.update(id, data);
                fetchPackages();
                toast.success('Package updated successfully');
            } catch (err) {
                toast.error('Failed to update package');
            }
        },
        [fetchPackages]
    );

    const deletePackage = useCallback(async (id) => {
        try {
            await PackageService.remove(id);

            setPackages((prev) =>
                prev.filter((pkg) => pkg._id !== id)
            );

            toast.success('Package deleted successfully');
        } catch (err) {
            toast.error('Failed to delete package');
        }
    }, []);

    const fetchPricing = useCallback(async () => {
        try {
            const res = await PricingService.getAll();
            console.log('response', res);

            setPricing(res.data);
        } catch (err) {
            console.log(err);
        }
    }, []);

    const addPricing = useCallback(async (data) => {
        try {
            const res = await PricingService.create(data);

            console.log('response to add pricing', res);

            return res;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, []);

    const updatePricing = useCallback(async (id, data) => {
        try {
            const res = await PricingService.update(id, data);

            console.log('response to update package', res);

            return res;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, []);

    const deletePricing = useCallback(async (id) => {
        try {
            const res = await PricingService.remove(id);

            console.log('delete pricing', res);

            return res;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, []);

    const fetchInstructors = useCallback(async () => {
        setInstructorLoading(true);

        try {
            const res = await InstructorService.getAll();
            const sortedData = res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setInstructors(sortedData);
        } catch (err) {
            console.error('Error fetching instructors:', err);
        } finally {
            setInstructorLoading(false);
        }
    }, []);

    const fetchPupilsMoney = useCallback(async (id) => {
        try {
            const res = await MoneyService.getPupilSMoney(id);
            return res;
        } catch (error) {
            console.error('Error fetching pupil money:', error);
            return null;
        }
    }, []);

    const addInstructor = useCallback(
        async (data) => {
            const res = await InstructorService.create(data);
            console.log('response to add instructor', res);
            // Axios interceptor returns response.data, so res IS the data body
            if (res && res.status === false) {
                let msg = res.message || res.error_message || 'Failed to add instructor';
                if (res.errors) {
                    try {
                        const errDetails = typeof res.errors === 'string' ? res.errors : Object.values(res.errors).flat().join(', ');
                        if (errDetails) msg += `: ${errDetails}`;
                    } catch (e) {
                        console.error('Error parsing validation errors', e);
                    }
                }
                throw new Error(msg);
            }

            const internalNotes = data instanceof FormData ? data.get('internal_notes') : data.internal_notes;
            if (internalNotes) {
                const newId = res?.data?._id || res?._id || res?.instructor?._id;
                if (newId) {
                    const { NotesService } = await import('../services/notes.service');
                    await NotesService.saveInternalNote({
                        entityId: newId,
                        entityModel: 'InstructorMaster',
                        note: internalNotes
                    });
                }
            }

            fetchInstructors();
            return res;
        },
        [fetchInstructors]
    );

    const updateInstructor = useCallback(
        async (id, data) => {
            await InstructorService.update(id, data);
            fetchInstructors();
        },
        [fetchInstructors]
    );

    // approve instructor
    const approvedInstructor = useCallback(async (id) => {
        try {
            const res = await InstructorService.approveInstructor(id);
            return res;
        } catch (err) {
            toast.error('Could not approved');
            return null;
        }
    }, []);

    const deleteInstructor = useCallback(async (id) => {
        await InstructorService.remove(id);

        setInstructors((prev) =>
            prev.filter((instructor) => instructor._id !== id)
        );

        toast.success('Instructor deleted successfully');
    }, []);

    const fetchInstructorWorkingDays = useCallback(
        async (instructorId) => {
            try {
                const res =
                    await InstructorService.instructorWorkingDays(
                        instructorId
                    );

                return res.data;
            } catch (err) {
                console.error(
                    'Error fetching working days:',
                    err
                );

                return [];
            }
        },
        []
    );

    const instructorWorkingDaysCreateAndUpdate = useCallback(
        async (data) => {
            try {
                const res =
                    await InstructorService.instructorWorkingDayCreateAndUpdate(
                        data
                    );

                setIsUpdate((Prev) => !Prev);

                return res.data;
            } catch (err) {
                toast.error('failed to update workings days');
                return null;
            }
        },
        []
    );

    const GetBooking = useCallback(async (instructorId) => {
        const res = await bookingService.getAll(instructorId);
        return res.data;
    }, []);

    const getPupilBookings = useCallback(async (id) => {
        const res = await bookingService.getPupilBooking(id);
        return res;
    }, []);

    const createBooking = useCallback(async (data) => {
        try {
            const res = await bookingService.create(data);
            return res.data;
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                'Failed to create booking'
            );

            console.error(err);

            return null;
        }
    }, []);

    const updateBooking = useCallback(async (id, data) => {
        try {
            const res = await bookingService.update(id, data);
            return res.data;
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                'Failed to update booking'
            );
            console.error(err);
            return null;
        }
    }, []);

    const removeBooking = useCallback(async (id) => {
        try {
            const res = await bookingService.remove(id);
            return res.data;
        } catch (error) {
            console.error('Failed to remove booking:', error);
            throw error;
        }
    }, []);

    const GetAllBookings = useCallback(async () => {
        if (!window.getAllBookingsPromise) {
            window.getAllBookingsPromise = bookingService.getAllOFAllInstructos().finally(() => {
                window.getAllBookingsPromise = null;
            });
        }
        return window.getAllBookingsPromise;
    }, []);

    const getAllEnquires = useCallback(async (type = 'lessons') => {
        try {
            let res;
            if (type === 'intensives') {
                res = await Enquires.getIntensiveEnquires();
            } else if (type === 'adi') {
                res = await Enquires.getAdiTrainingEnquires();
            } else if (type === 'franchise') {
                res = await Enquires.getFranchiseEnquires();
            } else {
                res = await Enquires.getAllEnquires();
            }
            
            const dataArray = res?.data?.data || res?.data || [];
            
            // Normalize data to ensure it matches grid and form expectations
            const normalizedData = dataArray.map(item => {
                const commonId = item._id || item.id || item.EnquiryID;
                if (type === 'franchise') {
                    return {
                        ...item,
                        _id: commonId,
                        enquiry_type: 'franchise',
                        name: item.name || item.first_name || item.full_name,
                        status: item.status || 'New',
                        additional_message: [
                            item.message || '',
                            item.instructor_type ? `Instructor Type: ${item.instructor_type}` : '',
                            item.franchise_status ? `Franchise Status: ${item.franchise_status}` : ''
                        ].filter(Boolean).join('\n')
                    };
                }
                return {
                    ...item,
                    _id: commonId,
                    enquiry_type: type,
                    name: item.name || item.first_name || item.full_name
                };
            });
            
            console.log('enquies', normalizedData)
            const sortedData = normalizedData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setallenquies(sortedData);

        } catch (error) {
            console.log('error', error)
        }
    }, [])

    const addEnquiry = useCallback(
        async (data) => {
            try {
                const res = await Enquires.createEnquiry(data);
                if (data.internal_notes) {
                    const newId = res?.data?.data?._id || res?.data?._id;
                    if (newId) {
                        const { NotesService } = await import('../services/notes.service');
                        await NotesService.saveInternalNote({
                            entityId: newId,
                            entityModel: 'Enquire',
                            note: data.internal_notes
                        });
                    }
                }
                console.log('response to add', res);
                toast.success('Enquiry added successfully');
                const type = localStorage.getItem('enquiryFilterType') || 'lessons';
                getAllEnquires(type);
            } catch (err) {
                console.error(err);
                toast.error('Failed to add enquiry');
            }
        },
        [getAllEnquires]
    );

    const addAdiTrainingEnquiry = useCallback(
        async (data) => {
            console.log('--- START addAdiTrainingEnquiry ---');
            console.log('Payload being sent:', JSON.stringify(data, null, 2));
            try {
                const res = await Enquires.createAdiTrainingEnquiry(data);
                if (data.internal_notes) {
                    const newId = res?.data?.data?._id || res?.data?._id;
                    if (newId) {
                        const { NotesService } = await import('../services/notes.service');
                        await NotesService.saveInternalNote({
                            entityId: newId,
                            entityModel: 'AdiTrainingForm',
                            note: data.internal_notes
                        });
                    }
                }
                console.log('Success response to add ADI training enquiry:', res.data);
                toast.success('ADI Training Enquiry added successfully');
                getAllEnquires('adi');
            } catch (err) {
                console.error('ERROR in addAdiTrainingEnquiry:', err.response?.data || err.message);
                console.error('Full error object:', err);
                toast.error('Failed to add ADI training enquiry');
            }
            console.log('--- END addAdiTrainingEnquiry ---');
        },
        [getAllEnquires]
    );

    const addIntensiveEnquiry = useCallback(
        async (data) => {
            console.log('--- START addIntensiveEnquiry ---');
            console.log('Payload being sent:', JSON.stringify(data, null, 2));
            try {
                const res = await Enquires.createIntensiveEnquiry(data);
                if (data.internal_notes) {
                    const newId = res?.data?.data?._id || res?.data?._id;
                    if (newId) {
                        const { NotesService } = await import('../services/notes.service');
                        await NotesService.saveInternalNote({
                            entityId: newId,
                            entityModel: 'CourseForm',
                            note: data.internal_notes
                        });
                    }
                }
                console.log('Success response to add Intensive enquiry:', res.data);
                toast.success('Intensive Enquiry added successfully');
                getAllEnquires('intensives');
            } catch (err) {
                console.error('ERROR in addIntensiveEnquiry:', err.response?.data || err.message);
                console.error('Full error object:', err);
                toast.error('Failed to add intensive enquiry');
            }
            console.log('--- END addIntensiveEnquiry ---');
        },
        [getAllEnquires]
    );

    const addFranchiseEnquiry = useCallback(
        async (data) => {
            console.log('--- START addFranchiseEnquiry ---');
            console.log('Payload being sent:', JSON.stringify(data, null, 2));
            try {
                const res = await Enquires.createFranchiseEnquiry(data);
                if (data.internal_notes) {
                    const newId = res?.data?.data?._id || res?.data?._id;
                    if (newId) {
                        const { NotesService } = await import('../services/notes.service');
                        await NotesService.saveInternalNote({
                            entityId: newId,
                            entityModel: 'FranchiseEnquiry',
                            note: data.internal_notes
                        });
                    }
                }
                console.log('Success response to add Franchise enquiry:', res.data);
                toast.success('Franchise Enquiry added successfully');
                getAllEnquires('franchise');
            } catch (err) {
                console.error('ERROR in addFranchiseEnquiry:', err.response?.data || err.message);
                console.error('Full error object:', err);
                toast.error('Failed to add franchise enquiry');
            }
            console.log('--- END addFranchiseEnquiry ---');
        },
        [getAllEnquires]
    );
    useEffect(() => {
        fetchBranches();
        fetchInstructors();
        fetchPackages();
        fetchLearners();
        const type = localStorage.getItem('enquiryFilterType') || 'lessons';
        getAllEnquires(type);
    }, [
        fetchBranches,
        fetchInstructors,
        fetchPackages,
        fetchLearners,
    ]);

    // Memoize the context value
    const contextValue = useMemo(
        () => ({
            currentColor,
            currentMode,
            activeMenu,
            screenSize,
            setScreenSize,
            handleClick,
            isClicked,
            initialState,
            setIsClicked,
            setActiveMenu,
            setCurrentColor,
            setCurrentMode,
            setMode,
            setColor,
            themeSettings,
            setThemeSettings,
            enquiries,
            setEnquiries,
            unreadEnquiriesCount,
            markAsViewed,
            branches,
            fetchBranches,
            addBranch,
            updateBranch,
            deleteBranch,
            branchLoading,
            packages,
            fetchPackages,
            addPackage,
            updatePackage,
            deletePackage,
            packageLoading,
            pricing,
            fetchPricing,
            addPricing,
            updatePricing,
            deletePricing,
            pricingLoading,
            instructors,
            fetchInstructors,
            addInstructor,
            updateInstructor,
            approvedInstructor,
            deleteInstructor,
            instructorLoading,
            fetchInstructorWorkingDays,
            instructorWorkingDaysCreateAndUpdate,
            learners,
            fetchLearners,
            addLearner,
            updateLearner,
            deleteLearner,
            learnerLoading: loading,
            IsUpdate,
            GetBooking,
            createBooking,
            CreateBooking: createBooking,
            updateBooking,
            UpdateBooking: updateBooking,
            RemoveBooking: removeBooking,
            GetAllBookings,
            fetchPupilsMoney,
            getPupilBookings,
            getPupilSell,
            getPupilCreditsLog,
            allenquies,
            setallenquies,
            getAllEnquires,
            addEnquiry,
            addAdiTrainingEnquiry,
            addIntensiveEnquiry,
            addFranchiseEnquiry,
            setUnRead,
            UnRead,
            notifications,
            setNotifications,
            fetchNotifications
        }),
        [
            currentColor,
            currentMode,
            activeMenu,
            screenSize,
            isClicked,
            themeSettings,
            enquiries,
            branches,
            branchLoading,
            unreadEnquiriesCount,
            fetchBranches,
            addBranch,
            updateBranch,
            deleteBranch,
            packages,
            packageLoading,
            fetchPackages,
            addPackage,
            updatePackage,
            deletePackage,
            pricing,
            pricingLoading,
            fetchPricing,
            addPricing,
            updatePricing,
            deletePricing,
            instructors,
            instructorLoading,
            fetchInstructors,
            addInstructor,
            updateInstructor,
            deleteInstructor,
            approvedInstructor,
            fetchInstructorWorkingDays,
            instructorWorkingDaysCreateAndUpdate,
            learners,
            fetchLearners,
            addLearner,
            updateLearner,
            deleteLearner,
            loading,
            IsUpdate,
            GetBooking,
            createBooking,
            updateBooking,
            removeBooking,
            GetAllBookings,
            fetchPupilsMoney,
            getPupilBookings,
            getPupilSell,
            getPupilCreditsLog,
            allenquies,
            setallenquies,
            getAllEnquires,
            addEnquiry,
            addAdiTrainingEnquiry,
            addIntensiveEnquiry,
            addFranchiseEnquiry,
            setUnRead,
            UnRead,
            notifications,
            setNotifications,
            fetchNotifications
        ]
    );

    return (
        <StateContext.Provider value={contextValue}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);