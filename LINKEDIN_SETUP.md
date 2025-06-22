# 🔗 LinkedIn OAuth Setup Guide

## 🎯 Overview
This guide will help you set up LinkedIn OAuth authentication for your Cal-Hacks-AI app. Once configured, users can sign in with their LinkedIn accounts and their profile data will be displayed in the ProfileScreen.

## 📋 Prerequisites
- A LinkedIn account
- Access to LinkedIn Developer Portal
- Your app running on Expo

## 🚀 Step-by-Step Setup

### 1. Create a LinkedIn App

1. **Go to LinkedIn Developer Portal**
   - Visit: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account

2. **Create a New App**
   - Click "Create App"
   - Fill in the required information:
     - **App Name**: `Cal-Hacks-AI`
     - **LinkedIn Page**: Your LinkedIn page (or create one)
     - **App Logo**: Upload a logo for your app
     - **Legal Agreement**: Accept the terms

3. **Get Your App Credentials**
   - After creating the app, go to the "Auth" tab
   - Note down your **Client ID** and **Client Secret**

### 2. Configure OAuth Settings

1. **Add Redirect URLs**
   - In your LinkedIn app settings, go to "Auth" tab
   - Add these redirect URLs:
     ```
     calhacksai://linkedin-callback
     exp://localhost:8081/--/linkedin-callback
     ```

2. **Set OAuth 2.0 Scopes**
   - Add these scopes to your app:
     - `r_liteprofile` (Basic profile information)
     - `r_emailaddress` (Email address)

### 3. Update Your App Configuration

1. **Update `linkedinService.js`**
   - Open `linkedinService.js`
   - Replace `YOUR_LINKEDIN_CLIENT_ID` with your actual Client ID
   - Replace `YOUR_LINKEDIN_CLIENT_SECRET` with your actual Client Secret

   ```javascript
   const LINKEDIN_CONFIG = {
     clientId: 'your_actual_client_id_here',
     // ... rest of config
   };
   ```

2. **Environment Variables (Optional but Recommended)**
   - Create a `.env` file in your project root
   - Add your LinkedIn credentials:
     ```
     LINKEDIN_CLIENT_ID=your_client_id_here
     LINKEDIN_CLIENT_SECRET=your_client_secret_here
     ```
   - Update `linkedinService.js` to use environment variables:
     ```javascript
     clientId: process.env.LINKEDIN_CLIENT_ID || 'your_client_id_here',
     client_secret: process.env.LINKEDIN_CLIENT_SECRET || 'your_client_secret_here',
     ```

### 4. Test the Integration

1. **Start Your App**
   ```bash
   npx expo start
   ```

2. **Test LinkedIn Sign In**
   - Open your app
   - Go to SignInScreen
   - Tap "🔗 Sign in with LinkedIn"
   - Complete the OAuth flow
   - Check if profile data appears in ProfileScreen

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid redirect URI" Error**
   - Make sure the redirect URI in LinkedIn app matches exactly
   - Check that the scheme in `app.json` is correct

2. **"Client ID not found" Error**
   - Verify your Client ID is correct
   - Make sure your LinkedIn app is approved

3. **"Access denied" Error**
   - Check that you've added the correct OAuth scopes
   - Ensure your app is properly configured

4. **Profile data not loading**
   - Check console logs for API errors
   - Verify your access token is valid
   - Make sure you have the required permissions

### Debug Steps

1. **Check Console Logs**
   - Look for LinkedIn service logs in your terminal
   - Check for any error messages

2. **Verify OAuth Flow**
   - Test the authentication flow step by step
   - Check if the callback URL is being called

3. **Test API Calls**
   - Use tools like Postman to test LinkedIn API calls
   - Verify your access token works

## 📱 Features Available

Once configured, your app will have:

- ✅ **LinkedIn OAuth Authentication**
- ✅ **Profile Data Fetching**
- ✅ **Profile Display in ProfileScreen**
- ✅ **Data Persistence**
- ✅ **Profile Refresh**
- ✅ **Error Handling**

## 🔒 Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive data
- Implement proper token refresh mechanisms
- Handle user logout properly

## 📞 Support

If you encounter issues:

1. Check the LinkedIn Developer Documentation
2. Review the console logs for error messages
3. Verify your app configuration
4. Test with a simple OAuth flow first

## 🎉 Success!

Once everything is working, users will be able to:
- Sign in with their LinkedIn accounts
- See their real LinkedIn profile data
- Refresh their profile data
- Have their data persisted between app sessions

Your Cal-Hacks-AI app will now have a fully functional LinkedIn integration! 🚀 