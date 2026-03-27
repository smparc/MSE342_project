// // include profile picture, bio, edit profile button

import * as React from 'react'
import { Grid, Typography, Box, Button, Snackbar, Alert, Chip, Stack } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import AvatarDisplay from './AvatarDisplay'
import EditProfileModal from './EditProfileModal'
import EditTagsModal from './EditTagsModal'


const ProfileHeader = ({ username, displayName, setDisplayName, bio, setBio, faculty, setFaculty, program, setProgram, gradYear, setGradYear, exchangeTerm, setExchangeTerm, exchangeCountry, setExchangeCountry, exchangeSchool, setExchangeSchool, uwVerified, firebase }) => {

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

    // AI used to help IMPROVE already made UI 
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
                <Grid item xs={12} sm={10} md={8} lg={7} sx={{ lg: { maxWidth: '735px' } }} minWidth={'680px'} maxWidth={'800px'}
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

                       
                        <Grid item xs sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <Stack spacing={1} alignItems="flex-start">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontWeight={700} fontSize={28} sx={{ color: '#1a1a1a' }}>
                                        {username}
                                    </Typography>
                                    {uwVerified && (
                                        <VerifiedIcon sx={{ color: '#0095f6', fontSize: 24 }} titleAccess="UW Verified" />
                                    )}
                                </Stack>

                                <Typography fontWeight={600} fontSize={16} sx={{ color: '#262626' }}>
                                    {displayName}
                                </Typography>

                                <Typography
                                    fontWeight={400}
                                    fontSize={15}
                                    sx={{
                                        color: '#262626',
                                        whiteSpace: 'pre-line',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.5,
                                        mt: 0.5
                                    }}
                                >
                                    {bio}
                                </Typography>
                            </Stack>
                        </Grid>


                        <Grid item xs={12}>
                            <Stack spacing={2.5} mt={1}>
                                {/* waterloo tags */}
                                <Stack spacing={1}>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            color: '#666',
                                            letterSpacing: '0.1em',
                                            lineHeight: 1,
                                            mb: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        WATERLOO
                                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#efefef' }} />
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={2}>
                                        {uwVerified && <Chip icon={<VerifiedIcon style={{ fontSize: 16, color: '#2E7D32' }} />} label="UW Verified" size="small" sx={{ bgcolor: '#edf7ed', color: '#1e4620', fontWeight: '600', border: '1px solid #c8e6c9' }} />}
                                        {faculty && <Chip label={faculty} size="small" sx={{ bgcolor: '#fffde7', color: '#5d4037', fontWeight: '600', border: '1px solid #fff59d' }} />}
                                        {program && <Chip label={program} size="small" sx={{ bgcolor: '#fce4ec', color: '#880e4f', fontWeight: '600', border: '1px solid #f8bbd0' }} />}
                                        {gradYear && <Chip label={`Class of ${gradYear}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#0d47a1', fontWeight: '600', border: '1px solid #bbdefb' }} />}
                                    </Stack>
                                </Stack>

                                {/* exchange */}
                                <Stack spacing={1}>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            color: '#666',
                                            letterSpacing: '0.1em',
                                            lineHeight: 1,
                                            mb: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        EXCHANGE
                                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#efefef' }} />
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {exchangeTerm && <Chip label={`${exchangeTerm} Exchange`} size="small" sx={{ bgcolor: '#f3e5f5', color: '#4a148c', fontWeight: '600', border: '1px solid #e1bee7' }} />}
                                        {exchangeCountry && <Chip label={exchangeCountry} size="small" sx={{ bgcolor: '#e0f2f1', color: '#004d40', fontWeight: '600', border: '1px solid #b2dfdb' }} />}
                                        {exchangeSchool && <Chip label={exchangeSchool} size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: '600', border: '1px solid #ffe0b2' }} />}
                                    </Stack>
                                </Stack>
                            </Stack>

                            {/* modal buttons */}
                            <Stack direction="row" spacing={1.5} mt={4}>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    id="edit-profile-button"
                                    sx={{
                                        bgcolor: 'rgb(244, 244, 244)',
                                        height: '38px',
                                        textTransform: 'none',
                                        color: '#000',
                                        border: '1px solid #efefef',
                                        ":hover": { bgcolor: '#efefef' },
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        borderRadius: '8px',
                                        boxShadow: 'none'
                                    }}
                                    onClick={() => setModalStatus(true)}>
                                    Edit Profile
                                </Button>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    id="edit-tags-button"
                                    sx={{
                                        bgcolor: 'rgb(244, 244, 244)',
                                        height: '38px',
                                        textTransform: 'none',
                                        color: '#000',
                                        border: '1px solid #efefef',
                                        ":hover": { bgcolor: '#efefef' },
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        borderRadius: '8px',
                                        boxShadow: 'none'
                                    }}
                                    onClick={() => setTagsModalStatus(true)}>
                                    {(faculty || program || gradYear || exchangeTerm) ? 'Edit Tags' : 'Add Tags'}
                                </Button>
                            </Stack>
                        </Grid>
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
