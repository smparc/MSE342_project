import * as React from 'react'
// import ProfileHeader from './ProfileHeader'
import { Box, Tabs, Tab } from '@mui/material'
import grid from '../../images/grid-four-light.svg'
import books from '../../images/book-bookmark-light.svg'
import star from '../../images/star-light.svg'

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
                sx={{ '& .Mui-selected': { filter: 'invert(50%) brightness(20%)' } }}
            >
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={grid} alt='grid'  />} aria-label="grid" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={books} alt='books' />} aria-label="books" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Box component='img' src={star} alt='star'  />} aria-label="star" />
            </Tabs>

        </>
    )
}

export default SectionTab