import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'


const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"

    const [tabIndex, setTabIndex] = React.useState(0)



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
                    rowSpacing={0.5}>
                    {tabIndex === 0 && <UploadContent />}
                    {tabIndex === 1 && <Typography>This will display courses</Typography>}
                    {tabIndex === 2 && <Typography>This will display ratings</Typography>}
                </Grid>
            </Grid>
        </>
    )


}

export default Profile