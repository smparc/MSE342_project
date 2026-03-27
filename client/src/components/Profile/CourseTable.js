import * as React from 'react';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Alert, Snackbar, IconButton, Divider, Stack, Chip } from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { FirebaseContext, authFetch } from '../Firebase'

const CourseTable = ({ username, exchangeSchool, readOnly = false }) => {
    const firebase = React.useContext(FirebaseContext)

    const [list, setList] = React.useState([])
    const [dataFormStatus, setDataFormStatus] = React.useState(false)

    const [newUWCode, setNewUWCode] = React.useState('')
    const [newUWName, setNewUWName] = React.useState('')
    const [newHostCode, setNewHostCode] = React.useState('')
    const [newHostName, setNewHostName] = React.useState('')
    const [newHostUni, setNewHostUni] = React.useState('')
    const [newCountry, setNewCountry] = React.useState('')
    const [newContinent, setNewContinent] = React.useState('')
    const [newTerm, setNewTerm] = React.useState('')
    const [newProofUrl, setNewProofUrl] = React.useState('')

    const [error, setError] = React.useState('')
    const [editID, setEditID] = React.useState(null)
    const [outputAlert, setOutputAlert] = React.useState(false)

    const fetchCourses = React.useCallback(async () => {
        if (!username) return
        try {
            const response = await fetch(`/api/courses/user/${username}`);
            const data = await response.json()
            setList(data)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [username])

    React.useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    async function handleSubmit(event) {
        event.preventDefault()
        if (!newUWCode.trim() || !newUWName.trim() || !newHostCode.trim() || !newHostName.trim() || !newHostUni.trim()) {
            setError("Required entries must have a value. Please try again.")
            return
        }

        const courseData = {
            username: username,
            uw_course_code: newUWCode.toUpperCase().trim(),
            uw_course_name: newUWName.trim(),
            host_course_code: newHostCode.toUpperCase().trim(),
            host_course_name: newHostName.trim(),
            host_university: newHostUni.trim(),
            country: newCountry.trim(),
            continent: newContinent.trim(),
            term_taken: newTerm.trim(),
            proof_url: newProofUrl.trim()
        }

        try {
            const endpoint = editID ? `/api/courses/${editID}` : '/api/courses'
            const method = editID ? 'PUT' : 'POST'
            const response = await authFetch(endpoint, {
                method: method,
                body: JSON.stringify(courseData),
            }, firebase)

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || "Submission failed. Please try again.")
                return
            }

            fetchCourses()
            resetForm()
            setEditID(null)
            setError('')
            setDataFormStatus(false)
            setOutputAlert(true)
        } catch (err) {
            setError("Network error. Please try again.")
        }
    }

    function resetForm() {
        setNewUWCode('')
        setNewUWName('')
        setNewHostCode('')
        setNewHostName('')
        setNewHostUni('')
        setNewCountry('')
        setNewContinent('')
        setNewTerm('')
        setNewProofUrl('')
    }

    function editRow(row) {
        setEditID(row.course_id)
        setNewUWCode(row.uw_course_code)
        setNewUWName(row.uw_course_name)
        setNewHostCode(row.host_course_code)
        setNewHostName(row.host_course_name)
        setNewHostUni(row.host_university)
        setNewCountry(row.country || '')
        setNewContinent(row.continent || '')
        setNewTerm(row.term_taken || '')
        setNewProofUrl(row.proof_url || '')
        setDataFormStatus(true)
    }

    async function deleteRow(id) {
        try {
            const response = await authFetch(`/api/courses/${id}`, {
                method: 'DELETE',
            }, firebase)
            if (response.ok) {
                fetchCourses()
                setOutputAlert(true)
            }
        } catch (error) {
            console.error('Error deleting course:', error)
        }
    }

    function handleClick() {
        resetForm()
        setEditID(null)
        setDataFormStatus(true)
    }

    const handleFormClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOutputAlert(false);
    };

    const headerStyle = {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.78rem',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #f1f5f9',
        py: 1.5
    };

    const cellStyle = {
        py: 1.5,
        fontSize: '0.875rem',
        color: '#334155'
    };

    const inputLabelStyle = {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        mb: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '1100px', mx: 'auto' }}>
            <Paper elevation={0} sx={{
                p: { xs: 2, md: 3 },
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                    <Typography sx={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.6rem',
                        color: '#1a1a2e'
                    }}>
                        Course Equivalencies
                    </Typography>
                    {(exchangeSchool || (list.length > 0 && list[0].host_university)) && (
                        <Chip
                            label={exchangeSchool || list[0].host_university}
                            size="small"
                            sx={{
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                borderRadius: '6px'
                            }}
                        />
                    )}
                </Box>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headerStyle}>UW Code</TableCell>
                                <TableCell sx={headerStyle}>UW Course Name</TableCell>
                                <TableCell sx={headerStyle}>Host Code</TableCell>
                                <TableCell sx={headerStyle}>Host Course Name</TableCell>
                                <TableCell align="center" sx={headerStyle}>Status</TableCell>
                                {!readOnly && <TableCell align="right" sx={headerStyle}>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.map(row => (
                                <TableRow key={row.course_id} sx={{ "&:hover": { bgcolor: "#fafafa" }, transition: '0.2s' }}>
                                    <TableCell sx={cellStyle}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.uw_course_code}</Typography>
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Typography variant="body2" >{row.uw_course_name}</Typography>
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.host_course_code}</Typography>
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Typography variant="body2" >{row.host_course_name}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={cellStyle}>
                                        <Typography variant="caption" sx={{
                                            bgcolor: row.status === 'Approved' ? '#ecfdf5' : row.status === 'Flagged' ? '#fef2f2' : '#fffbeb',
                                            color: row.status === 'Approved' ? '#065f46' : row.status === 'Flagged' ? '#991b1b' : '#92400e',
                                            px: 1.5, py: 0.5, borderRadius: '20px', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase'
                                        }}>
                                            {row.status}
                                        </Typography>
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell align="right" sx={cellStyle}>
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <IconButton size="small" onClick={() => editRow(row)} sx={{ color: '#3143E3' }}>
                                                    <EditIcon sx={{ fontSize: '1.1rem' }} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => deleteRow(row.course_id)} sx={{ color: '#ef4444' }}>
                                                    <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={readOnly ? 5 : 6} align="center" sx={{ py: 4, color: '#94a3b8', fontStyle: 'italic' }}>
                                        No courses submitted yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!readOnly && !dataFormStatus && (
                    <Button variant='outlined' fullWidth onClick={handleClick}
                        sx={{ marginTop: '20px', border: '1px solid #3143E3', color: '#3143E3', fontWeight: 700, textTransform: 'none', borderRadius: '10px', ":hover": { bgcolor: '#3143E3', color: 'white' } }}>
                        Submit new course
                    </Button>
                )}

                {!readOnly && dataFormStatus && (
                    <Box sx={{ mt: 4, pt: 4, borderTop: '2px dashed #f1f5f9' }}>
                        <Typography sx={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.3rem',
                            color: '#1a1a2e',
                            mb: 3
                        }}>
                            {editID ? "Edit Course Detail" : "Submit New Course"}
                        </Typography>

                        <form onSubmit={handleSubmit} id='add-course-form'>
                            <Grid container spacing={3}>
                                {/* Waterloo Side */}
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={3}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#6366f1', letterSpacing: '0.1em' }}>WATERLOO INFO</Typography>
                                        <Box>
                                            <Typography sx={inputLabelStyle}>Course Code *</Typography>
                                            <TextField required fullWidth size="small" value={newUWCode} onChange={(e) => setNewUWCode(e.target.value)} placeholder="e.g. CS 342" />
                                        </Box>
                                        <Box>
                                            <Typography sx={inputLabelStyle}>Course Name *</Typography>
                                            <TextField required fullWidth size="small" value={newUWName} onChange={(e) => setNewUWName(e.target.value)} placeholder="e.g. Advanced AI" />
                                        </Box>
                                    </Stack>
                                </Grid>

                                {/* Host Side */}
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={3}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', letterSpacing: '0.1em' }}>HOST INFO</Typography>
                                        <Box>
                                            <Typography sx={inputLabelStyle}>Host University *</Typography>
                                            <TextField required fullWidth size="small" value={newHostUni} onChange={(e) => setNewHostUni(e.target.value)} placeholder="e.g. Oxford" />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={inputLabelStyle}>Host Code *</Typography>
                                                <TextField required fullWidth size="small" value={newHostCode} onChange={(e) => setNewHostCode(e.target.value)} placeholder="e.g. OX 101" />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={inputLabelStyle}>Host Name *</Typography>
                                                <TextField required fullWidth size="small" value={newHostName} onChange={(e) => setNewHostName(e.target.value)} placeholder="e.g. Intro Linear" />
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Grid>


                                <Grid item xs={12} sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                                    <Button type='submit' variant="contained" sx={{ bgcolor: '#3143E3', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 4, "&:hover": { bgcolor: '#2633b3' } }}>
                                        {editID ? "Update Course" : "Submit Course"}
                                    </Button>
                                    <Button onClick={() => setDataFormStatus(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                                </Grid>
                            </Grid>
                        </form>

                        {error && <Alert severity='error' sx={{ mt: 2, borderRadius: '8px' }}>{error}</Alert>}
                    </Box>
                )}

                <Snackbar open={outputAlert} autoHideDuration={3500} onClose={handleFormClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity='success' sx={{ borderRadius: '12px', fontWeight: 600 }}>Course changes saved</Alert>
                </Snackbar>
            </Paper>
        </Box>
    );
}

export default CourseTable;