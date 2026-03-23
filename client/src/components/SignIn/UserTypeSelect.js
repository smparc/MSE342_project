import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

const USER_TYPES = [
    {
        id: 'current_exchange',
        label: 'Current Exchange Student',
        description: "I'm currently on exchange at Waterloo",
    },
    {
        id: 'prospective',
        label: 'Prospective Student',
        description: "I'm considering an exchange and exploring options",
    },
    {
        id: 'alumni',
        label: 'Alumni',
        description: "I've completed my exchange and want to share my experience",
    },
    {
        id: 'browsing',
        label: 'Just Browsing',
        description: "I'm exploring the community",
    },
];

const UserTypeSelect = ({ value, onChange, disabled }) => (
    <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
            What describes you best?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select your user type. You can change this later in settings.
        </Typography>
        <Grid container spacing={2}>
            {USER_TYPES.map((type) => (
                <Grid item xs={12} sm={6} key={type.id}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderColor: value === type.id ? 'primary.main' : 'divider',
                            borderWidth: value === type.id ? 2 : 1,
                            bgcolor: value === type.id ? 'action.selected' : 'background.paper',
                        }}
                    >
                        <CardActionArea
                            onClick={() => !disabled && onChange(type.id)}
                            disabled={disabled}
                        >
                            <CardContent sx={{ py: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    {type.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {type.description}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </Box>
);

export default UserTypeSelect;
export { USER_TYPES };
