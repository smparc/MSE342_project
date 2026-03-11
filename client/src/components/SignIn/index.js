import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { withFirebase } from '../Firebase';
import { useNavigate } from 'react-router-dom';

const SignIn = ({ firebase }) => {
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [faculty, setFaculty] = useState('');
    const [program, setProgram] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [exchangeTerm, setExchangeTerm] = useState('');
    
    // UI state
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState(1); // 1 = account info, 2 = profile info
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    const handleNext = () => {
        setError(null);
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setError(null);
        setStep(1);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                // Create Firebase auth user
                const userCredential = await firebase.doCreateUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                const token = await user.getIdToken();

                // Create user in database with profile info
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
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to create user profile');
                }

                navigate('/');
            } else {
                // Sign in
                await firebase.doSignInWithEmailAndPassword(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsSignUp(!isSignUp);
        setStep(1);
        setError(null);
        setFaculty('');
        setProgram('');
        setGradYear('');
        setExchangeTerm('');
    };

    // Step 1: Account Information (Sign In or Sign Up basics)
    const renderStep1 = () => (
        <Paper
            elevation={6}
            sx={{
                p: 5,
                borderRadius: 3,
            }}
        >
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                textAlign="center"
            >
                WATExchange
            </Typography>
            <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 3 }}
                textAlign="center"
            >
                Connect with fellow exchange students and share your experiences
            </Typography>

            <form noValidate onSubmit={isSignUp ? (e) => { e.preventDefault(); handleNext(); } : onSubmit}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    <Typography
                        align="center"
                        color="error"
                        sx={{ mt: 2, p: 1 }}
                    >
                        {error.message || 'Email or password are incorrect'}
                    </Typography>
                )}

                <Button 
                    type="submit"
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    sx={{ 
                        mt: 3, 
                        mb: 2, 
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                    }}
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
                        {isSignUp 
                            ? 'Already have an account? Sign In' 
                            : "Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </form>
        </Paper>
    );

    // Step 2: Profile Information (Sign Up only)
    const renderStep2 = () => (
        <Paper
            elevation={6}
            sx={{
                p: 5,
                borderRadius: 3,
            }}
        >
            <Typography 
                variant="h5" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                textAlign="center"
            >
                Profile Information
            </Typography>
            <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 3 }}
                textAlign="center"
            >
                Help others find and connect with you (optional - you can add this later)
            </Typography>

            <form noValidate onSubmit={onSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="faculty"
                            label="Faculty"
                            name="faculty"
                            placeholder="e.g. Engineering"
                            value={faculty}
                            onChange={(e) => setFaculty(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="program"
                            label="Program"
                            name="program"
                            placeholder="e.g. MSCI"
                            value={program}
                            onChange={(e) => setProgram(e.target.value)}
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
                    <Typography
                        align="center"
                        color="error"
                        sx={{ mt: 2, p: 1 }}
                    >
                        {error.message || 'Something went wrong'}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button 
                        type="button"
                        fullWidth 
                        variant="outlined" 
                        color="primary"
                        onClick={handleBack}
                        disabled={loading}
                        sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Back
                    </Button>
                    <Button 
                        type="submit"
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                        sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                {step === 1 ? renderStep1() : renderStep2()}
            </Container>
        </Box>
    );
};

export default withFirebase(SignIn);