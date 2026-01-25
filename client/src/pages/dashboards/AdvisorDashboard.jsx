import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Checkbox,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HelpTab from '../../components/HelpTab';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const AdvisorDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [approvalSubTab, setApprovalSubTab] = useState(0); // 0: Instructor, 1: Advisor

    const [pendingRequests, setPendingRequests] = useState([]); // FA Requests
    const [instructorPendingRequests, setInstructorPendingRequests] = useState([]); // Instructor Requests
    const [myCourses, setMyCourses] = useState([]); // My Courses
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Float Form State
    const [floatData, setFloatData] = useState({
        code: '', title: '', department: '', lecture: 3, tutorial: 0, practical: 0, credits: 4, semester: 'I', year: new Date().getFullYear().toString(),
        section: '', slot: ''
    });
    const [eligibilityList, setEligibilityList] = useState([]);
    const [newEligibility, setNewEligibility] = useState({
        degree: '', department: '', category: 'Programme Core', entryYears: ''
    });

    // Course Filter State
    const [courseFilters, setCourseFilters] = useState({
        code: '', title: '', department: '', semester: '', section: ''
    });

    // Profile View State
    const [viewProfileOpen, setViewProfileOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Independent Filter States
    const initialFilters = { department: '', year: '', type: '' };
    const [instructorFilters, setInstructorFilters] = useState({ ...initialFilters });
    const [advisorFilters, setAdvisorFilters] = useState({ ...initialFilters });

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    const DEPARTMENTS = [
        "Computer Science and Engineering", "Electronics and Communication Engineering", "Mechanical Engineering",
        "Civil Engineering", "Chemical Engineering", "Biotechnology", "Mathematics", "Humanities and Social Sciences"
    ];

    const DEGREES = ["B.Tech", "M.Tech", "PhD", "M.Sc"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Updated endpoint to bypass cache
            const faRes = await api.get('/courses/fa/pending-approvals');
            setPendingRequests(faRes.data);

            const instRes = await api.get('/courses/instructor/pending');
            setInstructorPendingRequests(instRes.data);

            const coursesRes = await api.get('/courses');
            const mine = coursesRes.data.filter(c => (c.instructor._id === user?._id) || (c.instructor === user?._id));
            setMyCourses(mine);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/course-details/${courseId}`);
    };

    const handleAction = async (id, action, context) => {
        try {
            const endpoint = context === 'fa' ? `/courses/fa/approve/${id}` : `/courses/instructor/approve/${id}`;
            await api.put(endpoint, { action });
            setMessage({ type: 'success', text: `Request ${action}ed successfully` });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleSubTabChange = (event, newValue) => {
        setApprovalSubTab(newValue);
        setSelectedIds([]);
    };

    const handleCourseFilterChange = (field, value) => {
        setCourseFilters({ ...courseFilters, [field]: value });
    };

    const handleClearCourseFilters = () => {
        setCourseFilters({ code: '', title: '', department: '', semester: '', section: '' });
    };

    const handleFloatChange = (e) => setFloatData({ ...floatData, [e.target.name]: e.target.value });

    const handleLookup = async () => {
        try {
            const res = await api.get(`/courses/history/search?q=${floatData.code || floatData.title}`);
            if (res.data && res.data.length > 0) {
                const match = res.data[0];
                setFloatData({
                    ...floatData,
                    code: match.code, title: match.title, department: match.department,
                    credits: match.credits?.total || 4, lecture: match.credits?.lecture || 3,
                    tutorial: match.credits?.tutorial || 0, practical: match.credits?.practical || 0
                });
                setMessage({ type: 'success', text: 'Auto-filled from history' });
            } else {
                setMessage({ type: 'info', text: 'No history found' });
            }
        } catch (err) { console.error(err); }
    };

    const handleFloatSubmit = async () => {
        if (!floatData.code || !floatData.title || !floatData.department) return setMessage({ type: 'error', text: 'Fill required fields' });
        try {
            await api.post('/courses/float', {
                ...floatData,
                credits: { lecture: Number(floatData.lecture), tutorial: Number(floatData.tutorial), practical: Number(floatData.practical), total: Number(floatData.credits) },
                eligibility: eligibilityList
            });
            setMessage({ type: 'success', text: 'Course floated successfully!' });
            setFloatData({ code: '', title: '', department: '', lecture: 3, tutorial: 0, practical: 0, credits: 4, semester: 'I', year: new Date().getFullYear().toString() });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed' });
        }
    };

    // Eligibility Handlers
    const handleAddEligibility = () => {
        if (!newEligibility.degree || !newEligibility.department) return;
        setEligibilityList([...eligibilityList, { ...newEligibility, entryYears: newEligibility.entryYears.split(',').map(y => y.trim()) }]);
        setNewEligibility({ degree: '', department: '', category: 'Programme Core', entryYears: '' });
    };

    const handleDeleteEligibility = (index) => {
        const list = [...eligibilityList];
        list.splice(index, 1);
        setEligibilityList(list);
    };

    // Helper functions
    const extractYearFromRollNumber = (rollNumber) => {
        if (!rollNumber || rollNumber.length < 4) return '';
        return rollNumber.substring(0, 4);
    };

    const filterRequests = (requests, filters) => {
        return requests.filter(req => {
            const matchesDepartment = filters.department === '' || req.student?.department === filters.department;
            const studentYear = extractYearFromRollNumber(req.student?.rollNumber);
            const matchesYear = filters.year === '' || studentYear === filters.year;
            const matchesType = filters.type === '' || req.type === filters.type;
            return matchesDepartment && matchesYear && matchesType;
        });
    };

    const filteredCourses = myCourses.filter(course => {
        const matchesCode = courseFilters.code === '' || course.code.toLowerCase().includes(courseFilters.code.toLowerCase());
        const matchesTitle = courseFilters.title === '' || course.title.toLowerCase().includes(courseFilters.title.toLowerCase());
        const matchesDepartment = courseFilters.department === '' || course.department === courseFilters.department;
        const matchesSemester = courseFilters.semester === '' || course.semester.toLowerCase().includes(courseFilters.semester.toLowerCase());
        const matchesSection = courseFilters.section === '' || (course.section && course.section.toLowerCase() === courseFilters.section.toLowerCase());
        return matchesCode && matchesTitle && matchesDepartment && matchesSemester && matchesSection;
    });

    // Derived State
    const currentContext = approvalSubTab === 0 ? 'instructor' : 'fa';
    const currentRequests = approvalSubTab === 0 ? instructorPendingRequests : pendingRequests;
    const currentFilters = approvalSubTab === 0 ? instructorFilters : advisorFilters;
    const setFilterState = approvalSubTab === 0 ? setInstructorFilters : setAdvisorFilters;
    const filteredRequests = filterRequests(currentRequests, currentFilters);

    const handleFilterChange = (field, value) => {
        setFilterState(prev => ({ ...prev, [field]: value }));
    };

    const handleClearFilters = () => {
        setFilterState({ ...initialFilters });
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) setSelectedIds(filteredRequests.map(req => req._id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkActionClick = (action) => {
        setBulkAction(action);
        setBulkDialogOpen(true);
    };

    const handleBulkActionConfirm = async () => {
        try {
            const endpoint = currentContext === 'fa' ? '/courses/fa/bulk-approve' : '/courses/instructor/bulk-approve';
            const response = await api.put(endpoint, { ids: selectedIds, action: bulkAction });
            setMessage({ type: 'success', text: `Successfully ${bulkAction}d ${response.data.successCount} requests` });
            setSelectedIds([]);
            setBulkDialogOpen(false);
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Bulk action failed' });
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">Faculty Advisor Dashboard</Typography>
            {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Paper square sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                    <Tab icon={<AssignmentIcon />} label="Pending Approvals" />
                    <Tab icon={<ClassIcon />} label="My Courses" />
                    <Tab icon={<AddCircleIcon />} label="Float Course" />
                    <Tab icon={<HelpIcon />} label="Help & Support" />
                </Tabs>
            </Paper>

            {/* Tab 0: Pending Requests */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={approvalSubTab} onChange={handleSubTabChange}>
                                <Tab icon={<ClassIcon fontSize="small" />} label="As Instructor" iconPosition="start" />
                                <Tab icon={<AssignmentIcon fontSize="small" />} label="As Faculty Advisor" iconPosition="start" />
                            </Tabs>
                        </Box>

                        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                Filter {approvalSubTab === 0 ? "Course Registrations" : "Advisee Requests"}
                            </Typography>
                            <Grid container spacing={3} alignItems="stretch">
                                <Grid item xs={12} xl={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Department</InputLabel>
                                        <Select value={currentFilters.department} label="Department" onChange={(e) => handleFilterChange('department', e.target.value)}>
                                            <MenuItem value="">All Departments</MenuItem>
                                            {DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} xl={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Year of Entry</InputLabel>
                                        <Select value={currentFilters.year} label="Year of Entry" onChange={(e) => handleFilterChange('year', e.target.value)}>
                                            <MenuItem value="">All Years</MenuItem>
                                            <MenuItem value="2024">2024</MenuItem>
                                            <MenuItem value="2023">2023</MenuItem>
                                            <MenuItem value="2022">2022</MenuItem>
                                            <MenuItem value="2021">2021</MenuItem>
                                            <MenuItem value="2020">2020</MenuItem>
                                            <MenuItem value="2019">2019</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} xl={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Registration Type</InputLabel>
                                        <Select value={currentFilters.type} label="Registration Type" onChange={(e) => handleFilterChange('type', e.target.value)}>
                                            <MenuItem value="">All Types</MenuItem>
                                            <MenuItem value="Credit">Credit</MenuItem>
                                            <MenuItem value="Audit">Audit</MenuItem>
                                            <MenuItem value="Minor">Minor</MenuItem>
                                            <MenuItem value="Concentration">Concentration</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} xl={3}>
                                    <Button fullWidth variant="outlined" onClick={handleClearFilters} sx={{ height: '56px', fontSize: '0.95rem', fontWeight: 600 }}>Clear Filters</Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {selectedIds.length > 0 && (
                            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedIds.length} selected</Typography>
                                <Button variant="contained" color="success" size="small" onClick={() => handleBulkActionClick('approve')}>Approve Selected</Button>
                                <Button variant="contained" color="error" size="small" onClick={() => handleBulkActionClick('reject')}>Reject Selected</Button>
                            </Box>
                        )}

                        <Paper sx={{ p: 3, borderRadius: 2, borderLeft: `6px solid ${approvalSubTab === 0 ? '#1976d2' : '#9c27b0'}` }} elevation={3}>
                            <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {approvalSubTab === 0 ? "My Course Approvals" : "Student Approvals"}
                                <Chip label={`${filteredRequests.length} Pending`} size="small" color={filteredRequests.length > 0 ? "warning" : "default"} />
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length} indeterminate={selectedIds.length > 0 && selectedIds.length < filteredRequests.length} onChange={handleSelectAll} />
                                            </TableCell>
                                            <TableCell><strong>Student</strong></TableCell>
                                            <TableCell><strong>Course</strong></TableCell>
                                            <TableCell><strong>Entry No.</strong></TableCell>
                                            <TableCell><strong>Type</strong></TableCell>
                                            <TableCell align="center"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRequests.map((req) => (
                                            <TableRow key={req._id} hover selected={selectedIds.includes(req._id)}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={selectedIds.includes(req._id)} onChange={() => handleSelectOne(req._id)} />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {req.student?.name}
                                                        <IconButton size="small" color="info" onClick={() => { setSelectedStudent(req.student); setViewProfileOpen(true); }} sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{req.course?.code}: {req.course?.title}</TableCell>
                                                <TableCell>{req.student?.rollNumber}</TableCell>
                                                <TableCell>{req.type}</TableCell>
                                                <TableCell align="center">
                                                    <Button variant="contained" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleAction(req._id, 'approve', currentContext)}>Approve</Button>
                                                    <Button variant="contained" color="error" size="small" onClick={() => handleAction(req._id, 'reject', currentContext)}>Reject</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredRequests.length === 0 && (
                                            <TableRow><TableCell colSpan={6} align="center"><Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>No pending approvals.</Typography></TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Tab 1: My Courses */}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>My Floated Courses</Typography>

                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Filter Courses</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2.4}><TextField fullWidth size="small" label="Course Code" value={courseFilters.code} onChange={(e) => handleCourseFilterChange('code', e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6} md={2.4}><TextField fullWidth size="small" label="Course Title" value={courseFilters.title} onChange={(e) => handleCourseFilterChange('title', e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6} md={1}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Dept</InputLabel>
                                    <Select value={courseFilters.department} label="Dept" onChange={(e) => handleCourseFilterChange('department', e.target.value)}>
                                        <MenuItem value="">All</MenuItem>
                                        {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}><TextField fullWidth size="small" label="Semester" value={courseFilters.semester} onChange={(e) => handleCourseFilterChange('semester', e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6} md={2.4}><TextField fullWidth size="small" label="Section" value={courseFilters.section} onChange={(e) => handleCourseFilterChange('section', e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6} md={1.4}><Button fullWidth variant="outlined" onClick={handleClearCourseFilters}>Clear</Button></Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(99, 102, 241, 0.1)', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Course Code</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCourses.map(course => (
                                        <TableRow key={course._id} hover>
                                            <TableCell><Chip label={course.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(99, 102, 241, 0.12)', color: 'primary.dark' }} /></TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{course.title}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{course.department}</TableCell>
                                            <TableCell><Chip label={course.credits?.total || 4} size="small" color="secondary" /></TableCell>
                                            <TableCell>{course.semester}</TableCell>
                                            <TableCell><Chip label={course.status} size="small" color={course.status === 'Approved' ? 'success' : 'primary'} variant="outlined" /></TableCell>
                                            <TableCell align="right">
                                                {course.status === 'Approved' ? (
                                                    <Button variant="contained" size="small" endIcon={<VisibilityIcon />} onClick={() => handleViewCourse(course._id)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                                        View Details
                                                    </Button>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        Pending Admin Approval
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredCourses.length === 0 && (
                                        <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No courses match criteria.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* Tab 2: Float New Course */}
            {activeTab === 2 && (
                <Container maxWidth="lg">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">Course Offering Details</Typography>
                    </Box>

                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #ddd' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ borderBottom: '2px solid #eee', pb: 1, mb: 3 }}>
                            Main
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Box display="flex" gap={1} mb={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Course Code & Title"
                                        name="code"
                                        value={floatData.code}
                                        onChange={handleFloatChange}
                                        placeholder="e.g. CS201 :: Data Structures"
                                        required
                                    />
                                    <Button variant="outlined" onClick={handleLookup}>Lookup</Button>
                                </Box>

                                <Box mb={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Course Title"
                                        name="title"
                                        value={floatData.title}
                                        onChange={handleFloatChange}
                                        required
                                    />
                                </Box>

                                {/* Credits */}
                                <Box mb={3}>
                                    <Typography variant="caption">Credits (L-T-P-C)</Typography>
                                    <Box display="flex" gap={2}>
                                        <TextField size="small" label="L" name="lecture" type="number" value={floatData.lecture} onChange={handleFloatChange} />
                                        <TextField size="small" label="T" name="tutorial" type="number" value={floatData.tutorial} onChange={handleFloatChange} />
                                        <TextField size="small" label="P" name="practical" type="number" value={floatData.practical} onChange={handleFloatChange} />
                                        <TextField size="small" label="Total" name="credits" type="number" value={floatData.credits} onChange={handleFloatChange} required />
                                    </Box>
                                </Box>

                                <Box display="flex" gap={2} mb={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Session</InputLabel>
                                        <Select name="semester" value={floatData.semester} label="Session" onChange={handleFloatChange}>
                                            <MenuItem value="I">Semester I</MenuItem>
                                            <MenuItem value="II">Semester II</MenuItem>
                                            <MenuItem value="Summer">Summer</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField size="small" label="Year" name="year" value={floatData.year} onChange={handleFloatChange} />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                                    <InputLabel>Department</InputLabel>
                                    <Select name="department" value={floatData.department} label="Department" onChange={handleFloatChange}>
                                        {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <TextField fullWidth size="small" label="Section" name="section" value={floatData.section || ''} onChange={handleFloatChange} sx={{ mb: 3 }} />
                                <TextField fullWidth size="small" label="Slot" name="slot" value={floatData.slot || ''} onChange={handleFloatChange} sx={{ mb: 3 }} />

                                {/* Coord Table */}
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Instructor</TableCell><TableCell>Is Coord</TableCell></TableRow></TableHead>
                                        <TableBody><TableRow><TableCell>{user.name}</TableCell><TableCell><input type="checkbox" checked disabled /></TableCell></TableRow></TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        {/* Eligibility Section */}
                        <Box mt={4} bgcolor="#f5f5f5" p={2} borderRadius={2}>
                            <Typography variant="subtitle2" gutterBottom>Crediting Categorization (Eligibility)</Typography>
                            <Grid container spacing={2} alignItems="center" mb={2}>
                                <Grid item xs={3}>
                                    <Select fullWidth size="small" displayEmpty value={newEligibility.degree} onChange={e => setNewEligibility({ ...newEligibility, degree: e.target.value })}>
                                        <MenuItem value="" disabled>Degree</MenuItem>
                                        {DEGREES.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </Grid>
                                <Grid item xs={3}>
                                    <Select fullWidth size="small" displayEmpty value={newEligibility.department} onChange={e => setNewEligibility({ ...newEligibility, department: e.target.value })}>
                                        <MenuItem value="" disabled>Dept</MenuItem>
                                        {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField fullWidth size="small" placeholder="Years (e.g. 2023)" value={newEligibility.entryYears} onChange={e => setNewEligibility({ ...newEligibility, entryYears: e.target.value })} />
                                </Grid>
                                <Grid item xs={3}>
                                    <Button variant="contained" size="small" onClick={handleAddEligibility}>Add</Button>
                                </Grid>
                            </Grid>

                            {eligibilityList.length > 0 && (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Degree</TableCell><TableCell>Dept</TableCell><TableCell>Years</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {eligibilityList.map((elig, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{elig.degree}</TableCell>
                                                    <TableCell>{elig.department}</TableCell>
                                                    <TableCell>{elig.entryYears.join(', ')}</TableCell>
                                                    <TableCell>
                                                        <Button size="small" color="error" onClick={() => handleDeleteEligibility(idx)}>Remove</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>

                        <Box mt={3} display="flex" justifyContent="flex-end">
                            <Button variant="contained" size="large" onClick={handleFloatSubmit}>Float Course</Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Tab 3: Help */}
            {activeTab === 3 && <HelpTab />}

            {/* Dialogs */}
            <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)}>
                <DialogTitle>Confirm {bulkAction}</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkActionConfirm} variant="contained" color={bulkAction === 'approve' ? 'success' : 'error'}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewProfileOpen} onClose={() => setViewProfileOpen(false)}>
                <DialogTitle>Student Profile</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box p={2}>
                            <Typography variant="h6">{selectedStudent.name}</Typography>
                            <Typography variant="body2">{selectedStudent.email}</Typography>
                            <Typography variant="body2">{selectedStudent.department}</Typography>
                            <Typography variant="body2">Entry: {selectedStudent.rollNumber}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setViewProfileOpen(false)}>Close</Button></DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdvisorDashboard;
