// client/src/layouts/MainLayout.js
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px', // Adjust based on your app bar height
          width: 'calc(100% - 240px)' // Adjust based on sidebar width
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;