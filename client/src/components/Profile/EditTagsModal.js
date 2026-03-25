import * as React from 'react';
import { Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, MenuItem } from '@mui/material';

const EditTagsModal = ({ open, handleClose, username, faculty, setFaculty, program, setProgram, gradYear, setGradYear, exchangeTerm, setExchangeTerm, exchangeCountry, setExchangeCountry, exchangeSchool, setExchangeSchool, displayName, bio, setProfileChanged, firebase }) => {

    const [tempFaculty, setTempFaculty] = React.useState(faculty)
    const [tempProgram, setTempProgram] = React.useState(program)
    const [tempGradYear, setTempGradYear] = React.useState(gradYear)
    const [tempExchangeTerm, setTempExchangeTerm] = React.useState(exchangeTerm)
    const [tempExchangeCountry, setTempExchangeCountry] = React.useState(exchangeCountry)
    const [tempExchangeSchool, setTempExchangeSchool] = React.useState(exchangeSchool)
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
        setTempFaculty(faculty)
        setTempProgram(program)
        setTempGradYear(gradYear)
        setTempExchangeTerm(exchangeTerm)
        setTempExchangeCountry(exchangeCountry)
        setTempExchangeSchool(exchangeSchool)
    }, [faculty, program, gradYear, exchangeTerm, exchangeCountry, exchangeSchool])

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!tempFaculty || !tempProgram || !tempGradYear || !tempExchangeTerm || !tempExchangeCountry || !tempExchangeSchool) {
            setError(true)
            return
        }
        setError(false)

        try {
            // Get ID token for authentication
            let headers = { 'Content-Type': 'application/json' }
            if (firebase && firebase.auth.currentUser) {
                const token = await firebase.auth.currentUser.getIdToken()
                headers.Authorization = token
            }
            
            const response = await fetch(`/api/user/${username}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    display_name: displayName,
                    bio: bio,
                    faculty: tempFaculty,
                    program: tempProgram,
                    grad_year: tempGradYear === '' ? null : tempGradYear,
                    exchange_term: tempExchangeTerm,
                    destination_country: tempExchangeCountry,
                    destination_school: tempExchangeSchool
                }),
            })
            const data = await response.json()
            if (data.success) {
                setFaculty(tempFaculty)
                setProgram(tempProgram)
                setGradYear(tempGradYear)
                setExchangeTerm(tempExchangeTerm)
                setExchangeCountry(tempExchangeCountry)
                setExchangeSchool(tempExchangeSchool)
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
                                    select
                                    required
                                    margin='dense'
                                    id='edit-faculty-field'
                                    label="Faculty"
                                    value={tempFaculty || ''}
                                    onChange={(event) => setTempFaculty(event.target.value)}>
                                        <MenuItem value={'Art'}>Art</MenuItem>
                                        <MenuItem value={'Engineering'}>Engineering</MenuItem>
                                        <MenuItem value={'Environment'}>Environment</MenuItem>
                                        <MenuItem value={'Health'}>Health</MenuItem>
                                        <MenuItem value={'Mathematics'}>Mathematics</MenuItem>
                                        <MenuItem value={'Science'}>Science</MenuItem>
                                </TextField>
                                        
                                {/* <FormControl fullWidth>
                                <InputLabel id='edit-faculty-field-label'>Faculty</InputLabel>
                                <Select fullWidth
                                    // margin='dense'
                                    labelId='edit-faculty-field-label'
                                    id='edit-faculty-field'
                                    label="Faculty"
                                    value={tempFaculty}
                                    onChange={(event) => setTempFaculty(event.target.value)}>
                                        <MenuItem value={'Art'}>Art</MenuItem>
                                        <MenuItem value={'Engineering'}>Engineering</MenuItem>
                                        <MenuItem value={'Environment'}>Environment</MenuItem>
                                        <MenuItem value={'Health'}>Health</MenuItem>
                                        <MenuItem value={'Mathematics'}>Mathematics</MenuItem>
                                        <MenuItem value={'Science'}>Science</MenuItem>
                                </Select>
                                </FormControl> */}
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

                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='normal'
                                    id='edit-exchange-country-field'
                                    label="Exchange Country"
                                    value={tempExchangeCountry}
                                    onChange={(event) => setTempExchangeCountry(event.target.value)} />
                            </Grid>

                            <Grid item width='100%'>
                                <TextField fullWidth
                                    required
                                    margin='normal'
                                    id='edit-exchange-school-field'
                                    label="Exchange School"
                                    value={tempExchangeSchool}
                                    onChange={(event) => setTempExchangeSchool(event.target.value)} />
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
