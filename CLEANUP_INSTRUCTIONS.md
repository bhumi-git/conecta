# Project Structure Cleanup Guide

## CURRENT STRUCTURE (CLEAN - KEEP):
```
Conecta/
├── src/
│   ├── App.jsx                    ✅ Main app
│   ├── App.css
│   ├── main.jsx
│   ├── index.css
│   ├── assets/                    ✅ Keep (images)
│   └── pages/                     ✅ KEEP THIS LEVEL
│       ├── firebase.js            ✅ Firebase config
│       ├── auth.jsx               ✅ Auth component
│       ├── auth.css               ✅ Auth styles
│       ├── landing.jsx            ✅ Landing page
│       ├── landing.css            ✅ Landing styles
│       ├── StudentDashboard.jsx   ✅ Student dashboard
│       ├── TeacherDashboard.jsx   ✅ Teacher dashboard
│       ├── Feed.jsx               ✅ Feed component
│       ├── Feed.css               ✅ Feed styles
│       ├── Sidebar.jsx            ✅ Sidebar component
│       ├── Dashboard.css          ✅ Dashboard styles
│       └── src/                   ❌ DELETE THIS (nested duplicate)
│           └── pages/src/pages/...
```

## FOLDERS TO DELETE:
```
❌ src/pages/src/                    (entire nested tree)
   This contains duplicate, old files that are no longer used.
   The actual files are in src/pages/ (one level up)
```

## HOW TO MANUALLY DELETE:
1. Open File Explorer
2. Navigate to: `C:\Users\HP\OneDrive\Desktop\Conecta\src\pages\`
3. Find the folder named `src` (highlighted below)
4. Right-click → Delete
5. Confirm deletion

## FINAL CLEAN STRUCTURE (after cleanup):
```
Conecta/src/pages/
├── Dashboard.css
├── Feed.css
├── Feed.jsx
├── Sidebar.jsx
├── StudentDashboard.jsx
├── TeacherDashboard.jsx
├── auth.css
├── auth.jsx
├── firebase.js
├── landing.css
└── landing.jsx
```

## VERIFICATION:
After deletion, the src/pages/ folder should contain EXACTLY 11 files (no nested folders).
