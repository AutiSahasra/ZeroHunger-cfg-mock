# ZeroHunger Food Rescue Platform — Donor Backend Service

Backend service implemented for the **Food Donor** persona with **Google Maps API** integration (excluding Socket.IO per specification).

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (Express.js)
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing
- **Maps & Geolocation**: Google Maps Geocoding & Distance Matrix APIs + Google Maps JS API Configuration

---

## ⚙️ Environment Configuration (`.env`)

Create or update `.env` inside the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb://127.0.0.1:27017/zerohunger

# JWT Authentication
JWT_SECRET=zerohunger_donor_jwt_super_secret_key_2026_cfg
JWT_EXPIRES_IN=7d

# Google Maps API Configuration
# Provide your Google Maps API Key here (with Geocoding API, Places API, and Maps JavaScript API enabled)
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Donor Data
Populates default donors (e.g., ITC Grand Chola Banquets, Annapoorna Catering Hall) and initial food requests:
```bash
npm run seed
```

### 3. Start the Server
```bash
# Production start
npm start

# Development mode with hot-reloading
npm run dev
```

### 4. Run Automated Verification Tests
```bash
node test-donor-module.js
```

---

## 📡 API Endpoints (Donor Modules)

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new food donor organization |
| `POST` | `/api/auth/login` | Public | Log in with donor credentials and receive JWT |
| `GET` | `/api/auth/me` | Protected | Get current authenticated donor profile |
| `POST` | `/api/auth/logout` | Protected | Terminate donor session |

### 2. Food Request Management (`/api/requests`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/requests` | Donor | Create surplus food donation request (status: `PENDING`) |
| `GET` | `/api/requests/mine` | Donor | List donor's requests (supports `?status=ACTIVE|COMPLETED|PENDING`) |
| `GET` | `/api/requests/:id` | Donor | Get request details, volunteer assignment, and delivery proof |
| `PATCH` | `/api/requests/:id` | Donor | **Edit request (permitted ONLY while status is `PENDING`)** |
| `DELETE` | `/api/requests/:id` | Donor | **Cancel request (permitted ONLY while status is `PENDING`)** |
| `POST` | `/api/requests/:id/cancel`| Donor | Alternative cancellation endpoint |

### 3. Donor Analytics & Impact KPIs (`/api/donors/me/stats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/donors/me/stats` | Donor | Total servings, kg rescued, successful deliveries, active breakdown |

### 4. Request Chat Messages (`/api/requests/:id/messages`)
*(REST implementation without Socket.IO)*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/requests/:id/messages` | Donor | Retrieve chat history for the request |
| `POST` | `/api/requests/:id/messages` | Donor | Send message from donor |

### 5. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Donor | List donor notifications |
| `PATCH` | `/api/notifications/:id/read` | Donor | Mark specific notification as read |
| `PATCH` | `/api/notifications/read-all` | Donor | Mark all notifications as read |

### 6. Google Maps API Endpoints (`/api/maps`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/maps/config` | Public | Returns Google Maps JS API script URL, API key, and defaults |
| `GET` | `/api/maps/geocode?address=...` | Donor | Converts text address to latitude & longitude |
| `GET` | `/api/maps/reverse-geocode?lat=...&lng=...` | Donor | Converts coordinates to formatted street address |
| `GET` | `/api/maps/distance?originLat=...` | Donor | Computes distance & travel time via Distance Matrix API |

---

## 🔒 State Integrity Rules Enforced
1. **Donor Ownership**: Donors can only inspect, edit, and cancel requests that they created.
2. **Strict Status Lifecycle**: `PATCH /api/requests/:id` and `DELETE /api/requests/:id` strictly enforce that requests must have a status of `PENDING`. Modifying an `ACCEPTED`, `IN_PROGRESS`, `DELIVERED`, or `CANCELLED` request is blocked with HTTP `400 Bad Request`.
3. **Audit Trail**: All modifications and cancellations automatically log actor, timestamp, and reason to `statusHistory`.
