import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
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
    Select,
    MenuItem,
    Avatar,
    Box,
    Chip
} from '@mui/material';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Failed to update role');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'faculty_advisor': return 'warning';
            case 'instructor': return 'primary';
            default: return 'default'; // student
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
                Manage Users and Roles
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Entry No.</strong></TableCell>
                            <TableCell><strong>Current Role</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={user.pfp} alt={user.name} />
                                        <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.rollNumber || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.role.toUpperCase()} 
                                        color={getRoleColor(user.role)} 
                                        size="small" 
                                        variant="outlined" 
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role}
                                        size="small"
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        sx={{ minWidth: 150 }}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="instructor">Instructor</MenuItem>
                                        <MenuItem value="faculty_advisor">Faculty Advisor</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminDashboard;
