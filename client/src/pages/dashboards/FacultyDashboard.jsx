import React, { useState, useEffect, useContext } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Chip,
    Alert
} from '@mui/material';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFloatDialog, setOpenFloatDialog] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Float Form State
    const [floatData, setFloatData] = useState({
        code: '',
        title: '',
        department: '',
        credits: 3,
        semester: '',
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch pending requests for me
            const pendingRes = await api.get('/courses/instructor/pending');
            setPendingRequests(pendingRes.data);

            // Fetch all courses and filter for "my courses" (optimization: backend endpoint would be better)
            const coursesRes = await api.get('/courses');
            const mine = coursesRes.data.filter(c => 
                (c.instructor._id === user._id) || 
                (c.instructor === user._id)
            );
            setMyCourses(mine);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    const handleFloatSubmit = async () => {
        if (!floatData.code || !floatData.title || !floatData.department) {
            return setMessage({ type: 'error', text: 'Please fill required fields' });
        }
        try {
            await api.post('/courses/float', {
                ...floatData,
                credits: { total: floatData.credits } // Adjusting to schema structure
            });
            setMessage({ type: 'success', text: 'Course floated successfully!' });
            setOpenFloatDialog(false);
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to float course' });
        }
    };

    const handleFloatChange = (e) => setFloatData({ ...floatData, [e.target.name]: e.target.value });

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Faculty Dashboard
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => setOpenFloatDialog(true)}>
                    Float New Course
                </Button>
            </Box>

            {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Grid container spacing={4}>
                {/* Pending Requests */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Pending Enrollment Requests
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Course</strong></TableCell>
                                        <TableCell><strong>Entry No.</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingRequests.map((req) => (
                                        <TableRow key={req._id}>
                                            <TableCell>{req.student?.name}</TableCell>
                                            <TableCell>{req.course?.code}</TableCell>
                                            <TableCell>{req.student?.rollNumber}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleAction(req._id, 'approve')}
                                                >
                                                    Forward to FA
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    onClick={() => handleAction(req._id, 'reject')}
                                                >
                                                    Reject
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No pending requests.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* My Floated Courses */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fafafa' }} elevation={2}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            My Floated Courses
                        </Typography>
                        {myCourses.map(course => (
                            <Box key={course._id} mb={1} p={1} border={1} borderColor="#eee" borderRadius={1} bgcolor="white">
                                <Typography variant="subtitle2" fontWeight="bold">{course.code}: {course.title}</Typography>
                                <Typography variant="caption">{course.semester} {course.year}</Typography>
                            </Box>
                        ))}
                        {myCourses.length === 0 && <Typography variant="body2">No courses floated yet.</Typography>}
                    </Paper>
                </Grid>
            </Grid>

            {/* Float Course Dialog */}
            <Dialog open={openFloatDialog} onClose={() => setOpenFloatDialog(false)}>
                <DialogTitle>Float New Course</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField fullWidth margin="dense" label="Course Code" name="code" value={floatData.code} onChange={handleFloatChange} required />
                        <TextField fullWidth margin="dense" label="Course Title" name="title" value={floatData.title} onChange={handleFloatChange} required />
                        <TextField fullWidth margin="dense" label="Department" name="department" value={floatData.department} onChange={handleFloatChange} required />
                        <TextField fullWidth margin="dense" label="Credits" name="credits" type="number" value={floatData.credits} onChange={handleFloatChange} required />
                        <TextField fullWidth margin="dense" label="Semester" name="semester" value={floatData.semester} onChange={handleFloatChange} required />
                        <TextField fullWidth margin="dense" label="Year" name="year" value={floatData.year} onChange={handleFloatChange} required />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFloatDialog(false)}>Cancel</Button>
                    <Button onClick={handleFloatSubmit} variant="contained">Float</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default FacultyDashboard;
