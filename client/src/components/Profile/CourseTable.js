import * as React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material'

const CourseTable = () => {


const [list, setList] = React.useState([
        { id: 1, uwCourseCode: 'MSE 331', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 2, uwCourseCode: 'MSE 341', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 3, uwCourseCode: 'MSE 431', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { id: 4, uwCourseCode: 'MSE 531', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' }
    ])

    return (
        <>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3}}>
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align={'right'}><strong>UW Course Code</strong></TableCell>
                                <TableCell align={'center'}><strong>UW Course Name</strong></TableCell>
                                <TableCell><strong>Host School Course Code</strong></TableCell>
                                <TableCell><strong>Host School Course Name</strong></TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {list.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.uwCourseCode}</TableCell>
                                    <TableCell align={'right'}>{row.uwCourseName}</TableCell>
                                    <TableCell align={'center'}>{row.hostCourseCode}</TableCell>
                                    <TableCell align={'right'}>{row.hostCourseName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </TableContainer>


                <Button variant='outlined' fullWidth
                    sx={{marginTop: '20px', border: '1px solid #3143E3',  ":hover": {bgcolor: '#3143E3', color: 'white'}}}>
                        Enter new course
                    </Button>



            </Paper>


        </>
    )
}

export default CourseTable