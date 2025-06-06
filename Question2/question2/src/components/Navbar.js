import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Stock Analytics
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/stock">
            Stock Analysis
          </Button>
          <Button color="inherit" component={RouterLink} to="/heatmap">
            Correlation Map
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
