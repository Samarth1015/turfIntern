# Deployment Guide

This guide will help you deploy the Turf Booking Application to production.

## 🚀 Backend Deployment (Render/Railway)

### Option 1: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com) and sign up
   - Connect your GitHub account

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `server` directory
   - Configure the service:
     - **Name**: `turf-booking-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or choose paid plan)

3. **Environment Variables**
   - Add the following environment variables:
     ```
     DATABASE_URL=your_supabase_connection_string
     NODE_ENV=production
     PORT=10000
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the generated URL (e.g., `https://your-app.onrender.com`)

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app) and sign up
   - Connect your GitHub account

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `server`
   - Railway will auto-detect Node.js

3. **Environment Variables**
   - Add the same environment variables as above

4. **Deploy**
   - Railway will automatically deploy and provide a URL

## 🌐 Frontend Deployment (Vercel/Netlify)

### Option 1: Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Connect your GitHub account

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset**: Next.js
     - **Root Directory**: `my-app`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Environment Variables**
   - Add the following environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com) and sign up
   - Connect your GitHub account

2. **Deploy Frontend**
   - Click "New site from Git"
   - Select your repository
   - Configure the build settings:
     - **Base directory**: `my-app`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

3. **Environment Variables**
   - Add the same environment variable as above

4. **Deploy**
   - Click "Deploy site"

## 🗄️ Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and sign up
   - Create a new project

2. **Get Connection String**
   - Go to Settings → Database
   - Copy the connection string

3. **Run Migrations**
   - Update your backend environment variable with the connection string
   - Run the migration command:
     ```bash
     npm run prisma:migrate
     ```

4. **Seed Database**
   - Run the seed command:
     ```bash
     npm run prisma:seed
     ```

## 🔧 Post-Deployment

1. **Update Frontend API URL**
   - Ensure your frontend environment variable points to the deployed backend

2. **Test the Application**
   - Test all API endpoints
   - Test the booking flow
   - Check mobile responsiveness

3. **Monitor Logs**
   - Check your deployment platform's logs for any errors
   - Monitor database connections

## 🚨 Common Issues

### CORS Errors
- Ensure your backend CORS configuration allows your frontend domain
- Update the CORS_ORIGIN environment variable

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if your database allows external connections
- Ensure your IP is whitelisted if required

### Build Failures
- Check if all dependencies are in package.json
- Verify Node.js version compatibility
- Check build logs for specific error messages

## 📊 Performance Optimization

1. **Database Indexing**
   - Add indexes to frequently queried fields
   - Use Prisma's built-in optimization features

2. **Caching**
   - Implement Redis for session storage
   - Add API response caching

3. **CDN**
   - Use Vercel's edge functions
   - Implement static asset optimization

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use secure environment variable management

2. **API Security**
   - Implement rate limiting
   - Add request validation
   - Use HTTPS in production

3. **Database Security**
   - Use connection pooling
   - Implement proper user permissions
   - Regular security updates

---

**Note**: This deployment guide covers the basic setup. For production use, consider implementing additional security measures, monitoring, and backup strategies.
