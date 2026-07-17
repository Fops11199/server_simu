# Project Runbook

## 1. Overview
This project is a React + Vite application for an interactive hosting simulator.

It is designed for local development and learning purposes.

## 2. Prerequisites
Make sure the following are installed on your machine:

- Node.js 18 or newer
- npm
- Git

## 3. Open the Project Folder
Open the project directory in your terminal:

```bash
cd /d/builds/web/papper\ simu/server_simu
```

If you are using PowerShell on Windows:

```powershell
Set-Location "D:\builds\web\papper simu\server_simu"
```

## 4. Install Dependencies
Run the following command:

```bash
npm install
```

## 5. Run the Development Server
Start the app with:

```bash
npm run dev
```

Then open the app in your browser at:

```text
http://localhost:3000
```

## 6. Common Commands

### Start development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Run TypeScript check
```bash
npm run lint
```

### Clean build output
```bash
npm run clean
```

## 7. Testing and Verification
This project does not currently include a dedicated automated test suite.

Use these checks before considering the app ready:

```bash
npm run lint
npm run build
```

Then manually verify:
1. Open the app in the browser.
2. Confirm the UI loads correctly.
3. Click through the main sections.
4. Check that there are no visible errors in the console.

## 8. Troubleshooting

### npm says package.json not found
You are likely not in the correct folder. Go to the project folder first:

```bash
cd /d/builds/web/papper\ simu/server_simu
```

### npm install fails with ENOSPC
Free up disk space and try again.

### Port 3000 is already in use
Stop the other process or change the port in the Vite config.

## 9. Notes
The main scripts are defined in the project package file.
