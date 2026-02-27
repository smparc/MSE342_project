import * as React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Box, Alert, Snackbar, IconButton } from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const CourseTable = ({ username }) => {


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
            const response = await fetch(`/api/courses/user/${username}`)
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
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            })

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
            const response = await fetch(`/api/courses/${id}`, {
                method: 'DELETE'
            })
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
        if (reason === 'clickaway') {
        return;
        }

        setOutputAlert(false);
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align={'left'}><strong>UW Code</strong></TableCell>
                                <TableCell align={'left'}><strong>UW Course Name</strong></TableCell>
                                <TableCell align={'left'}><strong>Host University</strong></TableCell>
                                <TableCell align={'left'}><strong>Host Code</strong></TableCell>
                                <TableCell align={'left'}><strong>Host Course Name</strong></TableCell>
                                <TableCell align={'center'}><strong>Status</strong></TableCell>
                                <TableCell align={'center'}><strong>Actions</strong></TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {list.map(row => (
                                <TableRow key={row.course_id}>
                                    <TableCell>{row.uw_course_code}</TableCell>

                                    <TableCell align={'left'}>{row.uw_course_name}</TableCell>
                                    <TableCell align={'left'}>{row.host_university}</TableCell>
                                    <TableCell align={'left'}>{row.host_course_code}</TableCell>
                                    <TableCell align={'left'}>{row.host_course_name}</TableCell>
                                    <TableCell align={'center'}>
                                        <Typography variant="caption" sx={{ 
                                            bgcolor: row.status === 'Approved' ? '#e6fffa' : row.status === 'Flagged' ? '#fff5f5' : '#fffaf0',
                                            color: row.status === 'Approved' ? '#2c7a7b' : row.status === 'Flagged' ? '#c53030' : '#b7791f',
                                            px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold'
                                        }}>
                                            {row.status}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align={'center'} sx={{ p: 0 }}>
                                        <IconButton size="small" onClick={() => editRow(row)} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => deleteRow(row.course_id)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </TableContainer>


                <Button variant='outlined' fullWidth onClick={handleClick}
                    sx={{ marginTop: '20px', border: '1px solid #3143E3', color: '#3143E3', ":hover": { bgcolor: '#3143E3', color: 'white' } }}>
                    Submit new course
                </Button>

                {dataFormStatus &&
                    <>
                    <Grid container alignItems={'center'} justifyContent={'center'} direction={'column'} spacing={2} mt={'10px'}>
                        <Grid item width="100%">
                            
                        <form onSubmit={handleSubmit} id='add-course-form'>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField required fullWidth
                                        value={newUWCode}
                                        onChange={(event) => setNewUWCode(event.target.value)}
                                        size="small"
                                        label="UW Course Code" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField required fullWidth
                                        value={newUWName}
                                        onChange={(event) => setNewUWName(event.target.value)}
                                        size="small"
                                        label="UW Course Name" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField required fullWidth
                                        value={newHostUni}
                                        onChange={(event) => setNewHostUni(event.target.value)}
                                        size="small"
                                        label="Host University" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField required fullWidth
                                        value={newHostCode}
                                        onChange={(event) => setNewHostCode(event.target.value)}
                                        size="small"
                                        label="Host Course Code" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField required fullWidth
                                        value={newHostName}
                                        onChange={(event) => setNewHostName(event.target.value)}
                                        size="small"
                                        label="Host Course Name" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField fullWidth
                                        value={newCountry}
                                        onChange={(event) => setNewCountry(event.target.value)}
                                        size="small"
                                        label="Country" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField fullWidth
                                        value={newContinent}
                                        onChange={(event) => setNewContinent(event.target.value)}
                                        size="small"
                                        label="Continent" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField fullWidth
                                        value={newTerm}
                                        onChange={(event) => setNewTerm(event.target.value)}
                                        size="small"
                                        label="Term Taken" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField fullWidth
                                        value={newProofUrl}
                                        onChange={(event) => setNewProofUrl(event.target.value)}
                                        size="small"
                                        label="Proof URL/Path" />
                                </Grid>
                        </Grid>
                        </form>
                        
                        </Grid>
                        <Grid item>
                        <Button type='submit' form='add-course-form' variant="contained" sx={{ bgcolor: '#3143E3' }}>
                            {editID ? "Update Course" : "Add Course"}
                        </Button>
                        <Button onClick={() => setDataFormStatus(false)} sx={{ ml: 1 }}>Cancel</Button>
                        </Grid>

                        {error && <Alert severity='error'>{error}</Alert>}

                    </Grid>
                    </>}

                    <Snackbar open={outputAlert} autoHideDuration={3500} onClose={handleFormClose} anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                        <Alert severity='success'>Course changes saved</Alert>
                    </Snackbar>
            </Paper>
        </>
    )
}

export default CourseTable