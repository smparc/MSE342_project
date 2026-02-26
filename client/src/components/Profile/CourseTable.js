import * as React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Box, Alert, Snackbar } from '@mui/material'
import trashIcon from '../../images/trash-light.svg'
import pencilIcon from '../../images/pencil-light.svg'

const CourseTable = () => {


    const [list, setList] = React.useState([
        { id: 1, uwCourseCode: 'MSE 331', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 2, uwCourseCode: 'MSE 341', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 3, uwCourseCode: 'MSE 431', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 4, uwCourseCode: 'MSE 531', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' }
    ])
    const [dataFormStatus, setDataFormStatus] = React.useState(false)

    const [newUWCode, setNewUWCode] = React.useState('')
    const [newUWName, setNewUWName] = React.useState('')
    const [newHostCode, setNewHostCode] = React.useState('')
    const [newHostName, setNewHostName] = React.useState('')

    const [error, setError] = React.useState('')
    const [editID, setEditID] = React.useState(null)
    const [outputAlert, setOutputAlert] = React.useState(false)


    function handleSubmit(event) {
        event.preventDefault()
        if (!newUWCode.trim() || !newUWName.trim() || !newHostCode.trim() || !newHostName.trim()) {
            setError("All entries must have a value. Please try again.")
            // setNewUWCode('')
            // setNewUWName('')
            // setNewHostCode('')
            // setNewHostName('')
            return
        }
        

        if (editID) {
            const updatedList = list.map(row => 
                row.id === editID ?
                {...row, uwCourseCode: newUWCode.toUpperCase().trim(), uwCourseName: newUWName.trim(), hostCourseCode: newHostCode.toUpperCase().trim(), hostCourseName: newHostName.trim()}
                : row
            )
            setList(updatedList)
        }

        else {
        if (list.some(row => row.uwCourseCode.trim().toUpperCase() === newUWCode.trim().toUpperCase())) {
            setError("Duplicate course entries are not allowed. Please try again.")
            return
        }

        const newRow = {id: Date.now(), uwCourseCode: newUWCode.toUpperCase().trim(), uwCourseName: newUWName.trim(), hostCourseCode: newHostCode.toUpperCase().trim(), hostCourseName: newHostName.trim() }
        
        setList([...list, newRow])
        setNewUWCode('')
        setNewUWName('')
        setNewHostCode('')
        setNewHostName('')
    }
        setEditID(null)
        setError('')
        setDataFormStatus(false)
        setOutputAlert(true)
}

    function editRow(row) {
        setEditID(row.id)
        setNewUWCode(row.uwCourseCode)
        setNewUWName(row.uwCourseName)
        setNewHostCode(row.hostCourseCode)
        setNewHostName(row.hostCourseName)
        setDataFormStatus(true)
    }


    function deleteRow(id) {
        const updatedList = list.filter(row => row.id !== id)
        setList(updatedList)
        setOutputAlert(true)
    }


    function handleClick() {
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
                                <TableCell align={'left'}><strong>UW Course Code</strong></TableCell>
                                <TableCell align={'center'}><strong>UW Course Name</strong></TableCell>
                                <TableCell align={'left'}><strong>Host School Course Code</strong></TableCell>
                                <TableCell align={'center'}><strong>Host School Course Name</strong></TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {list.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.uwCourseCode}</TableCell>

                                    <TableCell align={'left'}>{row.uwCourseName}</TableCell>
                                    <TableCell align={'center'}>{row.hostCourseCode}</TableCell>
                                    <TableCell align={'left'}>{row.hostCourseName}</TableCell>
                                    <TableCell align={'center'} sx={{p: 0 }}>
                                        <Button sx={{minWidth: 'auto', marginLeft: '20px'}} variant="text" onClick={() => editRow(row)}>
                                            <Box component={'img'} src={pencilIcon} alt='pencilIcon'/></Button>
                                        <Button sx={{minWidth: 'auto'}} variant="text" onClick={() => deleteRow(row.id)}>
                                            <Box component={'img'} src={trashIcon} alt='trashIcon' /></Button>
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
                        <Grid item>
                            
                        <form onSubmit={handleSubmit} id='add-course-form'>
                            <Grid container spacing={2} justifyContent={'space-between'}>
                            <Grid item xs={2}>
                            <TextField required fullWidth
                                value={newUWCode}
                                onChange={(event) => setNewUWCode(event.target.value)}
                                size="small"
                                id='uw-course-code'
                                label="UW Course Code" />
                                </Grid>
                                <Grid item xs={4}>
                            <TextField required fullWidth
                                value={newUWName}
                                onChange={(event) => setNewUWName(event.target.value)}
                                size="small"
                                id='uw-course-name'
                                label="UW Course Name" />
                                </Grid>
                                <Grid item xs={2}>
                            <TextField required fullWidth
                                value={newHostCode}
                                onChange={(event) => setNewHostCode(event.target.value)}
                                size="small"
                                id='host-course-code'
                                label="Host Course Code" />
                                </Grid>
                                <Grid item xs={4}>
                            <TextField required fullWidth
                                value={newHostName}
                                onChange={(event) => setNewHostName(event.target.value)}
                                size="small"
                                id='host-course-name'
                                label="Host Course Name" />
                                </Grid>
                        </Grid>
                        </form>
                        
                        </Grid>
                        <Grid item>
                        <Button type='submit' form='add-course-form'>{editID ? "Update Course" : "Add Course"}</Button>
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