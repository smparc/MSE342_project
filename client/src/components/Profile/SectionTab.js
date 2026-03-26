import * as React from 'react'
// import ProfileHeader from './ProfileHeader'
import { Box, Tabs, Tab } from '@mui/material'
import { GridView, FolderSpecialOutlined, Star } from '@mui/icons-material'

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
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<GridView />} aria-label="grid" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<FolderSpecialOutlined />} aria-label="books" />
                <Tab disableRipple sx={{ marginX: '75px' }} icon={<Star />} aria-label="star" />
            </Tabs>

        </>
    )
}

export default SectionTab