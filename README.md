# Cloudflare Pages Deployment Cleanup Script

This script helps you delete old Cloudflare Pages deployments to free up storage and improve performance.

## Prerequisites

1. **Cloudflare API Token**: You need a Cloudflare API token with `Pages:Edit` permissions
2. **Account ID**: Your Cloudflare Account ID
3. **Project Name**: The name of your Cloudflare Pages project

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

3. **Fill in your credentials**:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID  
   - `CLOUDFLARE_PROJECT_NAME`: Your project name (optional, defaults to 'example-project')

## Usage

Run the script:
```bash
npm start
```

Or directly with Node:
```bash
node delete-pages-deployments.js
```

## What the script does

1. Fetches all deployments for your project (paginated)
2. Deletes each deployment one by one
3. Provides detailed logging of the process
4. Shows a summary at the end

## Safety Features

- ✅ Environment variable validation
- ✅ Comprehensive error handling
- ✅ Rate limiting protection (100ms delay between deletions)
- ✅ Detailed logging and progress tracking
- ✅ Graceful error recovery

## Troubleshooting

- **"CLOUDFLARE_API_TOKEN environment variable is required"**: Make sure you've set up your `.env` file correctly
- **"HTTP error! status: 403"**: Check that your API token has the correct permissions
- **"HTTP error! status: 404"**: Verify your Account ID and Project Name are correct

## Security Note

Never commit your `.env` file to version control. The `.env` file is already in `.gitignore` to prevent accidental commits. 
