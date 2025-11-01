# Deployment Guide for EduSpace MERN Stack Application

This guide will help you deploy your MERN stack application with:
- **Frontend (React)**: Deployed on Netlify
- **Backend (Node.js/Express)**: Deployed on Render
- **Database**: MongoDB Atlas (cloud-hosted)

---

## Prerequisites

1. GitHub account and repository
2. MongoDB Atlas account (free tier available)
3. Netlify account (free tier available)
4. Render account (free tier available)
5. Email service credentials (optional, for email verification)

---

## Step 1: Prepare Your Code

### 1.1 Verify Your Project Structure

Your project should have:
```
eduspace/
├── server/          # Backend (Node.js/Express)
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── models/
│   └── utils/
└── web/            # Frontend (React)
    ├── package.json
    ├── src/
    └── public/
```

### 1.2 Commit All Changes

Make sure all your code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (choose the free tier)
4. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose password authentication
   - Save the username and password securely
5. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for simplicity
6. Get your connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `eduspace` (or your preferred database name)

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/eduspace?retryWrites=true&w=majority
```

**Keep this connection string secure!**

---

## Step 3: Deploy Backend to Render

### 3.1 Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repository

### 3.2 Configure the Service

**Basic Settings:**
- **Name**: `eduspace-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install` (or leave empty)
- **Start Command**: `npm start`

### 3.3 Set Environment Variables

Click on "Environment" tab and add these variables:

```
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/eduspace?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_generate_a_random_string
APP_BASE_URL=https://your-frontend-app.netlify.app
PORT=10000
```

**Important Notes:**
- Replace `ATLAS_URI` with your actual MongoDB connection string
- Generate a strong `JWT_SECRET` (you can use: `openssl rand -base64 32`)
- Replace `APP_BASE_URL` with your Netlify URL (you'll get this in Step 4)
- `PORT` is usually set automatically by Render, but you can specify it

**Optional Email Variables:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=EduSpace Scheduler <no-reply@eduspace.local>
```

### 3.4 Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (this may take 5-10 minutes)
4. Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

### 3.5 Note Your Backend URL

Copy your Render backend URL. You'll need it for the frontend deployment.

**Important**: Free tier Render services spin down after 15 minutes of inactivity. The first request after spin-down may take 30-60 seconds.

---

## Step 4: Deploy Frontend to Netlify

### 4.1 Prepare Frontend Environment Variables

**You have two options:**

**Option A (Recommended):** Set environment variables directly in Netlify dashboard (see Step 4.4 below). This is the easiest and recommended approach.

**Option B (Optional):** If you prefer, you can create a file `web/.env.production` with:

```env
REACT_APP_API_URL=https://your-app-name.onrender.com
REACT_APP_SOCKET_URL=https://your-app-name.onrender.com
```

**Note:** Environment variables set in Netlify dashboard will override this file, so Option A is recommended.

### 4.2 Deploy via Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Select your repository

### 4.3 Configure Build Settings

**Basic Settings:**
- **Base directory**: `web`
- **Build command**: `npm run build`
- **Publish directory**: `web/build`

### 4.4 Set Environment Variables

Go to Site settings → Environment variables and add:

```
REACT_APP_API_URL=https://your-app-name.onrender.com
REACT_APP_SOCKET_URL=https://your-app-name.onrender.com
```

**Replace with your actual Render backend URL!**

### 4.5 Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your React app
3. Once complete, you'll get a URL like: `https://random-name.netlify.app`

### 4.6 Update Backend Environment Variable

Now go back to Render and update the `APP_BASE_URL` environment variable with your Netlify URL:
```
APP_BASE_URL=https://random-name.netlify.app
```

Then restart your Render service.

---

## Step 5: Update CORS Settings (if needed)

Your backend CORS is already configured to allow all origins (`origin: '*'`), so it should work with your Netlify URL automatically. However, for better security, you can update `server/server.js`:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));
```

---

## Step 6: Test Your Deployment

1. Visit your Netlify frontend URL
2. Try to sign up a new user
3. Check if verification emails are sent (if email is configured)
4. Test login and other features
5. Check browser console for any errors

---

## Troubleshooting

### Backend Issues

**Problem**: Backend returns 500 errors
- Check Render logs: Go to Render dashboard → Your service → Logs
- Verify all environment variables are set correctly
- Check MongoDB connection string is valid

**Problem**: Backend is slow to respond
- This is normal for free tier Render (spins down after inactivity)
- Consider upgrading to paid tier for always-on service

**Problem**: CORS errors
- Verify `APP_BASE_URL` in backend matches your Netlify URL
- Check that CORS is enabled in `server.js`

### Frontend Issues

**Problem**: Frontend shows "Cannot connect to server"
- Verify `REACT_APP_API_URL` is set correctly in Netlify
- Check that the backend URL is accessible (try opening it in a browser)
- Ensure backend is not sleeping (if on free tier)

**Problem**: Environment variables not working
- Environment variables in React must start with `REACT_APP_`
- After changing env variables, rebuild the site in Netlify

**Problem**: 404 errors on page refresh
- The `netlify.toml` file should handle this with redirects
- Verify the redirect configuration is correct

### Database Issues

**Problem**: Database connection fails
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Check database user credentials
- Ensure connection string format is correct

---

## Additional Configuration

### Custom Domain (Optional)

**Netlify:**
1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to your service → Settings → Custom Domain
2. Add your domain and configure DNS

### Email Service Setup (Optional)

If you want email verification to work:

1. **Gmail Setup:**
   - Go to Google Account → Security
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the app password as `EMAIL_PASS`

2. **Other Email Services:**
   - Most SMTP services will work
   - Update `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` accordingly

### Monitoring and Logs

- **Render**: View logs in the dashboard → Logs tab
- **Netlify**: View build logs and function logs in the dashboard
- **MongoDB Atlas**: Monitor database in Atlas dashboard

---

## Security Checklist

- [ ] `JWT_SECRET` is a strong random string
- [ ] MongoDB connection string doesn't include sensitive info in code
- [ ] All environment variables are set in platform (not in code)
- [ ] CORS is configured properly
- [ ] Email credentials are secure
- [ ] `.env` files are in `.gitignore`

---

## Post-Deployment

1. **Test all features:**
   - User registration
   - Email verification
   - Login
   - Room booking
   - Admin functions

2. **Monitor performance:**
   - Check Render logs for errors
   - Monitor MongoDB Atlas for connection issues
   - Check Netlify build logs

3. **Set up monitoring (optional):**
   - Use services like UptimeRobot to monitor your API
   - Set up error tracking (Sentry, etc.)

---

## Cost Estimates

- **Netlify**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier includes 750 hours/month (can spin down)
- **MongoDB Atlas**: Free tier includes 512MB storage

For production use, consider paid tiers for better performance.

---

## Need Help?

If you encounter issues:
1. Check the logs in both Render and Netlify dashboards
2. Verify all environment variables are set correctly
3. Test backend URL directly in browser/Postman
4. Check browser console for frontend errors

Good luck with your deployment! 🚀

