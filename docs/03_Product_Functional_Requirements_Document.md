# PRODUCT / FUNCTIONAL REQUIREMENTS DOCUMENT
## No Food Waste — Food Rescue & Redistribution Platform

### 1. Project Overview
The platform connects food donors who have surplus food with volunteers who collect and deliver that food to locations where it is needed. The complete process should be trackable from food availability through request creation, volunteer assignment, pickup, delivery, proof submission, and analytics.

### 2. User Roles
| Role | Main Responsibility |
| --- | --- |
| **Donor** | Submit surplus-food requests and track their status. |
| **Volunteer** | Find, accept, collect and deliver food requests. |
| **Admin** | Manage volunteers, regions, requests and system analytics. |

### 3. Donor Requirements
#### 3.1 Registration & Login
- Create an account.
- Login and logout.
- View profile.
- Access own requests and statistics.

#### 3.2 Create Food Donation Request
- **Food details**: food type/name, description, quantity, servings if applicable, availability time and instructions.
- **Pickup details**: location, address, coordinates and preferred pickup time.
- Optional contact information and images.

#### 3.3 Request Management
- View all personally created requests and their details/status.
- Edit a request only while its status is pending.
- Cancel a request only before a volunteer accepts it.

#### 3.4 Donor Dashboard
- Total requests and requests by status.
- Total donations and total food quantity donated.
- Successful deliveries.
- Request history and outcomes.

### 4. Map & Tracking
- Donor can select and view pickup location and, where applicable, track the assigned volunteer.
- Volunteer can view geographically relevant requests, pickup/delivery locations and update current location.
- Admin can view volunteers, active requests, pickup/delivery locations and delivery-density hotspots.

### 5. Volunteer Requirements
- Volunteer registration with account initially inactive/pending admin approval when required.
- View pending requests available in the volunteer's region.
- Accept a request and become its assigned volunteer.
- Update request progress through pickup and delivery.
- Cancel/reject an accepted request with a reason; the request can be reopened as pending.
- View personal pickup, delivery and food-transport statistics.
- Update live location for maps and distance calculations.

### 6. Distance & Quantity Based Priority
Available requests should be ordered using a priority mechanism based on the volunteer's distance from the pickup location and the quantity of food. The exact weighting should be configurable.

### 7. Delivery Proof
- Delivery location/GPS information.
- Food photographs.
- Delivery-spot photographs.
- Submission timestamp and volunteer association.

### 8. Chat System
Each request should have a request-scoped chat between the donor and assigned volunteer. Users can send and receive messages in real time and view message history.

### 9. Notifications
- Notify donors when request status changes.
- Notify volunteers about relevant request events.
- Notify admins about important volunteer/request events.
- Users can view notifications and mark them as read.

### 10. Admin Requirements
#### 10.1 Volunteer Management
- Add volunteers.
- Approve/activate volunteers.
- Deactivate/remove volunteers.
- View and filter volunteers by region/status.

#### 10.2 City & Region Management
- Add cities/regions.
- Edit or deactivate regions.
- Associate volunteers with regions.

#### 10.3 Analytics
- Total food collected.
- Total food delivered.
- Total requests.
- Requests by status.
- Active volunteers and volunteer delivery statistics.

#### 10.4 Volunteer & Request Tracking
- Track volunteer locations.
- Track active requests.
- View request assignment and delivery history.

#### 10.5 Hunger/Need Region Identification
Aggregate delivery locations to identify areas that repeatedly receive food deliveries and display these as data-derived high-need/delivery-density hotspots. These hotspots should be treated as indicators based on platform data, not as definitive measurements of hunger without additional validated data.

#### 10.6 Delivery Proof
- View proof submitted by volunteers.
- View food and delivery-spot images.
- View delivery location and timestamp.

#### 10.7 Request History
- Filter by city, region, date, status, volunteer and donor.
- Open a request to view its complete history.

### 11. Request Lifecycle
```
PENDING → ACCEPTED → IN_PROGRESS → DELIVERED
```
**Alternative flows**:
- `PENDING` → `CANCELLED` (donor cancellation)
- `ACCEPTED` → `PENDING` (volunteer cancellation/rejection with reason)

### 12. End-to-End User Flow
1. Donor creates food request
2. Request becomes `PENDING`
3. System prioritizes it for relevant volunteers using distance + quantity engine
4. Volunteer accepts $\rightarrow$ donor is notified
5. Volunteer starts pickup $\rightarrow$ volunteer delivers food
6. Volunteer submits delivery location and photographs (Delivery Proof)
7. Request becomes `DELIVERED`
8. Donor, volunteer and admin statistics are updated
