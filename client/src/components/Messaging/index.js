import * as React from 'react';
import ReviewTitle from './ReviewTitle';
import ReviewBody from './ReviewBody';
import ReviewRating from './ReviewRating';
import MovieSelection from './MovieSelection';
import NavBar from '../App/NavBar';
//import all necessary libraries here, e.g., Material-UI Typography, as follows
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles';

const Messaging = () => {
  const theme = useTheme();

  //states declarations
  const [movies, setMovies] = React.useState([]);
  
  const[selectedMovie, setSelectedMovie] = React.useState('');
  const[error, setError] = React.useState(false);

  const [enteredTitle, setEnteredTitle] = React.useState('')
  const [enteredReview, setEnteredReview] = React.useState('')
  const [selectedRating, setSelectedRating] = React.useState('')

  const[titleError, setTitleError] = React.useState(false);
  const[reviewError, setReviewError] = React.useState(false);
  const[ratingError, setRatingError] = React.useState(false);

  const[hasError, setHasError] = React.useState(true);

  const[loading, setLoading]= React.useState(true);

  const[userID, setUserID] = React.useState(1);

    // load movie records from database
  React.useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async() =>{
    try{
      const response = await fetch('/api/movies');
      const data = await response.json();
      console.log('Movies loaded:', data);
      setMovies(data);
      setLoading(false);
    }catch(error){
      console.error('Error loading movies:', error);
      setLoading(false);
    }
  }
    
  const handleChange = (event) => {
    setSelectedMovie(event.target.value);
    setError(false);
  };

  const handleTitleChange = (event) =>{
    setEnteredTitle(event.target.value);
    setTitleError(false);
  };

  const handleReviewChange = (event) =>{
    setEnteredReview(event.target.value);
    setReviewError(false);
  };

  const handleRatingChange = (event) =>{
    setSelectedRating(event.target.value);
    setRatingError(false);
  };


  const handleSubmit = async (event) => {
    let hasError = false;
    if(!selectedMovie){
      setError(true);
      hasError = true;
    }else{
      setError(false);
    }

    if(!enteredTitle){
      setTitleError(true);
      hasError = true;
    }else{
      setTitleError(false);
    }

    if(!enteredReview){
      setReviewError(true);
      hasError = true;
    }else{
      setReviewError(false);
    }

    if(!selectedRating){
      setRatingError(true);
      hasError = true;
    }else{
      setRatingError(false);
    }
    console.log('Submitted')

    if(!hasError){
      setHasError(false);
      const selectedMovieObj = movies.find(movie => movie.name === selectedMovie);
      const selectedMovieID = selectedMovieObj ? selectedMovieObj.id : null;

      const reviewData = {
        movieID: selectedMovieID,
        userID: userID,
        reviewTitle: enteredTitle,
        reviewContent: enteredReview, 
        reviewScore: selectedRating
      }

      console.log(reviewData);
      try{
        const response = await fetch('/api/reviews', {
          method: 'POST', 
          headers:{
            'Content-Type': 'application/json',
          },
          body:JSON.stringify(reviewData)
        });

        if(!response.ok){
          throw new Error('Failed to add review.');
        }
        //const newReview = await response.json();
      }catch(error){
        console.error('Error adding review:', error);
        //setLoading(false);
      }
    }
  }

  if (loading) return <div>Loading recipes ...</div>;

  return (
    <>
    <NavBar/>
    <Box 
      component="section"
        sx={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: theme.palette.background.container,
          margin: '0 auto',
          py: 5,
          px: 4,
          borderRadius: 2,
        }}
    >
      <Grid 
        container 
        spacing={2} 
        direction ="column"
        px={2}
        sx={{ py: 2 , maxWidth: '600px', backgroundColor: theme.palette.container.main, margin: '0 auto', borderRadius: 2}}
        
      >
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Typography variant="h3">Review a Movie</Typography>
        </Grid>
        <Grid item xs={12} >
          <MovieSelection 
            movies = {movies}
            selectedMovie = {selectedMovie}
            handleChange = {handleChange}
          />
          {error &&
            <Typography color="red" sx={{ mt: 1 }}>
              Select your movie
            </Typography>
          }
        </Grid>
        
        <Grid item xs={12}>
          <ReviewTitle 
            enteredTitle = {enteredTitle}
            handleTitleChange = {handleTitleChange}
          />
          {titleError &&
            <Typography color="red" sx={{ mt: 1 }}>
              Enter your review title
            </Typography>
          }
        </Grid>
        <Grid item xs={12}>
          <ReviewBody
            enteredReview = {enteredReview}
            handleReviewChange={handleReviewChange}
          />
          {reviewError &&
            <Typography color="red" sx={{ mt: 1 }}>
              Enter your review
            </Typography>
          }
        </Grid>
        <Grid item xs={12}>
          <ReviewRating
            selectedRating = {selectedRating}
            handleRatingChange={handleRatingChange}
          />
          {ratingError &&
            <Typography color="red" sx={{ mt: 1 }}>
              Select the rating
            </Typography>
          }
        </Grid>
        <Grid item xs={12}>
          <Button 
            id = "submit-button"
            variant="contained"
            onClick={handleSubmit}
            sx={{ mb: 2 }}
          >Submit
          </Button>
          {!hasError &&
            <>
              <Typography id="confirmation-message" sx={{ mt: 1 }}>
                Your review has been received
              </Typography>
              <Typography>Movie: {selectedMovie}</Typography>
              <Typography>Review Title: {enteredTitle}</Typography>
              <Typography>Review Body: {enteredReview}</Typography>
              <Typography>Rating: {selectedRating}</Typography>
            </>
          }
        </Grid>
      </Grid>
    </Box>


    </>
  );
}

export default Messaging;