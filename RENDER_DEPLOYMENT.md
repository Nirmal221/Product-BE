# Render.com Deployment Guide

## Fix for "Cannot find module '/opt/render/project/src/dist/index.js'"

This error occurs because Render is looking in the wrong path. The compiled files are at `/opt/render/project/dist/index.js` (not `src/dist`).

## Solution

### Option 1: Using render.yaml (Recommended)

The project includes a `render.yaml` file. In your Render dashboard:

1. Go to your service settings
2. Under "Build & Deploy" → "Build Settings"
3. Select **"Use render.yaml"** or manually set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js` (NOT `npm start`)
   - **Root Directory:** `.` (leave empty or set to `.` - NOT `src`)

### Option 2: Manual Configuration

If not using `render.yaml`, configure these in Render dashboard:

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/index.js`
- **Root Directory:** `.` (project root - **IMPORTANT: Do NOT set this to `src`**)

**Environment Variables:**
Add these in Render dashboard:
- `NODE_ENV=production`
- `PORT=10000` (or the port Render assigns)
- `MONGODB_URI=your_mongodb_connection_string`
- `CLOUDINARY_CLOUD_NAME=your_cloud_name`
- `CLOUDINARY_API_KEY=your_api_key`
- `CLOUDINARY_API_SECRET=your_api_secret`

## Verify Build Output

After deployment, check the build logs. You should see:
```
> tsc
```

The build should create:
```
/opt/render/project/
├── dist/
│   └── index.js          ← This is what should run
├── src/
│   └── index.ts
├── package.json
└── ...
```

## Common Issues

1. **"Root Directory" is set to `src`:**
   - Change it to `.` (project root)
   - This is the most common cause of the path error

2. **Build fails:**
   - Check that TypeScript compiles successfully
   - Verify `tsconfig.json` has `outDir: "./dist"`

3. **Start command uses wrong path:**
   - Use: `node dist/index.js`
   - NOT: `node src/dist/index.js` or `npm start` (unless package.json start is correct)

## Testing Locally

Before deploying, test the build:
```bash
npm run build
node dist/index.js
```

This should compile and start the server successfully.
