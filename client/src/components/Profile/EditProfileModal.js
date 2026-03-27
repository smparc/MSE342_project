import * as React from 'react';
import { Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, IconButton, Typography, Stack, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'


// skipping dialog content text for now

const EditProfileModal = ({ open, handleClose, displayName, setDisplayName, bio, setBio, username, faculty, program, gradYear, exchangeTerm, setProfileChanged, firebase }) => {


    const [tempName, setTempName] = React.useState(displayName)
    const [tempBio, setTempBio] = React.useState(bio)
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            setTempName(displayName)
            setTempBio(bio)
            setError(false)
        }
    }, [open, displayName, bio])

    const handleSubmit = async (event) => {
        event.preventDefault()

        // if (!tempName.trim() || !tempBio.trim()) {
        //     setError(true)
        //     setTempName(displayName)
        //     setTempBio(bio)
        //     return
        // }
        // remove requirement for a value in bio (delete bio story)
        if (!tempName.trim()) {
            setError(true)
            setTempName(displayName)
            // setTempBio(bio)
            return
        
        }
        setError(false)

        try {
            // get ID token for authentication
            let headers = { 'Content-Type': 'application/json' }
            if (firebase && firebase.auth.currentUser) {
                const token = await firebase.auth.currentUser.getIdToken()
                headers.Authorization = token
            }
            
            const response = await fetch(`/api/user/${username}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    display_name: tempName,
                    bio: tempBio.trim(),
                    faculty: faculty.trim(),
                    program: program.trim(),
                    grad_year: gradYear === '' ? null : gradYear,
                    exchange_term: exchangeTerm
                }),
            })
            const data = await response.json()
            if (data.success) {
                setDisplayName(tempName)
                setBio(tempBio)
                setProfileChanged(true)
                handleClose()
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    // AI used to help match UI to other pages
    const labelStyle = {
        fontSize: '0.78rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: '#666',
        mb: 0.5,
        fontFamily: "'DM Sans', sans-serif"
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#fafafa',
            '& fieldset': {
                borderWidth: '2px',
                borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
                borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#1a1a2e',
            },
        },
        '& .MuiInputBase-input': {
            fontSize: '0.9rem',
            fontFamily: "'DM Sans', sans-serif",
            padding: '10px 14px',
        }
    };


    return (
        <>
            <Dialog open={open} onClose={handleClose}
                fullWidth={true}
                // maxWidth={'sm'}>
                // <DialogTitle textAlign={'center'} fontWeight={600} fontSize={'25px'}>Edit profile</DialogTitle>
                maxWidth={'sm'}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: '1rem',
                        position: 'relative'
                    }
                }}>
                    <IconButton 
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        bgcolor: '#f0f0f5',
                        '&.hover': {bgColor: '#e2e2e8'},
                        width: 28,
                        height: 28

                    }}><CloseIcon sx={{fontSize: '1rem', color: '#666'}} /></IconButton>

                <DialogTitle sx={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '20px',
                    pb: 1,
                    color: '#1a1a2e'
                }}>Edit Profile</DialogTitle>

                <DialogContent>
                    <form onSubmit={handleSubmit} id='edit-profile-modal'>
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Box>
                            <Typography sx={labelStyle}>User Name</Typography>
                            <TextField
                                fullWidth
                                disabled
                                value={username}
                                sx={inputStyle}
                            />
                                    
                            
                            {/* </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth */}
                            </Box>
                            <Box>
                            <Typography sx={labelStyle}>Display Name *</Typography>
                            <TextField
                                fullWidth
                                required
                                id='edit-display-name-field'
                                inputProps={{ 'aria-label': 'Display Name' }}
                                value={tempName}
                                onChange={(event) => setTempName(event.target.value)}
                                sx={inputStyle}
                            />
                        </Box><Box>
                            <Typography sx={labelStyle}>Bio</Typography>
                            <TextField
                                fullWidth
                                multiline
                                    // margin='dense'
                                    // minRows={2}
                                maxRows={5}
                                    // color='blue'
                                id='edit-bio-field'
                                    label="Bio"
                                value={tempBio}
                                inputProps={{ maxLength: 200, 'aria-label': 'Bio' }}
                                onChange={(event) => setTempBio(event.target.value)}
                                sx={inputStyle}
                            />
                        </Box>
                    </Stack>
                    {error && <Alert severity='error' sx={{ mt: 2, borderRadius: '8px' }}>Display name must have a value.</Alert>}
                </form>
            </DialogContent>

            <DialogActions sx={{ p: '20px 24px' }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        color: '#1a1a2e',
                        border: '2px solid #1a1a2e',
                        borderRadius: '8px',
                        px: 3,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#f0f0f8', border: '2px solid #1a1a2e' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type='submit'
                    form='edit-profile-modal'
                    variant="contained"
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        bgcolor: '#1a1a2e',
                        color: '#fff',
                        borderRadius: '8px',
                        px: 3,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#2d2d52', boxShadow: 'none' }
                    }}
                >
                    Save Changes
                </Button>
            </DialogActions>
            </Dialog>

        </>
    )
}

export default EditProfileModal