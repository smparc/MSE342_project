import * as React from 'react'
// import Biography from './Biography'
import Avatar from './AvatarDisplay'
import ProfileHeader from './ProfileHeader'
import { Grid } from '@mui/material'

const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"


    return (
        <>
            {/* entire screen */}
            {/* <Grid container
                // justifyContent={'center'}
                // sx={{
                //     minHeight: '100vh',
                //     bgcolor: 'lightgrey'
                // }}
            > */}
                {/* display name must be first and last name */}
                <ProfileHeader bio={bio} displayName={displayName} username={username} />



            {/* </Grid> */}



        </>
    )


}

export default Profile