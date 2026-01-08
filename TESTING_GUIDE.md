# Comprehensive Testing Guide - Pretoria Energy Fleet Management App

## Test Environment Setup

**Test Users Available:**
- Admin: `admin@fleet.com` / `12345`
- Manager: `manager@fleet.com` / `12345`
- Operator: `operator@fleet.com` / `12345`
- Tyre Fitter: `fitter@fleet.com` / `12345`
- Mechanic: `mechanic@fleet.com` / `12345`

---

## 1. Authentication & Login ✓

### Test Case 1.1: Login with Valid Credentials
**Steps:**
1. Open the app
2. Enter `admin@fleet.com` in username field
3. Enter `12345` in password field
4. Tap "Sign In"

**Expected Result:**
- User is redirected to dashboard
- Company logo displayed
- No error messages

### Test Case 1.2: Login with Invalid Credentials
**Steps:**
1. Enter `wrong@email.com`
2. Enter `wrongpass`
3. Tap "Sign In"

**Expected Result:**
- Alert shows "Login Failed"
- User stays on login screen

### Test Case 1.3: Login with Empty Fields
**Steps:**
1. Leave fields empty
2. Tap "Sign In"

**Expected Result:**
- Alert shows "Please enter both username and password"

### Test Case 1.4: Logout
**Steps:**
1. Login as any user
2. Go to Profile tab
3. Tap "Logout"

**Expected Result:**
- User returns to login screen
- Session cleared

---

## 2. Dashboard & Home Screen ✓

### Test Case 2.1: Dashboard Statistics
**Steps:**
1. Login as Admin
2. View dashboard

**Expected Result:**
- Total Fleet count displayed
- Checks Today count shown
- Active Issues count shown
- Near-Miss count shown
- Pretoria Energy logo visible

### Test Case 2.2: Quick Actions
**Steps:**
1. Verify buttons visible:
   - Daily Check
   - Report Damage
   - Near-Miss Report

**Expected Result:**
- All buttons visible and styled correctly
- Buttons navigate to respective screens

---

## 3. Shift Timer & Timesheets ✓

### Test Case 3.1: Start Shift
**Steps:**
1. Login as Operator
2. On dashboard, find Shift Timer card
3. Tap "Start Shift"

**Expected Result:**
- Timer starts counting (HH:MM:SS format)
- "Shift in progress" label shown
- Button changes to "Finish Shift"

### Test Case 3.2: Finish Shift without Location
**Steps:**
1. With active shift, tap "Finish Shift"
2. Select "No, Just Finish"

**Expected Result:**
- Timer stops
- Alert: "Shift finished successfully"
- Timesheet saved with duration

### Test Case 3.3: Finish Shift with Location
**Steps:**
1. Start new shift
2. Tap "Finish Shift"
3. Select "Yes, Record Location"
4. Grant location permission if prompted

**Expected Result:**
- Location captured
- Alert: "Shift finished with location recorded"
- Finish location stored in timesheet

### Test Case 3.4: View Timesheets
**Steps:**
1. Go to Profile tab
2. Check for timesheet history

**Expected Result:**
- List of completed shifts
- Shows date, duration, location

---

## 4. User Management ✓

### Test Case 4.1: View All Users
**Steps:**
1. Login as Admin
2. Go to Profile tab
3. Tap "Manage Users"

**Expected Result:**
- List of all users displayed
- Shows role, email, department
- Default users present

### Test Case 4.2: Add New User
**Steps:**
1. In Manage Users, tap "Add User"
2. Fill in:
   - Name: "Test User"
   - Email: "test@fleet.com"
   - Username: "testuser"
   - Password: "test123"
   - Role: Operator
   - Department: Arable
   - Manager: Select a manager
3. Tap "Add User"

**Expected Result:**
- Success message
- New user appears in list
- Can login with new credentials

### Test Case 4.3: Edit User
**Steps:**
1. Tap on any user
2. Change department or role
3. Save changes

**Expected Result:**
- Changes saved
- User list updated

### Test Case 4.4: Deactivate User
**Steps:**
1. Edit a user
2. Toggle "Active" switch off
3. Save

**Expected Result:**
- User marked as inactive
- Cannot login with inactive account

---

## 5. Department Management ✓

### Test Case 5.1: View Departments
**Steps:**
1. Login as Admin/Manager
2. Go to Profile tab
3. Tap "Manage Departments"

**Expected Result:**
- List of departments shown
- Manager assignments visible

### Test Case 5.2: Create Department
**Steps:**
1. Tap "Add Department"
2. Fill in name and type
3. Assign managers
4. Save

**Expected Result:**
- Department created
- Appears in list
- Available in user assignment

---

## 6. Machinery/Fleet Management ✓

### Test Case 6.1: View Fleet
**Steps:**
1. Login as any user
2. Go to Machinery tab

