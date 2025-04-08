# Retool Custom React Component Starter

A starter template for creating custom React components for Retool. This project includes a simple counter component that demonstrates how to use Retool's state management.

## Features

- Simple counter component with increment functionality
- Mock implementation for local development
- Integration with Retool's state management

## Development Setup

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

### Local Development

For local development, the project includes a mock implementation of the Retool API:

1. Open `src/MyRetoolComponent.tsx`
2. Comment out the Retool import and uncomment the mock import:
   ```typescript
   // import { Retool } from '@tryretool/custom-component-support';
   import { Retool } from './mocks/retool';
   ```
3. Start the development server:
   ```
   npm start
   ```

This allows you to develop and test your component without needing to connect to Retool.

### Building for Retool

When you're ready to use your component in Retool:

1. Open `src/MyRetoolComponent.tsx`
2. Uncomment the Retool import and comment out the mock import:
   ```typescript
   import { Retool } from '@tryretool/custom-component-support';
   // import { Retool } from './mocks/retool';
   ```
3. Build the component:
   ```
   npm run build
   ```
4. Deploy to Retool:
   ```
   npm run deploy
   ```

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the component for production
- `npm test` - Run tests
- `npm run login` - Log in to Retool
- `npm run sync` - Sync changes to Retool during development
- `npm run deploy` - Deploy the component to Retool
- `npm run init` - Initialize a new Retool component

## Project Structure

- `src/MyRetoolComponent.tsx` - The main component file
- `src/MyRetoolComponent.css` - Styles for the component
- `src/mocks/retool.ts` - Mock implementation of Retool API for local development
- `src/index.tsx` - Entry point for the component

## Customizing the Component

To customize the component:

1. Modify `src/MyRetoolComponent.tsx` to add your own functionality
2. Update styles in `src/MyRetoolComponent.css`
3. Add additional state using Retool's state management hooks:
   - `useStateBoolean`
   - `useStateNumber`
   - `useStateString`
   - `useStateEnumeration`
   - `useStateObject`
   - `useStateArray`

## Using Retool State Management

This starter uses Retool's state management through hooks. In the counter example:

```typescript
const [count, setCountState] = Retool.useStateNumber?.({
  name: "count",
  initialValue: 0,
});
```

This creates a state variable that is managed by Retool, allowing the state to be accessed and manipulated from the Retool interface.
