// API Configuration
// In development, this uses localhost
// In production, this uses the Render backend URL from environment variables
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, '');

// Socket.IO configuration
let SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
SOCKET_URL = SOCKET_URL.replace(/\/$/, '');

// Export the base URL for axios requests
export default API_BASE_URL;
export { SOCKET_URL };

