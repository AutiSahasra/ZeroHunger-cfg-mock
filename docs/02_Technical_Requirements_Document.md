# TECHNICAL REQUIREMENTS DOCUMENT
## No Food Waste — Food Rescue & Redistribution Platform

### 1. Technical Scope
This document defines the technical requirements for implementing the No Food Waste platform. It focuses on architecture, APIs, database requirements, authentication, maps, priority calculation, real-time communication, notifications, file handling, analytics, security and non-functional requirements.

### 2. Recommended Technology Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time communication**: Socket.IO
- **Maps**: MapLibre GL JS with suitable map-data, geocoding and routing providers
- **File storage**: External object/file storage; store URLs/references in MongoDB

### 3. Authentication & Authorization
- Implement JWT-based authentication.
- Support `DONOR`, `VOLUNTEER` and `ADMIN` roles.
- Volunteer accounts may remain inactive/pending until admin approval.
- Backend must enforce role-based authorization; frontend route protection alone is insufficient.
- Passwords must be securely hashed using bcrypt.
- `GET /api/auth/me` must return the current authenticated user and role profile.

### 4. Authentication APIs
| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Donor/Volunteer | Register account |
| POST | `/api/auth/login` | All | Login and return JWT |
| POST | `/api/auth/logout` | All | Logout/session handling |
| GET | `/api/auth/me` | All | Current user + role profile |

### 5. Core Database Requirements
MongoDB should contain at minimum the following logical collections/models:
- **User**: identity, credentials, role, activation state, phone and region.
- **FoodRequest**: donor, assigned volunteer, food details, quantity, pickup location, status, priority and timestamps.
- **Region**: city, region name, center/boundary and active state.
- **DeliveryProof**: request, volunteer, delivery location, food images, delivery-spot images and submission time.
- **VolunteerLocation**: volunteer, latitude, longitude and last-update timestamp.
- **Message**: request, sender, message content and timestamps.
- **Notification**: recipient, type, message, request reference, read state and timestamp.
- **RejectionLog**: request, volunteer, reason and timestamp.
- **RequestStatusHistory**: request, old/new status, actor, reason and timestamp.

### 6. Donor APIs
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/requests` | Create request with location, food details and quantity |
| GET | `/api/requests/mine` | List own requests |
| GET | `/api/requests/:id` | Request details |
| PATCH | `/api/requests/:id` | Edit only while pending |
| DELETE | `/api/requests/:id` | Cancel only while pending |
| GET | `/api/donors/me/stats` | Donor statistics |

### 7. Volunteer APIs
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/requests/available?regionId=` | Pending requests in volunteer region, sorted by priority |
| POST | `/api/requests/:id/accept` | Claim request and assign volunteer |
| POST | `/api/requests/:id/reject` | Reject/cancel accepted request with reason and reopen to pending |
| POST | `/api/requests/:id/delivery-proof` | Multipart delivery location + food pictures + delivery-spot pictures |
| PATCH | `/api/requests/:id/status` | Intermediate status updates such as in_progress |
| GET | `/api/volunteers/me/stats` | Volunteer statistics |
| PATCH | `/api/volunteers/me/location` | Update live location |

### 8. Admin APIs
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/admin/volunteers` | Add or approve volunteer |
| DELETE | `/api/admin/volunteers/:id` | Remove/deactivate volunteer |
| GET | `/api/admin/volunteers` | List/filter volunteers |
| GET | `/api/admin/regions` | List cities/regions |
| POST | `/api/admin/regions` | Create city/region |
| GET | `/api/admin/analytics/overview` | Food, delivery and request totals |
| GET | `/api/admin/analytics/hotspots` | Aggregated delivery-location hotspots |
| GET | `/api/admin/requests?city=&region=&date=&status=` | Filtered request history |
| GET | `/api/admin/requests/:id/proof` | View delivery proof |

### 9. Chat APIs & Real-Time Requirements
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/requests/:id/messages` | Request chat history |
| POST | `/api/requests/:id/messages` | Send message and emit via Socket.IO |

Socket.IO should be used for real-time request-scoped chat. Messages must be persisted in MongoDB before/alongside real-time emission so chat history survives page refreshes. Only the donor, assigned volunteer and authorized admin should be able to access a request conversation.

