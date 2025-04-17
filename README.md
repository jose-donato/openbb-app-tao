# TAO.app Backend

This project provides a backend service that connects to the TAO.app API, enabling the integration of TAO/Bittensor on-chain analytics and price data into OpenBB Workspace. It defines templates and widgets for visualizing this data within the OpenBB Workspace interface.

## Connecting to OpenBB Pro

Follow these steps to connect this backend as a data source in OpenBB Pro:

1.  Log in to your OpenBB Pro account at [pro.openbb.co](https://pro.openbb.co). (Register if you don't have an account yet).
2.  Navigate to the **Data Connectors** page: [pro.openbb.co/app](https://pro.openbb.co/app).
3.  Click the **+ Add Data** button.
4.  Select **Custom Backend** from the left sidebar menu.
5.  Fill in the following details:
    *   **Name**: `TAO.app backend`
    *   **URL**: `https://openbb-app-tao.jose-donato.workers.dev/`
6.  Click the **Test** button to verify the connection.
7.  If the test is successful, click the **Add** button.

Once added, you should be able to find the `TAO app` available in the **Templates** section of OpenBB Pro.


## Running locally

To run this project locally, follow these steps:

1.  **Prerequisites:**
    *   Ensure you have [Node.js](https://nodejs.org/) installed (which includes npm).

2.  **Clone the Repository:**
    ```bash
    # Replace with your repository URL
    git clone https://github.com/jose-donato/openbb-app-tao
    cd openbb-app-tao
    ```
3.  **Install Dependencies:**
    ```bash
    npm install # or bun, yarn, pnpm
    ```
4.  **Environment Variables:** Create a `.dev.vars` file in the root directory and add TAO.app api key `TAO_API_KEY=`
5.  **Start the Development Server:**
    ```bash
    npm run dev # or bun, yarn, pnpm
    ```
    This command will start a local server, typically at `http://localhost:8787`, where you can test the endpoints