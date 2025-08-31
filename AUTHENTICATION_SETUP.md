# Authentication Setup Guide

This guide will help you set up Clerk authentication with JWT tokens for the Turf Booking Application.

## 🚀 Frontend Setup (Clerk)

### 1. Create Clerk Account
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework

### 2. Configure Clerk Application
1. **API Keys**: Copy your publishable key and secret key
2. **User Management**: Enable email/password authentication
3. **Appearance**: Customize the sign-in/sign-up forms to match your app's theme
4. **Webhooks**: Set up webhook endpoint for user sync

### 3. Environment Variables
Create a `.env` file in the `my-app` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Webhook Configuration
1. In Clerk Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy the webhook secret to your environment variables

## 🔐 Backend Setup (JWT)

### 1. Environment Variables
Create a `.env` file in the `server` directory:

```env
# Database Configuration
DATABASE_URL="your_supabase_connection_string"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# Clerk Configuration
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key_here"
```

### 2. Generate JWT Secret
Use a strong, random secret for JWT:

```bash
# Generate a random 64-character string
openssl rand -base64 64
```

### 3. Database Migration
After updating the Prisma schema, run:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

## 🔄 How It Works

### 1. User Authentication Flow
1. User signs up/signs in through Clerk UI
2. Clerk handles authentication and user management
3. Frontend receives Clerk user session
4. Frontend calls backend with Clerk user data

### 2. JWT Token Generation
1. Backend receives user data from Clerk webhook
2. Backend creates/updates user in local database
3. Backend generates JWT token with user information
4. Frontend stores JWT token for API calls

### 3. Protected API Routes
1. Frontend includes JWT token in Authorization header
2. Backend middleware validates JWT token
3. Backend extracts user information from token
4. API routes have access to authenticated user data

## 🛡️ Security Features

### 1. JWT Token Security
- **Expiration**: Tokens expire after 24 hours
- **Secret**: Strong, environment-based secret key
- **Validation**: Server-side token verification

### 2. API Protection
- **Authentication Required**: All booking endpoints require valid JWT
- **User Isolation**: Users can only access their own data
- **CORS Protection**: Configured for secure cross-origin requests

### 3. Clerk Security
- **Webhook Verification**: Svix-based webhook signature verification
- **User Management**: Secure user authentication and session management
- **Environment Variables**: Sensitive data stored securely

## 📱 Frontend Components

### 1. Authentication Components
- `SignInButton`: Modal-based sign-in
- `SignUpButton`: Modal-based sign-up
- `UserButton`: User profile and sign-out
- `useUser`: Hook for user state management

### 2. Protected Features
- Court booking requires authentication
- User data pre-fills booking forms
- Personalized user experience

## 🔧 Backend Middleware

### 1. Authentication Middleware
- `authenticateToken`: JWT token validation
- `generateToken`: JWT token creation
- User data extraction and validation

### 2. Protected Routes
- All booking endpoints require authentication
- User context available in request object
- Automatic token validation

## 🚨 Common Issues & Solutions

### 1. JWT Token Errors
**Issue**: "Invalid or expired token"
**Solution**: 
- Check JWT_SECRET environment variable
- Ensure token hasn't expired
- Verify token format in Authorization header

### 2. Clerk Webhook Failures
**Issue**: Webhook verification fails
**Solution**:
- Verify CLERK_WEBHOOK_SECRET
- Check webhook endpoint URL
- Ensure proper webhook event selection


## 🧪 Testing Authentication

### 1. Test User Flow
1. Sign up with new email
2. Verify user appears in backend database
3. Test protected API endpoints
4. Verify JWT token validation

### 2. Test API Protection
1. Try accessing protected routes without token
2. Verify 401 Unauthorized response
3. Test with valid JWT token
4. Verify successful access

### 3. Test Webhook
1. Create/update user in Clerk
2. Verify webhook received by backend
3. Check user data synced correctly
4. Verify JWT token generated

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [JWT.io](https://jwt.io/) - JWT token debugging
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## 🔒 Production Considerations

### 1. Security
- Use strong, unique JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Add request validation

### 2. Monitoring
- Log authentication attempts
- Monitor webhook failures
- Track JWT token usage
- Set up error alerting

### 3. Scaling
- Consider Redis for token storage
- Implement token refresh strategy
- Add user session management
- Plan for multiple environments

---

**Note**: This authentication system provides a solid foundation for user management. For production use, consider implementing additional security measures like rate limiting, request validation, and comprehensive logging.
