# Environment Variables Reference

This document lists all environment variables needed for deployment.

## Backend (Render) Environment Variables

Set these in Render Dashboard → Your Service → Environment:

```env
# Required
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/eduspace?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_generate_a_random_string
APP_BASE_URL=https://your-frontend-app.netlify.app
PORT=10000

# Optional (for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=EduSpace Scheduler <no-reply@eduspace.local>
```

### How to Generate JWT_SECRET:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Frontend (Netlify) Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```env
# Required - Replace with your Render backend URL
REACT_APP_API_URL=https://your-app-name.onrender.com
REACT_APP_SOCKET_URL=https://your-app-name.onrender.com
```

**Important Notes:**
- Environment variables must start with `REACT_APP_` to be accessible in React
- After setting variables, trigger a new deployment in Netlify
- The backend URL should include `https://` but no trailing slash

## Local Development

Create `.env` files in both `server/` and `web/` directories:

### `server/.env`:
```env
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/eduspace?retryWrites=true&w=majority
JWT_SECRET=your_local_jwt_secret
APP_BASE_URL=http://localhost:3000
PORT=5000
```

### `web/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**⚠️ Never commit `.env` files to Git!** They should be in `.gitignore`.

