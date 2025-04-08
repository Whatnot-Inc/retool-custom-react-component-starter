import React from 'react';
import ReactDOM from 'react-dom/client';
import MyRetoolComponent from './MyRetoolComponent';

// Export the component for use as a module
export { default as MyRetoolComponent } from './MyRetoolComponent';

// For development
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <MyRetoolComponent />
    </React.StrictMode>
  );
}