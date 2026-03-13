import * as React from 'react'
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Rating, Input, Typography, Button, Snackbar, Alert } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import { authFetch } from '../Firebase'

const UploadReviews = ({ username }) => {

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
        { id: 'monthly-cost', label: 'Total Monthly Expenses', dbField: 'monthly_cost' },
        { id: 'rent', label: 'Monthly Rent', dbField: 'rent_cost' },
        { id: 'meal', label: 'Cost of Meal', dbField: 'meal_cost' },
        { id: 'coffee', label: 'Cup of Coffee', dbField: 'coffee_cost' },
        { id: 'flight', label: '2-Way Flight (Canada - Exchange Destination)', dbField: 'flight_cost' },
    ]

    const ratingsList = [
        { id: 'difficulty', label: 'School Difficulty', dbField: 'difficulty_rating' },
        { id: 'safety', label: 'Safety', dbField: 'safety_rating' },
        { id: 'cleanliness', label: 'Cleanliness', dbField: 'cleanliness_rating' },
        { id: 'travel-opp', label: 'Travel Opportunities', dbField: 'travel_opp_rating' },
        { id: 'food', label: 'Food', dbField: 'food_rating' },
        { id: 'scenery', label: 'Scenery', dbField: 'scenery_rating' },
        { id: 'activities', label: "Leisure & Activities", dbField: 'activities_rating' }
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
            })

            // Save ratings
            const ratingData = {}
            ratingsList.forEach(item => {
                ratingData[item.dbField] = ratings[item.id]
            })
            await authFetch(`/api/users/${username}/ratings`, {
                method: 'PUT',
                body: JSON.stringify(ratingData)
            })

            setSaveSuccess(true)
        } catch (error) {
            console.error('Error saving reviews:', error)
            setSaveError(true)
        }
    }

    return (
        <>
            <Grid container alignItems={'center'} justifyContent={'center'} rowGap={4}>
                <Grid item xs={11} md={9} lg={6.5}>
                    <Paper elevation={3} sx={{ p: 3, px: 5, borderRadius: 3 }}>
                        <Grid container justifyContent={'space-between'} px={'11px'}>
                            <Grid item>
                                <Typography fontWeight={800} textAlign={'center'}>Expenses</Typography>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={() => setOpenExpenses(!openExpenses)} sx={{ p: 0, m: 0, fontWeight: '800', color: '#3143E3', fontSize: '60px' }}><KeyboardArrowDownIcon /></IconButton>
                            </Grid>
                        </Grid>

                        {openExpenses &&
                            <TableContainer>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align={'left'}><strong>Item</strong></TableCell>
                                            <TableCell align={'center'}><strong>Average Cost</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {expensesList.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell align={'left'}><Typography fontSize={'15px'}>{row.label}</Typography></TableCell>
                                                <TableCell align={'center'}>
                                                    <Input
                                                        type="number"
                                                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                                        value={expenses[row.id]}
                                                        error={isNaN(expenses[row.id])}
                                                        onChange={(event) => {
                                                            setExpenses(prev => ({ ...prev, [row.id]: event.target.value }));
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
                    </Paper>
                </Grid>

                <Grid item xs={11} md={9} lg={6.5}>
                    <Paper elevation={3} sx={{ p: 3, px: 5, borderRadius: 3 }}>
                        <Grid container justifyContent={'space-between'} px={'11px'}>
                            <Grid item>
                                <Typography fontWeight={800} textAlign={'center'}>Ratings</Typography>
                            </Grid>
                            <Grid item>
                                <IconButton size='large' onClick={() => setOpenRatings(!openRatings)} sx={{ p: 0, m: 0, fontWeight: '800', color: '#3143E3', fontSize: '80px' }}><KeyboardArrowDownIcon /></IconButton>
                            </Grid>
                        </Grid>

                        {openRatings &&
                            <TableContainer>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align={'left'}><strong>Item</strong></TableCell>
                                            <TableCell align={'center'}><strong>Rating</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ratingsList.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell align={'left'}><Typography fontSize={'15px'}>{row.label}</Typography></TableCell>
                                                <TableCell align={'center'}><Rating
                                                    precision={0.5}
                                                    name={row.id}
                                                    value={ratings[row.id]}
                                                    onChange={(event, newValue) => {
                                                        setRatings(prev => ({ ...prev, [row.id]: newValue }));
                                                    }}
                                                />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
                    </Paper>
                </Grid>

                <Grid item xs={11} md={9} lg={6.5} textAlign={'center'}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#3143E3',
                            borderRadius: '10px',
                            px: 5,
                            py: 1.5,
                            fontWeight: 700,
                            '&:hover': {
                                backgroundColor: '#2635B5'
                            }
                        }}
                        onClick={handleSave}
                    >
                        Save Reviews
                    </Button>
                </Grid>
            </Grid>

            <Snackbar open={saveSuccess} autoHideDuration={3500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity='success'>Reviews updated successfully!</Alert>
            </Snackbar>

            <Snackbar open={saveError} autoHideDuration={3500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity='error'>Failed to update reviews.</Alert>
            </Snackbar>
        </>
    )

}

export default UploadReviews
