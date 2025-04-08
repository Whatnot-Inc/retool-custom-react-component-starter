import React, { useState } from 'react';
import './MyRetoolComponent.css';

// Define a type for the Retool interface we need
interface RetoolInterface {
  useStateNumber?: (options: {
    name: string;
    initialValue: number;
  }) => [number, (value: number) => void];
}

// Create a mock Retool object for local development
const MockRetool: RetoolInterface = { useStateNumber: undefined };

// Use a global declaration to handle availability of the Retool package
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _RETOOL_CUSTOM_COMPONENT?: any;
  }
}

// Access Retool from window if available, otherwise use mock
const Retool: RetoolInterface = (
  typeof window !== 'undefined' && 
  window._RETOOL_CUSTOM_COMPONENT && 
  window._RETOOL_CUSTOM_COMPONENT.Retool
) || MockRetool;

const MyRetoolComponent = (props: any) => {
  // Direct Retool state bindings - fallback to React's useState if Retool is not available
  const [count, setCountState] = Retool.useStateNumber?.({
    name: "count",
    initialValue: props.startCount || 0,
  }) || useState(props.startCount || 0);

  const handleIncrement = () => {
    setCountState(count + 1);
  };

  return (
    <div className="my-retool-component my-retool-component-container">
      <h1 className="my-retool-component-title">My Custom Retool Component</h1>
      <p className="my-retool-component-text">Count: {count}</p>
      <button 
        className="my-retool-component-button glow-button"
        onClick={handleIncrement}
      >
        <span data-glow aria-hidden="true"></span>
        Increment
      </button>
    </div>
  );
};

export default MyRetoolComponent; 