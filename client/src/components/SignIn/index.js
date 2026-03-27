import React, { useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { FACULTIES, getProgramsForFaculty } from '../../data/facultyPrograms';
import { withFirebase } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import UserTypeSelect from './UserTypeSelect';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';

const SignIn = ({ firebase, onSignupComplete }) => {
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [faculty, setFaculty] = useState('');
    const [program, setProgram] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [exchangeTerm, setExchangeTerm] = useState('');
    const [userType, setUserType] = useState('browsing');

    // UI state
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const programOptions = useMemo(() => getProgramsForFaculty(faculty), [faculty]);

    // Convert Firebase error codes to user-friendly messages
    const getErrorMessage = (error) => {
        const code = error.code || '';

        switch (code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password must be at least 6 characters';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            default:
                return error.message || 'Something went wrong. Please try again';
        }
    };

    const validateStep1 = () => {
        if (!email.trim()) {
            setError({ message: 'Email is required' });
            return false;
        }
        if (!password.trim()) {
            setError({ message: 'Password is required' });
            return false;
        }
        if (isSignUp && !username.trim()) {
            setError({ message: 'Username is required' });
            return false;
        }
        return true;
    };
    


    // Step 1 -> Step 2 (profile info): ensure email and username are not already in DB
    const handleNextToProfile = async (event) => {
        event.preventDefault();
        setError(null);
        if (!validateStep1()) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                email: email.trim(),
                username: username.trim(),
            });
            const res = await fetch(`/api/users/availability?${params}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Could not verify availability');
            }
            const parts = [];
            if (data.emailTaken) {
                parts.push('This email is already registered');
            }
            if (data.usernameTaken) {
                parts.push('This username is already taken');
            }
            if (parts.length > 0) {
                setError({ message: parts.join('. ') });
                return;
            }
            setStep(2);
        } catch (err) {
            setError({ message: err.message || 'Something went wrong. Please try again' });
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> Step 3 (user type)
    const handleNextToUserType = () => {
        setError(null);
        setStep(3);
    };

    // Step 3 -> Create account and redirect
    const handleCompleteSignUp = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const isUwEmail = email.trim().toLowerCase().endsWith('@uwaterloo.ca');

        try {
            await firebase.doCreateUserWithEmailAndPassword(email, password);
            const user = firebase.auth.currentUser;
            const token = await user.getIdToken();

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email,
                    display_name: username.trim(),
                    faculty: faculty.trim() || null,
                    program: program.trim() || null,
                    grad_year: gradYear ? parseInt(gradYear) : null,
                    exchange_term: exchangeTerm.trim() || null,
                    uw_verified: isUwEmail,
                    user_type: userType,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create user profile');
            }

            if (onSignupComplete) {
                onSignupComplete()
            }

            console.log('[SignIn] Sign-up complete! Letting PrivateRoute handle redirect.');
            // window.location.href = '/';
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    // Step 2 <- back to Step 1
    const handleBackToStep1 = () => {
        setError(null);
        setStep(1);
    };

    // Step 3 <- back to Step 2
    const handleBackToStep2 = () => {
        setError(null);
        setStep(2);
    };

    const onSignIn = async (event) => {
        event.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError({ message: 'Email is required to log in' });
            return;
        }
        if (!password.trim()) {
            setError({ message: 'Password is required to log in' });
            return;
        }

        setLoading(true);

        try {
            await firebase.doSignInWithEmailAndPassword(email, password);
            console.log('[SignIn] Sign-in complete! Letting PrivateRoute handle redirect.');
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsSignUp(!isSignUp);
        setStep(1);
        setError(null);
        setSuccess(null);
        setEmail('');
        setPassword('');
        setUsername('');
        setFaculty('');
        setProgram('');
        setGradYear('');
        setExchangeTerm('');
        setUserType('browsing');
    };

    // Step 1: Sign In / Sign Up form
    const renderStep1 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} textAlign="center">
                {isSignUp ? 'Join the UW exchange community' : 'Sign in to continue'}
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <form noValidate onSubmit={isSignUp ? handleNextToProfile : onSignIn}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText={isSignUp ? "Use @uwaterloo.ca to get the UW Verified badge" : ""}
                />

                {isSignUp && (
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        helperText="This will be your unique identifier"
                    />
                )}

                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <Typography align="center" color="error" sx={{ mt: 2, p: 1 }}>
                        {error.message}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                >
                    {loading ? 'Please wait...' : (isSignUp ? 'Next' : 'Sign In')}
                </Button>

                <Box textAlign="center">
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={resetForm}
                        sx={{ cursor: 'pointer' }}
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </form>
        </Paper>
    );

    // Step 2: Profile Information
    const renderStep2 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
                Help others find and connect with you (optional - you can add this later)
            </Typography>

            <form noValidate onSubmit={handleNextToUserType}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="signin-faculty-label">Faculty</InputLabel>
                            <Select
                                labelId="signin-faculty-label"
                                id="faculty"
                                name="faculty"
                                label="Faculty"
                                value={faculty}
                                onChange={(e) => {
                                    setFaculty(e.target.value);
                                    setProgram('');
                                }}
                            >
                                <MenuItem value="">
                                    <em>Optional — select faculty</em>
                                </MenuItem>
                                {FACULTIES.map((f) => (
                                    <MenuItem key={f} value={f}>
                                        {f}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            key={faculty || 'no-faculty'}
                            freeSolo
                            disabled={!faculty}
                            options={programOptions}
                            value={program}
                            onChange={(_, newValue) => setProgram(newValue ?? '')}
                            inputValue={program}
                            onInputChange={(_, newInput, reason) => {
                                if (reason === 'input' || reason === 'clear') {
                                    setProgram(newInput);
                                }
                            }}
                            filterOptions={(opts, state) => {
                                const q = state.inputValue.trim().toLowerCase();
                                if (!q) return opts;
                                return opts.filter((o) =>
                                    o.toLowerCase().includes(q)
                                );
                            }}
                            noOptionsText={
                                faculty
                                    ? 'No programs match — keep typing or enter your own'
                                    : 'Select a faculty first'
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Program"
                                    name="program"
                                    id="program"
                                    placeholder={faculty ? 'Search or type a program' : ''}
                                    helperText={
                                        faculty
                                            ? 'Type to filter the list; you can enter a program not listed'
                                            : ''
                                    }
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="gradYear"
                            label="Graduation Year"
                            name="gradYear"
                            type="number"
                            placeholder="e.g. 2026"
                            value={gradYear}
                            onChange={(e) => setGradYear(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="exchangeTerm"
                            label="Exchange Term"
                            name="exchangeTerm"
                            placeholder="e.g. Fall 2025"
                            value={exchangeTerm}
                            onChange={(e) => setExchangeTerm(e.target.value)}
                        />
                    </Grid>
                </Grid>

                {error && (
                    <Typography align="center" color="error" sx={{ mt: 2, p: 1 }}>
                        {error.message}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={handleBackToStep1}
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                    >
                        Next
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    // Step 3: User Type Selection
    const renderStep3 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                Tell us about yourself
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
                This helps personalize your experience
            </Typography>

            <form noValidate onSubmit={handleCompleteSignUp}>
                <UserTypeSelect
                    value={userType}
                    onChange={setUserType}
                    disabled={loading}
                />

                {error && (
                    <Typography align="center" color="error" sx={{ mt: 2, p: 1 }}>
                        {error.message}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={handleBackToStep2}
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                    >
                        {loading ? 'Please wait...' : 'Complete Sign Up'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle at center, rgb(152, 187, 234) 0%, ${theme.palette.background.default} 100%)`,
                py: 4,
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <AirplaneTicketIcon sx={{ fontSize: 32, color: 'navy' }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: 'navy' }}>
                    WatExchange
                </Typography>
            </Box>
            <Container maxWidth="sm">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </Container>
        </Box>
    );
};

export default withFirebase(SignIn);
