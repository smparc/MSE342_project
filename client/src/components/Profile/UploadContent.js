import * as React from 'react'
import { Grid, Box, Typography } from '@mui/material'
import camera from '../../images/camera-thin.svg'

const UploadContent = () => {


    return (
        <>
        

            <Grid item>
            <Box component={'img'} src={camera} alt='camera' sx={{width: '62px'}}/>
            </Grid>
            <Grid item>
            <Typography fontSize={'30px'} fontWeight={800} textAlign={'center'}>Share Photos</Typography>
            </Grid>
            <Grid item>
            <Typography fontSize={'18px'} fontWeight={400} textAlign={'center'}>When you share photos, they will appear on your profile.</Typography>
            </Grid>
            <Grid item>
            <Typography fontSize={'18px'} fontWeight={400} textAlign={'center'}>Share your first photo</Typography>
            </Grid>
        
        
        
        </>
    )
}

export default UploadContent