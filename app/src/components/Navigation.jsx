import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navigation = () => {
  return (
    <nav>
      {/* Other navigation items */}
      <Button component={Link} to="/signup" variant="contained" color="primary">
        Sign Up
      </Button>
    </nav>
  );
};

export default Navigation;