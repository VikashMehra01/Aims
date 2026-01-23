import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Grid,
    Chip
} from '@mui/material';
import api from '../utils/api';

const StudentRecord = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAcademicRecord();
    }, []);

    const fetchAcademicRecord = async () => {
        try {
            const res = await api.get('/courses/student/academic-record');
            setData(res.data);
        } catch (err) {
            setError('Failed to load academic record');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const { studentInfo, semesters, cgpa } = data || {};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Student Details Card */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                    Student Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">First Name</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.name?.split(' ')[0] || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Last Name</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.name?.split(' ').slice(1).join(' ') || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Roll No.</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.rollNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Email</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.email || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Department</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.department || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Year of entry</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.yearOfEntry || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Degree</Typography>
                        <Typography variant="body1" fontWeight={600}>{studentInfo?.degree || 'B.Tech'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Degree Type</Typography>
                        <Typography variant="body1" fontWeight={600}>B.Tech</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="textSecondary">Current Status</Typography>
                        <Chip label={studentInfo?.currentStatus || 'Registered'} color="success" size="small" />
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                    <Tab label="Academics" />
                    <Tab label="Documents" />
                </Tabs>
            </Paper>

            {/* Academics Tab */}
            {activeTab === 0 && (
                <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <strong>NOTE:</strong> Some of the grades shown here may be pending approval by the senate.
                        The records confirmed by the academic section will take precedence over anything shown here.
                    </Alert>

                    {semesters && semesters.map((semester, semIndex) => (
                        <Paper key={semIndex} sx={{ mb: 3, p: 3, borderRadius: 2 }} elevation={2}>
                            <Box sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                p: 2,
                                mb: 2,
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Academic session: {semester.semesterName}
                                </Typography>
                                <Typography variant="body1">
                                    SGPA: {semester.sgpa} | Credits registered: {semester.creditsRegistered} |
                                    Earned Credits: {semester.creditsEarned} | CGPA: {semester.cgpa}
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Academics for Credit Courses
                            </Typography>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><strong>S#</strong></TableCell>
                                            <TableCell><strong>Course</strong></TableCell>
                                            <TableCell><strong>Enrol.</strong></TableCell>
                                            <TableCell><strong>Enrol. status</strong></TableCell>
                                            <TableCell><strong>Course cat.</strong></TableCell>
                                            <TableCell><strong>Grade</strong></TableCell>
                                            <TableCell><strong>Attd.</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {semester.courses.map((course) => (
                                            <TableRow key={course.sno} hover>
                                                <TableCell>{course.sno}</TableCell>
                                                <TableCell>
                                                    {course.code} - {course.title}
                                                    {course.credits && ` (${course.credits}-0-0-${course.credits})`}
                                                </TableCell>
                                                <TableCell>{course.enrollmentType}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={course.enrollmentStatus}
                                                        size="small"
                                                        color={course.enrollmentStatus === 'Approved' ? 'success' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell>{course.courseCategory}</TableCell>
                                                <TableCell><strong>{course.grade}</strong></TableCell>
                                                <TableCell>{course.attendance}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ))}

                    <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            Cumulative GPA (CGPA): {cgpa}
                        </Typography>
                    </Paper>
                </Box>
            )}

            {/* Documents Tab */}
            {activeTab === 1 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        Documents section - Coming soon
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default StudentRecord;