### 10. Notification Requirements
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notifications` | Get current user's notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |

Notifications should be generated for significant request and volunteer lifecycle events. Socket.IO can be used to deliver in-app notifications in real time while notifications are also persisted.

### 11. Request State & Data Integrity
- Backend must enforce valid status transitions.
- PATCH and DELETE on donor requests must verify status is PENDING.
- Users must only access resources they own or are assigned to.
- When a volunteer accepts a request, the assignment must be atomic so two volunteers cannot claim the same request.
- Accepted requests must not appear as available to other volunteers.
- Delivery should require the required proof information before the request is marked DELIVERED.
- Important status changes should be recorded in `RequestStatusHistory`.

### 12. Distance & Quantity Priority Engine
The backend should calculate a configurable priority score using volunteer-to-pickup distance and food quantity. A normalized scoring model may be used, for example:
$$\text{Priority Score} = (\text{distance weight} \times \text{distance score}) + (\text{quantity weight} \times \text{quantity score})$$
The weights should be configurable rather than scattered through application code.
MongoDB geospatial capabilities should be used where appropriate for location-based filtering. The available-requests endpoint must return requests sorted according to the calculated priority.

### 13. Map & Location Technical Requirements
- Use MapLibre GL JS for map rendering.
- Use a compatible map-data source for tiles/map visualization.
- Use a geocoding service for address-to-coordinate conversion.
- Use reverse geocoding where coordinate-to-address conversion is required.
- Use a routing service to calculate routes, distance and estimated travel time.
- Display pickup locations, delivery locations, volunteer locations and admin hotspot/cluster information.
- Use GeoJSON/geospatial data for regions and boundaries where required.

### 14. Live Volunteer Location
Volunteer location updates should include latitude, longitude and timestamp. Updates may be sent through REST or Socket.IO. The implementation should avoid unnecessary high-frequency updates by using a sensible interval and/or movement threshold. The latest location should be available to the admin map and priority calculation.

### 15. Delivery Proof & File Uploads
- Use multipart/form-data for delivery-proof submission.
- Validate file type and maximum file size on the backend.
- Generate unique file names/identifiers.
- Store images in external file/object storage.
- Store only file URLs/references and metadata in MongoDB.
- Record delivery coordinates and submission timestamp.

### 16. Admin Analytics
- Use MongoDB aggregation for totals and grouped statistics.
- Calculate total food collected and delivered.
- Calculate request counts by status.
- Calculate volunteer pickup/delivery statistics.
- Support filtering by city, region, date and status.
- Return map-ready hotspot/cluster data from delivery coordinates.

### 17. Hunger/Need Hotspot Technical Logic
Delivery coordinates should be aggregated using geospatial clustering or density calculations. The result should identify areas with repeated/high-density delivery activity and return data suitable for a heatmap or cluster visualization. This is an indicator generated from platform delivery data and should not be presented as a definitive hunger measurement without external validated data.

### 18. Security Requirements
- Hash passwords with bcrypt.
- Keep JWT secrets and API credentials in environment variables.
- Never commit real secrets to source control.
- Validate and sanitize request inputs.
- Enforce authentication and role authorization on every protected API.
- Enforce donor ownership and volunteer assignment checks server-side.
- Validate uploaded files.
- Apply suitable rate limiting and CORS configuration.
- Avoid exposing sensitive user information in API responses.

### 19. Environment & Configuration
- `MONGO_URI`
- `JWT_SECRET`
- `PORT`
- Map/geocoding/routing provider credentials where required
- File/object-storage credentials where required
- Socket configuration where required
A `.env.example` file should contain variable names/placeholders only. The actual `.env` file must be excluded from Git.

### 20. Non-Functional Requirements
- **Performance**: paginate large lists and optimize geospatial/map queries.
- **Reliability**: use atomic request acceptance and persist important state changes.
- **Scalability**: support growth in donors, volunteers, regions and requests.
- **Maintainability**: keep business logic such as priority calculation and hotspot processing modular.
- **Observability**: log authentication failures, important status transitions, assignment failures and server errors without logging secrets.

### 21. Technical Acceptance Criteria
- A donor can create, view, edit and cancel requests according to status rules.
- A volunteer sees only relevant active requests and can accept one without double assignment.
- Priority ordering accounts for distance and quantity.
- A volunteer can update progress and submit delivery proof.
- Donor-volunteer request chat works in real time and persists history.
- Notifications are generated for key status changes.
- Admin can manage volunteers/regions and view analytics and request history.
- Admin can view delivery proofs and map-based volunteer/request/hotspot information.
- Protected APIs reject unauthorized role/resource access.
