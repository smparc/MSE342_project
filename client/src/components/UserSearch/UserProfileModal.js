import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import AvatarDisplay from '../Profile/AvatarDisplay';
import CourseTable from '../Profile/CourseTable';

const CHIP_STYLES = {
  uwVerified: { bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', fontWeight: '500' },
  faculty: { bgcolor: '#FFF9C4', color: '#827717', border: '1px solid #FFF176', fontWeight: '500' },
  program: { bgcolor: '#FCE4EC', color: '#C2185B', border: '1px solid #F8BBD0', fontWeight: '500' },
  gradYear: { bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontWeight: '500' },
  exchangeTerm: { bgcolor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB', fontWeight: '500' },
};

const TAG_LABELS = { program: 'Program', year: 'Year', country: 'Country', school: 'School', term: 'Term' };

const UserProfileModal = ({ open, onClose, user, currentUsername, authFetch, firebase }) => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [posts, setPosts] = React.useState([]);
  const [postsLoading, setPostsLoading] = React.useState(false);
  const [expenses, setExpenses] = React.useState(null);
  const [ratings, setRatings] = React.useState(null);
  const [expensesRatingsLoading, setExpensesRatingsLoading] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [messageLoading, setMessageLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !user?.username) return;
    setTabIndex(0);
    setSelectedPost(null);
    setExpenses(null);
    setRatings(null);
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(user.username)}`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [open, user?.username]);

  React.useEffect(() => {
    if (!open || !user?.username || tabIndex !== 2) return;
    setExpensesRatingsLoading(true);
    Promise.all([
      fetch(`/api/users/${user.username}/expenses`).then((r) => r.ok ? r.json() : {}),
      fetch(`/api/users/${user.username}/ratings`).then((r) => r.ok ? r.json() : {}),
    ])
      .then(([expData, ratData]) => {
        setExpenses(expData);
        setRatings(ratData);
      })
      .catch(() => {
        setExpenses({});
        setRatings({});
      })
      .finally(() => setExpensesRatingsLoading(false));
  }, [open, user?.username, tabIndex]);

  if (!user) return null;

  if (user.username === currentUsername) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          <Typography variant="h6">Your Profile</Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            View and edit your profile on the Profile page.
          </Typography>
          <Button variant="contained" onClick={() => { onClose(); navigate('/profile'); }}>
            Go to Profile
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const {
    username,
    display_name,
    bio,
    faculty,
    program,
    grad_year,
    exchange_term,
    uw_verified,
    tags = [],
  } = user;
  const displayName = display_name || username || 'Unknown';

  const handleMessage = async () => {
    if (!currentUsername || !authFetch || !firebase || !username) return;
    if (username === currentUsername) return;
    setMessageLoading(true);
    try {
      const response = await authFetch(
        `/api/conversations?username=${encodeURIComponent(currentUsername)}`,
        {
          method: 'POST',
          body: JSON.stringify({ targetUsername: username }),
        },
        firebase
      );
      const data = await response.json();
      if (response.ok) {
        onClose();
        navigate('/messages', { state: { openConversationId: data.id, senderName: data.senderName } });
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    } finally {
      setMessageLoading(false);
    }
  };

  const profileTags = [];
  if (uw_verified) profileTags.push(<Chip key="uwVerified" label="UW Verified" size="small" sx={CHIP_STYLES.uwVerified} />);
  if (faculty) profileTags.push(<Chip key="faculty" label={faculty} size="small" sx={CHIP_STYLES.faculty} />);
  if (program) profileTags.push(<Chip key="program" label={program} size="small" sx={CHIP_STYLES.program} />);
  if (grad_year) profileTags.push(<Chip key="gradYear" label={`Class of ${grad_year}`} size="small" sx={CHIP_STYLES.gradYear} />);
  if (exchange_term) profileTags.push(<Chip key="exchangeTerm" label={`${exchange_term} Exchange`} size="small" sx={CHIP_STYLES.exchangeTerm} />);
  const shownTypes = new Set(['program', 'year', 'term']);
  if (faculty) shownTypes.add('faculty');
  tags.filter((t) => !shownTypes.has(t.tag_type)).forEach((t) => {
    profileTags.push(
      <Chip
        key={`${t.tag_type}-${t.tag_value}`}
        label={`${TAG_LABELS[t.tag_type] || t.tag_type}: ${t.tag_value}`}
        size="small"
        variant="outlined"
        sx={{ borderColor: 'divider', fontWeight: 500 }}
      />
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography variant="h6">{displayName}&apos;s Profile</Typography>
        <IconButton onClick={onClose} aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 120, height: 120 }}>
            <AvatarDisplay name={displayName || '?'} />
          </Box>
          <Typography fontWeight={700} fontSize={20}>
            @{username}
          </Typography>
          {bio && (
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
              {bio}
            </Typography>
          )}
          {profileTags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap justifyContent="center">
              {profileTags}
            </Stack>
          )}

          {username !== currentUsername && (
            <Button
              variant="contained"
              startIcon={messageLoading ? <CircularProgress size={16} color="inherit" /> : <ChatIcon />}
              onClick={handleMessage}
              disabled={messageLoading}
              sx={{ mt: 1 }}
            >
              Message
            </Button>
          )}

          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ width: '100%', mt: 2 }}>
            <Tab label="Photos" />
            <Tab label="Courses" />
            <Tab label="Expenses & Ratings" />
          </Tabs>

          {tabIndex === 0 && (
            <Box sx={{ width: '100%', minHeight: 120 }}>
              {postsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : posts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No photos yet.
                </Typography>
              ) : (
                <ImageList cols={3} gap={8} sx={{ width: '100%', m: 0 }}>
                  {posts.map((post) => (
                    <ImageListItem
                      key={post.photo_id}
                      sx={{ cursor: 'pointer', borderRadius: 1, overflow: 'hidden' }}
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={`/${post.image_path}`}
                        alt=""
                        loading="lazy"
                        style={{ aspectRatio: 1, objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <CourseTable username={username} readOnly />
            </Box>
          )}

          {tabIndex === 2 && (
            <Box sx={{ width: '100%', mt: 1 }}>
              {expensesRatingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography fontWeight={700} sx={{ mb: 1.5 }}>Expenses</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Item</strong></TableCell>
                            <TableCell align="right"><strong>Cost</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { label: 'Total Monthly', field: 'monthly_cost' },
                            { label: 'Monthly Rent', field: 'rent_cost' },
                            { label: 'Cost of Meal', field: 'meal_cost' },
                            { label: 'Cup of Coffee', field: 'coffee_cost' },
                            { label: '2-Way Flight', field: 'flight_cost' },
                          ].map(({ label, field }) => {
                            const val = expenses?.[field];
                            return (
                              <TableRow key={field}>
                                <TableCell>{label}</TableCell>
                                <TableCell align="right">{val != null && val !== '' ? `$${val}` : '—'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography fontWeight={700} sx={{ mb: 1.5 }}>Ratings</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Item</strong></TableCell>
                            <TableCell align="center"><strong>Rating</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { label: 'School Difficulty', field: 'difficulty_rating' },
                            { label: 'Safety', field: 'safety_rating' },
                            { label: 'Cleanliness', field: 'cleanliness_rating' },
                            { label: 'Travel Opportunities', field: 'travel_opp_rating' },
                            { label: 'Food', field: 'food_rating' },
                            { label: 'Scenery', field: 'scenery_rating' },
                            { label: 'Leisure & Activities', field: 'activities_rating' },
                          ].map(({ label, field }) => {
                            const val = ratings?.[field];
                            return (
                              <TableRow key={field}>
                                <TableCell>{label}</TableCell>
                                <TableCell align="center">
                                  {val != null && val > 0 ? <Rating value={Number(val)} readOnly size="small" /> : '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <Box
          onClick={() => setSelectedPost(null)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          {selectedPost && (
            <img
              src={`/${selectedPost.image_path}`}
              alt=""
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </Dialog>
  );
};

export default UserProfileModal;