**Expected Result:**
- List of all vehicles/machinery
- Grouped by type (HGV, JCB, Tractor, 8 Wheeler, etc.)
- Shows registration numbers
- Status indicators (operational/out of use)

### Test Case 6.2: View Machinery Details
**Steps:**
1. Tap on any vehicle (e.g., "KS24 BWO")

**Expected Result:**
- Shows full details
- Registration, make, model, department
- Fuel type
- Recent checks history
- Damage reports
- Job cards linked

### Test Case 6.3: Add New Machinery
**Steps:**
1. In Machinery tab, tap Add button
2. Fill in:
   - Type: HGV
   - Registration: "TEST123"
   - Make: "Volvo"
   - Model: "FH16"
   - Department: Arable
3. Save

**Expected Result:**
- New vehicle added to fleet
- Appears in machinery list
- Can be selected in forms

---

## 7. Daily Checks/Inspections ✓

### Test Case 7.1: Create Daily Check
**Steps:**
1. Login as Inspector/Operator
2. Tap "Daily Check" from dashboard
3. Select machinery (e.g., "KS24 BWO")
4. Fill out all check items
5. Mark items as Pass/Minor/Major
6. Add photos (optional)
7. Draw signature
8. Submit

**Expected Result:**
- Check saved
- If major defect marked, vehicle status changes to "Out of Use"
- Check appears in machinery history
- Dashboard "Checks Today" increments

### Test Case 7.2: View Check History
**Steps:**
1. Go to Machinery tab
2. Select a vehicle
3. View checks list

**Expected Result:**
- Shows all checks for that vehicle
- Sorted by date
- Status badges (pass/minor/major)

---

## 8. Damage Reports ✓

### Test Case 8.1: Create General Damage Report
**Steps:**
1. Tap "Report Damage" from dashboard
2. Select damage type: "General"
3. Select machinery
4. Fill description
5. Select severity (Minor/Moderate/Severe)
6. Add photo (at least 1 required)
7. Enter location or use GPS
8. Draw signature
9. Submit

**Expected Result:**
- Damage report created
- Appears in Active Issues on dashboard
- Status: Pending
- Job card automatically created

### Test Case 8.2: Create Tyre Damage Report
**Steps:**
1. Report Damage > Tyre
2. Select machinery
3. Select tyre position (e.g., "driver_steering")
4. Add description
5. Add photos
6. Submit

**Expected Result:**
- Tyre-specific damage report created
- Visible to Tyre Fitter role
- Status: Pending

### Test Case 8.3: Accept Damage Report (Workshop)
**Steps:**
1. Login as Mechanic/Tyre Fitter
2. Go to Reports tab
3. View pending damage reports
4. Tap on report
5. Tap "Accept"

**Expected Result:**
- Status changes to "Accepted"
- Assignee set to current user
- Live location sharing enabled (if implemented)

### Test Case 8.4: Complete Damage Report
**Steps:**
1. With accepted report
2. Add repair notes
3. Upload completion photos
4. Mark as complete

**Expected Result:**
- Status: Completed
- Reporter notified
- Shows in damage history

---

## 9. Job Cards ✓

### Test Case 9.1: Create Job Card
**Steps:**
1. Go to Add tab
2. Tap "New Job Card"
3. Select machinery (can be multiple)
4. Enter loading location
5. Enter unloading location
6. Select material type
7. Add notes
8. Draw signature
9. Submit

**Expected Result:**
- Job card created with status "Pending"
- Appears in job cards list
- Machinery operators can see it

### Test Case 9.2: Mark Job Card as Outgoing
**Steps:**
1. View pending job card
2. Tap "Mark as Outgoing"

**Expected Result:**
- Status changes to "Outgoing"
- Outgoing date recorded

### Test Case 9.3: Complete Job Card
**Steps:**
1. View outgoing job card
2. Tap "Complete"
3. Enter completion location
4. Add weight/ticket number
5. Scan QR or enter manually
6. Draw completion signature
7. Submit

**Expected Result:**
- Status: Completed
- Completion date recorded
- All data saved

### Test Case 9.4: View Job Card History
**Steps:**
1. Go to job card details
2. View machinery section

**Expected Result:**
- Shows all machinery involved
- Can navigate to machinery details

---

## 10. Tyre Management ✓

### Test Case 10.1: View Tyre Stock
**Steps:**
1. Login as Tyre Fitter or Admin
2. Go to Tyres tab
3. View stock list

**Expected Result:**
- Shows tyre inventory
- Sizes, brands, quantities
- Conditions (new/part worn/used)

### Test Case 10.2: Add Tyre Stock
**Steps:**
1. Tap "Stock" > "Add Stock"
2. Fill in:
   - Size: 315/80R22.5
   - Brand: Michelin
   - Quantity: 10
   - Condition: New
   - Location: PC Workshop
