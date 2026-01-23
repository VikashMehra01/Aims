import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    Container,
    Typography,
    Paper,
    Box,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Stack
} from '@mui/material';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });
    
    const [courseData, setCourseData] = useState({});
    const [users, setUsers] = useState([]);
    const [newEligibility, setNewEligibility] = useState({
        degree: '',
        department: '',
        category: 'Programme Core',
        entryYears: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, usersRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get('/admin/users')
                ]);

                const course = courseRes.data;
                setCourseData({
                    code: course.code,
                    title: course.title,
                    department: course.department,
                    semester: course.semester,
                    year: course.year,
                    instructor: course.instructor?._id || course.instructor,
                    credits: course.credits || { lecture: 0, tutorial: 0, practical: 0, total: 0 },
                    status: course.status,
                    enrollmentDeadline: course.enrollmentDeadline,
                    isEnrollmentOpen: course.isEnrollmentOpen,
                    section: course.section || '',
                    slot: course.slot || '',
                    coordinators: course.coordinators ? course.coordinators.map(c => c._id || c) : [],
                    eligibility: course.eligibility || []
                });
                setUsers(usersRes.data);
            } catch (err) {
                console.error(err);
                setMsg({ type: 'error', text: 'Failed to fetch data' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async () => {
        try {
            await api.put(`/courses/${id}`, courseData);
            setMsg({ type: 'success', text: 'Course updated successfully' });
            setTimeout(() => navigate('/admin-dashboard'), 1500);
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to update course' });
        }
    };

    const handleAddEligibility = () => {
        if (!newEligibility.degree || !newEligibility.department) return;
        setCourseData({
            ...courseData,
            eligibility: [
                ...(courseData.eligibility || []),
                { ...newEligibility, entryYears: newEligibility.entryYears.split(',').map(y => y.trim()) }
            ]
        });
        setNewEligibility({ degree: '', department: '', category: 'Programme Core', entryYears: '' });
    };

    const handleDeleteEligibility = (index) => {
        const list = [...(courseData.eligibility || [])];
        list.splice(index, 1);
        setCourseData({ ...courseData, eligibility: list });
    };

    const handleRemoveCoordinator = (idToRemove) => {
        setCourseData({
            ...courseData,
            coordinators: (courseData.coordinators || []).filter(cId => cId !== idToRemove)
        });
    };

    if (loading) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                 <Typography variant="h4" fontWeight="bold">Edit Course</Typography>
                 <Button variant="outlined" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
            </Box>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 3 }}>{msg.text}</Alert>}

            <Stack spacing={3}>
                {/* BASIC INFORMATION */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                        Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth label="Course Code" value={courseData.code || ''} onChange={e => setCourseData({...courseData, code: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Course Title" value={courseData.title || ''} onChange={e => setCourseData({...courseData, title: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Department" value={courseData.department || ''} onChange={e => setCourseData({...courseData, department: e.target.value})} />
                        </Grid>
                        
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth label="Session" value={courseData.semester || ''} onChange={e => setCourseData({...courseData, semester: e.target.value})} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth label="Year" value={courseData.year || ''} onChange={e => setCourseData({...courseData, year: e.target.value})} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth label="Section" value={courseData.section || ''} onChange={e => setCourseData({...courseData, section: e.target.value})} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth label="Slot" value={courseData.slot || ''} onChange={e => setCourseData({...courseData, slot: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Status" value={courseData.status || 'Proposed'} disabled />
                        </Grid>
                    </Grid>
                </Paper>

                {/* CREDITS DISTRIBUTION */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                        Credits Distribution
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2.5}>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="Lecture (L)" type="number" value={courseData.credits?.lecture || 0} onChange={e => setCourseData({...courseData, credits: {...courseData.credits, lecture: Number(e.target.value)}})} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="Tutorial (T)" type="number" value={courseData.credits?.tutorial || 0} onChange={e => setCourseData({...courseData, credits: {...courseData.credits, tutorial: Number(e.target.value)}})} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="Practical (P)" type="number" value={courseData.credits?.practical || 0} onChange={e => setCourseData({...courseData, credits: {...courseData.credits, practical: Number(e.target.value)}})} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="Total Credits" type="number" value={courseData.credits?.total || 0} onChange={e => setCourseData({...courseData, credits: {...courseData.credits, total: Number(e.target.value)}})} />
                        </Grid>
                    </Grid>
                </Paper>

                {/* ENROLLMENT SETTINGS */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                        Enrollment Settings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="Enrollment Deadline" 
                                type="date" 
                                InputLabelProps={{ shrink: true }}
                                value={courseData.enrollmentDeadline ? new Date(courseData.enrollmentDeadline).toISOString().split('T')[0] : ''} 
                                onChange={e => setCourseData({...courseData, enrollmentDeadline: new Date(e.target.value)})} 
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Enrollment Status</InputLabel>
                                <Select
                                    value={courseData.isEnrollmentOpen ? 'open' : 'closed'}
                                    label="Enrollment Status"
                                    onChange={e => setCourseData({...courseData, isEnrollmentOpen: e.target.value === 'open'})}
                                >
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* COURSE COORDINATORS */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                        Course Coordinators
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Add Coordinator</InputLabel>
                        <Select
                            value=""
                            label="Add Coordinator"
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId && !courseData.coordinators.includes(selectedId)) {
                                    setCourseData({
                                        ...courseData,
                                        coordinators: [...(courseData.coordinators || []), selectedId]
                                    });
                                }
                            }}
                        >
                            {users.filter(u => u.role === 'instructor' || u.role === 'faculty_advisor').map((u) => (
                                <MenuItem key={u._id} value={u._id} disabled={courseData.coordinators?.includes(u._id)}>
                                    {u.name} ({u.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Current Coordinators:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {(courseData.coordinators || []).length > 0 ? (
                                (courseData.coordinators || []).map((cId) => {
                                    const u = users.find(user => user._id === cId);
                                    return (
                                        <Chip 
                                            key={cId} 
                                            label={u ? u.name : cId} 
                                            onDelete={() => handleRemoveCoordinator(cId)}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary">No coordinators added yet.</Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* ELIGIBILITY CRITERIA */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                        Eligibility Criteria
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f9f9f9', mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            Add New Rule:
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={{ minWidth: 150 }}>
                                    <InputLabel shrink>Degree</InputLabel>
                                    <Select 
                                        value={newEligibility.degree} 
                                        label="Degree" 
                                        onChange={e => setNewEligibility({...newEligibility, degree: e.target.value})}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Degree</MenuItem>
                                        {["B.Tech", "M.Tech", "PhD", "M.Sc"].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={{ minWidth: 200 }}>
                                    <InputLabel shrink>Department</InputLabel>
                                    <Select 
                                        value={newEligibility.department} 
                                        label="Department" 
                                        onChange={e => setNewEligibility({...newEligibility, department: e.target.value})}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Department</MenuItem>
                                        {["Computer Science and Engineering", "Electronics and Communication Engineering", "Mechanical Engineering", "Civil Engineering", "Biotechnology", "Mathematics"].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={9}>
                                <TextField fullWidth label="Entry Years (e.g. 2023, 2024)" value={newEligibility.entryYears} onChange={e => setNewEligibility({...newEligibility, entryYears: e.target.value})} />
                            </Grid>
                            <Grid item xs={12} md={3} display="flex" alignItems="center">
                                <Button fullWidth variant="contained" onClick={handleAddEligibility} size="large" sx={{ height: '56px' }}>Add Rule</Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Current Eligibility Rules:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {courseData.eligibility && courseData.eligibility.length > 0 ? (
                                courseData.eligibility.map((el, i) => (
                                    <Chip 
                                        key={i} 
                                        label={`${el.degree} - ${el.department} (${el.entryYears.join(', ')})`} 
                                        onDelete={() => handleDeleteEligibility(i)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">No eligibility rules added yet.</Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* ACTION BUTTONS */}
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button size="large" variant="outlined" onClick={() => navigate('/admin-dashboard')}>Cancel</Button>
                    <Button size="large" variant="contained" onClick={handleSave}>Save Changes</Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default EditCourse;
