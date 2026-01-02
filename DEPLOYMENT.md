# Deployment Guide

## Render Deployment

This project is configured for deployment on Render.com.

### Build Settings for Render:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Node Version**: 18+ (recommended)

### Environment Variables:

Set these in your Render dashboard:

- `GEMINI_API_KEY`: Your Google Gemini API key

### Deployment Process:

1. Connect your GitHub repository to Render
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy!

### Local Testing:

```bash
# Build the project
npm run build

# Test the production server locally
npm start
```

### Notes:

- The app will serve on the PORT environment variable (provided by Render)
- Static files are served from the `dist` directory
- The start.js script handles cross-platform port configuration

### Troubleshooting:

If deployment fails:
1. Check that `dist` folder exists after build
2. Verify all dependencies are in `dependencies` (not `devDependencies`)
3. Check Render logs for specific error messages