# Deployment Checklist

Use this checklist to ensure all steps are completed before and during deployment.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All localhost URLs have been replaced with environment variables
- [ ] No hardcoded secrets or API keys in code
- [ ] `.env` files are in `.gitignore`
- [ ] Application works correctly in local development

## MongoDB Atlas Setup

- [ ] Created MongoDB Atlas account
- [ ] Created a cluster (free tier is fine)
- [ ] Created database user with password
- [ ] Whitelisted IP addresses (0.0.0.0/0 for all)
- [ ] Copied connection string
- [ ] Tested connection string locally

## Backend Deployment (Render)

- [ ] Created Render account
- [ ] Created new Web Service in Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `server`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added environment variable: `ATLAS_URI`
- [ ] Added environment variable: `JWT_SECRET` (strong random string)
- [ ] Added environment variable: `APP_BASE_URL` (will update after frontend deploy)
- [ ] Service is deployed and running
- [ ] Tested backend URL in browser (should show connection or error page)
- [ ] Copied backend URL for frontend configuration

## Frontend Deployment (Netlify)

- [ ] Created Netlify account
- [ ] Connected GitHub repository
- [ ] Set Base Directory to `web`
- [ ] Set Build Command: `npm run build`
- [ ] Set Publish Directory: `web/build`
- [ ] Added environment variable: `REACT_APP_API_URL` (backend URL)
- [ ] Added environment variable: `REACT_APP_SOCKET_URL` (backend URL)
- [ ] Site is deployed successfully
- [ ] Copied frontend URL

## Post-Deployment Configuration

- [ ] Updated `APP_BASE_URL` in Render with Netlify URL
- [ ] Restarted Render service after updating `APP_BASE_URL`
- [ ] Tested frontend can connect to backend
- [ ] Verified API calls work from frontend

## Testing

- [ ] Frontend loads without errors
- [ ] Can access signup page
- [ ] Can register a new user
- [ ] Can receive verification email (if email configured)
- [ ] Can verify email and login
- [ ] Can login with existing credentials
- [ ] Can view rooms (if applicable)
- [ ] Can create bookings (if applicable)
- [ ] Can access admin dashboard (if applicable)
- [ ] Socket.IO connections work (if applicable)
- [ ] No console errors in browser
- [ ] No errors in Render logs
- [ ] No errors in Netlify build logs

## Security Check

- [ ] All environment variables are set in platform (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection string is secure
- [ ] No sensitive data in code or commits
- [ ] CORS is properly configured

## Optional Enhancements

- [ ] Set up custom domain for frontend
- [ ] Set up custom domain for backend
- [ ] Configure email service for verification emails
- [ ] Set up monitoring/uptime checking
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure automatic deployments from GitHub

## Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Team members informed of deployment URLs
- [ ] Access credentials shared securely

---

## Quick Reference

**Backend URL**: `https://your-app-name.onrender.com`  
**Frontend URL**: `https://random-name.netlify.app`

**Key Files**:
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `ENVIRONMENT_VARIABLES.md` - Environment variable reference
- `web/netlify.toml` - Netlify configuration
- `web/src/config/api.js` - Frontend API configuration

**Important Notes**:
- Free tier Render spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- Environment variables starting with `REACT_APP_` are required for React
- Always test after deployment before sharing with users