3. Save

**Expected Result:**
- Stock item added
- Quantity available for job cards

### Test Case 10.3: Create Tyre Job Card
**Steps:**
1. Tyres tab > "New Job Card"
2. Select machinery
3. Select tyre position
4. Select tyre from stock
5. Add old tyre details
6. Record work done
7. Add 3 photos (retorque slip, damaged tyre, new tyre)
8. Draw signature
9. Submit

**Expected Result:**
- Tyre job card created
- Stock quantity decremented
- Shows in usage history

### Test Case 10.4: View Tyre Usage
**Steps:**
1. Tyres tab > "Usage"

**Expected Result:**
- Shows all tyre installations
- Grouped by vehicle
- Shows dates and quantities

---

## 11. Workshop Parts ✓

### Test Case 11.1: View Parts Stock
**Steps:**
1. Login as Mechanic/Admin
2. Go to Workshop Parts tab
3. View stock

**Expected Result:**
- List of parts
- Categories (filters, oils, brake parts, etc.)
- Quantities available

### Test Case 11.2: Add Parts Stock
**Steps:**
1. Tap "Add Stock"
2. Fill details:
   - Part number
   - Part name
   - Category
   - Quantity
   - Location
3. Save

**Expected Result:**
- Part added to inventory

### Test Case 11.3: Create Workshop Job Card
**Steps:**
1. Workshop Parts > "New Job Card"
2. Select machinery
3. Add work description
4. Select parts used (multiple)
5. Enter labor hours
6. Add photos
7. Sign
8. Submit

**Expected Result:**
- Job card created
- Parts deducted from stock
- Shows in usage history

---

## 12. Near-Miss Reporting ✓

### Test Case 12.1: Create Near-Miss Report
**Steps:**
1. Tap "Near-Miss Report" from dashboard
2. Fill in:
   - Department
   - Site location
   - Date and time
   - Nature of near-miss (checkboxes)
   - Urgency level (Low/Medium/High/Critical)
   - Problem description
   - Immediate action taken
   - Root cause analysis
   - Long-term actions
3. Capture 3 signatures:
   - Reporting person
   - Issued to
   - Responsible person
4. Add photos
5. Submit

**Expected Result:**
- Near-miss report created
- Shows on dashboard with urgency badge
- Visible to managers
- Color-coded by urgency

### Test Case 12.2: View Near-Miss Reports
**Steps:**
1. Go to Reports tab
2. Select Near-Miss section

**Expected Result:**
- List of all near-miss reports
- Filter by urgency
- Shows date and status

---

## 13. Brake Testing ✓

### Test Case 13.1: Create Brake Test Request
**Steps:**
1. Login as Milton Workshop user
2. Go to Workshop > Brake Test Request
3. Select vehicle
4. Enter requested date
5. Add comments
6. Submit

**Expected Result:**
- Request created with status "Pending"
- PC Workshop team notified

### Test Case 13.2: Accept Brake Test Request
**Steps:**
1. Login as PC Workshop user
2. View brake test requests
3. Accept request

**Expected Result:**
- Status: In Progress
- Can upload results

### Test Case 13.3: Upload Brake Test Results
**Steps:**
1. Go to Brake Test page
2. Fill in all test data:
   - Vehicle details
   - Axle measurements
   - Brake forces
   - Efficiency calculations
3. Submit

**Expected Result:**
- Results saved
- Request marked as Completed
- Pass/Fail status determined

---

## 14. Location Management ✓

### Test Case 14.1: Create Location
**Steps:**
1. Go to Locations tab
2. Tap "New Location"
3. Enter:
   - Name
   - Address
   - GPS coordinates (or use current location)
4. Save

**Expected Result:**
- Location created
- QR code generated
- Appears on map

### Test Case 14.2: View Location Details
**Steps:**
1. Tap on location from list
2. View details

**Expected Result:**
- Shows map with pin
- QR code displayed
- Recent submissions

### Test Case 14.3: Submit Location Check
**Steps:**
1. In location details
2. Tap "Submit Check"
3. Add comment
4. Submit

**Expected Result:**
- Submission recorded with timestamp
- GPS coordinates captured

---

## 15. Reports & Dashboards ✓

### Test Case 15.1: Damage Dashboard
**Steps:**
1. Login as Admin/Manager
2. Go to Reports > Damage Dashboard

**Expected Result:**
- Statistics displayed
- Charts showing damage by type
- Filter by date range
- Export options

### Test Case 15.2: Invoice Management
**Steps:**
1. Go to Reports > Invoices
2. View invoice list

**Expected Result:**
- Shows all invoices
- Linked to job cards
- Status (pending/paid)

---

