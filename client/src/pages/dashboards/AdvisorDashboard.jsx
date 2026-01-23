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
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Divider,
    IconButton,
    Checkbox,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import HelpTab from '../../components/HelpTab';
import api from '../../utils/api';

const AdvisorDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile View State
    const [viewProfileOpen, setViewProfileOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Student Filter State
    const [studentFilters, setStudentFilters] = useState({
        department: '',
        year: '',
        type: ''
    });

    // Selection State for Bulk Actions
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

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

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleViewProfile = (student) => {
        setSelectedStudent(student);
        setViewProfileOpen(true);
    };

    // Extract year from roll number
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
            const response = await api.put('/courses/fa/bulk-approve', {
                ids: selectedIds,
                action: bulkAction
            });

            setMessage({
                type: 'success',
                text: `Successfully ${bulkAction}d ${response.data.successCount} requests`
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

    // Helper to parse Entry No
    const parseEntryNumber = (entryNo) => {
        if (!entryNo || entryNo.length < 7) return { year: 'N/A', branch: 'N/A' };
        // Example: 2023CSB1143
        const year = entryNo.substring(0, 4);
        const branch = entryNo.substring(4, 7);
        return { year, branch };
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Faculty Advisor Dashboard
            </Typography>

            {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Paper square sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                    <Tab icon={<AssignmentIcon />} label="Pending Requests" />
                    <Tab icon={<HelpIcon />} label="Help & Support" />
                </Tabs>
            </Paper>

            {/* Tab 0: Pending Requests */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
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
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Department</InputLabel>
                                        <Select
                                            value={studentFilters.department}
                                            label="Department"
                                            onChange={(e) => handleStudentFilterChange('department', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {DEPARTMENTS.map(dept => (
                                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Year of Entry"
                                        placeholder="e.g. 2023"
                                        value={studentFilters.year}
                                        onChange={(e) => handleStudentFilterChange('year', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Registration Type</InputLabel>
                                        <Select
                                            value={studentFilters.type}
                                            label="Registration Type"
                                            onChange={(e) => handleStudentFilterChange('type', e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Credit">Credit</MenuItem>
                                            <MenuItem value="Audit">Audit</MenuItem>
                                            <MenuItem value="Minor">Minor</MenuItem>
                                            <MenuItem value="Concentration">Concentration</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="medium"
                                        onClick={handleClearStudentFilters}
                                        sx={{ height: '40px' }}
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

                        <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Enrollments Pending Final Approval
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={filteredPendingRequests.length > 0 && selectedIds.length === filteredPendingRequests.length}
                                                    indeterminate={selectedIds.length > 0 && selectedIds.length < filteredPendingRequests.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell><strong>Student</strong></TableCell>
                                            <TableCell><strong>Course</strong></TableCell>
                                            <TableCell><strong>Entry No.</strong></TableCell>
                                            <TableCell><strong>Type</strong></TableCell>
                                            <TableCell align="center"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredPendingRequests.map((req) => (
                                            <TableRow key={req._id} hover>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedIds.includes(req._id)}
                                                        onChange={() => handleSelectOne(req._id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {req.student?.name}
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => handleViewProfile(req.student)}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <InfoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{req.course?.code}: {req.course?.title}</TableCell>
                                                <TableCell>{req.student?.rollNumber}</TableCell>
                                                <TableCell>{req.type}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                        onClick={() => handleAction(req._id, 'approve')}
                                                    >
                                                        Approve
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
                                        {filteredPendingRequests.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography variant="body1" sx={{ py: 2 }}>
                                                        {pendingRequests.length === 0
                                                            ? 'No pending approvals requiring your attention.'
                                                            : 'No requests match your filters.'}
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
            )}

            {/* Tab 1: Help */}
            {activeTab === 1 && (
                <HelpTab />
            )}

            {/* Bulk Action Confirmation Dialog */}
            <Dialog open={bulkDialogOpen} onClose={handleBulkActionCancel}>
                <DialogTitle>
                    Confirm Bulk {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {bulkAction} {selectedIds.length} registration{selectedIds.length > 1 ? 's' : ''}?
                        {bulkAction === 'approve' && ' This will give final approval to these enrollments.'}
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

            {/* Student Profile Dialog */}
            <Dialog open={viewProfileOpen} onClose={() => setViewProfileOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Student Profile</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box textAlign="center" py={2}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>{selectedStudent.name}</Typography>
                            <Typography color="textSecondary" gutterBottom>{selectedStudent.email}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2} textAlign="left">
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                                    <Typography variant="body1" fontWeight="medium">{selectedStudent.department || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Entry Number</Typography>
                                    <Typography variant="body1" fontWeight="medium">{selectedStudent.rollNumber || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Year of Entry</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {parseEntryNumber(selectedStudent.rollNumber).year}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Branch</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {parseEntryNumber(selectedStudent.rollNumber).branch}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewProfileOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdvisorDashboard;
