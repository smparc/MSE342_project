import * as React from 'react'
// import ProfileHeader from './ProfileHeader'
import { Box, Tabs, Tab } from '@mui/material'
import grid from '../../images/squares-four.png'
import books from '../../images/books.png'
import star from '../../images/star.png'

const SectionTab = ({ tabIndex, setTabIndex }) => {

    const handleChange = (event, newValue) => {
        setTabIndex(newValue)
        // console.log(newValue)
        // console.log(tabIndex)
    }
    // console.log(tabIndex)

    return (
        <>
            <Tabs centered
                value={tabIndex}
                onChange={handleChange}
                aria-label="profile-icon-tabs"
                TabIndicatorProps={{ sx: { background: 'black' } }}
                sx={{ '& .MuiTab-root': { filter: 'invert(50%) brightness(80%)' }, '& .Mui-selected': { filter: 'invert(50%) brightness(20%)' } }}
            >
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={grid} alt='grid' sx={{ width: '35px' }} />} aria-label="grid" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={books} alt='books' sx={{ width: '35px'}} />} aria-label="books" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={star} alt='star' sx={{ width: '33px'}} />} aria-label="star" />
            </Tabs>

        </>
    )
}

export default SectionTab