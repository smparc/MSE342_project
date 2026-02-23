import * as React from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// skipping dialog content text for now

const EditProfileModal = ({ open, handleClose, displayName, setDisplayName, bio, setBio, username }) => {

    // const [profileData, setProfileData] = {
    //     displayName: currName,
    //     bio: currBio
    // }

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

        handleClose()
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit profile</DialogTitle>
                    <DialogContent>

                        <form onSubmit={handleSubmit} id='edit-profile-modal'>
                            <TextField disabled
                                margin='dense'
                                id='user-name-field'
                                label='User Name'
                                value={username}
                                />

                            <TextField
                                autoFocus
                                required
                                // color='primary'
                                margin='dense'
                                id='edit-display-name-field'
                                label="Display Name"
                                value={tempName}
                                onChange={(event) => setTempName(event.target.value)} />
                            
                            <TextField
                                required
                                multiline
                                margin='dense'
                                maxRows={2}
                                // color='blue'
                                id='edit-bio-field'
                                label="Bio"
                                value={tempBio}
                                onChange={(event) => setTempBio(event.target.value)} />

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