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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [faculty, setFaculty] = useState('');
    const [program, setProgram] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [exchangeTerm, setExchangeTerm] = useState('');
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                // Sign up: create Firebase user, then create database user
                if (!username.trim()) {
                    setError({ message: 'Username is required' });
                    setLoading(false);
                    return;
                }

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
        setError(null);
        setFaculty('');
        setProgram('');
        setGradYear('');
        setExchangeTerm('');
    };

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

                    <form noValidate onSubmit={onSubmit}>
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

                        {isSignUp && (
                            <>
                                <Typography 
                                    variant="subtitle2" 
                                    color="text.secondary" 
                                    sx={{ mt: 3, mb: 1 }}
                                >
                                    Profile Information (Optional)
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            id="faculty"
                                            label="Faculty"
                                            name="faculty"
                                            placeholder="e.g. Engineering"
                                            value={faculty}
                                            onChange={(e) => setFaculty(e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            id="program"
                                            label="Program"
                                            name="program"
                                            placeholder="e.g. MSCI"
                                            value={program}
                                            onChange={(e) => setProgram(e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
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
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            id="exchangeTerm"
                                            label="Exchange Term"
                                            name="exchangeTerm"
                                            placeholder="e.g. Fall 2025"
                                            value={exchangeTerm}
                                            onChange={(e) => setExchangeTerm(e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

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
                            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
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
            </Container>
        </Box>
    );
};

export default withFirebase(SignIn);