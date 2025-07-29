# Hotel-Reservation-System

This is a full-stack web application for a hotel reservation system. The project is built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and allows users to search for hotels, view details, and book rooms. It also includes an admin panel for managing hotels and bookings.

## Project Structure

The project is divided into two main parts:

*   `frontend`: A React application built with Vite that serves as the user interface.
*   `backend`: A Node.js and Express.js application that provides the API and business logic.

## Features

### User Features

*   **User Authentication**: Users can register and log in to their accounts.
*   **Search Hotels**: Search for hotels based on destination, check-in/check-out dates, and number of guests.
*   **View Hotel Details**: See detailed information about each hotel, including images, description, amenities, and price.
*   **Book Rooms**: Securely book hotel rooms.
*   **View Bookings**: Users can view their own booking history.

### Admin Features

*   **Admin Dashboard**: A dedicated dashboard for managing the platform.
*   **Manage Hotels**: Admins can add, edit, and delete hotels.
*   **View All Bookings**: Admins can view and manage all user bookings.

---

## Backend Setup

The back-end is a Node.js application using the Express.js framework and MongoDB for the database.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)
*   [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Installation

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your actual configuration.

    ```env
    # Server Configuration
    PORT=7000
    FRONTEND_URL=http://localhost:5173

    # Database
    MONGODB_URI=<your_mongodb_connection_string>

    # JSON Web Token
    JWT_SECRET_KEY=<your_jwt_secret_key>

    # Cloudinary (for image hosting)
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```

### Running the Backend

1.  **Start the server in development mode** (with hot-reloading):
    ```bash
    npm run dev
    ```

2.  **Start the server in production mode**:
    ```bash
    npm start
    ```

The server will be running at `http://localhost:7000`.

### Seeding the Database

The project includes scripts to seed the database with initial data.

*   **Seed Hotels**:
    ```bash
    npm run seed
    ```

*   **Seed an Admin User**:
    ```bash
    npm run seed-admin
    ```

---

## Frontend Setup

The front-end is a React application built with Vite and styled with Tailwind CSS.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)

### Installation

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the `frontend` directory and add the following variable.

    ```env
    VITE_API_BASE_URL=http://localhost:7000
    ```

### Running the Frontend

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build of the front-end, run:

```bash
npm run build
```

This will create an optimized build in the `dist` directory.

## API Endpoints

The back-end exposes the following API routes:

*   `/auth`: User authentication (login, register)
*   `/users`: User management
*   `/logout`: User logout
*   `/my-hotels`: Hotel management for logged-in users
*   `/hotels`: Public hotel search and details
*   `/`: View routes
*   `/admin`: Admin-specific routes
*   `/admin/hotels`: Hotel management for admins
*   `/bookings`: Booking management

For detailed information on each endpoint, please refer to the back-end source code in `backend/src/routes`.
