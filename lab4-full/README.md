# Lab 4 - Secure Connect and Communication Platform

Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt + dotenv + Socket.IO + EventEmitter

## Folder structure
```
lab4-full/
├── server.js                 starting point
├── .env                      secret settings (port, DB link, JWT secret)
├── package.json              libraries list
├── config/
│   └── db.js                 connects to MongoDB
├── models/
│   ├── User.js               user structure
│   ├── Note.js               note structure
│   └── Message.js            chat message structure
├── middleware/
│   ├── authMiddleware.js     checkLogin  -> verifies JWT
│   └── roleMiddleware.js     checkRole   -> RBAC (admin only)
├── routes/
│   ├── authRoutes.js         signup, login, profile
│   ├── noteRoutes.js         notes CRUD (protected)
│   └── adminRoutes.js        admin-only routes
├── events/
│   └── eventEmitter.js       EventEmitter events + listeners
├── socket/
│   └── chat.js               Socket.IO chat (JWT secured)
├── public/
│   └── index.html            signup / login / chat page
└── postman/
    └── Lab4.postman_collection.json   ready-made API tests
```

## How to run
1. Install **Node.js** (LTS) from nodejs.org.
2. Get MongoDB ready (pick ONE):
   - **Local:** install MongoDB Community Server (it runs in the background).
   - **Atlas (cloud, free):** create a cluster, click Connect > Drivers, copy the link and put it in `.env` as `MONGO_URI=...` (replace `<password>`).
3. Open this folder in VS Code, open the terminal (Ctrl + `) and run:
   ```
   npm install
   npm start
   ```
4. You should see:
   ```
   Server running at http://localhost:3000
   MongoDB connected
   ```

## API list
| Method | URL | Who can use it |
|---|---|---|
| POST | /api/auth/signup | everyone |
| POST | /api/auth/login | everyone |
| GET | /api/auth/profile | logged-in users |
| POST | /api/notes | logged-in users |
| GET | /api/notes | logged-in users (own notes) |
| GET | /api/notes/:id | logged-in users (own note) |
| PUT | /api/notes/:id | logged-in users (own note) |
| DELETE | /api/notes/:id | logged-in users (own note) |
| GET | /api/admin/users | admin only |
| GET | /api/admin/notes | admin only |

## How to test
**Postman:** Import `postman/Lab4.postman_collection.json` and run the requests 1 to 9 in order.
The login request saves the token automatically, so you do not have to copy it.

**Screenshots for the lab:**
- Fig 1: Signup and Login responses (requests 1 and 2)
- Fig 2: Notes without token = 401 (request 3), then with token (requests 4-6)
- Fig 3: Open http://localhost:3000 in two tabs, signup/login as two different users, chat.
  Take a screenshot of the chat and of the terminal logs (`[SOCKET]` and `[EVENT]` lines).

**Admin test:** signup with `admin@example.com` (the ADMIN_EMAIL in .env), login, and call GET /api/admin/users with that token.

## Viva answers
- **Why hash passwords?** If the database leaks, real passwords stay safe. bcrypt adds a random salt and is slow on purpose.
- **What is JWT?** A signed token the server gives after login. The client sends it with every request, so the server does not store sessions (stateless).
- **Authentication vs Authorization?** Authentication = who are you (login). Authorization = what are you allowed to do (roles).
- **What is middleware?** A function that runs between the request and the route (`checkLogin`, `checkRole`).
- **What is RBAC?** Access depends on the user's role (user / admin).
- **HTTP vs WebSocket?** HTTP: client asks, server answers. WebSocket: the connection stays open and both sides can send any time.
- **What is EventEmitter?** Node's built-in tool: `emit` announces an event, `on` reacts to it.
- **Why dotenv?** Keeps secrets (JWT secret, DB link) out of the code.
- **Why can't a user make himself admin?** The role is set by the server from ADMIN_EMAIL, never from the request body.
- **Why filter notes by owner?** So one user cannot read or change another user's notes.
