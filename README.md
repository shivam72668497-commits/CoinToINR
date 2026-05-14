# Shivearnapp Starter Project

## Files
- `index.html` → entry point
- `login.html` → user login
- `signup.html` → user signup
- `dashboard.html` → user home
- `tasks.html` → live tasks / games
- `wallet.html` → user balance page
- `profile.html` → user profile
- `contact.html` → support page
- `privacy.html`, `terms.html`, `rules.html` → legal pages

### Admin
- `admin/login.html` → admin login
- `admin/dashboard.html` → admin control panel

### Firebase
- `firebaseconfig.js` → paste Firebase config here
- Use Firebase Authentication, Realtime Database, and Storage

## Database Structure
```json
{
  "users": {
    "uid": {
      "name": "User Name",
      "email": "user@example.com",
      "balance": 0,
      "earned": 0,
      "joinedAt": 0,
      "status": "active",
      "role": "user"
    }
  },
  "items": {
    "itemId": {
      "title": "Task title",
      "description": "Task description",
      "reward": "10",
      "type": "task",
      "actionUrl": "https://example.com",
      "buttonText": "Open",
      "imageUrl": "https://...",
      "enabled": true,
      "status": "active",
      "createdAt": 0,
      "updatedAt": 0,
      "createdBy": "adminUid"
    }
  },
  "admins": {
    "adminUid": true
  }
}
```

## Setup
1. Create a Firebase project.
2. Enable Email/Password and Google sign-in.
3. Create Realtime Database.
4. Enable Firebase Storage.
5. Paste config into `firebaseconfig.js`.
6. Add your admin UID under `admins/{uid} = true`.
7. Upload `assets/shivearnapp.png`.

## Notes
- This is a front-end starter.
- Admin changes are live because the user app listens to `items/` in Realtime Database.
- Uploaded images use Firebase Storage; image URLs can also be pasted directly.
