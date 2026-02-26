import * as React from 'react'
import { Grid, Box, Typography, Button, styled, ImageList, ImageListItem, Modal, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import camera from '../../images/camera-thin.svg'
import uploadicon from '../../images/upload-simple-light-color.svg'

const UploadContent = ({ fetchPosts, posts, cols }) => {

    const [fileUrl, setFileUrl] = React.useState('')
    const [selectedPost, setSelectedPost] = React.useState(null)

    const handleNext = (e) => {
        e.stopPropagation();
        if (!selectedPost || !posts || posts.length <= 1) return;
        const currentIndex = posts.findIndex(post => post.photo_id === selectedPost.photo_id);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % posts.length;
        setSelectedPost(posts[nextIndex]);
    };

    const handlePrevious = (e) => {
        e.stopPropagation();
        if (!selectedPost || !posts || posts.length <= 1) return;
        const currentIndex = posts.findIndex(post => post.photo_id === selectedPost.photo_id);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
        setSelectedPost(posts[prevIndex]);
    };

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
        // TODO: Replace hardcoded username with actual user data from context or auth
        formData.append('username', 'olga.vecht')

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
                        <ImageListItem key={post.photo_id} sx={{ overflow: 'hidden', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
                            <img
                                src={`/${post.image_path}`}
                                alt={`Post ${post.photo_id}`}
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
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 2,
                    outline: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}>
                    {posts && posts.length > 1 && (
                        <IconButton
                            onClick={handlePrevious}
                            sx={{
                                flexShrink: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                    )}
                    
                    {selectedPost && (
                        <img
                            src={`/${selectedPost.image_path}`}
                            alt={`Post ${selectedPost.photo_id}`}
                            loading="lazy"
                            style={{ 
                                width: 'auto', 
                                height: 'auto', 
                                display: 'block', 
                                maxWidth: 'calc(95vw - 150px)', 
                                maxHeight: '85vh', 
                                objectFit: 'contain' 
                            }}
                        />
                    )}

                    {posts && posts.length > 1 && (
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                flexShrink: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    )}
                </Box>
            </Modal>

        </>
    )
}

export default UploadContent