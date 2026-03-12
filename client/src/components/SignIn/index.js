import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    const [success, setSuccess] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    // Steps: 1 = account info, 2 = email verification (optional), 3 = profile info
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [checkingVerification, setCheckingVerification] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

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

    const handleNextToVerification = async () => {
        setError(null);
        if (!validateStep1()) return;
        
        setLoading(true);
        try {
            // Create Firebase account first
            await firebase.doCreateUserWithEmailAndPassword(email, password);
            
            // Check if it's a UWaterloo email
            if (email.trim().toLowerCase().endsWith('@uwaterloo.ca')) {
                // Send verification email and go to verification step
                await firebase.doSendEmailVerification();
                setResendCooldown(60);
                setStep(2);
            } else {
                // Non-UW email, skip verification and go to profile step
                setStep(3);
            }
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleSkipVerification = () => {
        setError(null);
        setIsVerified(false);
        setStep(3);
    };

    const handleBack = () => {
        setError(null);
        if (step === 3) {
            // Can't go back from profile if we've already created the Firebase account
            // Just stay on step 3
        } else if (step === 2) {
            // Can't go back from verification - account already created
        } else {
            setStep(1);
        }
    };

    const handleResendVerification = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await firebase.doSendEmailVerification();
            setSuccess('Verification email sent! Check your inbox.');
            setResendCooldown(60);
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setError(null);
        setCheckingVerification(true);

        try {
            await firebase.auth.currentUser.reload();
            const user = firebase.auth.currentUser;

            if (user.emailVerified) {
                setIsVerified(true);
                setSuccess('Email verified! You now have the UW Verified badge.');
                // Move to profile step after short delay
                setTimeout(() => {
                    setStep(3);
                }, 1500);
            } else {
                setError({ message: 'Email not verified yet. Please check your inbox and click the verification link.' });
            }
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setCheckingVerification(false);
        }
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
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
                    uw_verified: isVerified,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create user profile');
            }

            navigate('/');
        } catch (err) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
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
            navigate('/');
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
        setIsVerified(false);
        setFaculty('');
        setProgram('');
        setGradYear('');
        setExchangeTerm('');
    };

    // Step 1: Account Information
    const renderStep1 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                WATExchange
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
                Connect with fellow exchange students and share your experiences
            </Typography>

            <form noValidate onSubmit={isSignUp ? (e) => { e.preventDefault(); handleNextToVerification(); } : onSignIn}>
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
                    helperText={isSignUp ? "Use your @uwaterloo.ca email to get verified" : ""}
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

    // Step 2: Email Verification (Optional)
    const renderStep2 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
                <EmailIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            </Box>
            
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                Verify Your UWaterloo Email
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                We've sent a verification link to:
            </Typography>
            
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 3, color: 'primary.main' }}>
                {email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Verify your email to get the "UW Verified" badge on your profile. This helps other students know you're a real UWaterloo student.
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error.message}
                </Alert>
            )}

            <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                onClick={handleCheckVerification}
                disabled={checkingVerification}
                startIcon={checkingVerification ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{ py: 1.5, mb: 2, textTransform: 'none', fontSize: '1rem' }}
            >
                {checkingVerification ? 'Checking...' : "I've Verified My Email"}
            </Button>

            <Button 
                fullWidth 
                variant="outlined" 
                color="primary"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                sx={{ py: 1.5, mb: 2, textTransform: 'none', fontSize: '1rem' }}
            >
                {resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}
            </Button>

            <Button 
                fullWidth 
                variant="text" 
                color="inherit"
                onClick={handleSkipVerification}
                sx={{ py: 1, textTransform: 'none', fontSize: '0.9rem', color: 'text.secondary' }}
            >
                Skip for now
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Didn't receive the email? Check your spam folder.
            </Typography>
        </Paper>
    );

    // Step 3: Profile Information
    const renderStep3 = () => (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
                Help others find and connect with you (optional - you can add this later)
            </Typography>

            {isVerified && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Your UWaterloo email has been verified! You'll have the "UW Verified" badge.
                </Alert>
            )}

            <form noValidate onSubmit={handleCreateAccount}>
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
                    sx={{ mt: 3, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                >
                    {loading ? 'Creating Account...' : 'Complete Sign Up'}
                </Button>
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
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </Container>
        </Box>
    );
};

export default withFirebase(SignIn);
