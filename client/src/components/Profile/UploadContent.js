import * as React from 'react'
import { Grid, Box, Typography, Button, styled, ImageList, ImageListItem, Modal } from '@mui/material'
import camera from '../../images/camera-thin.svg'
import uploadicon from '../../images/upload-simple-light-color.svg'

const UploadContent = ({ fetchPosts, posts, cols }) => {

    const [fileUrl, setFileUrl] = React.useState('')
    const [selectedPost, setSelectedPost] = React.useState(null)


    const handleFileUpload = async (event) => {
        event.preventDefault()
        const selectedFile = event.target.files[0]
        if (!selectedFile) return

        // Preview locally
        const fileReader = new FileReader()
        fileReader.onload = () => {
            setFileUrl(fileReader.result)
        }
        fileReader.readAsDataURL(selectedFile)

        // Upload to backend
        const formData = new FormData()
        formData.append('image', selectedFile)
        // TODO: Replace hardcoded userId with actual user data from context or auth
        formData.append('userId', 1)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            if (data.success) {
                console.log('Upload successful:', data.filePath)
                // Trigger re-fetch of posts
                if (fetchPosts) {
                    fetchPosts()
                }
            } else {
                console.error('Upload failed')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
        }
    }
    console.log(fileUrl)


    const VisuallyHidddenInput = styled('input')({
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
            {(!posts || posts.length === 0) && (
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
                </>
            )}

            <Grid item>
                <Button component="label"
                    role={undefined}
                    variant="outlined"
                    startIcon={<Box component={'img'} src={uploadicon} alt='upload-icon' />}
                    sx={{ marginTop: '20px', p: '10px', px: '20px', textTransform: 'none', borderRadius: 3, border: '1px solid #3143E3', color: '#3143E3', fontWeight: '400', fontSize: '18px', ":hover": { bgcolor: '#3143E3', color: 'white' } }}
                // sx={{color: 'black', bgcolor: '#F0F2F5', ":hover": { bgcolor: '#E7EAEE' }, borderRadius: '12px', textTransform: 'none', fontSize: '17px'}}
                >
                    {(!posts || posts.length === 0) ? 'Share your first photo' : 'Upload more photos'}
                    <VisuallyHidddenInput type='file'
                        accept='image/*'
                        onChange={handleFileUpload}
                        multiple />
                </Button>
            </Grid>

            {posts && posts.length > 0 && (
                <ImageList sx={{ width: '80%', maxWidth: '1000px', height: 'auto', mt: 4, px: 2 }} cols={cols} rowHeight={300} gap={12}>
                    {posts.map((post) => (
                        <ImageListItem key={post.id} sx={{ overflow: 'hidden', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
                            <img
                                src={`/${post.image_path}`}
                                alt={`Post ${post.id}`}
                                loading="lazy"
                                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            <Modal open={Boolean(selectedPost)} onClose={() => setSelectedPost(null)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'auto',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    outline: 'none',
                    borderRadius: '12px'
                }}>
                    {selectedPost && (
                        <img
                            src={`/${selectedPost.image_path}`}
                            alt={`Post ${selectedPost.id}`}
                            loading="lazy"
                            style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    )}
                </Box>
            </Modal>

        </>
    )
}

export default UploadContent