## 16. Dark Mode ✓

### Test Case 16.1: Toggle Dark Mode
**Steps:**
1. Change device theme to dark
2. Restart app or navigate between screens

**Expected Result:**
- App switches to dark theme
- All screens use dark colors
- Text remains readable
- Icons adapt to theme

### Test Case 16.2: Light Mode
**Steps:**
1. Change device theme to light
2. Check all screens

**Expected Result:**
- App uses light theme
- Proper contrast maintained

---

## 17. Role-Based Access Control ✓

### Test Case 17.1: Operator Permissions
**Steps:**
1. Login as Operator
2. Try to access:
   - Dashboard ✓ (visible)
   - Daily Checks ✓ (can create)
   - Damage Reports ✓ (can create)
   - User Management ✗ (hidden/restricted)
   - Department Management ✗ (hidden)

**Expected Result:**
- Only sees assigned machinery
- Can create checks and reports
- Cannot manage users

### Test Case 17.2: Tyre Fitter Permissions
**Steps:**
1. Login as Tyre Fitter
2. Check access:
   - Tyre damage reports only ✓
   - Tyre stock management ✓
   - General damage reports ✗ (filtered out)

**Expected Result:**
- Only sees tyre-related work
- Can manage tyre stock
- Can complete tyre job cards

### Test Case 17.3: Admin Permissions
**Steps:**
1. Login as Admin
2. Verify access to:
   - All machinery ✓
   - All reports ✓
   - User management ✓
   - Department management ✓
   - All job cards ✓

**Expected Result:**
- Full system access
- Can see and edit everything

---

## 18. Data Validation & Error Handling ✓

### Test Case 18.1: Required Fields
**Steps:**
1. Try to submit forms without required fields
2. Check validation

**Expected Result:**
- Error messages displayed
- Cannot submit incomplete forms
- Helpful error text

### Test Case 18.2: Photo Requirements
**Steps:**
1. Try to submit damage report without photo
2. Try tyre job card without 3 photos

**Expected Result:**
- Validation error
- Specifies photo requirement

### Test Case 18.3: Signature Requirements
**Steps:**
1. Try to submit without signature

**Expected Result:**
- Error: "Signature required"
- Cannot proceed

---

## 19. QR Code Functionality ✓

### Test Case 19.1: Generate QR Code
**Steps:**
1. Create new location/machinery
2. Generate QR code

**Expected Result:**
- QR code image generated
- Can be scanned

### Test Case 19.2: Scan QR Code
**Steps:**
1. Use QR scanner in app
2. Scan generated code

**Expected Result:**
- Navigates to item details
- Data pre-filled in forms

---

## 20. Field-Specific Tests

### Test Case 20.1: Bale Stack Management
**Steps:**
1. Create bale stack location
2. Create job card with stack operation
3. Update bale count

**Expected Result:**
- Stack count incremented/decremented
- History tracked

### Test Case 20.2: Land Work Recording
**Steps:**
1. Create land work entry
2. Enter field name, acres, hours
3. Link machinery

**Expected Result:**
- Work recorded
- Time calculations correct

### Test Case 20.3: Field Measurements
**Steps:**
1. Go to Testing > Field Measurement
2. Add measurements
3. Upload photos
4. Sign and submit

**Expected Result:**
- Measurements saved
- Photos attached

---

## Performance Tests

### Test 21.1: Large Data Sets
- Add 100+ machinery items
- Create 500+ job cards
- Check app performance

### Test 21.2: Offline Mode
- Disable internet
- Try to use app
- Check AsyncStorage functionality

---

## Critical Acceptance Criteria

### ✅ Must Pass:
1. ✓ Login/Logout works for all roles
2. ✓ Shift timer accurately records time
3. ✓ Location capture works on Finish Shift
4. ✓ Daily checks mark vehicle as "Out of Use" on major defect
5. ✓ Damage reports create job cards
6. ✓ Tyre fitter only sees tyre-related work
7. ✓ Stock deduction works correctly
8. ✓ Signatures capture and save
9. ✓ Photos upload and display
10. ✓ Role-based access control enforced
11. ✓ Dark mode works on all screens
12. ✓ Data persists across app restarts

---

## Bug Tracking Template

**Bug ID:** [Auto-increment]  
**Severity:** Critical / High / Medium / Low  
**Area:** Authentication / Dashboard / Forms / etc.  
**Description:** Clear description of issue  
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** What should happen  
**Actual Result:** What actually happens  
**Screenshots:** Attach if applicable  
**Device:** iOS / Android / Web  
**Status:** Open / In Progress / Resolved  

---

## Test Sign-Off

**Tested By:** _____________  
**Date:** _____________  
**Version:** _____________  
**Overall Status:** ☐ Pass ☐ Fail ☐ Partial  
**Notes:**
