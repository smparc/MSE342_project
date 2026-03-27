import * as React from 'react'
import { Grid, Paper, IconButton, Rating, TextField, Typography, Button, Snackbar, Alert, Box, Stack, Collapse } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import AirplaneTicketOutlinedIcon from '@mui/icons-material/AirplaneTicketOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';

import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import CardTravelOutlinedIcon from '@mui/icons-material/CardTravelOutlined';
import DinnerDiningOutlinedIcon from '@mui/icons-material/DinnerDiningOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import AttractionsOutlinedIcon from '@mui/icons-material/AttractionsOutlined';

import { FirebaseContext, authFetch } from '../Firebase'

const UploadReviews = ({ username }) => {
    const firebase = React.useContext(FirebaseContext)
    const [openExpenses, setOpenExpenses] = React.useState(true)
    const [openRatings, setOpenRatings] = React.useState(true)
    const [saveSuccess, setSaveSuccess] = React.useState(false)
    const [saveError, setSaveError] = React.useState(false)

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSaveSuccess(false);
        setSaveError(false);
    };

    const expensesList = [
        { id: 'monthly-cost', label: 'Total Monthly Expenses', dbField: 'monthly_cost', icon: LocalAtmOutlinedIcon },
        { id: 'rent', label: 'Monthly Rent', dbField: 'rent_cost', icon: BedOutlinedIcon },
        { id: 'meal', label: 'Cost of Meal', dbField: 'meal_cost', icon: RestaurantOutlinedIcon },
        { id: 'coffee', label: 'Cup of Coffee', dbField: 'coffee_cost', icon: LocalCafeOutlinedIcon },
        { id: 'flight', label: 'Return Flight', dbField: 'flight_cost', icon: AirplaneTicketOutlinedIcon },
    ]

    const ratingsList = [
        { id: 'difficulty', label: 'School Difficulty', dbField: 'difficulty_rating', icon: SchoolOutlinedIcon },
        { id: 'safety', label: 'Safety', dbField: 'safety_rating', icon: HealthAndSafetyOutlinedIcon },
        { id: 'cleanliness', label: 'Cleanliness', dbField: 'cleanliness_rating', icon: CleaningServicesOutlinedIcon },
        { id: 'travel-opp', label: 'Travel Opportunities', dbField: 'travel_opp_rating', icon: CardTravelOutlinedIcon },
        { id: 'food', label: 'Food', dbField: 'food_rating', icon: DinnerDiningOutlinedIcon },
        { id: 'scenery', label: 'Scenery', dbField: 'scenery_rating', icon: LandscapeOutlinedIcon },
        { id: 'activities', label: "Leisure & Activities", dbField: 'activities_rating', icon: AttractionsOutlinedIcon }
    ]

    const [expenses, setExpenses] = React.useState({
        'monthly-cost': '',
        'rent': '',
        'meal': '',
        'coffee': '',
        'flight': ''
    })

    const [ratings, setRatings] = React.useState({
        'difficulty': 0,
        'safety': 0,
        'cleanliness': 0,
        'travel-opp': 0,
        'food': 0,
        'scenery': 0,
        'activities': 0
    })

    React.useEffect(() => {
        const fetchData = async () => {
            if (!username) return
            try {
                // Fetch expenses
                const expResponse = await fetch(`/api/users/${username}/expenses`)
                if (expResponse.ok) {
                    const expData = await expResponse.json()
                    setExpenses({
                        'monthly-cost': expData.monthly_cost ?? '',
                        'rent': expData.rent_cost ?? '',
                        'meal': expData.meal_cost ?? '',
                        'coffee': expData.coffee_cost ?? '',
                        'flight': expData.flight_cost ?? ''
                    })
                }

                // Fetch ratings
                const ratResponse = await fetch(`/api/users/${username}/ratings`)
                if (ratResponse.ok) {
                    const ratData = await ratResponse.json()
                    setRatings({
                        'difficulty': ratData.difficulty_rating ?? 0,
                        'safety': ratData.safety_rating ?? 0,
                        'cleanliness': ratData.cleanliness_rating ?? 0,
                        'travel-opp': ratData.travel_opp_rating ?? 0,
                        'food': ratData.food_rating ?? 0,
                        'scenery': ratData.scenery_rating ?? 0,
                        'activities': ratData.activities_rating ?? 0
                    })
                }
            } catch (error) {
                console.error('Error fetching reviews:', error)
            }
        }
        fetchData()
    }, [username])

    const handleSave = async () => {
        if (!username) return
        try {
            // Save expenses - ensure they are sent as numbers
            const expenseData = {}
            expensesList.forEach(item => {
                const value = expenses[item.id]
                expenseData[item.dbField] = value === '' ? null : Number(value)
            })
            await authFetch(`/api/users/${username}/expenses`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            }, firebase)

            // Save ratings
            const ratingData = {}
            ratingsList.forEach(item => {
                ratingData[item.dbField] = ratings[item.id]
            })
            await authFetch(`/api/users/${username}/ratings`, {
                method: 'PUT',
                body: JSON.stringify(ratingData)
            }, firebase)

            setSaveSuccess(true)
        } catch (error) {
            console.error('Error saving reviews:', error)
            setSaveError(true)
        }
    }

    // AI to help improve UI (UI was very similar before, this is just an improvement)
    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#f8fafc',
            '& fieldset': { borderWidth: '1.5px', borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
            '&.Mui-focused fieldset': { borderColor: '#1a1a2e' },
        },
        '& .MuiInputBase-input': {
            fontSize: '0.86rem',
            fontFamily: "'DM Sans', sans-serif",
            padding: '6px 10px',
        }
    };

    const headerStyle = {
        fontFamily: "'DM Serif Display', serif",
        fontSize: '1.45rem',
        color: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        gap: 1.2
    };

    const rowStyle = {
        py: 1.2,
        px: 2,
        borderRadius: '8px',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: '#f8fafc' },
        borderBottom: '1px solid #f1f5f9',
        alignItems: 'center'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#475569',
        fontFamily: "'DM Sans', sans-serif"
    };

    return (
        <>
            <Box sx={{ width: '100%', maxWidth: '1100px', mx: 'auto', px: 2 }}>
            <Grid container spacing={4}>
                {/* Expenses  */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: '1px solid #f1f5f9',
                        bgcolor: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography sx={headerStyle}>
                                <AttachMoneyIcon sx={{ color: '#1a1a2e', fontSize: '1.8rem' }} />
                                Expenses
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setOpenExpenses(!openExpenses)}
                                sx={{ transform: openExpenses ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
                            >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>

                        <Collapse in={openExpenses}>
                            <Stack>
                                {expensesList.map(item => (
                                    <Grid container key={item.id} sx={rowStyle} >
                                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} marginRight='30px'>
                                            <Box sx={{ color: '#64748b', display: 'flex', '& svg': { fontSize: '1.2rem' } }}>
                                                {<item.icon />}
                                            </Box>
                                            <Typography sx={labelStyle}>{item.label}</Typography>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                value={expenses[item.id]}
                                                onChange={(e) => setExpenses(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.85rem' } }}>$</InputAdornment>,
                                                }}
                                                sx={inputStyle}
                                                placeholder="0.00"
                                            />
                                        </Grid>
                                    </Grid>
                                ))}
                            </Stack>
                        </Collapse>
                    </Paper>
                </Grid>

                {/* Ratings  */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: '1px solid #f1f5f9',
                        bgcolor: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography sx={headerStyle}>
                                <StarIcon sx={{ color: '#fbbf24', fontSize: '1.8rem' }} />
                                Ratings
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setOpenRatings(!openRatings)}
                                sx={{ transform: openRatings ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
                            >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>

                        <Collapse in={openRatings}>
                            <Stack>
                                {ratingsList.map(item => (
                                    <Grid container key={item.id} sx={rowStyle}>
                                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ color: '#64748b', display: 'flex', '& svg': { fontSize: '1.2rem' } }}>
                                                {<item.icon />}
                                            </Box>
                                            <Typography sx={labelStyle}>{item.label}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Rating
                                                // size="large"
                                                name={item.id}
                                                precision={0.5}
                                                value={ratings[item.id]}
                                                onChange={(e, val) => setRatings(prev => ({ ...prev, [item.id]: val }))}
                                                sx={{ color: '#fbbf24' }}
                                            />
                                        </Grid>
                                    </Grid>
                                ))}
                            </Stack>
                        </Collapse>
                    </Paper>
                </Grid>

                {/* Save Section */}
                <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', pt: 2, pb: 4 }}>
                        <Button
                            // variant="contained"
                            variant="outlined"
                            onClick={handleSave}
                            // sx={{
                            //     fontFamily: "'DM Sans', sans-serif",
                            //     fontWeight: 700,
                            //     fontSize: '0.95rem',
                            //     bgcolor: '#1a1a2e',
                            //     color: '#fff',
                            //     borderRadius: '12px',
                            //     px: 10,
                            //     py: 1.5,
                            //     textTransform: 'none',
                            //     boxShadow: '0 10px 15px -3px rgba(26, 26, 46, 0.1)',
                            //     '&:hover': { bgcolor: '#2d2d52', boxShadow: '0 10px 15px -3px rgba(26, 26, 46, 0.2)' }
                            sx={{borderRadius: 2, border: '1px solid #3143E3', bgcolor: '#3143E3', color: '#ffff', fontWeight: '400', fontSize: '18px', ":hover": { bgcolor: 'white', color: '##4338CA', border: '1px solid ##4338CA'}
                            }}
                        >
                            Save Reviews
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={saveSuccess} autoHideDuration={3500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity='success' sx={{ borderRadius: '10px' }}>Reviews updated successfully!</Alert>
            </Snackbar>

            <Snackbar open={saveError} autoHideDuration={3500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity='error' sx={{ borderRadius: '10px' }}>Failed to update reviews.</Alert>
            </Snackbar>
        </Box>
        </>
    )

}

export default UploadReviews
