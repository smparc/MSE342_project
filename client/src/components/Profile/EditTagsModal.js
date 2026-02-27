import * as React from 'react';
import { Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';

const EditTagsModal = ({ open, handleClose, username, faculty, setFaculty, program, setProgram, gradYear, setGradYear, exchangeTerm, setExchangeTerm, displayName, bio, setProfileChanged }) => {

    const [tempFaculty, setTempFaculty] = React.useState(faculty)
    const [tempProgram, setTempProgram] = React.useState(program)
    const [tempGradYear, setTempGradYear] = React.useState(gradYear)
    const [tempExchangeTerm, setTempExchangeTerm] = React.useState(exchangeTerm)
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
        setTempFaculty(faculty)
        setTempProgram(program)
        setTempGradYear(gradYear)
        setTempExchangeTerm(exchangeTerm)
    }, [faculty, program, gradYear, exchangeTerm])

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!tempFaculty || !tempProgram || !tempGradYear || !tempExchangeTerm) {
            setError(true)
            return
        }
        setError(false)

        try {
            const response = await fetch(`/api/user/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: displayName,
                    bio: bio,
                    faculty: tempFaculty,
                    program: tempProgram,
                    grad_year: tempGradYear === '' ? null : tempGradYear,
                    exchange_term: tempExchangeTerm
                }),
            })
            const data = await response.json()
            if (data.success) {
                setFaculty(tempFaculty)
                setProgram(tempProgram)
                setGradYear(tempGradYear)
                setExchangeTerm(tempExchangeTerm)
                setProfileChanged(true)
                handleClose()
            }
        } catch (error) {
            console.error('Error updating profile tags:', error)
        }
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose}
                fullWidth={true}
                maxWidth={'sm'}>
                <DialogTitle textAlign={'center'} fontWeight={600} fontSize={'25px'}>Edit tags</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} id='edit-tags-modal'>
                        <Grid container
                            justifyContent={'center'}
                            alignItems={'center'}
                            direction={'column'}
                            py='20px'
                            px={'30px'}
                        >

                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='dense'
                                    id='edit-faculty-field'
                                    label="Faculty"
                                    value={tempFaculty}
                                    onChange={(event) => setTempFaculty(event.target.value)} />
                            </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='normal'
                                    id='edit-program-field'
                                    label="Program"
                                    value={tempProgram}
                                    onChange={(event) => setTempProgram(event.target.value)} />
                            </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='dense'
                                    id='edit-grad-year-field'
                                    label="Graduation Year"
                                    type="number"
                                    value={tempGradYear}
                                    onChange={(event) => setTempGradYear(event.target.value)} />
                            </Grid>
                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='normal'
                                    id='edit-exchange-term-field'
                                    label="Exchange Term"
                                    value={tempExchangeTerm}
                                    onChange={(event) => setTempExchangeTerm(event.target.value)} />
                            </Grid>
                        </Grid>
                    </form>
                    <Grid item>
                        {error && <Alert severity='error'>All entries must have a value. Please try again.</Alert>}
                    </Grid>
                </DialogContent>
                <DialogActions>

                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type='submit' form='edit-tags-modal'>Save Changes</Button>

                </DialogActions>
            </Dialog>

        </>
    )
}

export default EditTagsModal;
