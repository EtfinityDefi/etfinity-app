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

**Note:** This is a **DEMONSTRATION APPLICATION**. No real funds are used, and all wallet connections, transactions, and market data are simulated within the frontend for illustrative purposes.

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

* **React.js:** A JavaScript library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
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
    git clone [https://github.com/EtfinityDefi/etfinity-app.git](https://github.com/EtfinityDefi/etfinity-app.git)
    cd etfinity-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Tailwind CSS Custom Breakpoint:**
    Ensure your `tailwind.config.js` file (at the project root) includes the `xs` breakpoint:
    ```javascript
    // tailwind.config.js
    module.exports = {
      // ...
      theme: {
        extend: {
          screens: {
            'xs': '400px', // Crucial for specific responsive behaviors
          },
        },
      },
      // ...
    };
    ```

### Running the Application

To run the development server:

```bash
npm start
# or
yarn start
```

This will open the application in your browser at http://localhost:3000 (or another available port).

## Contributing
Contributions are welcome! If you have suggestions for improvements or find issues, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.
