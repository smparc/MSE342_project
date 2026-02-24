import * as React from 'react'
import { Grid, Box, Typography, Button, styled } from '@mui/material'
import camera from '../../images/camera-thin.svg'
import uploadicon from '../../images/upload-simple-light-color.svg'

const UploadContent = ({file, setFile}) => {

    const [fileUrl, setFileUrl] = React.useState('')

    console.log(file)

    const handleFileUpload = (event) => {
        event.preventDefault()
        
        const fileReader = new FileReader()
        fileReader.onload = () => {
            setFileUrl(fileReader.result)
        }
        fileReader.readAsDataURL(event.target.files[0])
    }
    console.log(fileUrl)


    const VisuallyHidddenInput = styled('input') ({
        clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            height: 1,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            left: 0,
            whiteSpace: 'nowrap',
            width: 1,
    })

    return (
        <>

            <Grid item>
                <Box component={'img'} src={camera} alt='camera' sx={{ width: '62px' }} />
            </Grid>
            <Grid item>
                <Typography fontSize={'30px'} fontWeight={800} textAlign={'center'}>Share Photos</Typography>
            </Grid>
            <Grid item>
                <Typography fontSize={'18px'} fontWeight={400} textAlign={'center'}>When you share photos, they will appear on your profile.</Typography>
            </Grid>
            {/* <Grid item>
                <Typography fontSize={'18px'} fontWeight={400} textAlign={'center'}>Share your first photo</Typography>
            </Grid> */}

            <Grid item>
            <Button component="label"
                role={undefined}
                variant="text"
                startIcon={<Box component={'img'} src={uploadicon} alt='upload-icon' />}
                sx={{textTransform: 'none', color: '#3143E3', fontWeight: '400', fontSize: '18px', ":hover": {bgcolor: '#FFFF'}}}
                // sx={{color: 'black', bgcolor: '#F0F2F5', ":hover": { bgcolor: '#E7EAEE' }, borderRadius: '12px', textTransform: 'none', fontSize: '17px'}}
            >
                Share your first photo
                <VisuallyHidddenInput type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    multiple/>
            </Button>
            </Grid>


        </>
    )
}

export default UploadContent