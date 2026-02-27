import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography, Alert, Snackbar, Button, ImageList, ImageListItem, useMediaQuery, useTheme } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'
import CourseTable from './CourseTable'


const Profile = () => {

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMedium = useMediaQuery(theme.breakpoints.down('md'))

    const cols = isSmall ? 1 : isMedium ? 2 : 3

    const [bio, setBio] = React.useState('')
    const [displayName, setDisplayName] = React.useState('')
    const [username, setUsername] = React.useState('')

    const currentUsername = 'olga.vecht' // TODO: Replace with actual username from context or auth

    const [tabIndex, setTabIndex] = React.useState(0)
    const [posts, setPosts] = React.useState([])

    const fetchUserData = React.useCallback(async () => {
        try {
            const response = await fetch(`/api/user/${currentUsername}`)
            const data = await response.json()
            setDisplayName(data.display_name || '')
            setBio(data.bio || '')
            setUsername(data.username || '')
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }, [currentUsername])

    const fetchPosts = React.useCallback(async () => {
        try {
            const response = await fetch(`/api/posts/${currentUsername}`)
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }, [currentUsername])

    React.useEffect(() => {
        fetchUserData()
        fetchPosts()
    }, [fetchUserData, fetchPosts])


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
                        <UploadContent
                            fetchPosts={fetchPosts} posts={posts} cols={cols}
                        />
                    )}
                    {tabIndex === 1 && <CourseTable username={username} />}
                    {tabIndex === 2 && <Typography>This will display ratings</Typography>}
                </Grid>
            </Grid>

        </>
    )


}

export default Profile