# My Express App

This is a simple Express application that connects to MongoDB Atlas. It provides user-related functionalities such as creating and retrieving users.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-express-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   ```

2. Start the server:
   ```
   npm start
   ```

3. The server will run on `http://localhost:3000` (or the port specified in your configuration).

## API Endpoints

- `POST /users` - Create a new user
- `GET /users/:id` - Retrieve a user by ID

## Environment Variables

- `MONGODB_URI` - Connection string for MongoDB Atlas

## License

This project is licensed under the MIT License.