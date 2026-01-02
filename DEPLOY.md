# BrainVault - Deployment Guide

Step-by-step guide to deploy BrainVault with full functionality.

## Prerequisites

Before deploying, ensure you have:

- GitHub account
- Vercel account (sign up at vercel.com)
- Clerk account with API keys
- Pinecone account with index created
- HuggingFace API key (for embeddings)
- Groq API key (for chat)

## Step 1: Prepare Your Code

### 1.1 Ensure you're using HuggingFace + Groq

Your `.env.local` should have:
```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_...
GROQ_API_KEY=gsk_...
PINECONE_INDEX_DIMENSIONS=384
```

### 1.2 Commit all changes

```bash
# Make sure all changes are committed
git status

# If there are uncommitted changes:
git add .
git commit -m "Ready for deployment"
```

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `brainvault` (or any name you prefer)
4. Set to **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 2.2 Push Your Code

```bash
# If you haven't initialized git yet:
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BrainVault ready for deployment"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/brainvault.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you already have an account)
3. Sign up with **GitHub** (recommended - easiest integration)

### 3.2 Import Your Repository

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find your `brainvault` repository and click **"Import"**

### 3.3 Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (should be auto-filled)

**Output Directory:** `.next` (should be auto-filled)

**Install Command:** `npm install` (should be auto-filled)

### 3.4 Add Environment Variables

Add all required environment variables in Vercel:

Click **"Environment Variables"** and add each one:

#### Clerk Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Pinecone Variables:
```
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=brainvault
PINECONE_INDEX_DIMENSIONS=384
```

#### AI Provider Variables:
```
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_...
GROQ_API_KEY=gsk_...
```

For each variable:
1. Enter the **Name**
2. Enter the **Value** (paste from your `.env.local`)
3. Select **Environment**: Check all three boxes (Production, Preview, Development)
4. Click **"Save"**

### 3.5 Deploy!

1. Once all environment variables are added, click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll see a success message with your live URL: `https://your-app-name.vercel.app`

## Step 4: Update Clerk Settings

Your Clerk app needs to know about your Vercel URL.

### 4.1 Update Allowed URLs in Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your BrainVault application
3. Go to **"Configure"** → **"Domains"**
4. Under **"Allowed Redirect URLs"**, add:
   ```
   https://your-app-name.vercel.app
   https://your-app-name.vercel.app/*
   ```
5. Under **"Blocked Redirect URLs"**, make sure your Vercel URL is NOT there
6. Click **"Save"**

### 4.2 Update Sign-In/Sign-Up URLs (if needed)

If your URLs changed:
1. Go to **"Configure"** → **"Email, Phone, Username"** (or your auth method)
2. Update the redirect URLs to match your Vercel domain
3. Save changes

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. **Sign Up** with a new account (or sign in)
3. **Upload a document** (PDF or text file)
4. **Chat with your document** - ask it questions
5. Verify everything works!

## Success

Your BrainVault is now deployed and accessible.

Your live URL: `https://your-app-name.vercel.app`

## Updating Your Deployment

Any time you make changes:

```bash
# Make your changes locally
# Then commit and push:
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will **automatically redeploy** your app with the new changes!

## Important Notes

### What Works on Vercel

- ✅ Next.js app hosting
- ✅ API routes (with 60s timeout limit)
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Automatic deployments from GitHub

### Limitations

- **Function Timeout:** 60 seconds max per API call
  - Your upload/chat endpoints should work fine
  - Large document processing might time out (unlikely with normal PDFs)
  
- **Cold Starts:** First request after inactivity may be slower
  - Normal after ~10 minutes of inactivity
  - Subsequent requests are fast

- **In-Memory Storage:** Documents list resets on server restart
  - Vectors in Pinecone persist
  - Document metadata resets

### Security Notes

- All your API keys are stored securely in Vercel
- They're only accessible to your deployment
- Never commit `.env.local` to GitHub (it's in .gitignore)

## Troubleshooting

### Build Fails

**Check:**
- All environment variables are set correctly
- No typos in variable names
- All dependencies are in `package.json`

### App Deploys but Shows Errors

**Check:**
- Browser console for errors
- Vercel function logs (in Vercel dashboard → your project → "Functions")
- Verify all environment variables are set

### "Cannot connect to Pinecone" Error

**Check:**
- `PINECONE_API_KEY` is set correctly
- `PINECONE_INDEX_NAME` matches your actual index name
- Index exists in Pinecone dashboard

### "Clerk: Unauthorized" Error

**Check:**
- Clerk keys are correct
- Vercel URL is added to Clerk's allowed domains
- Check Clerk dashboard for any errors

### Chat Not Working

**Check:**
- `GROQ_API_KEY` is set
- `HUGGINGFACE_API_KEY` is set
- `AI_PROVIDER=huggingface` is set
- Check Vercel function logs for errors

## Next Steps

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Database:** Add Supabase/MongoDB for persistent document storage
3. **Analytics:** Add Vercel Analytics (free tier available)
4. **Monitoring:** Set up error tracking (Sentry has free tier)

Your app is now live and accessible.

