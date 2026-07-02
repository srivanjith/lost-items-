# College Lost & Found Portal

A complete, production-ready full-stack web application designed for students and administrators to report lost/found items, search catalog records, and display smart similarity matches within a college campus.

---

## 🚀 Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT-based login and registration (password hashing via `bcryptjs`)
- **File Uploads**: Local storage via `multer` middleware

---

## 📁 Project Structure

```text
lost-items/
├── database/
│   └── lost_found.sql         # Database schema and seed data
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── adminController.js # Admin moderators capabilities
│   │   ├── authController.js  # User login and registration handler
│   │   ├── dashboardController.js # Dashboard metrics assembler
│   │   ├── foundController.js # Found items CRUD controller
│   │   ├── lostController.js  # Lost items CRUD controller
│   │   ├── matchController.js # Similarity matches retrieval
│   │   └── searchController.js# Unified database search engine
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification guards
│   │   └── uploadMiddleware.js# Multer image validation helper
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── foundRoutes.js
│   │   ├── lostRoutes.js
│   │   ├── matchRoutes.js
│   │   └── searchRoutes.js
│   ├── uploads/               # Item images directory (auto-created)
│   ├── .env                   # Configuration file (ignored in git)
│   ├── package.json
│   └── server.js              # Main Express server entrypoint
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx     # Responsive main shell navigation
    │   │   └── ProtectedRoute.jsx # Authentication route checks
    │   ├── context/
    │   │   ├── AuthContext.jsx# Application login auth context
    │   │   └── ToastContext.jsx # Modern dynamic notification system
    │   ├── pages/
    │   │   ├── AdminPanel.jsx # Moderation portal
    │   │   ├── Dashboard.jsx  # Metrics visual dashboard
    │   │   ├── Login.jsx      # Validate credential form
    │   │   ├── Matches.jsx    # Side-by-side comparison screen
    │   │   ├── Profile.jsx    # Profile adjustments & reports
    │   │   ├── Register.jsx   # Register student or admin
    │   │   ├── ReportFound.jsx# Found reporting form
    │   │   ├── ReportLost.jsx # Lost reporting form
    │   │   └── Search.jsx     # Search & Filter grid
    │   ├── services/
    │   │   └── api.js         # Axios helper services
    │   ├── App.jsx            # Routing and global entrypoint
    │   ├── index.css          # Tailwind import directives
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js         # Vite configuration with Tailwind CSS v4
```

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
- **Node.js** (v16+ recommended)
- **MySQL Server**

---

### Step 1: Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or terminal).
2. Execute the schema file located at `database/lost_found.sql`:
   ```bash
   mysql -u root -p < database/lost_found.sql
   ```
   *Note: This creates a database named `lost_found_db` and seeds users, items, and matches.*

---

### Step 2: Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. A `.env` file has been pre-configured with default credentials. Review or modify it if your MySQL requires a password:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=lost_found_db
   JWT_SECRET=supersecretlostfoundportaltokenkey12345
   ```
4. Start the server using Nodemon (for development):
   ```bash
   npm run dev
   ```
   *The server starts listening on `http://localhost:5000`.*

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend starts listening on `http://localhost:5173`.*

---

## 🔑 Seeding User Credentials
For quick evaluation, the database contains three seeded accounts (password is `password123` for all):

| Name | Email | Role |
| :--- | :--- | :--- |
| **Alice Johnson** | `alice@college.edu` | Student |
| **Bob Smith** | `bob@college.edu` | Student |
| **Admin User** | `admin@college.edu` | Admin |

---

## 🧠 Smart Similarity Matching Logic
When reports are created or updated, our backend scans opposite active tables to search matches. The matching score is calculated from **0% to 100%** based on:
1. **Category (30%)**: Matches if the items fall under the exact category name.
2. **Item Name (25%)**: Calculates Jaccard token similarities (omits common English stopwords like a, the, of, in). Falls back to a substring contain search.
3. **Description Details (25%)**: Jaccard token similarity over detailed descriptions.
4. **Campus Location (20%)**: Token overlap on reported locations.

Matches with a similarity score **>= 35%** are saved into the `matches` database table.
