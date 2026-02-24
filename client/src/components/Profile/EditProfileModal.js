import * as React from 'react';
import { Box, Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';


// skipping dialog content text for now

const EditProfileModal = ({ open, handleClose, displayName, setDisplayName, bio, setBio, username, profileChanged, setProfileChanged }) => {


    const [tempName, setTempName] = React.useState(displayName)
    const [tempBio, setTempBio] = React.useState(bio)

    const handleSubmit = (event) => {
        event.preventDefault()

        // can't change name unless form is submitted
        // name has to change in input field but not in display

        console.log('handle submit')
        console.log(displayName)
        console.log(bio)

        setDisplayName(tempName)
        setBio(tempBio)
        setProfileChanged(true)

        handleClose()
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
                                    onChange={(event) => setTempBio(event.target.value)} />
                            </Grid>
                        </Grid>
                    </form>
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