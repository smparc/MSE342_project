// include profile picture, bio, edit profile button

import * as React from 'react'
import { Grid, Typography, Box, Button, Snackbar, Alert } from '@mui/material'
import AvatarDisplay from './AvatarDisplay'
import EditProfileModal from './EditProfileModal'


const ProfileHeader = ({ username, displayName, setDisplayName, bio, setBio }) => {

    const [modalStatus, setModalStatus] = React.useState(false)
    const [profileChanged, setProfileChanged] = React.useState(false)


    const [open, setOpen] = React.useState(false);



  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    setProfileChanged(false)
  };

    return (
        <>
            {/* <Grid container
                justifyContent={'center'}
                sx={{
                    minHeight: '100vh',
                    // bgcolor: 'lightgrey'
                    // px: '20px',
                }}
            > */}
            {/* later move container to index and add this profile header as an item */}
            {/* profile card */}
            <Grid container justifyContent={'center'}>
            <Grid item xs={12} sm={10} md={8} lg={7}
            >
                <Grid container
                    columnGap={'40px'}
                    rowGap={'30px'}
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'center', sm: 'stretch' }}
                    // justifyContent={{xs: 'center', sm:'flex-start'}}
                    paddingTop={'60px'}
                    paddingX={'30px'}
                    // paddingTop={'30px'}
                    >

                    <Grid item
                    // sx={{border: '1px solid pink'}}
                    >
                        <Box
                            sx={{
                                width: { md: '150px', xs: '130px' },
                                aspectRatio: 1 / 1,
                                // borderRadius: '50%',
                                // border: '1px solid black',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: '3px'
                            }}>
                            <AvatarDisplay name={displayName} />
                        </Box>
                    </Grid>

                    {/* AI used for help with wrapping */}
                    <Grid item xs width='100%' sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>

                        <Grid container
                            flexDirection={'column'}
                            alignItems='flex-start'
                            justifyContent={'space-evenly'}
                            sx={{ textWrap: 'wrap', height: '100%' }}
                            rowGap={'4px'}>

                            <Grid item mb={'10px'}>
                                <Typography fontWeight={700} fontSize={24}>{username}</Typography>
                            </Grid>
                            <Grid item
                            // border={'1px solid black'}
                            >
                                <Grid container flexDirection={'column'} justifyContent={'space-between'} sx={{ height: '100%' }}>

                                    <Grid item mb={'12px'}>
                                        <Typography fontWeight={400} fontSize={16}>{displayName}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography fontWeight={400} fontSize={16} sx={{ whiteSpace: 'pre-line' , wordBreak: 'break-word'}}>{bio}</Typography>
                                    </Grid>

                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>


                    <Grid item xs={12}>
                        <Button fullWidth variant='contained'
                            id="edit-profile-button"
                            sx={{
                                bgcolor: '#F0F2F5',
                                height: '44px',
                                textTransform: 'none',
                                color: 'black', ":hover": { bgcolor: '#E7EAEE' },
                                fontWeight: '500', fontSize: '16px',
                                borderRadius: '12px'
                            }}
                            disableElevation={true}
                            onClick={() => setModalStatus(true)}>
                            Edit Profile
                        </Button>
                    </Grid>
                    <EditProfileModal open={modalStatus} handleClose={() => setModalStatus(false)} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} username={username} profileChanged={profileChanged} setProfileChanged={setProfileChanged} />

                    {/* <Grid item xs={12}>
                        <Grid container justifyContent={'space-between'} alignItems={'center'}>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>Program</Button>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>Year</Button>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>School</Button>
                        </Grid>
                    </Grid> */}
                </Grid>
                {/* <Divider variant="middle" /> */}
            </Grid>
                
            </Grid>
                            
            <Snackbar open={profileChanged} autoHideDuration={3500} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                <Alert severity='success'>Profile changes saved</Alert>
            </Snackbar>

        </>
    )
}

export default ProfileHeader