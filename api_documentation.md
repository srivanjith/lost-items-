# Backend API Documentation

The College Lost & Found Portal API is built with Node.js, Express.js, and MySQL. It uses JSON Web Tokens (JWT) for user authentication.

---

## 🔒 Authentication Headers
For endpoints requiring authentication, pass the JWT token in the `Authorization` header as a Bearer token:
```text
Authorization: Bearer <your_jwt_token_here>
```

---

## 🔑 Authentication Endpoints

### 1. Student / Admin Registration
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@college.edu",
    "password": "password123",
    "phone": "9876543210",
    "role": "student" 
  }
  ```
  *(Note: role can be `"student"` or `"admin"`. Defaults to `"student"`).*
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful!",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 4,
      "name": "Jane Doe",
      "email": "jane@college.edu",
      "phone": "9876543210",
      "role": "student"
    }
  }
  ```

### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "alice@college.edu",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful!",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@college.edu",
      "phone": "1234567890",
      "role": "student"
    }
  }
  ```

---

## 👤 User Profile Endpoints

### 1. Get Logged-in User Profile
* **Endpoint**: `GET /api/users/profile`
* **Access**: Private (Authenticated User)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@college.edu",
      "phone": "1234567890",
      "role": "student",
      "created_at": "2026-06-06T03:54:00.000Z"
    }
  }
  ```

### 2. Update User Profile
* **Endpoint**: `PUT /api/users/profile`
* **Access**: Private (Authenticated User)
* **Request Body**:
  ```json
  {
    "name": "Alice Johnson Updated",
    "email": "alice@college.edu",
    "phone": "1112223333",
    "currentPassword": "password123", 
    "newPassword": "newpassword123" 
  }
  ```
  *(Note: Password fields are optional. Use them only to update password).*
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully!",
    "user": {
      "id": 1,
      "name": "Alice Johnson Updated",
      "email": "alice@college.edu",
      "phone": "1112223333",
      "role": "student"
    }
  }
  ```

---

## 🔍 Lost Items Endpoints

### 1. Report a Lost Item
* **Endpoint**: `POST /api/lost-items`
* **Access**: Private (Authenticated User)
* **Content-Type**: `multipart/form-data`
* **Request Body (FormData)**:
  - `item_name` (string, required)
  - `category` (string, required)
  - `description` (string, required)
  - `location` (string, required)
  - `date_lost` (date string `YYYY-MM-DD`, required)
  - `contact_number` (string, required)
  - `image` (file, optional)
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lost item reported successfully!",
    "item": {
      "id": 4,
      "user_id": 1,
      "item_name": "Leather Notebook",
      "category": "Books & Stationery",
      "description": "Brown leather notebook with ruled pages.",
      "image": "16230485934-829.jpg",
      "location": "Science Hall 101",
      "date_lost": "2026-06-05",
      "status": "lost"
    }
  }
  ```

### 2. List Active Lost Items
* **Endpoint**: `GET /api/lost-items`
* **Access**: Public
* **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `category` (string, optional filter)
  - `location` (string, optional filter)
  - `search` (string, optional keywords)
  - `status` (string, optional: `lost` or `resolved`. Defaults to `lost`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "items": [
      {
        "id": 1,
        "user_id": 1,
        "item_name": "iPhone 13 Black",
        "category": "Electronics",
        "description": "Black iPhone 13 in a blue case.",
        "image": null,
        "location": "Library Study Room B",
        "date_lost": "2026-06-01T18:30:00.000Z",
        "status": "lost",
        "created_at": "2026-06-06T03:54:00.000Z",
        "reporter_name": "Alice Johnson",
        "reporter_email": "alice@college.edu",
        "reporter_phone": "1234567890"
      }
    ]
  }
  ```

### 3. Get Single Lost Item details
* **Endpoint**: `GET /api/lost-items/:id`
* **Access**: Public
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "item": {
      "id": 1,
      "user_id": 1,
      "item_name": "iPhone 13 Black",
      "category": "Electronics",
      "description": "Black iPhone 13 in a blue case.",
      "image": null,
      "location": "Library Study Room B",
      "date_lost": "2026-06-01T18:30:00.000Z",
      "status": "lost",
      "created_at": "2026-06-06T03:54:00.000Z",
      "reporter_name": "Alice Johnson",
      "reporter_email": "alice@college.edu",
      "reporter_phone": "1234567890"
    }
  }
  ```

### 4. Update Lost Item Details
* **Endpoint**: `PUT /api/lost-items/:id`
* **Access**: Private (Only Creator or Admin)
* **Content-Type**: `multipart/form-data`
* **Request Body (FormData)**: Same as POST. (e.g. set `status` to `"resolved"`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lost item updated successfully!",
    "item": {
      "id": 1,
      "user_id": 1,
      "item_name": "iPhone 13 Black",
      "category": "Electronics",
      "description": "Updated description details.",
      "image": null,
      "location": "Library Study Room B",
      "date_lost": "2026-06-01",
      "status": "resolved"
    }
  }
  ```

### 5. Delete Lost Item report
* **Endpoint**: `DELETE /api/lost-items/:id`
* **Access**: Private (Only Creator or Admin)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lost item report deleted successfully!"
  }
  ```

