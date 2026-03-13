import * as React from 'react'
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Rating, Input, Slider, Typography, TextField } from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';



const UploadReviews = () => {

    const [openExpenses, setOpenExpenses] = React.useState(true)
    const [openRatings, setOpenRatings] = React.useState(true)
    // const NUM = [1, 2, 3, 4, 5, 6, 7, 8, 9]


    const expensesList =[
        {id: 'monthly-cost', label: 'Total Monthly Expenses'},
        {id: 'rent', label: 'Monthly Rent'},
        {id: 'meal', label: 'Cost of Meal'},
        {id: 'coffee', label: 'Cup of Coffee'},
        {id: 'flight', label: '2-Way Flight (Canada - Exchange Destination)'},
    ]


    const ratingsList = [
        {id: 'difficulty', label: 'School Difficulty'},
        {id: 'safety', label: 'Safety'},
        {id: 'cleanliness', label: 'Cleanliness'},
        {id: 'travel-opp', label: 'Travel Opportunities'},
        {id: 'food', label: 'Food'},
        {id: 'scenery', label: 'Scenery'},
        {id: 'actitivies', label: "Leisure & Activities"}
    ]

    const [expenses, setExpenses] = React.useState({
        'monthly-cost': null,
        'rent': null,
        'meal': null,
        'coffee': null,
        'flight': null
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

    console.log(expenses['monthly-cost'])
    console.log(ratings['difficulty'])


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
                        <IconButton onClick={() => setOpenExpenses(!openExpenses)} sx={{p: 0, m: 0, fontWeight: '800', color: '#3143E3', fontSize: '60px'}}><KeyboardArrowDownIcon /></IconButton>
                    </Grid>
                </Grid>
            
            
            {/* <Paper elevation={3} sx={{ p: 3, px: 5, borderRadius: 3 }}> */}
            {openExpenses &&
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align={'left'}><strong>Item</strong></TableCell>
                                <TableCell align={'center'} color= '#3143E3'><strong>Average Cost</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expensesList.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell align={'left'}><Typography fontSize={'15px'}>{row.label}</Typography></TableCell>
                                    {/* <TableCell align={'center'}>hi</TableCell> */}
                                    <TableCell align={'center'}>
                                        <Input 
                                         
                                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                        value={expenses[row.id]}
                                        error={isNaN(expenses[row.id])}
                                        onChange={(event) => {
                                            // if (event.target.value in NUM) {}
                                            setExpenses(prev => ({...prev, [row.id]: event.target.value}));
                                        }}
                                        >
                                        </Input>
                                        </TableCell>
                                    {/* <TextField id="outlined-basic" label="Outlined" variant="outlined" /> */}
                                    
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
                        <IconButton size='large' onClick={() => setOpenRatings(!openRatings)} sx={{p: 0, m: 0, fontWeight: '800', color: '#3143E3', fontSize: '80px'}}><KeyboardArrowDownIcon /></IconButton>
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
                                            setRatings(prev => ({...prev, [row.id]: newValue}));
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
            </Grid>
        </>
    )

}

export default UploadReviews