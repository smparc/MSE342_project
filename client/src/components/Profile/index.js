import * as React from 'react'
import ProfileHeader from './ProfileHeader'
import { Grid, Divider, Typography, Alert, Snackbar, Button, ImageList, ImageListItem, useMediaQuery, useTheme } from '@mui/material'
import SectionTab from './SectionTab'
import UploadContent from './UploadContent'
import CourseTable from './CourseTable'
import { FirebaseContext, authFetch } from '../Firebase'
import UploadReviews from './UploadReviews'


const Profile = ({ currentUser, authUser, viewUsername }) => {

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
    const [exchangeCountry, setExchangeCountry] = React.useState('')
    const [exchangeSchool, setExchangeSchool] = React.useState('')


    const [uwVerified, setUwVerified] = React.useState(false)

    // Use viewUsername when viewing another user, else current user
    const currentUsername = currentUser || authUser?.email?.split('@')[0] || 'john.doe'
    const profileUsername = viewUsername || currentUsername
    const isOwnProfile = !viewUsername || profileUsername === currentUsername

    const [tabIndex, setTabIndex] = React.useState(0)
    const [posts, setPosts] = React.useState([])

    const fetchUserData = React.useCallback(async () => {
        if (!profileUsername) return
        try {
            const response = await fetch(`/api/user/${profileUsername}`)
            if (!response.ok) {
                console.error('Failed to fetch user data:', response.status)
                return
            }
            const data = await response.json()
            setDisplayName(data.display_name || '')
            setBio(data.bio || '')
            setUsername(data.username || profileUsername)
            setFaculty(data.faculty || '')
            setProgram(data.program || '')
            setGradYear(data.grad_year || '')
            setExchangeTerm(data.exchange_term || '')
            // add exchange country and exchange term
            setExchangeCountry(data.destination_country)
            setExchangeSchool(data.destination_school)
            setUwVerified(!!data.uw_verified)
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }, [profileUsername])

    const fetchPosts = React.useCallback(async () => {
        if (!profileUsername) return
        try {
            const response = await fetch(`/api/posts/${profileUsername}`)
            if (!response.ok) {
                console.error('Failed to fetch posts:', response.status)
                setPosts([])
                return
            }
            const data = await response.json()
            setPosts(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching posts:', error)
            setPosts([])
        }
    }, [profileUsername])

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
                        exchangeCountry={exchangeCountry}
                        setExchangeCountry={setExchangeCountry}
                        exchangeSchool={exchangeSchool}
                        setExchangeSchool={setExchangeSchool}
                        uwVerified={uwVerified}
                        firebase={firebase}
                        isOwnProfile={isOwnProfile}
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
                            currentUsername={profileUsername}
                            firebase={firebase}
                            isOwnProfile={isOwnProfile}
                        />
                    )}
                    {tabIndex === 1 && <CourseTable username={username} />}
                    {tabIndex === 2 && <UploadReviews username={username} />}
                </Grid>
            </Grid>

        </>
    )


}

export default Profile