---

## 🔎 Found Items Endpoints

Supports identical paths and operations as lost items:
* `POST /api/found-items` (Create)
* `GET /api/found-items` (List)
* `GET /api/found-items/:id` (Details)
* `PUT /api/found-items/:id` (Update)
* `DELETE /api/found-items/:id` (Delete)

---

## 🔍 Search & Filtering Endpoints

### 1. Global Unified Search
Searches across both lost and found active databases, combining results using SQL UNION.
* **Endpoint**: `GET /api/search`
* **Access**: Public
* **Query Parameters**:
  - `query` (string, optional: search terms in name or description)
  - `category` (string, optional: category name)
  - `location` (string, optional: location filter)
  - `type` (string, optional: `"lost"`, `"found"`, or `"all"`. Default: `"all"`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "items": [
      {
        "report_type": "lost",
        "id": 1,
        "user_id": 1,
        "item_name": "iPhone 13 Black",
        "category": "Electronics",
        "description": "Black iPhone 13...",
        "image": null,
        "location": "Library Study Room B",
        "item_date": "2026-06-01T18:30:00.000Z",
        "status": "lost",
        "created_at": "2026-06-06T03:54:00.000Z",
        "reporter_name": "Alice Johnson",
        "reporter_email": "alice@college.edu",
        "reporter_phone": "1234567890"
      }
    ]
  }
  ```

---

## 🧠 Smart Matching Endpoints

### 1. Get Matches
Fetches computed similarity matches. Normal students will only see matches related to items they reported. Admins see all matches.
* **Endpoint**: `GET /api/matches`
* **Access**: Private (Authenticated User)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "matches": [
      {
        "match_id": 1,
        "match_score": 85.00,
        "match_date": "2026-06-06T03:54:00.000Z",
        "lost_item": {
          "id": 1,
          "item_name": "iPhone 13 Black",
          "category": "Electronics",
          "description": "Black iPhone 13 with a cracked screen protector and a blue silicone case.",
          "image": null,
          "location": "Library Study Room B",
          "date_lost": "2026-06-01T18:30:00.000Z",
          "status": "lost",
          "owner": {
            "id": 1,
            "name": "Alice Johnson",
            "email": "alice@college.edu",
            "phone": "1234567890"
          }
        },
        "found_item": {
          "id": 1,
          "item_name": "iPhone 13 with blue case",
          "category": "Electronics",
          "description": "Found a black iPhone 13 in a blue case on the floor. Screen protector is cracked.",
          "image": null,
          "location": "Library Second Floor",
          "date_found": "2026-06-02T18:30:00.000Z",
          "status": "found",
          "finder": {
            "id": 2,
            "name": "Bob Smith",
            "email": "bob@college.edu",
            "phone": "9876543210"
          }
        }
      }
    ]
  }
  ```

---

## 📈 Dashboard Endpoints

### 1. Get Metrics & Recent Activities
Retrieves counts of lost items, found items, matches, and the 5 most recent reports.
* **Endpoint**: `GET /api/dashboard/stats`
* **Access**: Private (Authenticated User)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalLost": 3,
      "totalFound": 3,
      "totalMatches": 2
    },
    "recentReports": [
      {
        "report_type": "found",
        "id": 3,
        "item_name": "Black Leather Wallet",
        "category": "Keys & Cards",
        "location": "Cafeteria",
        "item_date": "2026-06-05T18:30:00.000Z",
        "status": "found",
        "created_at": "2026-06-06T03:54:00.000Z"
      }
    ]
  }
  ```

---

## 🛡️ Admin Moderation Endpoints (Admin Only)

### 1. List All User Accounts
* **Endpoint**: `GET /api/admin/users`
* **Access**: Private (Admin Only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 3,
    "users": [
      {
        "id": 3,
        "name": "Admin User",
        "email": "admin@college.edu",
        "phone": "5555555555",
        "role": "admin",
        "created_at": "2026-06-06T03:54:00.000Z"
      }
    ]
  }
  ```

### 2. List All Active and Resolved Reports
* **Endpoint**: `GET /api/admin/reports`
* **Access**: Private (Admin Only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 6,
    "reports": [
      {
        "report_type": "lost",
        "id": 3,
        "item_name": "Silver Keychain with 3 keys",
        "category": "Keys & Cards",
        "description": "Keychain with a silver key...",
        "image": null,
        "location": "Student Center Gym",
        "item_date": "2026-06-04T18:30:00.000Z",
        "status": "lost",
        "created_at": "2026-06-06T03:54:00.000Z",
        "reporter_name": "Alice Johnson",
        "reporter_email": "alice@college.edu",
        "reporter_phone": "1234567890"
      }
    ]
  }
  ```

### 3. Moderate / Delete Any Report
Deletes any report by its ID from `lost_items` or `found_items`.
* **Endpoint**: `DELETE /api/admin/report/:id`
* **Access**: Private (Admin Only)
* **Query Parameters**:
  - `type` (string, required: `"lost"` or `"found"`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lost item report deleted by administrator."
  }
  ```
