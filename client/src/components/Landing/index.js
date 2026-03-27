import React from 'react';
import course_screenshot from '../../images/course_screenshot.png'
import { useNavigate } from 'react-router-dom';

import { Typography, Button, Container, Box, CssBaseline, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const theme = {
  Typography: {
    fontFamily: "'DM Serif Display', sans-serif",
    h1: { fontWeight: 900, letterSpacing: '-0.05em' },
    h4: { fontWeight: 500 },
  },
  palette: {
    primary: {
      main: '#FB923D',
    },
    background: {
      default: '#FFFFFF',
    },
  },
};

function LandingPage() {
  const navigate = useNavigate()
  return (
    <>
      <CssBaseline />


      <Container
        maxWidth="100vh"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '100vh',
          // bgcolor: theme.palette.background.default,
          bgcolor: 'white',
          fontFamily: "'DM Serif Display', sans-serif",
          p: 0,
          fontSize: '40px'
        }}
      >

        <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          
          <Stack
            direction={{ xs: 'column', md: 'row' }} 
            spacing={6}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >

            
            <Box>
              <Typography sx={{ fontSize: '30px', fontWeight: 300, mb: 1 }}>Meet</Typography>
              <Typography sx={{ fontSize: '80px', fontWeight: 900,  background: 'linear-gradient(to right, #fb923c, #fb7185)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                WatExchange
              </Typography>
              <Typography sx={{ fontSize: '28px', mb: 2 }}>Plan your exchange term.</Typography>
              <Typography sx={{ fontSize: '18px', mb: 5, color: 'text.secondary' }}>
                This platform is for University of Waterloo students to plan, discover, and connect.
              </Typography>
              <Button variant="contained" 
                onClick={() => navigate('/SignIn')}
                size="large" sx={{
                borderRadius: '8px', px: 4, py: 1.5, bgcolor: theme.palette.primary.main,
                color: 'black',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                // borderRadius: '10px', 
                // px: 4,
                // py: 1.5,
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'white',
                  border: '0.5px solid #FB8C4A',
                  color: '#FB8C4A'
                }
              }}>
                Get started
              </Button>
            </Box>


            <Box
              component="img"
              src={course_screenshot}
              alt="Course Planning Screenshot"
              sx={{
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 40px 40px rgba(0,0,0,0.2)',
                border: '1px solid #e0e0e0'
              }}
            />

          </Stack>
        </Container>
      </Container>
    </>
  );
}

export default LandingPage;