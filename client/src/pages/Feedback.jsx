import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Container,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Box,
    Rating,
    Slider,
    Grid,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Feedback = (props) => {
    const registrations = props.registrations;
    const [active, setActive] = useState(false);
    const [feedbackInfo, setFeedbackInfo] = useState({});
    const [selectedCourseInstructorKey, setSelectedCourseInstructorKey] = useState('');
    const [selectedFeedbackType, setSelectedFeedbackType] = useState('Mid-sem');
    const [registrationsData, setRegistrationsData] = useState(Array.isArray(registrations) ? registrations : []);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    // Questions State with full question text
    // Questions State with full question text
    const [responses, setResponses] = useState({
        'Instructor informed the evaluation criteria at the beginning of the course': '',
        'Number of Lectures taken by course instructor were adequate': '',
        'The instructor adapted professional ethics': '', // Note: User might want 'upheld' instead of 'adapted'
        'The instructor was sincere (timely release of grades, etc)': '',
        'The instructor had command over the subject': '',
    });

    const [additionalComments, setAdditionalComments] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkActive = async () => {
            try {
                // api instance attaches token and uses base URL
                const res = await api.get('/feedback/active');
                setActive(true);
                setFeedbackInfo(res.data || {});
                if (res.data?.type === 'Mid-sem' || res.data?.type === 'End-sem') {
                    setSelectedFeedbackType(res.data.type);
                }
            } catch (err) {
                console.error(err);
                 setFeedbackInfo({ type: 'Mid-sem', semester: 'Sem-I, 2026-27' });
                 setActive(true);
            }
        };
        checkActive();
    }, []);

    useEffect(() => {
        if (Array.isArray(registrations)) {
            setRegistrationsData(registrations);
        }
    }, [registrations]);

    useEffect(() => {
        const fetchRegistrationsIfNeeded = async () => {
            // Only auto-fetch when this component is used standalone (e.g. routed page)
            // If parent provides registrations (even empty during loading), rely on parent data.
            if (typeof registrations !== 'undefined') return;
            if (registrationsData && registrationsData.length > 0) return;

            setLoadingRegistrations(true);
            try {
                const res = await api.get('/courses/my-registrations');
                setRegistrationsData(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
                setRegistrationsData([]);
            } finally {
                setLoadingRegistrations(false);
            }
        };

        fetchRegistrationsIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (question, value) => {
        setResponses(prev => ({ ...prev, [question]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitError('');

            const [courseId, instructorId] = String(selectedCourseInstructorKey).split('|');
            if (!courseId || !instructorId) {
                setSubmitError('Please select a course instructor.');
                return;
            }

            await api.post('/feedback', {
                courseId,
                instructorId,
                ratings: responses,
                content: additionalComments,
                feedbackType: selectedFeedbackType
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.msg || err?.response?.data?.message || (typeof err?.response?.data === 'string' ? err.response.data : '');
            setSubmitError(serverMsg || 'Failed to submit feedback. Please try again.');
        }
    };

    // Filter eligible courses
    const registrationsToUse = Array.isArray(registrations) ? registrations : registrationsData;
    const eligibleCourses = (registrationsToUse || []).filter(r => {
        const status = String(r?.status || '');
        const normalizedStatus = status.toLowerCase();
        return normalizedStatus === 'approved' && Boolean(r?.course?._id);
    });

    const eligibleCourseInstructorOptions = eligibleCourses.flatMap(reg => {
        const course = reg?.course;
        if (!course?._id) return [];

        const instructors = [];
        if (course.instructor?._id) instructors.push(course.instructor);
        if (Array.isArray(course.coordinators)) {
            course.coordinators.forEach(c => {
                if (c?._id) instructors.push(c);
            });
        }

        const seen = new Set();
        return instructors
            .filter(i => {
                const id = String(i?._id || '');
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .map(i => {
                const key = `${course._id}|${i._id}`;
                const label = `${course.title} (${course.code}) -- ${i?.name || 'TBA'}`;
                return { key, label };
            });
    });

    if (!active) {
        return (
             <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                <Typography color="textSecondary">No active feedback session.</Typography>
            </Paper>
        );
    }

    if (submitted) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" color="success.main" gutterBottom>Feedback Submitted Successfully</Typography>
                <Button sx={{ mt: 2 }} onClick={() => {
                    setSubmitted(false); 
                    setResponses({
                        'Instructor informed the evaluation criteria at the beginning of the course': '',
                        'Number of Lectures taken by course instructor were adequate': '',
                        'The instructor adapted professional ethics': '',
                        'The instructor was sincere (timely release of grades, etc)': '',
                        'The instructor had command over the subject': '',
                    });
                    setAdditionalComments('');
                    setSelectedCourseInstructorKey('');
                }}>Submit Another</Button>
            </Paper>
        );
    }

    const yesNoQuestions = [
        'Instructor informed the evaluation criteria at the beginning of the course',
        'Number of Lectures taken by course instructor were adequate'
    ];

    const agreementQuestions = [
        'The instructor adapted professional ethics',
        'The instructor was sincere (timely release of grades, etc)',
        'The instructor had command over the subject'
    ];

    return (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            {/* Header / Instructions */}
            <Box mb={3} borderBottom="1px solid #eee" pb={2}>
                 <Typography variant="h6" gutterBottom fontWeight="bold">Course Feedback Form</Typography>
                 <Box bgcolor="#fff3e0" p={2} borderRadius={1} fontSize="0.9rem">
                    <strong>Please note the following before submitting:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                        <li>All fields marked with a '*' are mandatory.</li>
                        <li>Feedback for one course instructor can be submitted only once.</li>
                        <li>Feedback is anonymous.</li>
                    </ul>
                 </Box>
            </Box>

            {submitError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                </Alert>
            ) : null}

            {loadingRegistrations ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Loading your registered courses...
                </Alert>
            ) : null}

            {!loadingRegistrations && eligibleCourses.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    No approved course registrations found for feedback.
                </Alert>
            ) : null}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Top Row: Type & Course Selector */}
                    <Grid item xs={12} md={4}>
                         <FormControl fullWidth size="small">
                            <Typography variant="caption" fontWeight="bold" gutterBottom>* Feedback type</Typography>
                            <Select
                                value={selectedFeedbackType}
                                onChange={(e) => setSelectedFeedbackType(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="Mid-sem">Mid-sem</MenuItem>
                                <MenuItem value="End-sem">End-sem</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl fullWidth size="small" required>
                            <Typography variant="caption" fontWeight="bold" gutterBottom>* Select the course instructor</Typography>
                            <Select
                                value={selectedCourseInstructorKey}
                                onChange={e => setSelectedCourseInstructorKey(e.target.value)}
                                displayEmpty
                                variant="outlined"
                            >
                                <MenuItem value="" disabled>-- Select Course --</MenuItem>
                                {eligibleCourseInstructorOptions.map(opt => (
                                    <MenuItem key={opt.key} value={opt.key}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Yes/No Questions */}
                    {yesNoQuestions.map((question, idx) => (
                        <Grid item xs={12} key={idx}>
                            <FormControl fullWidth required>
                                <Typography variant="body2" gutterBottom fontWeight="medium">
                                    *{idx + 1}: {question}
                                </Typography>
                                <Select
                                    value={responses[question]}
                                    onChange={(e) => handleChange(question, e.target.value)}
                                    displayEmpty
                                    size="small"
                                >
                                    <MenuItem value="" disabled>-- Select Response --</MenuItem>
                                    <MenuItem value="Yes">Yes</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}

                    {/* Agreement Scale Questions */}
                    {agreementQuestions.map((question, idx) => (
                        <Grid item xs={12} key={idx}>
                            <FormControl fullWidth required>
                                <Typography variant="body2" gutterBottom fontWeight="medium">
                                    *{idx + 3}: {question}
                                </Typography>
                                <Select
                                    value={responses[question]}
                                    onChange={(e) => handleChange(question, e.target.value)}
                                    displayEmpty
                                    size="small"
                                >
                                    <MenuItem value="" disabled>-- Select Response --</MenuItem>
                                    <MenuItem value="Strongly agree">Strongly agree</MenuItem>
                                    <MenuItem value="Agree">Agree</MenuItem>
                                    <MenuItem value="Neither agree nor disagree">Neither agree nor disagree</MenuItem>
                                    <MenuItem value="Disagree">Disagree</MenuItem>
                                    <MenuItem value="Strongly disagree">Strongly disagree</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}

                    {/* Optional Additional Comments */}
                    <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom fontWeight="medium">
                            Additional Comments (Optional)
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={additionalComments}
                            onChange={(e) => setAdditionalComments(e.target.value)}
                            placeholder="Share any additional feedback, suggestions, or comments..."
                            helperText="This field is optional but your input is valuable"
                        />
                    </Grid>

                    <Grid item xs={12}>
                         <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={!selectedCourseInstructorKey || !selectedFeedbackType || Object.values(responses).some(v => !v)}
                            sx={{ mt: 2 }}
                         >
                            Submit Feedback
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default Feedback;
