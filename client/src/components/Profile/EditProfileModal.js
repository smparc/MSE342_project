import * as React from 'react';
import { Box, Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';


// skipping dialog content text for now

const EditProfileModal = ({ open, handleClose, displayName, setDisplayName, bio, setBio, username, profileChanged, setProfileChanged }) => {


    const [tempName, setTempName] = React.useState(displayName)
    const [tempBio, setTempBio] = React.useState(bio)
    const [error, setError] = React.useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!tempName.trim() || !tempBio.trim()) { 
            setError(true)
            setTempName(displayName)
            setTempBio(bio)
            return
        } 
        setError(false)

        try {
            const response = await fetch('/api/user/1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: tempName,
                    bio: tempBio
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


    return (
        <>
            <Dialog open={open} onClose={handleClose}
                fullWidth={true}
                maxWidth={'sm'}>
                <DialogTitle textAlign={'center'} fontWeight={600} fontSize={'25px'}>Edit profile</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} id='edit-profile-modal'>
                        <Grid container 
                            justifyContent={'center'}
                            alignItems={'center'}
                            direction={'column'}
                            py= '20px'
                            px={'30px'}
                            >

                            <Grid item width='100%'>
                                <TextField fullWidth disabled
                                    margin='dense'
                                    id='user-name-field'
                                    label='User Name'
                                    value={username}
                                />
                            </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    // color='primary'
                                    margin='normal'
                                    id='edit-display-name-field'
                                    label="Display Name"
                                    value={tempName}
                                    onChange={(event) => setTempName(event.target.value)} />
                            </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    multiline
                                    margin='dense'
                                    minRows={2}
                                    maxRows={5}
                                    // color='blue'
                                    id='edit-bio-field'
                                    label="Bio"
                                    value={tempBio}
                                    inputProps={{maxLength: 200}}
                                    onChange={(event) => setTempBio(event.target.value)} />
                            </Grid>
                        </Grid>
                    </form>
                    <Grid item>
                    {error && <Alert severity='error'>All entries must have a value. Please try again.</Alert>}
                    </Grid>
                </DialogContent>
                <DialogActions>

                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type='submit' form='edit-profile-modal'>Save Changes</Button>

                </DialogActions>
            </Dialog>

        </>
    )
}

export default EditProfileModal