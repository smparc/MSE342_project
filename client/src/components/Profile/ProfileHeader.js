// include profile picture, bio, edit profile button

import * as React from 'react'
import { Grid, Typography, Box, Divider, Button } from '@mui/material'
import AvatarDisplay from './AvatarDisplay'
import EditProfileModal from './EditProfileModal'


const ProfileHeader = ({ username, displayName, setDisplayName, bio, setBio }) => {
    
    const [modalStatus, setModalStatus] = React.useState(false)

    return (
        <>
            <Grid container
                justifyContent={'center'}
                sx={{
                    minHeight: '100vh',
                    // bgcolor: 'lightgrey'
                    // px: '20px',
                }}
            >
                {/* later move container to index and add this profile header as an item */}
                {/* profile card */}
                <Grid item xs={12} sm={10} md={8} lg={7}
                    sx={{ border: '2px solid brown' }}>


                    <Grid container
                        columnGap={'30px'}
                        rowGap={'30px'}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'center', sm: 'stretch' }}
                        // justifyContent={{xs: 'center', sm:'flex-start'}}
                        paddingTop={'30px'}
                        paddingX={'30px'}
                        marginY={'30px'}>

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
                        <Grid item xs sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>

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
                                            <Typography fontWeight={400} fontSize={16} sx={{ whiteSpace: 'pre-line' }}>{bio}</Typography>
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
                                    fontWeight: '500', fontSize: '16px'
                                }}
                                disableElevation={true}
                                onClick={() => setModalStatus(true)}>
                                Edit Profile
                            </Button>
                        </Grid>
                        <EditProfileModal open={modalStatus} handleClose={() => setModalStatus(false)} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} username={username}/>

                    </Grid>



                    <Divider variant="middle" />



                </Grid>
            </Grid>

        </>
    )
}

export default ProfileHeader