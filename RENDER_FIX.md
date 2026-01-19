# Render.com Deployment Fix

## The Problem

The error shows:
```
Error: Cannot find module '/opt/render/project/src/dist/index.js'
```

But the file should be at `/opt/render/project/dist/index.js` (not `src/dist`).

## Root Cause

Render.com might be:
1. Running the start command from the wrong directory
2. Or the "Root Directory" setting is incorrect in Render dashboard

## Solutions

### Solution 1: Use yarn start (Recommended)

The `render.yaml` has been updated to use `yarn start` which uses the package.json script that correctly resolves the path.

**In Render Dashboard:**
1. Go to your service → Settings → Build & Deploy
2. Make sure:
   - **Root Directory:** `.` (project root - **NOT** `src`)
   - **Build Command:** `yarn install && yarn build`
   - **Start Command:** `yarn start` (or `npm start`)

### Solution 2: Use Absolute Path

If Solution 1 doesn't work, try using an absolute path in the start command:

**In render.yaml:**
```yaml
startCommand: node /opt/render/project/dist/index.js
```

**Or in Render Dashboard:**
- **Start Command:** `node /opt/render/project/dist/index.js`

### Solution 3: Verify Root Directory

**CRITICAL:** In Render Dashboard:
1. Go to Settings → Build & Deploy
2. Check **"Root Directory"** field
3. It should be `.` (dot) or empty - **NOT** `src`
4. If it's set to `src`, change it to `.` and redeploy

### Solution 4: Check Build Output

After build, verify the file exists:
1. Check build logs - you should see `tsc` running
2. The build should create `dist/index.js` at the project root
3. Verify in build logs that `dist/index.js` is created

## Verification

After deploying, check the build logs. You should see:
```
> yarn build
> tsc
```

And the start command should find `dist/index.js` at the project root, not in `src/dist`.

## Most Common Issue

**The "Root Directory" in Render Dashboard is set to `src` instead of `.`**

This causes all paths to be resolved relative to `src`, so `dist/index.js` becomes `src/dist/index.js`.

**Fix:** Change Root Directory to `.` (project root) in Render Dashboard.
