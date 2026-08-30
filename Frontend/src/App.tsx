import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { InspectionProvider } from './store';

const App: React.FC = () => {
  return (
    <InspectionProvider>
      <RouterProvider router={router} />
    </InspectionProvider>
  );
};

export default App;