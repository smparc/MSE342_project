// include profile picture, bio, edit profile button

import * as React from 'react'
import { Grid, Typography, Box, Button, Snackbar, Alert, Chip, Divider } from '@mui/material'
import AvatarDisplay from './AvatarDisplay'
import EditProfileModal from './EditProfileModal'
import EditTagsModal from './EditTagsModal'


const ProfileHeader = ({ username, displayName, setDisplayName, bio, setBio, faculty, setFaculty, program, setProgram, gradYear, setGradYear, exchangeTerm, setExchangeTerm, exchangeCountry, setExchangeCountry, exchangeSchool, setExchangeSchool, uwVerified, firebase, isOwnProfile = true}) => {

    const [modalStatus, setModalStatus] = React.useState(false)
    const [tagsModalStatus, setTagsModalStatus] = React.useState(false)
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
                <Grid item xs={12} sm={10} md={8} lg={7} minWidth={'680px'} maxWidth={'800px'}
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
                                        <Grid item mb={'12px'}>
                                            <Typography fontWeight={400} fontSize={16} sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{bio}</Typography>
                                        </Grid>


                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>


                        <Grid item xs={12}>
                            {/* try here */}
                            <Grid item>
                                <Grid container spacing={2} direction={'column'}>
                                    {/* school tags */}
                                    <Grid item>
                                        <Grid container spacing={1}>
                                            <Grid item>
                                                <Typography fontWeight={400}>UW term:</Typography>
                                            </Grid>
                                            <Grid item>
                                                {uwVerified && <Grid item><Chip label="UW Verified" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                            <Grid item>
                                                {faculty && <Grid item><Chip label={faculty} size="small" sx={{ bgcolor: '#FFF9C4', color: '#827717', border: '1px solid #FFF176', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                            <Grid item>
                                                {program && <Grid item><Chip label={program} size="small" sx={{ bgcolor: '#FCE4EC', color: '#C2185B', border: '1px solid #F8BBD0', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                            <Grid item>
                                                {gradYear && <Grid item><Chip label={`Class of ${gradYear}`} size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {/* <Grid item>
                                        <Divider variant="middle" />
                                    </Grid> */}
                                    <Grid item>
                                        <Grid container spacing={1}>
                                            <Grid item>
                                                <Typography fontWeight={400}>Exchange term:</Typography>
                                            </Grid>
                                            <Grid item>
                                                {exchangeTerm && <Grid item><Chip label={`${exchangeTerm} Exchange`} size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                            <Grid item>
                                                {exchangeCountry && <Grid item><Chip label={exchangeCountry} size="small" sx={{ bgcolor: '#FFF9C4', color: '#827717', border: '1px solid #FFF176', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                            <Grid item>
                                                {exchangeSchool && <Grid item><Chip label={exchangeSchool} size="small" sx={{ bgcolor: '#FCE4EC', color: '#C2185B', border: '1px solid #F8BBD0', fontWeight: '500' }} /></Grid>}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>


                        {isOwnProfile && (
                        <Grid item xs={12}>
                            <Grid container columnGap={'10px'}>
                                <Grid item xs>
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
                                <Grid item xs>
                                    <Button fullWidth variant='contained'
                                        id="edit-tags-button"
                                        sx={{
                                            bgcolor: '#F0F2F5',
                                            height: '44px',
                                            textTransform: 'none',
                                            color: 'black', ":hover": { bgcolor: '#E7EAEE' },
                                            fontWeight: '500', fontSize: '16px',
                                            borderRadius: '12px'
                                        }}
                                        disableElevation={true}
                                        onClick={() => setTagsModalStatus(true)}>
                                        {(faculty || program || gradYear || exchangeTerm) ? 'Edit Tags' : 'Add Tags'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        )}
                        {isOwnProfile && <>
                        <EditProfileModal open={modalStatus} handleClose={() => setModalStatus(false)} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} username={username} faculty={faculty} program={program} gradYear={gradYear} exchangeTerm={exchangeTerm} profileChanged={profileChanged} setProfileChanged={setProfileChanged} firebase={firebase} />
                        <EditTagsModal
                            open={tagsModalStatus}
                            handleClose={() => setTagsModalStatus(false)}
                            username={username}
                            faculty={faculty}
                            setFaculty={setFaculty}
                            program={program}
                            setProgram={setProgram}
                            gradYear={gradYear}
                            setGradYear={setGradYear}
                            exchangeTerm={exchangeTerm}
                            setExchangeTerm={setExchangeTerm}
                            exchangeCountry={exchangeCountry}
                            setExchangeCountry={setExchangeCountry}
                            exchangeSchool={exchangeSchool}
                            setExchangeSchool={setExchangeSchool}
                            displayName={displayName}
                            bio={bio}
                            setProfileChanged={setProfileChanged}
                            firebase={firebase}
                        />
                        </>}

                        {/* <Grid item xs={12}>
                        <Grid container justifyContent={'space-between'} alignItems={'center'}>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>Program</Button>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>Year</Button>
                            <Button borderRadius='30%' variant='outlined' sx={{ width: '25%', ":hover": { bgcolor: '#E7EAEE' }, color: 'black' }} onClick={() => { console.log('test') }}>School</Button>
                        </Grid>
                    </Grid> */}
                    </Grid>
                    {/* <Grid item>
                        <Divider variant="middle" />   
                    </Grid> */}

                </Grid>

            </Grid>

            <Snackbar open={profileChanged} autoHideDuration={3500} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity='success'>Profile changes saved</Alert>
            </Snackbar>

        </>
    )
}

export default ProfileHeader