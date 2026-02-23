import * as React from 'react'
// import Biography from './Biography'
import Avatar from './AvatarDisplay'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider } from '@mui/material'

const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"


    return (
        <>

            <Grid container
                direction={'column'}
                alignItems={'center'}
                // justifyContent={'center'}
                sx={{minHeight: '100vh'}}
                
            >

                <Grid item>
                        <ProfileHeader username={username} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} />
                </Grid>
                <Grid item width={'75%'}>
                    <Divider variant="middle" />
                </Grid>

            </Grid>




        </>
    )


}

export default Profile