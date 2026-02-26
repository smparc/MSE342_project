import * as React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography } from '@mui/material'

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


    function handleSubmit() {
        setDataFormStatus(false)

        const newRow = {id: newUWCode, uwCourseCode: newUWCode, uwCourseName: newUWName, hostCourseCode: newHostCode, hostCourseName: newHostName }
        
        setList([...list, newRow])
    }



    function handleClick() {
        setDataFormStatus(true)
    }

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
                            <Grid container spacing={2}>
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
                        <Button type='submit' form='add-course-form'>Add Course</Button>
                        </Grid>
                    </Grid></>}




            </Paper>


        </>
    )
}

export default CourseTable