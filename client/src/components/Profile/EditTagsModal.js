import * as React from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, MenuItem, IconButton, Typography, Stack, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'

import { FACULTIES, getProgramsForFaculty } from '../../data/facultyPrograms'

const EditTagsModal = ({ open, handleClose, username, faculty, setFaculty, program, setProgram, gradYear, setGradYear, exchangeTerm, setExchangeTerm, exchangeCountry, setExchangeCountry, exchangeSchool, setExchangeSchool, displayName, bio, setProfileChanged, firebase }) => {

    const [tempFaculty, setTempFaculty] = React.useState(faculty)
    const [tempProgram, setTempProgram] = React.useState(program)
    const [tempGradYear, setTempGradYear] = React.useState(gradYear)
    const [tempExchangeTerm, setTempExchangeTerm] = React.useState(exchangeTerm)
    const [tempExchangeCountry, setTempExchangeCountry] = React.useState(exchangeCountry)
    const [tempExchangeSchool, setTempExchangeSchool] = React.useState(exchangeSchool)
    const [error, setError] = React.useState(false)

    const TERMS = ['3A', '3B', '4A', '4B']
    
    const labelStyle = {
        fontSize: '0.78rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: '#666',
        mb: 0.5,
        fontFamily: "'DM Sans', sans-serif"
    };

    // AI used to help match UI to other pages
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
            
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth={true}
            maxWidth={'sm'}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    p: '1rem',
                    position: 'relative'
                }
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    bgcolor: '#f0f0f5',
                    '&:hover': { bgcolor: '#e2e2e8' },
                    width: 28,
                    height: 28,
                }}
            >
                <CloseIcon sx={{ fontSize: '1rem', color: '#666' }} />
            </IconButton>

            <DialogTitle sx={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '20px',
                pb: 1,
                color: '#1a1a2e'
            }}>
                Edit Tags
            </DialogTitle>

            <DialogContent>
                <form onSubmit={handleSubmit} id='edit-tags-modal'>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        {/* waterloo form section */}
                        <Typography sx={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#1a1a2e',
                            bgcolor: '#f4f4f9',
                            p: '4px 10px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #1a1a2e'
                        }}>
                            WATERLOO DETAILS
                        </Typography>

                        <Box>
                            <Typography sx={labelStyle}>Faculty *</Typography>
                            <TextField
                                fullWidth
                                select
                                required
                                id='edit-faculty-field'
                                SelectProps={{ inputProps: { 'aria-label': 'Faculty' } }}
                                value={tempFaculty || ''}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => {
                                    setTempFaculty(event.target.value)
                                    setTempProgram('')
                                }}
                            >
                                {FACULTIES.map(f => (
                                    <MenuItem key={f} value={f}>{f}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box>
                            <Typography sx={labelStyle}>Program *</Typography>
                            <TextField
                                fullWidth
                                select
                                required
                                id='edit-program-field'
                                SelectProps={{ inputProps: { 'aria-label': 'Program' } }}
                                value={tempProgram}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => setTempProgram(event.target.value)}
                            >
                                {getProgramsForFaculty(tempFaculty).map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box>
                            <Typography sx={labelStyle}>Graduation Year *</Typography>
                            <TextField
                                fullWidth
                                required
                                id='edit-grad-year-field'
                                inputProps={{ 'aria-label': 'Graduation Year' }}
                                type="number"
                                value={tempGradYear}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => setTempGradYear(event.target.value)}
                            />
                        </Box>

                        {/* exchange form section */}
                        <Typography sx={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#1a1a2e',
                            bgcolor: '#f4f4f9',
                            p: '4px 10px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #6366f1',
                            mt: 2
                        }}>
                            EXCHANGE DETAILS
                        </Typography>

                        <Box>
                            <Typography sx={labelStyle}>Exchange Term *</Typography>
                            <TextField
                                fullWidth
                                select
                                required
                                id='edit-exchange-term-field'
                                SelectProps={{ inputProps: { 'aria-label': 'Exchange Term' } }}
                                value={tempExchangeTerm}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => setTempExchangeTerm(event.target.value)}
                            >
                                {TERMS.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box>
                            <Typography sx={labelStyle}>Exchange Country *</Typography>
                            <TextField
                                fullWidth
                                required
                                id='edit-exchange-country-field'
                                inputProps={{ 'aria-label': 'Exchange Country' }}
                                value={tempExchangeCountry}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => setTempExchangeCountry(event.target.value)}
                            />
                        </Box>

                        <Box>
                            <Typography sx={labelStyle}>Exchange School *</Typography>
                            <TextField
                                fullWidth
                                required
                                id='edit-exchange-school-field'
                                inputProps={{ 'aria-label': 'Exchange School' }}
                                value={tempExchangeSchool}
                                variant="outlined"
                                sx={inputStyle}
                                onChange={(event) => setTempExchangeSchool(event.target.value)}
                            />
                        </Box>
                    </Stack>
                    {error && <Alert severity='error' sx={{ mt: 2, borderRadius: '8px' }}>All entries must have a value.</Alert>}
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
                    form='edit-tags-modal'
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

export default EditTagsModal;
