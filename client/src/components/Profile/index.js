import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Box, Tabs, Tab, Typography } from '@mui/material'
import grid from '../../images/squares-four.png'
import books from '../../images/books.png'
import star from '../../images/star.png'
import SectionTab from './SectionTab'


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
                sx={{minHeight: '100vh'}}
                // rowGap={'20px'}
                >

                <Grid item>
                        <ProfileHeader username={username} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} />
                </Grid>

                <Grid item mt={'20px'}>
                    <SectionTab tabIndex={tabIndex} setTabIndex={setTabIndex} />
                </Grid>

                <Grid item width={'75%'}>
                    <Divider variant="middle" />
                </Grid>

                {tabIndex === 0 && <Typography>This will display posts</Typography>}
                {tabIndex === 1 && <Typography>This will display courses</Typography>}
                {tabIndex === 2 && <Typography>This will display ratings</Typography>}
            
            </Grid>
        </>
    )


}

export default Profile