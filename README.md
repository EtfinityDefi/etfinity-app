# Etfinity Frontend Demo Application ✨

## Table of Contents

* [About](#about)
* [Features](#features)
* [Technologies Used](#technologies-used)
* [Getting Started](#getting-started)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Running the Application](#running-the-application)
* [Contributing](#contributing)
* [License](#license)

---

## About

https://etfinity.com

This repository houses the complete user interface for **Etfinity**, a pioneering platform democratizing access to synthetic Exchange-Traded Funds (ETFs) like sSPY. This application serves as a comprehensive showcase of how users can gain traditional market exposure directly within their crypto wallets, without the need for traditional brokers or banks.

Built with **Next.js's powerful App Router**, this application leverages file-system based routing and server components (where applicable) for enhanced performance and modern development practices.

**Note:** This is a **DEMONSTRATION APPLICATION**. No real funds are used, and all wallet connections, transactions, and market data are simulated within the frontend for illustrative purposes. User holdings (sSPY, USDC, LP Value) and recent activities are persisted locally in your browser's `localStorage` for a consistent demo experience across sessions.

---

## Features

The Etfinity Frontend Demo highlights the core functionalities of a synthetic asset platform:

* **Home Page:** Introduction to Etfinity, current sSPY market price, and immediate actions (Mint/Redeem).
* **Dashboard:** Overview of user's simulated sSPY holdings, collateral value, LP value, and recent activity.
* **Mint sSPY:** Simulate minting sSPY by providing USDC collateral.
* **Redeem sSPY:** Simulate redeeming sSPY for collateral.
* **Liquidity Pool:** Simulate adding and removing liquidity (sSPY/USDC) to earn simulated fees.
* **Swap:** External link to a simulated Uniswap swap for sSPY.
* **FAQ (DeFi Assistant):** An interactive assistant powered by an LLM (via Gemini API) to answer general DeFi questions.
* **About Us:** Information about the Etfinity project and links to community channels.
* **Responsive Design:** Optimized for seamless experience across various device resolutions.
* **Terms and Conditions & Privacy Policy:** Dedicated pages for legal information.

---

## Technologies Used

* **Next.js:** A React framework for building server-rendered and statically generated web applications.
* **React.js:** A JavaScript library for building user interfaces (core of Next.js).
* **Tailwind CSS (v3):** A utility-first CSS framework for rapid UI development.
* **Lucide-React:** A collection of beautiful and customizable open-source icons.
* **Recharts:** A composable charting library built on React components.
* **Gemini API:** Used for the LLM-powered DeFi Assistant.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (LTS version recommended)
* npm (comes with Node.js) or Yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL_HERE]
    cd etfinity-frontend/etfinity-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Tailwind CSS and PostCSS:**
    Ensure your `tailwind.config.js` and `postcss.config.cjs` files (at the project root: `etfinity-frontend/etfinity-app/`) are correctly configured for Tailwind CSS v3:

    **`tailwind.config.js`:**
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          screens: {
            'xs': '360px', // Custom breakpoint
          },
          fontFamily: {
            inter: ['Inter', 'sans-serif'],
          },
          colors: {
            purple: {
              '400': '#A78BFA', '500': '#8B5CF6', '600': '#7C3AED', '700': '#6D28D9',
            },
            zinc: {
              '100': '#F4F4F5', '300': '#D4D4D8', '400': '#A1A1AA', '500': '#71717A',
              '600': '#52525B', '700': '#3F3F46', '800': '#27272A', '900': '#18181B', '950': '#09090B',
            },
          }
        },
      },
      plugins: [],
    };
    ```

    **`postcss.config.cjs`:**
    ```javascript
    // postcss.config.cjs
    module.exports = {
      plugins: {
        tailwindcss: {}, // For Tailwind CSS v3
        autoprefixer: {},
      },
    };
    ```

    **`app/globals.css` (inside `etfinity-frontend/etfinity-app/app/`):**
    ```css
    /* app/globals.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    ```

### Running the Application

To run the development server:

```bash
npm run dev
# or
yarn dev
```
This will open the application in your browser at http://localhost:3000 (or another available port).

## Contributing
Contributions are welcome! If you have suggestions for improvements or find issues, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.
