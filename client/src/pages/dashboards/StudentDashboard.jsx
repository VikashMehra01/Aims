import React, { useState, useEffect } from 'react';
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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import api from '../../utils/api';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollType, setEnrollType] = useState('Credit');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, myRes] = await Promise.all([
                api.get('/courses'),
                api.get('/courses/my-registrations')
            ]);
            setCourses(coursesRes.data);
            setMyRegistrations(myRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setOpenDialog(true);
        setMessage({ type: '', text: '' });
    };

    const handleEnrollSubmit = async () => {
        try {
            await api.post('/courses/register', {
                courseId: selectedCourse._id,
                type: enrollType
            });
            setMessage({ type: 'success', text: 'Enrollment request sent!' });
            fetchData(); // Refresh data
            setTimeout(() => setOpenDialog(false), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Enrollment failed' });
        }
    };

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'success';
        if (status === 'Rejected') color = 'error';
        if (status.includes('Pending')) color = 'warning';
        return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Student Dashboard
            </Typography>

            <Grid container spacing={4}>
                {/* Available Courses */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Available Courses
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Code</strong></TableCell>
                                        <TableCell><strong>Title</strong></TableCell>
                                        <TableCell><strong>Instructor</strong></TableCell>
                                        <TableCell align="right"><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {courses.map((course) => {
                                        const isEnrolled = myRegistrations.some(r => r.course._id === course._id);
                                        return (
                                            <TableRow key={course._id} hover>
                                                <TableCell>{course.code}</TableCell>
                                                <TableCell>{course.title}</TableCell>
                                                <TableCell>{course.instructor?.name || 'Unknown'}</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disabled={isEnrolled}
                                                        onClick={() => handleEnrollClick(course)}
                                                    >
                                                        {isEnrolled ? 'Applied' : 'Enroll'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {courses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No courses available.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* My Enrollments */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fdfdfd' }} elevation={3}>
                        <Typography variant="h6" color="secondary" gutterBottom>
                            My Enrollments
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Course</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell align="right"><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {myRegistrations.map((reg) => (
                                        <TableRow key={reg._id}>
                                            <TableCell>{reg.course?.code}</TableCell>
                                            <TableCell>{reg.type}</TableCell>
                                            <TableCell align="right">{getStatusChip(reg.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {myRegistrations.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No enrollments yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Enroll Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Enroll in {selectedCourse?.title}</DialogTitle>
                <DialogContent sx={{ minWidth: 300, mt: 1 }}>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Enrollment Type</InputLabel>
                        <Select
                            value={enrollType}
                            label="Enrollment Type"
                            onChange={(e) => setEnrollType(e.target.value)}
                        >
                            <MenuItem value="Credit">Credit</MenuItem>
                            <MenuItem value="Audit">Audit</MenuItem>
                            <MenuItem value="Minor">Minor</MenuItem>
                            <MenuItem value="Concentration">Concentration</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleEnrollSubmit} variant="contained" disabled={!!message.text && message.type === 'success'}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentDashboard;
