# Password Manager

A secure, modern, and user-friendly password management application built with React (client) and Node.js/Express (server). This project enables users to safely store, generate, and manage their passwords, featuring robust authentication, encryption, and customizable settings.

## Features

### Client (Frontend)
- **User Authentication**: Sign Up, Sign In, and Forgot Password flows with OTP verification.
- **Password Vault**: Store, view, edit, and delete passwords securely.
- **Password Generator**: Generate strong, customizable passwords.
- **Password Modal**: Add or update password entries with a clean modal interface.
- **Settings**: Manage user preferences and theme (light/dark mode).
- **Responsive UI**: Built with React and Vite for fast, modern performance.
- **Confirmation Dialogs**: Safeguard critical actions with confirmation prompts.

### Server (Backend)
- **RESTful API**: Node.js/Express server with modular routes for authentication, password management, and user operations.
- **MongoDB Integration**: Securely store user and password data.
- **JWT Authentication**: Robust session management using JSON Web Tokens.
- **Encryption**: Passwords are encrypted using a strong ENCRYPTION_KEY before storage.
- **Email Support**: SMTP integration for OTP and password recovery emails.
- **Middleware**: Authentication and security middleware for protected routes.

## Folder Structure

```
Password-Manager/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Auth & theme context
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Main app pages
│   │   └── ...
│   ├── public/
│   └── ...
├── server/          # Node.js backend
│   ├── middleware/   # Auth middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Encryption & mailer
│   └── ...
├── .env              # Environment variables
├── package.json      # Project metadata
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB instance

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Password-Manager.git
   cd Password-Manager
   ```
2. Configure environment variables in `.env` (see sample in server folder).
3. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Start the frontend client:
   ```bash
   cd ../client
   npm run dev
   ```

## Security
- All sensitive data is encrypted before storage.
- JWT-based authentication for secure sessions.
- Environment variables for secrets and keys.

## License
This project is licensed under the MIT License.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## Contact
For support or inquiries, please contact [your-email@example.com].
