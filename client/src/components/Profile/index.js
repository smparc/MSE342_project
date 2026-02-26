import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography, Alert, Snackbar, Button, ImageList, ListItemSecondaryAction } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'
import CourseTable from './CourseTable'


const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"

    const [tabIndex, setTabIndex] = React.useState(0)
    const [file, setFile] = React.useState([])


    return (
        <>

            <Grid container
                direction={'column'}
                alignItems={'center'}
                // justifyContent={'center'}
                sx={{ minHeight: '95vh' }}
            // rowGap={'20px'}
            >

                <Grid item>
                    <ProfileHeader username={username} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} />
                </Grid>

                <Grid item mt={'20px'} paddingTop={'20px'}>
                    <SectionTab tabIndex={tabIndex} setTabIndex={setTabIndex} />
                </Grid>

                <Grid item width={'75%'}>
                    <Divider variant="middle" />
                </Grid>

                <Grid container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    flexGrow={1}
                    rowSpacing={1.3}>
                    {tabIndex === 0 && <UploadContent file={file} setFile={setFile}/>}
                    {tabIndex === 1 && <CourseTable />}
                    {tabIndex === 2 && <Typography>This will display ratings</Typography>}
                </Grid>

                {/* <ImageList sx={{width: 500, height: 450 }} cols={3} rowHeight={164} >
                    {files.map((item) => (
                        <ImageListItem key={item.img}>
                            <img 
                        </ImageListItem>
                    ))}
                </ImageList> */}
            </Grid>
            
        </>
    )


}

export default Profile