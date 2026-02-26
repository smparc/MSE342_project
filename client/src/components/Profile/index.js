import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography, Alert, Snackbar, Button, ImageList, ImageListItem } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'
import CourseTable from './CourseTable'


const Profile = () => {

    const [bio, setBio] = React.useState('hi this is my bio \n feel free to reach out if you have any questions about exchange!')
    const [displayName, setDisplayName] = React.useState('John Doe')
    const username = "olga.vecht"

    const [tabIndex, setTabIndex] = React.useState(0)
    const [posts, setPosts] = React.useState([])

    const fetchPosts = React.useCallback(async () => {
        try {
            const response = await fetch('/api/posts/1') // Using hardcoded ID 1
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }, [])

    React.useEffect(() => {
        fetchPosts()
    }, [fetchPosts])


    return (
        <>

            <Grid container
                direction={'column'}
                alignItems={'center'}
                // justifyContent={'center'}
                sx={{ minHeight: '95vh' }}
            // rowGap={'20px'}
            >

                <Grid item>
                    <ProfileHeader username={username} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} />
                </Grid>

                <Grid item mt={'20px'} paddingTop={'20px'}>
                    <SectionTab tabIndex={tabIndex} setTabIndex={setTabIndex} />
                </Grid>

                <Grid item width={'75%'}>
                    <Divider variant="middle" />
                </Grid>

                <Grid container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    flexGrow={1}
                    rowSpacing={1.3}
                    sx={{ mt: 2, mb: 4 }}>
                    {tabIndex === 0 && (
                        <>
                            <UploadContent fetchPosts={fetchPosts} posts={posts} />
                            <ImageList sx={{ width: '80%', height: 'auto', mt: 4 }} cols={3} rowHeight={200} gap={8}>
                                {posts.map((post) => (
                                    <ImageListItem key={post.id}>
                                        <img
                                            src={`/${post.image_path}`}
                                            alt={`Post ${post.id}`}
                                            loading="lazy"
                                            style={{ height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </>
                    )}
                    {tabIndex === 1 && <CourseTable />}
                    {tabIndex === 2 && <Typography>This will display ratings</Typography>}
                </Grid>
            </Grid>

        </>
    )


}

export default Profile