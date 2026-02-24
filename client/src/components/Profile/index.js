import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, IconButton, Box, Tabs, Tab } from '@mui/material'
import grid from '../../images/squares-four.png'
import books from '../../images/books.png'
import star from '../../images/star.png'
import { createEventHandlerWithConfig } from 'recompose'


const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"

    const [value, setValue] = React.useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }


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

                <Tabs centered
                value={value}
                onChange={handleChange}
                aria-label="profile-icon-tabs"
                TabIndicatorProps={{sx: {background: 'black'}}}
                sx={{'& .MuiTab-root': {filter: 'invert(50%) brightness(80%)'}, '& .Mui-selected': {filter: 'invert(50%) brightness(20%)'}}}
                >
                   
                   <Tab sx={{marginX: '80px'}} icon={<Box component='img' src={grid} alt='grid' sx={{width:'35px'}}/>} aria-label="grid" />
                    <Tab sx={{marginX: '80px'}} icon={<Box component='img' src={books} alt='books' sx={{width:'35px', filter: 'invert(50%) brightness(80%)'}}/>} aria-label="books" />
                    <Tab sx={{marginX: '80px'}} icon={<Box component='img' src={star} alt='star' sx={{width:'33px', filter: 'invert(50%) brightness(80%)'}}/>} aria-label="star" />
                </Tabs>

                <Grid item width={'75%'}>
                    <Divider variant="middle" />
                </Grid>
            
            </Grid>
        </>
    )


}

export default Profile