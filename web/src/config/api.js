// API Configuration
// In development, this uses localhost
// In production, this uses the Render backend URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Socket.IO configuration
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Export the base URL for axios requests
export default API_BASE_URL;

