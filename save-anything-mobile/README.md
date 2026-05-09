# SaveStack Mobile

This is the next phase of the SaveStack idea: an Expo-ready React Native mobile app.

## What Is Built

- Mobile app screen using React Native components
- Save URL, title, category, platform, and note
- Search saved items
- Filter by category
- Favorite, edit, delete, and open links
- Local persistence using AsyncStorage
- Firebase config placeholder for the backend phase

## Run Locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Then scan the Expo QR code with Expo Go on Android, or run on an emulator.

## Deploy For Users

The app can be deployed as a web app first, so users can open it from a link.

Create the production build:

```bash
npm run build:web
```

The deployable files will be created in:

```text
dist
```

### Netlify

This project includes `netlify.toml`, so Netlify can build it automatically.

Recommended Netlify settings:

- Base directory: `save-anything-mobile`
- Build command: `npm run build:web`
- Publish directory: `save-anything-mobile/dist`

If deploying manually with Netlify CLI:

```bash
npx netlify deploy --prod --dir=dist
```

### Mobile Store Phase

For Android/iOS publishing, use Expo EAS:

```bash
npx eas build --platform android
```

That phase needs an Expo account and app signing setup.

## Firebase Phase

Create a Firebase project and replace the placeholder values in:

```text
src/firebase/config.js
```

Recommended Firebase services:

- Firebase Authentication for signup/login
- Cloud Firestore for saved links per user
- Firebase Storage later for thumbnails
- Cloud Functions later for AI summaries and auto-category suggestions
