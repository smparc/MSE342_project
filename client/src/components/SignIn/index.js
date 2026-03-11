import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { withFirebase } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
const SignIn = ({ firebase }) => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const onSubmit = event => {
        event.preventDefault();
        firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                navigate('/');
            })
            .catch(error => {
                setError(error);
            });
    };
    const onChange = event => {
        const { name, value } = event.target;
        if (name === 'email') setEmail(value);
        else if (name === 'password') setPassword(value);
    };
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '100vh' }}
        >
            <Grid item>
                <Container maxWidth="xs">
                    <Typography variant={'h6'} component="div" style={{ margin: '20px 0' }}>
                        Sign In
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
                            InputLabelProps={{ shrink: true }}
                            value={email}
                            onChange={onChange}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            InputLabelProps={{ shrink: true }}
                            value={password}
                            onChange={onChange}
                        />
                        {error && (
                            <Typography
                                align="center"
                                style={{
                                    color: theme.palette.error.main,
                                    marginTop: theme.spacing(2),
                                    padding: theme.spacing(1),
                                }}
                            >
                                Email or password are incorrect
                            </Typography>
                        )}
                        <Button type="submit" fullWidth variant="contained" color="primary">
                            Sign In
                        </Button>
                    </form>
                </Container>
            </Grid>
        </Grid>
    );
};
export default withFirebase(SignIn);