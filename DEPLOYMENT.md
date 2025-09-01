# Deployment Guide for Vercel

This guide will help you deploy the Turf Booking Application to production using Vercel for both the frontend and backend.

## 🚀 Deployment on Vercel

Vercel simplifies the deployment process by handling both the Next.js frontend and the Express backend in a monorepo setup.

### 1. Project Configuration for Vercel

Vercel can automatically detect and deploy your monorepo with the correct settings. Ensure your `vercel.json` or `package.json` is configured correctly if you need to customize the build process. For this project, Vercel's zero-config deployments should work out of the box.

### 2. Deploying the Project

1.  **Create a Vercel Account**
    *   Go to [vercel.com](https://vercel.com) and sign up.
    *   Connect your GitHub account.

2.  **Import Your Project**
    *   Click "New Project".
    *   Import your GitHub repository.

3.  **Configure the Project**
    *   Vercel will automatically detect that you are using a Next.js application in the `my-app` directory.
    *   It will also detect the `server` directory and configure it as a serverless function.
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `my-app` (Vercel should automatically set this, but if you have a choice, select the frontend app's directory).

### 3. Environment Variables

You need to add your environment variables to Vercel.

*   Go to your project's "Settings" tab and then "Environment Variables".
*   Add the following variables:

    ```
    DATABASE_URL=your_supabase_connection_string
    NODE_ENV=production
    NEXT_PUBLIC_API_URL=/api 
    ```
    *Note: `NEXT_PUBLIC_API_URL` is set to `/api` because Vercel will proxy requests from the frontend to the backend serverless functions.*

### 4. Deploy

*   Click "Deploy".
*   Vercel will build and deploy your application. After the deployment is complete, you will get a URL for your live site.

## 🗄️ Database Setup (Supabase)

1.  **Create Supabase Project**
    *   Go to [supabase.com](https://supabase.com) and sign up.
    *   Create a new project.

2.  **Get Connection String**
    *   Go to Settings → Database.
    *   Copy the connection string.

3.  **Run Migrations**
    *   Update your Vercel environment variable (`DATABASE_URL`) with the connection string.
    *   To run migrations, you can either do it locally pointing to the production database (with caution) or set up a script in your `package.json` that Vercel can run. For simplicity, running it locally is often easiest for smaller projects:
        ```bash
        # Ensure your local .env file in the server directory has the production DATABASE_URL
        npm run prisma:migrate
        ```

4.  **Seed Database**
    *   Run the seed command locally against your production database:
        ```bash
        npm run prisma:seed
        ```

## 🔧 Post-Deployment

1.  **Test the Application**
    *   Test all API endpoints through your frontend.
    *   Test the booking flow.
    *   Check mobile responsiveness.

2.  **Monitor Logs**
    *   Check your Vercel dashboard logs for any errors.
    *   Monitor database connections in Supabase.

## 🚨 Common Issues

### CORS Errors
*   With Vercel's proxying, you might not face CORS issues between the frontend and backend. If you do, ensure your backend's CORS configuration is correctly set up to allow your frontend's domain.

### Database Connection Issues
*   Verify your `DATABASE_URL` is correct in the Vercel environment variables.
*   Check if your Supabase database allows external connections.

### Build Failures
*   Check if all dependencies are in `package.json`.
*   Verify Node.js version compatibility in your Vercel project settings.
*   Check build logs on the Vercel dashboard for specific error messages.

---

**Note**: This deployment guide covers the basic setup. For production use, consider implementing additional security measures, monitoring, and backup strategies.