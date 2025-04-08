# Retool Custom React Component Starter

This is a starter template for creating custom React components for use in Retool.

## Getting Started

1.  **Clone or download this repository.**

2.  **Install dependencies:**
    ```bash
    cd retool-custom-react-component-starter
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will watch for changes in the `src` directory and rebuild the component automatically.

4.  **Start developing your component:**
    -   Modify `src/MyComponent.tsx` to create your custom component.
    -   Add styles to `src/MyComponent.css`.
    -   If you rename `MyComponent.tsx` or create multiple components, update `src/index.tsx` and `rollup.config.js` accordingly.

## Building for Retool

1.  **Build the component:**
    ```bash
    npm run build
    ```
    This creates the necessary bundled files in the `dist` directory.

## Using in Retool

1.  **Login to Retool CLI:**
    ```bash
    npm run login
    ```
    Follow the prompts to log in to your Retool account.

2.  **Sync for development (optional but recommended):**
    ```bash
    npm run sync
    ```
    This command watches your component files and automatically uploads changes to Retool, allowing for live previews within the Retool editor.

3.  **Deploy the component library:**
    ```bash
    npm run deploy
    ```
    This command builds your component and uploads the library (defined in `package.json` under `retoolCustomComponentLibraryConfig`) to your Retool instance.

4.  **Add the component in Retool:**
    -   Go to your Retool app editor.
    -   In the component panel on the right, find your custom component library (e.g., "My Custom Components").
    -   Drag your component (e.g., "My Component") onto the canvas.

## Project Structure

-   `dist/`: Contains the bundled component files ready for Retool.
-   `node_modules/`: Project dependencies.
-   `public/`: Can be used for static assets if needed for local development (e.g., with `npm start`).
-   `src/`: Contains your React component source code.
    -   `index.tsx`: The main export file for the component library.
    -   `MyComponent.tsx`: The example starter component.
    -   `MyComponent.css`: Styles for the example component.
-   `.eslintrc.json`: ESLint configuration.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `.prettierrc`: Prettier code formatting configuration.
-   `css-modules.d.ts`: TypeScript definitions for CSS modules.
-   `package.json`: Project metadata and dependencies.
-   `rollup.config.js`: Rollup configuration for bundling the component.
-   `tsconfig.json`: TypeScript configuration.

## Customization

-   **Component Name:** Rename `MyComponent.tsx` and `MyComponent.css`. Update imports in `index.tsx` and `rollup.config.js`.
-   **Multiple Components:**
    -   Create new `.tsx` and `.css` files for each component in `src/`.
    -   Export each component from `src/index.tsx`.
    -   Update `rollup.config.js` to build each component individually for Retool if needed, or adjust the main build target.
    -   Configure the `components` array within `retoolCustomComponentLibraryConfig` in `package.json` if deploying multiple components within the library.
-   **Library Name:** Update `name`, `label`, and `description` in the `retoolCustomComponentLibraryConfig` section of `package.json`.
