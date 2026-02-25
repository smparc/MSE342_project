import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid'
import { Box } from '@mui/material'

const CourseTable = () => {

    const columns = [
        { field: 'uwCourseCode ', headerName: 'UW Course Code', width: 90 },
        {
            field: 'uwCourseName',
            headerName: 'UW Course Name',
            width: 150,
            editable: true,
        },
        {
            field: 'hostCourseCode',
            headerName: 'Host School Course Code',
            width: 150,
            editable: true,
        },
        {
            field: 'hostCourseName',
            headerName: 'Host School Course Name',
            type: 'number',
            width: 110,
            editable: true,
        }
    ];

    const rows = [
        { uwCourseCode: 'MSE 331', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { uwCourseCode: 'MSE 341', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { uwCourseCode: 'MSE 431', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' },
        { uwCourseCode: 'MSE 531', uwCourseName: 'Optimization & Operations Planning', hostCourseCode: 'XXX111', hostCourseName: 'Not Optimization and Operations' }
    ]

    return (
        <>
            <DataGrid 
                rows={rows}
                columns={columns}
                />


        </>
    )
}

export default CourseTable