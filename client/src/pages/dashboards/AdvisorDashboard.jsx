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
    Alert,
    CircularProgress
} from '@mui/material';
import api from '../../utils/api';

const AdvisorDashboard = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/courses/fa/pending');
            setPendingRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/courses/fa/approve/${id}`, { action });
            setMessage({ type: 'success', text: `Request ${action}ed successfully` });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Faculty Advisor Dashboard
            </Typography>

            {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Grid container spacing={3}>
                {/* Pending Approvals */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Enrollments Pending Final Approval
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Course</strong></TableCell>
                                        <TableCell><strong>Entry No.</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingRequests.map((req) => (
                                        <TableRow key={req._id} hover>
                                            <TableCell>{req.student?.name}</TableCell>
                                            <TableCell>{req.course?.code}: {req.course?.title}</TableCell>
                                            <TableCell>{req.student?.rollNumber}</TableCell>
                                            <TableCell>{req.type}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 2 }}
                                                    onClick={() => handleAction(req._id, 'approve')}
                                                >
                                                    Final Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleAction(req._id, 'reject')}
                                                >
                                                    Reject
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography variant="body1" sx={{ py: 2 }}>
                                                    No pending approvals requiring your attention.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdvisorDashboard;
