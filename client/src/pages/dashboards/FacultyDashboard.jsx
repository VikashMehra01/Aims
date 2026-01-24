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
    TextField,
    CircularProgress,
    Chip,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    Fade,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpTab from '../../components/HelpTab';

import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Float Form State
    const [floatData, setFloatData] = useState({
        code: '',
        title: '',
        department: '',
        lecture: 3,
        tutorial: 0,
        practical: 0,
        credits: 4,
        semester: 'I',
        year: new Date().getFullYear().toString()
    });

    // Enhanced Float State
    const [lookupQuery, setLookupQuery] = useState('');
    const [eligibilityList, setEligibilityList] = useState([]);

    // Eligibility Row State
    const [newEligibility, setNewEligibility] = useState({
        degree: '',
        department: '',
        category: 'Programme Core',
        entryYears: ''
    });

    // Course Filter State
    const [courseFilters, setCourseFilters] = useState({
        code: '',
        title: '',
        department: '',
        semester: '',
        section: ''
    });

    // Student Filter State (for pending requests)
    const [studentFilters, setStudentFilters] = useState({
        department: '',
        year: '',
        type: ''
    });

    // Selection State for Bulk Actions
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState(''); // 'approve' or 'reject'

    const DEPARTMENTS = [
        "Computer Science and Engineering",
        "Electronics and Communication Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Biotechnology",
        "Mathematics",
        "Humanities and Social Sciences"
    ];

    const DEGREES = ["B.Tech", "M.Tech", "PhD", "M.Sc"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch pending requests for me
            const pendingRes = await api.get('/courses/instructor/pending');
            setPendingRequests(pendingRes.data);

            // Fetch my floated courses directly from backend
            const coursesRes = await api.get('/courses/instructor/my-courses');
            setMyCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/courses/instructor/approve/${id}`, { action });
            setMessage({ type: 'success', text: `Request ${action === 'approve' ? 'forwarded to FA' : 'rejected'} successfully` });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/course-details/${courseId}`);
    };



    const handleFloatChange = (e) => setFloatData({ ...floatData, [e.target.name]: e.target.value });

    // Lookup Function
    const handleLookup = async () => {
        try {
            // In a real app, this would open a dialog with results. 
            // For now, we will just auto-fill if we find an exact match or similar.
            const res = await api.get(`/courses/history/search?q=${floatData.code || floatData.title}`);
            if (res.data && res.data.length > 0) {
                const match = res.data[0];
                setFloatData({
                    ...floatData,
                    code: match.code,
                    title: match.title,
                    department: match.department,
                    credits: match.credits?.total || 4,
                    lecture: match.credits?.lecture || 3,
                    tutorial: match.credits?.tutorial || 0,
                    practical: match.credits?.practical || 0
                });
                setMessage({ type: 'success', text: 'Course details auto-filled from history' });
            } else {
                setMessage({ type: 'info', text: 'No course history found for this code.' });
            }
        } catch (err) {
            console.error(err);
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

    const handleFloatSubmit = async () => {
        if (!floatData.code || !floatData.title || !floatData.department) {
            return setMessage({ type: 'error', text: 'Please fill required fields' });
        }
        try {
            await api.post('/courses/float', {
                ...floatData,
                credits: {
                    lecture: Number(floatData.lecture),
                    tutorial: Number(floatData.tutorial),
                    practical: Number(floatData.practical),
                    total: Number(floatData.credits)
                },
                eligibility: eligibilityList
            });
            setMessage({ type: 'success', text: 'Course floated successfully!' });
            // Reset form
            setFloatData({
                code: '',
                title: '',
                department: '',
                lecture: 3,
                tutorial: 0,
                practical: 0,
                credits: 4,
                semester: 'I',
                year: new Date().getFullYear().toString()
            });
            setEligibilityList([]);
            fetchData();
            setActiveTab(1); // Switch to My Courses tab
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to float course' });
        }
    };

    // Filter courses based on courseFilters
    const filteredCourses = myCourses.filter(course => {
        const matchesCode = courseFilters.code === '' ||
            course.code.toLowerCase().includes(courseFilters.code.toLowerCase());
        const matchesTitle = courseFilters.title === '' ||
            course.title.toLowerCase().includes(courseFilters.title.toLowerCase());
        const matchesDepartment = courseFilters.department === '' ||
            course.department === courseFilters.department;
        const matchesSemester = courseFilters.semester === '' ||
            course.semester.toLowerCase().includes(courseFilters.semester.toLowerCase());
        const matchesSection = courseFilters.section === '' ||
            (course.section && course.section.toLowerCase() === courseFilters.section.toLowerCase());

        return matchesCode && matchesTitle && matchesDepartment && matchesSemester && matchesSection;
    });

    const handleCourseFilterChange = (field, value) => {
        setCourseFilters({ ...courseFilters, [field]: value });
    };

    const handleClearCourseFilters = () => {
        setCourseFilters({
            code: '',
            title: '',
            department: '',
            semester: '',
            section: ''
        });
    };

    // Extract year from roll number (assumes format like "2023CSB1143" or similar)
    const extractYearFromRollNumber = (rollNumber) => {
        if (!rollNumber || rollNumber.length < 4) return '';
        return rollNumber.substring(0, 4);
    };

    // Filter students based on studentFilters
    const filteredPendingRequests = pendingRequests.filter(req => {
        const matchesDepartment = studentFilters.department === '' ||
            req.student?.department === studentFilters.department;
        const studentYear = extractYearFromRollNumber(req.student?.rollNumber);
        const matchesYear = studentFilters.year === '' ||
            studentYear === studentFilters.year;
        const matchesType = studentFilters.type === '' ||
            req.type === studentFilters.type;

        return matchesDepartment && matchesYear && matchesType;
    });

    const handleStudentFilterChange = (field, value) => {
        setStudentFilters({ ...studentFilters, [field]: value });
    };

    const handleClearStudentFilters = () => {
        setStudentFilters({
            department: '',
            year: '',
            type: ''
        });
    };

    // Selection Handlers
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(filteredPendingRequests.map(req => req._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkActionClick = (action) => {
        setBulkAction(action);
        setBulkDialogOpen(true);
    };

    const handleBulkActionConfirm = async () => {
        try {
            const response = await api.put('/courses/instructor/bulk-approve', {
                ids: selectedIds,
                action: bulkAction
            });

            setMessage({
                type: 'success',
                text: `Successfully ${bulkAction === 'approve' ? 'forwarded' : 'rejected'} ${response.data.successCount} requests`
            });

            setSelectedIds([]);
            setBulkDialogOpen(false);
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Bulk action failed' });
        }
    };

    const handleBulkActionCancel = () => {
        setBulkDialogOpen(false);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={true} timeout={600}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Faculty Dashboard
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                },
                            }}
                        >
                            <Tab icon={<AssignmentIcon />} label="Pending Requests" sx={{ fontWeight: 600 }} />
                            <Tab icon={<ClassIcon />} label="My Floated Courses" sx={{ fontWeight: 600 }} />
                            <Tab icon={<AddCircleIcon />} label="Float New Course" sx={{ fontWeight: 600 }} />
                            <Tab icon={<HelpIcon />} label="Help" sx={{ fontWeight: 600 }} />
                            <Tab icon={<PersonIcon />} label="Profile" sx={{ fontWeight: 600 }} />
                        </Tabs>
                    </Paper>

                    {message.text && (
                        <Fade in={true}>
                            <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                                {message.text}
                            </Alert>
                        </Fade>
                    )}

                    {/* Tab 0: Pending Requests */}
                    {activeTab === 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Pending Student Requests</Typography>

                            {/* Student Filter UI */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 2,
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Filter Students
                                </Typography>
                                <Grid container spacing={3} alignItems="stretch">
                                    <Grid item xs={12} xl={3}>
                                        <FormControl fullWidth>
                                            <InputLabel shrink>Department</InputLabel>
                                            <Select
                                                value={studentFilters.department}
                                                label="Department"
                                                onChange={(e) => handleStudentFilterChange('department', e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value="">All Departments</MenuItem>
                                                {DEPARTMENTS.map(dept => (
                                                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} xl={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Year of Entry</InputLabel>
                                            <Select value={studentFilters.year} label="Year of Entry" onChange={(e) => handleStudentFilterChange('year', e.target.value)}>
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
                                            <InputLabel shrink>Registration Type</InputLabel>
                                            <Select
                                                value={studentFilters.type}
                                                label="Registration Type"
                                                onChange={(e) => handleStudentFilterChange('type', e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value="">All Types</MenuItem>
                                                <MenuItem value="Credit">Credit</MenuItem>
                                                <MenuItem value="Audit">Audit</MenuItem>
                                                <MenuItem value="Minor">Minor</MenuItem>
                                                <MenuItem value="Concentration">Concentration</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} xl={3}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleClearStudentFilters}
                                            sx={{ height: '56px', fontSize: '0.95rem', fontWeight: 600 }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </Grid>
                                </Grid>
                                {(studentFilters.department || studentFilters.year || studentFilters.type) && (
                                    <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                                        Showing {filteredPendingRequests.length} of {pendingRequests.length} requests
                                    </Typography>
                                )}
                            </Paper>

                            {/* Bulk Action Buttons */}
                            {selectedIds.length > 0 && (
                                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {selectedIds.length} selected
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleBulkActionClick('approve')}
                                    >
                                        Approve Selected
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleBulkActionClick('reject')}
                                    >
                                        Reject Selected
                                    </Button>
                                </Box>
                            )}

                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                    overflow: 'hidden',
                                }}
                            >
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)' }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={filteredPendingRequests.length > 0 && selectedIds.length === filteredPendingRequests.length}
                                                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredPendingRequests.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Entry No.</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredPendingRequests.map((req) => (
                                                <TableRow
                                                    key={req._id}
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                        },
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedIds.includes(req._id)}
                                                            onChange={() => handleSelectOne(req._id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>{req.student?.name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={req.course?.code}
                                                            size="small"
                                                            sx={{ fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.12)' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{req.student?.rollNumber}</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => handleAction(req._id, 'approve')}
                                                                sx={{ minWidth: 90, fontWeight: 600 }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => handleAction(req._id, 'reject')}
                                                                sx={{ minWidth: 90, fontWeight: 600 }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredPendingRequests.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                        <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                                                            {pendingRequests.length === 0
                                                                ? 'No pending requests.'
                                                                : 'No requests match your filters.'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}

                    {/* Bulk Action Confirmation Dialog */}
                    <Dialog open={bulkDialogOpen} onClose={handleBulkActionCancel}>
                        <DialogTitle>
                            Confirm Bulk {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
                        </DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to {bulkAction} {selectedIds.length} registration{selectedIds.length > 1 ? 's' : ''}?
                                {bulkAction === 'approve' && ' They will be forwarded to Faculty Advisor for final approval.'}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleBulkActionCancel}>Cancel</Button>
                            <Button
                                onClick={handleBulkActionConfirm}
                                variant="contained"
                                color={bulkAction === 'approve' ? 'success' : 'error'}
                            >
                                Confirm {bulkAction === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                        </DialogActions>
                    </Dialog>


                    {/* Tab 1: My Courses */}
                    {activeTab === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                My Floated Courses
                            </Typography>

                            {/* Course Filter UI */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 2,
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Filter Courses
                                </Typography>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Course Code"
                                            placeholder="e.g. CS101"
                                            value={courseFilters.code}
                                            onChange={(e) => handleCourseFilterChange('code', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Course Title"
                                            placeholder="e.g. Data Structures"
                                            value={courseFilters.title}
                                            onChange={(e) => handleCourseFilterChange('title', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                value={courseFilters.department}
                                                label="Department"
                                                onChange={(e) => handleCourseFilterChange('department', e.target.value)}
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                {DEPARTMENTS.map(dept => (
                                                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Semester"
                                            placeholder="e.g. I, II"
                                            value={courseFilters.semester}
                                            onChange={(e) => handleCourseFilterChange('semester', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.2}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Section"
                                            placeholder="A, B"
                                            value={courseFilters.section}
                                            onChange={(e) => handleCourseFilterChange('section', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="medium"
                                            onClick={handleClearCourseFilters}
                                            sx={{ height: '40px' }}
                                        >
                                            Clear
                                        </Button>
                                    </Grid>
                                </Grid>
                                {(courseFilters.code || courseFilters.title || courseFilters.department || courseFilters.semester || courseFilters.section) && (
                                    <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                                        Showing {filteredCourses.length} of {myCourses.length} courses
                                    </Typography>
                                )}
                            </Paper>

                            {filteredCourses.length === 0 && myCourses.length > 0 ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.98)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                    }}
                                >
                                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                                        No courses match your filters. Try adjusting the search criteria.
                                    </Typography>
                                </Paper>
                            ) : myCourses.length === 0 ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.98)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                    }}
                                >
                                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                                        You haven't floated any courses yet.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.98)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)' }}>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course Code</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course Title</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Department</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Credits</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Semester</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredCourses.map((course, index) => (
                                                    <TableRow
                                                        key={course._id}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                                cursor: 'pointer',
                                                            },
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Chip
                                                                label={course.code}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                                                    color: 'primary.dark',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>{course.title}</TableCell>
                                                        <TableCell sx={{ color: 'text.secondary' }}>{course.department}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={`${course.credits?.total || 0}`}
                                                                size="small"
                                                                color="secondary"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'text.secondary' }}>{course.semester}</TableCell>
                                                        <TableCell align="right">
                                                            {course.status === 'Approved' ? (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    endIcon={<VisibilityIcon />}
                                                                    onClick={() => handleViewCourse(course._id)}
                                                                    sx={{
                                                                        transition: 'all 0.3s ease',
                                                                        textTransform: 'none',
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
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
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {/* Tab 2: Float Course Form */}
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

                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Degree</TableCell><TableCell>Dept</TableCell><TableCell>Years</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {eligibilityList.map((el, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{el.degree}</TableCell>
                                                    <TableCell>{el.department}</TableCell>
                                                    <TableCell>{el.entryYears.join(',')}</TableCell>
                                                    <TableCell><Button size="small" color="error" onClick={() => handleDeleteEligibility(i)}>Del</Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>

                                <Box mt={3}>
                                    <Button variant="contained" size="large" onClick={handleFloatSubmit}>Float Course</Button>
                                </Box>
                            </Paper>
                        </Container>
                    )}


                    {/* Tab 3: Help */}
                    {activeTab === 3 && (
                        <HelpTab />
                    )}

                    {/* Tab 4: Profile */}
                    {activeTab === 4 && (
                        <Container maxWidth="sm">
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                    <Avatar
                                        src={user.pfp}
                                        sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}
                                    />
                                    <Typography variant="h5" fontWeight="bold">{user.name.toUpperCase()}</Typography>
                                    <Typography color="textSecondary" gutterBottom>{user.role.toUpperCase()}</Typography>
                                    <Box mt={3} textAlign="left">
                                        <Typography><strong>EMAIL:</strong> {user.email}</Typography>
                                        <Typography sx={{ mt: 1 }}><strong>DEPARTMENT:</strong> {user.department || 'N/A'}</Typography>
                                        {user.rollNumber && <Typography sx={{ mt: 1 }}><strong>ENTRY NO:</strong> {user.rollNumber}</Typography>}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Container>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default FacultyDashboard;
