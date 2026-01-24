const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const User = require('../models/User');

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('AUTH MIDDLEWARE - Decoded JWT:', JSON.stringify(decoded));
        req.user = decoded.user;
        console.log('AUTH MIDDLEWARE - req.user set to:', JSON.stringify(req.user));
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check role
const checkRole = (roles) => async (req, res, next) => {
    try {
        // Use role from JWT token to avoid ObjectId issues with admin-id
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'Access denied - no role found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/courses
// @desc    Get all available courses
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Students only see approved courses
        // Faculty and admin see all courses
        // Use role from JWT token to avoid ObjectId issues with admin-id
        console.log('GET /courses - User role:', req.user.role);
        const filter = req.user.role === 'student' ? { status: 'Approved' } : {};
        console.log('GET /courses - Filter:', JSON.stringify(filter));

        const courses = await Course.find(filter).populate('instructor', 'name');
        console.log(`GET /courses - Returning ${courses.length} courses for role: ${req.user.role}`);
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/my-registrations
// @desc    Get student's registrations
// @access  Student
router.get('/my-registrations', auth, async (req, res) => {
    try {
        const registrations = await CourseRegistration.find({ student: req.user.id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .populate('student', 'name rollNumber');
        res.json(registrations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/student/academic-record
// @desc    Get student's complete academic record with grades
// @access  Student
router.get('/student/academic-record', auth, async (req, res) => {
    try {
        // Get student info
        const student = await User.findById(req.user.id).select('-password');

        // Get all registrations for student
        const registrations = await CourseRegistration.find({ student: req.user.id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ createdAt: 1 });

        // Group by semester
        const semesterMap = {};
        registrations.forEach(reg => {
            const semesterKey = reg.semester || 'Ongoing';
            if (!semesterMap[semesterKey]) {
                semesterMap[semesterKey] = [];
            }
            semesterMap[semesterKey].push(reg);
        });

        // Calculate SGPA for each semester and prepare response
        const gradePoints = { 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0 };
        const semesters = [];
        let totalCredits = 0;
        let totalGradePoints = 0;

        Object.keys(semesterMap).sort().forEach(semesterName => {
            const courses = semesterMap[semesterName];
            let semCredits = 0;
            let semGradePoints = 0;
            let creditsEarned = 0;

            const coursesData = courses.map((reg, index) => {
                const credits = reg.course?.credits?.total || 0;
                const grade = reg.grade;
                const gp = grade && gradePoints[grade] !== undefined ? gradePoints[grade] : null;

                if (gp !== null && reg.status === 'Approved') {
                    semCredits += credits;
                    semGradePoints += gp * credits;
                    if (gp >= 4) creditsEarned += credits; // Passing grade
                }

                return {
                    sno: index + 1,
                    code: reg.course?.code || 'N/A',
                    title: reg.course?.title || 'N/A',
                    credits: credits,
                    enrollmentType: reg.type || 'Credit',
                    enrollmentStatus: reg.status || 'Pending',
                    courseCategory: reg.courseCategory || 'SC',
                    grade: grade || '-',
                    attendance: reg.attendance ? `${reg.attendance}%` : '0%'
                };
            });

            const sgpa = semCredits > 0 ? (semGradePoints / semCredits).toFixed(2) : '0.00';

            totalCredits += semCredits;
            totalGradePoints += semGradePoints;

            semesters.push({
                semesterName,
                sgpa,
                creditsRegistered: courses.reduce((sum, r) => sum + (r.course?.credits?.total || 0), 0),
                creditsEarned,
                cgpa: totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00',
                courses: coursesData
            });
        });

        const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

        res.json({
            studentInfo: {
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                department: student.department,
                degree: 'B.Tech', // Could be added to User model
                yearOfEntry: student.rollNumber?.substring(0, 4) || '2023',
                currentStatus: 'Registered'
            },
            semesters,
            cgpa
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/instructor/my-courses
// @desc    Get courses floated by the logged-in instructor
// @access  Instructor
router.get('/instructor/my-courses', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const myCourses = await Course.find({ instructor: req.user.id });
        res.json(myCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/instructor/pending
// @desc    Get pending registrations for instructor's courses
// @access  Instructor
router.get('/instructor/pending', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        // Find courses taught by this instructor
        const myCourses = await Course.find({ instructor: req.user.id });
        const courseIds = myCourses.map(c => c._id);

        // Find pending registrations for these courses
        const pending = await CourseRegistration.find({
            course: { $in: courseIds },
            status: 'Pending_Instructor'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }

});

// @route   GET /api/courses/fa/pending
// @desc    Get pending registrations for FA
// @access  Faculty Advisor
router.get('/fa/pending', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        const pending = await CourseRegistration.find({
            status: 'Pending_FA'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:id
// @desc    Get course details by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        // If ID is invalid ObjectID, it throws error
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Course not found' });
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses/float
// @desc    Float a new course
// @access  Instructor only
router.post('/float', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { code, title, department, credits, semester, year, enrollmentDeadline, section, slot, eligibility, coordinators } = req.body;

        // Check History for Auto-Approval
        // Logic: If this course code was previously floated and Approved, we auto-approve this one.
        const previousInstance = await Course.findOne({
            code: code,
            status: 'Approved'
        });

        const initialStatus = previousInstance ? 'Approved' : 'Proposed';

        const newCourse = new Course({
            code,
            title,
            department,
            instructor: req.user.id,
            credits,
            semester,
            year,
            year,
            enrollmentDeadline: enrollmentDeadline ? enrollmentDeadline : undefined, // Use undefined to trigger default
            isEnrollmentOpen: true,
            status: initialStatus,
            section: section || 'A', // Default to 'A' if not provided to avoid null unique index issues? Or keep undefined? 
            // Better to check if course exists first.
            slot,
            eligibility: eligibility || [],
            coordinators: coordinators || []
        });

        // Handle Section - if undefined, unique index on {code, sem, year, section} treats null as value.
        // If user floats same course twice without section, it crashes.
        // Let's rely on catch block for duplicates.

        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error('=== FLOAT COURSE ERROR ===');
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Course already exists for this semester/year/section' });
        }
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @route   GET /api/courses/history/search
// @desc    Search course history for auto-fill
// @access  Instructor
router.get('/history/search', auth, async (req, res) => {
    try {
        const { q } = req.query; // e.g. "CS201"
        if (!q) return res.json([]);

        // Find distinct courses matching code or title
        // We use aggregation to return unique codes to avoid duplicates in dropdown
        const results = await Course.aggregate([
            {
                $match: {
                    $or: [
                        { code: { $regex: q, $options: 'i' } },
                        { title: { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$code",
                    title: { $first: "$title" },
                    credits: { $first: "$credits" },
                    department: { $first: "$department" }
                }
            },
            { $limit: 10 }
        ]);

        // Map back to simpler structure
        const mapped = results.map(r => ({
            code: r._id,
            title: r.title,
            credits: r.credits,
            department: r.department
        }));

        res.json(mapped);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses/register
// @desc    Student registers for a course
// @access  Student
router.post('/register', auth, checkRole(['student']), async (req, res) => {
    try {
        const { courseId, type } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Check Enrollment Status
        if (course.isEnrollmentOpen === false) {
            return res.status(400).json({ msg: 'Enrollment for this course is closed by the instructor.' });
        }

        if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
            return res.status(400).json({ msg: `Enrollment deadline passed on ${new Date(course.enrollmentDeadline).toDateString()}` });
        }

        const alreadyRegistered = await CourseRegistration.findOne({
            student: req.user.id,
            course: courseId
        });

        if (alreadyRegistered) {
            return res.status(400).json({ msg: 'Already registered for this course' });
        }

        const registration = new CourseRegistration({
            student: req.user.id,
            course: courseId,
            type
        });

        await registration.save();
        res.json(registration);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route   GET /api/courses/instructor/pending
// @desc    Get pending registrations for instructor's courses
// @access  Instructor
router.get('/instructor/pending', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        // Find courses taught by this instructor
        const myCourses = await Course.find({ instructor: req.user.id });
        const courseIds = myCourses.map(c => c._id);

        // Find pending registrations for these courses
        const pending = await CourseRegistration.find({
            course: { $in: courseIds },
            status: 'Pending_Instructor'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }

});

// @route   GET /api/courses/fa/pending
// @desc    Get pending registrations for FA
// @access  Faculty Advisor
router.get('/fa/pending', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        // In real app, we'd filter by students assigned to this FA. 
        // For now, we'll fetch ALL 'Pending_FA' requests.
        const pending = await CourseRegistration.find({
            status: 'Pending_FA'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:courseId
// @desc    Get a specific course by ID
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:courseId/registrations
// @desc    Get all registrations for a specific course (for the instructor)
// @access  Instructor
router.get('/:courseId/registrations', auth, checkRole(['instructor', 'faculty_advisor', 'student']), async (req, res) => {
    try {
        console.log('GET /:courseId/registrations request');
        console.log('Params:', req.params);
        console.log('User:', req.user.id);

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            console.log('Course not found');
            return res.status(404).json({ msg: 'Course not found' });
        }
        console.log('Course Instructor:', course.instructor);

        // Verify permissions
        // Instructors can only see their own courses
        if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this course registrations' });
        }
        // Students can see registrations for courses they are exploring or enrolled in (open for now based on requirement)


        const registrations = await CourseRegistration.find({ course: req.params.courseId })
            .populate('student', 'name rollNumber email department')
            .sort({ 'student.rollNumber': 1 }); // Sort by roll number

        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/instructor/approve/:id
// @desc    Instructor approves/rejects registration
// @access  Instructor
router.put('/instructor/approve/:id', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        const registration = await CourseRegistration.findById(req.params.id);

        if (!registration) return res.status(404).json({ msg: 'Registration not found' });

        if (action === 'approve') {
            registration.status = 'Pending_FA'; // Move to FA approval
            registration.approvedByInstructor = true;
        } else {
            registration.status = 'Rejected';
        }

        await registration.save();
        res.json(registration);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/courses/instructor/bulk-approve
// @desc    Instructor bulk approves/rejects multiple registrations
// @access  Instructor
router.put('/instructor/bulk-approve', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { ids, action } = req.body; // ids: array of registration IDs, action: 'approve' or 'reject'

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ msg: 'Please provide registration IDs' });
        }

        let successCount = 0;
        let failureCount = 0;
        const errors = [];

        for (const id of ids) {
            try {
                const registration = await CourseRegistration.findById(id);

                if (!registration) {
                    failureCount++;
                    errors.push({ id, error: 'Registration not found' });
                    continue;
                }

                if (action === 'approve') {
                    registration.status = 'Pending_FA';
                    registration.approvedByInstructor = true;
                } else {
                    registration.status = 'Rejected';
                }

                await registration.save();
                successCount++;
            } catch (err) {
                failureCount++;
                errors.push({ id, error: err.message });
            }
        }

        res.json({
            message: `Bulk ${action} completed`,
            successCount,
            failureCount,
            totalProcessed: ids.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route   PUT /api/courses/fa/approve/:id
// @desc    FA approves/rejects registration
// @access  Faculty Advisor
router.put('/fa/approve/:id', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        const registration = await CourseRegistration.findById(req.params.id);

        if (!registration) return res.status(404).json({ msg: 'Registration not found' });

        if (action === 'approve') {
            registration.status = 'Approved';
            registration.approvedByFA = true;
        } else {
            registration.status = 'Rejected';
        }

        await registration.save();
        res.json(registration);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/courses/fa/bulk-approve
// @desc    FA bulk approves/rejects multiple registrations
// @access  Faculty Advisor
router.put('/fa/bulk-approve', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        const { ids, action } = req.body; // ids: array of registration IDs, action: 'approve' or 'reject'

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ msg: 'Please provide registration IDs' });
        }

        let successCount = 0;
        let failureCount = 0;
        const errors = [];

        for (const id of ids) {
            try {
                const registration = await CourseRegistration.findById(id);

                if (!registration) {
                    failureCount++;
                    errors.push({ id, error: 'Registration not found' });
                    continue;
                }

                if (action === 'approve') {
                    registration.status = 'Approved';
                    registration.approvedByFA = true;
                } else {
                    registration.status = 'Rejected';
                }

                await registration.save();
                successCount++;
            } catch (err) {
                failureCount++;
                errors.push({ id, error: err.message });
            }
        }

        res.json({
            message: `Bulk ${action} completed`,
            successCount,
            failureCount,
            totalProcessed: ids.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/courses/:id
// @desc    Update a course (Admin only)
// @access  Admin
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        const { code, title, department, credits, semester, year, instructor, section, slot, eligibility, coordinators, status, enrollmentDeadline, isEnrollmentOpen } = req.body;

        // Find and update
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        if (code) course.code = code;
        if (title) course.title = title;
        if (department) course.department = department;
        if (credits) course.credits = credits;
        if (semester) course.semester = semester;
        if (year) course.year = year;
        if (instructor) course.instructor = instructor;
        if (section !== undefined) course.section = section;
        if (slot !== undefined) course.slot = slot;
        if (eligibility) course.eligibility = eligibility;
        if (coordinators) course.coordinators = coordinators;
        if (status) course.status = status;
        if (enrollmentDeadline !== undefined) course.enrollmentDeadline = enrollmentDeadline;
        if (isEnrollmentOpen !== undefined) course.isEnrollmentOpen = isEnrollmentOpen;

        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id/enrollment-status
// @desc    Update enrollment availability (Instructor)
// @access  Instructor
router.put('/:id/enrollment-status', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { isEnrollmentOpen, enrollmentDeadline } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Verify ownership
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to manage this course' });
        }

        if (isEnrollmentOpen !== undefined) course.isEnrollmentOpen = isEnrollmentOpen;
        if (enrollmentDeadline !== undefined) course.enrollmentDeadline = enrollmentDeadline;

        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course (Admin only)
// @access  Admin
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        // First delete all registrations for this course
        await CourseRegistration.deleteMany({ course: req.params.id });

        // Then delete the course
        const result = await Course.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ msg: 'Course not found' });

        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id/approve
// @desc    Approve a proposed course
// @access  Admin
router.put('/:id/approve', auth, checkRole(['admin']), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved' },
            { new: true }
        ).populate('instructor', 'name');

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id/reject
// @desc    Reject a proposed course
// @access  Admin
router.put('/:id/reject', auth, checkRole(['admin']), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'Rejected' },
            { new: true }
        ).populate('instructor', 'name');

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
