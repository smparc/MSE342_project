import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography, Alert, Snackbar, Button, ImageList, ImageListItem, useMediaQuery, useTheme } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'
import CourseTable from './CourseTable'
import { FirebaseContext, authFetch } from '../Firebase'


const Profile = ({ currentUser, authUser }) => {

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMedium = useMediaQuery(theme.breakpoints.down('md'))
    const firebase = React.useContext(FirebaseContext)

    const cols = isSmall ? 1 : isMedium ? 2 : 3

    const [bio, setBio] = React.useState('')
    const [displayName, setDisplayName] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [faculty, setFaculty] = React.useState('')
    const [program, setProgram] = React.useState('')
    const [gradYear, setGradYear] = React.useState('')
    const [exchangeTerm, setExchangeTerm] = React.useState('')

    // Use authenticated user's identifier, fallback to prop or default
    const currentUsername = currentUser || authUser?.email?.split('@')[0] || 'john.doe'

    const [tabIndex, setTabIndex] = React.useState(0)
    const [posts, setPosts] = React.useState([])

    const fetchUserData = React.useCallback(async () => {
        try {
            const response = await fetch(`/api/user/${currentUsername}`)
            const data = await response.json()
            setDisplayName(data.display_name || '')
            setBio(data.bio || '')
            setUsername(data.username || '')
            setFaculty(data.faculty || '')
            setProgram(data.program || '')
            setGradYear(data.grad_year || '')
            setExchangeTerm(data.exchange_term || '')
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
                    <ProfileHeader
                        username={username}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        bio={bio}
                        setBio={setBio}
                        faculty={faculty}
                        setFaculty={setFaculty}
                        program={program}
                        setProgram={setProgram}
                        gradYear={gradYear}
                        setGradYear={setGradYear}
                        exchangeTerm={exchangeTerm}
                        setExchangeTerm={setExchangeTerm}
                        firebase={firebase}
                    />
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
                            currentUsername={currentUsername} firebase={firebase}
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