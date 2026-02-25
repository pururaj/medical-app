# Screen Wireframes & Flow - Medical App

## 📱 Screen Structure Overview

### Navigation Menu Structure

```
Medical App
│
├── 🏥 CLINIC
│   ├── Dashboard
│   ├── Patients
│   │   ├── Register New Patient
│   │   ├── Search Patients
│   │   └── Patient List
│   ├── Appointments
│   │   ├── Book Appointment
│   │   ├── Today's Appointments
│   │   ├── Calendar View
│   │   └── Patient Queue
│   ├── Consultation
│   │   ├── Patient Queue
│   │   ├── Medical Record Viewer
│   │   ├── Write Prescription
│   │   └── Consultation History
│   ├── Billing
│   │   ├── Create Invoice
│   │   ├── Payment Collection
│   │   └── Invoice History
│   └── Reports
│       ├── Daily Summary
│       ├── Revenue Reports
│       └── Patient Analytics
│
├── 💊 PHARMACY
│   ├── Dashboard
│   ├── Sales (POS)
│   ├── Inventory
│   │   ├── Medicine List
│   │   ├── Add Medicine
│   │   ├── Stock Adjustment
│   │   └── Expiry Alerts
│   ├── Prescriptions Queue
│   ├── Purchase Orders
│   │   ├── Create PO
│   │   ├── Receive Stock
│   │   └── Supplier Payments
│   └── Reports
│       ├── Sales Report
│       ├── Inventory Report
│       └── Expiry Report
│
├── 🧪 LAB
│   ├── Test Orders
│   ├── Upload Reports
│   └── Report History
│
├── ⚙️ SETTINGS
│   ├── Clinic Settings
│   ├── User Management
│   ├── Doctor Management
│   └── SMS/Email Templates
│
└── 👤 PROFILE
    └── My Account
```

---

## 🎨 Key Screen Layouts

### 1. Dashboard (Clinic Admin)

```
┌─────────────────────────────────────────────────────┐
│  Medical Clinic Dashboard              [Profile] [⚙] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  📊 Today's Summary                    📅 Feb 17     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │  45  │  │  38  │  │  12  │  │ 5.2L │           │
│  │Appts │  │Done  │  │Queue │  │ Rev  │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                       │
│  📋 Appointments Today                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ 9:00  Dr. Kumar    John Doe      ✅ Done    │   │
│  │ 9:30  Dr. Kumar    Jane Smith    🟡 Waiting │   │
│  │ 10:00 Dr. Shah     Mike Brown    ⏰ Upcoming│   │
│  │ 10:30 Dr. Kumar    Sarah Lee     ⏰ Upcoming│   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  💰 Revenue Trend         📊 Patient Demographics   │
│  ┌──────────────┐        ┌──────────────┐          │
│  │ [Line Chart] │        │  [Pie Chart] │          │
│  │  Last 7 days │        │  Age Groups  │          │
│  └──────────────┘        └──────────────┘          │
│                                                       │
│  ⚠️ Alerts                                           │
│  • 3 prescriptions pending in pharmacy               │
│  • 2 lab reports ready                               │
│  • Low stock: Paracetamol 500mg                      │
└─────────────────────────────────────────────────────┘
```

---

### 2. Patient Registration

```
┌─────────────────────────────────────────────────────┐
│  ← Back    New Patient Registration                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Personal Information                                 │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ First Name *   │  │ Last Name *    │            │
│  └────────────────┘  └────────────────┘            │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │ Email                                  │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Phone *      │  │ Date of Birth│  │ Gender   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                       │
│  Address                                              │
│  ┌────────────────────────────────────────┐         │
│  │ Street Address                         │         │
│  └────────────────────────────────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ City         │  │ State        │  │ ZIP      │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                       │
│  Medical History                                      │
│  ┌────────────────────────────────────────┐         │
│  │ Blood Group         [Select]           │         │
│  └────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────┐         │
│  │ Known Allergies                        │         │
│  │                                        │         │
│  └────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────┐         │
│  │ Medical Conditions                     │         │
│  │                                        │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  Emergency Contact                                    │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ Contact Name   │  │ Phone Number   │            │
│  └────────────────┘  └────────────────┘            │
│                                                       │
│         [Cancel]              [Register Patient]     │
└─────────────────────────────────────────────────────┘
```

---

### 3. Appointment Booking

```
┌─────────────────────────────────────────────────────┐
│  ← Back    Book Appointment                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Step 1: Select Patient                              │
│  ┌────────────────────────────────────────┐         │
│  │ 🔍 Search patient by name or ID...    │         │
│  └────────────────────────────────────────┘         │
│  [+] Register New Patient                            │
│                                                       │
│  Selected: John Doe (#P12345)                        │
│  ─────────────────────────────────────────────       │
│                                                       │
│  Step 2: Select Doctor & Specialty                   │
│  ┌──────────────────────────────────────────┐       │
│  │ Specialty: [General Medicine ▼]         │       │
│  └──────────────────────────────────────────┘       │
│                                                       │
│  Available Doctors:                                   │
│  ○ Dr. Rajesh Kumar - General Physician              │
│  ● Dr. Priya Shah   - General Physician (Selected)   │
│  ○ Dr. Amit Verma   - Cardiologist                   │
│                                                       │
│  ─────────────────────────────────────────────       │
│                                                       │
│  Step 3: Select Date & Time                          │
│  ┌────────────────────────────────────────┐         │
│  │  📅 Calendar                           │         │
│  │  Feb 2026                              │         │
│  │  Mo Tu We Th Fr Sa Su                  │         │
│  │          1  2  3  4  5                 │         │
│  │  6  7  8  9 10 11 12                   │         │
│  │ 13 14 15 16 ⭕17 18 19                │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  Available Slots:                                     │
│  [9:00]  [9:30]  [10:00]  [10:30]  [11:00]          │
│  [14:00] [14:30] [15:00]  [15:30]  [16:00]          │
│                                                       │
│  Consultation Type:                                   │
│  ● New Visit    ○ Follow-up    ○ Emergency           │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │ Reason for visit (optional)            │         │
│  │                                        │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│            [Cancel]        [Confirm Booking]         │
└─────────────────────────────────────────────────────┘
```

---

### 4. Doctor Consultation Screen

```
┌─────────────────────────────────────────────────────┐
│  Consultation - Dr. Rajesh Kumar      Patient Queue  │
├──────────────────┬──────────────────────────────────┤
│                  │                                    │
│ Patient Info     │  Medical History                  │
│ ──────────────   │  ─────────────────                │
│ John Doe         │  Previous Visits: 5               │
│ #P12345          │  Last Visit: Jan 15, 2026         │
│ Age: 35 | M      │                                    │
│ +91-9876543210   │  Known Allergies:                 │
│                  │  • Penicillin                     │
│ Blood: O+        │  • Sulfa drugs                    │
│                  │                                    │
│ [Full History]   │  Chronic Conditions:              │
│                  │  • Diabetes Type 2                │
├──────────────────┤  • Hypertension                   │
│                  │                                    │
│ Vital Signs      │  Current Medications:             │
│ ──────────────   │  • Metformin 500mg (2x daily)    │
│ BP:   [____]     │  • Amlodipine 5mg (1x daily)     │
│ Temp: [____]     │                                    │
│ Pulse:[____]     │  ─────────────────                │
│ Weight:[____]    │                                    │
│ Height:[____]    │  Today's Consultation             │
│                  │  ─────────────────                │
│ [Record Vitals]  │  Chief Complaint:                 │
│                  │  ┌────────────────────────────┐  │
├──────────────────┤  │ Fever and body ache       │  │
│                  │  │ since 2 days              │  │
│ Quick Actions    │  └────────────────────────────┘  │
│ ──────────────   │                                    │
│ [📋 Prescription]│  Diagnosis:                       │
│ [🧪 Lab Tests]   │  ┌────────────────────────────┐  │
│ [📝 Notes]       │  │ Viral Fever               │  │
│ [📄 Print]       │  └────────────────────────────┘  │
│ [📅 Follow-up]   │                                    │
│                  │  Treatment Plan:                   │
└──────────────────┴────────────────────────────────────┘
```

---

### 5. E-Prescription Writer

```
┌─────────────────────────────────────────────────────┐
│  Write Prescription - John Doe (#P12345)             │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Add Medicine                                         │
│  ┌────────────────────────────────────────┐         │
│  │ 🔍 Search medicine...                  │         │
│  └────────────────────────────────────────┘         │
│  Suggestions: Paracetamol, Paracip, P-500...        │
│                                                       │
│  Prescribed Medicines                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ 1. Paracetamol 500mg                        │   │
│  │    Dosage: 1-0-1  Duration: 3 days          │   │
│  │    Instructions: After food                  │   │
│  │    [Edit] [Remove]                           │   │
│  │                                              │   │
│  │ 2. Azithromycin 500mg                       │   │
│  │    Dosage: 1-0-0  Duration: 5 days          │   │
│  │    Instructions: Before food                 │   │
│  │    [Edit] [Remove]                           │   │
│  │                                              │   │
│  │ 3. Cetirizine 10mg                          │   │
│  │    Dosage: 0-0-1  Duration: 5 days          │   │
│  │    Instructions: Before sleep                │   │
│  │    [Edit] [Remove]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  [+ Add Medicine]                                     │
│                                                       │
│  Additional Instructions                              │
│  ┌────────────────────────────────────────┐         │
│  │ • Take complete rest for 2-3 days      │         │
│  │ • Drink plenty of water                │         │
│  │ • Avoid cold food                      │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  Follow-up                                            │
│  ○ Not required                                       │
│  ● Required after [3] days                           │
│                                                       │
│  [Cancel] [Save Draft] [Preview] [Send to Pharmacy]  │
└─────────────────────────────────────────────────────┘
```

---

### 6. Pharmacy POS (Point of Sale)

```
┌─────────────────────────────────────────────────────┐
│  Pharmacy Sales                    Bill #INV-001234  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Search Medicine                                      │
│  ┌────────────────────────────────────────┐         │
│  │ 🔍 Scan barcode or search...           │         │
│  └────────────────────────────────────────┘         │
│  [Scan] [Voice Search]                               │
│                                                       │
│  Cart                                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Item                Qty   Price    Total    │   │
│  │ ──────────────────────────────────────────  │   │
│  │ Paracetamol 500mg    2    ₹5      ₹10      │   │
│  │ Crocin Advance       1    ₹25     ₹25      │   │
│  │ Vitamin C Tablets    1    ₹150    ₹150     │   │
│  │                                       [❌]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────┐        │
│  │ Subtotal:              ₹185.00          │        │
│  │ Discount: [_____%]     ₹0.00            │        │
│  │ Tax (GST 12%):         ₹22.20           │        │
│  │ ────────────────────────────────────    │        │
│  │ Total:                 ₹207.20          │        │
│  └─────────────────────────────────────────┘        │
│                                                       │
│  Payment Method                                       │
│  ● Cash    ○ Card    ○ UPI    ○ Insurance            │
│                                                       │
│  ┌──────────────┐                                    │
│  │ Amount Paid  │ ₹210.00                            │
│  └──────────────┘                                    │
│  Change to return: ₹2.80                             │
│                                                       │
│     [Clear Cart] [Hold] [Print Bill] [Complete Sale] │
└─────────────────────────────────────────────────────┘
```

---

### 7. Medicine Inventory List

```
┌─────────────────────────────────────────────────────┐
│  Medicine Inventory                    [+ Add New]   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  🔍 Search medicine...     [Category ▼] [Filter ▼]  │
│                                                       │
│  ⚠️ 5 medicines low on stock | 3 expiring in 30 days│
│                                                       │
│  Medicine List                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ Name           Batch    Stock  Expiry  Price│   │
│  │ ──────────────────────────────────────────  │   │
│  │ ⚠️ Paracetamol  B1234   50    12/26   ₹5   │   │
│  │   500mg                                [Edit]│   │
│  │                                              │   │
│  │ Azithromycin   B5678   200    06/27   ₹15  │   │
│  │ 500mg                                 [Edit]│   │
│  │                                              │   │
│  │ 🔴 Crocin Adv   B9012    15    03/26   ₹25  │   │
│  │ (Low Stock)                           [Edit]│   │
│  │                                              │   │
│  │ Vitamin C      B3456   100    09/27   ₹150 │   │
│  │                                       [Edit]│   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  Legend:                                              │
│  🔴 Low Stock (< 20)  |  ⚠️ Expiring Soon (< 60 days)│
│                                                       │
│  [Export to Excel] [Print] [Stock Adjustment]        │
└─────────────────────────────────────────────────────┘
```

---

### 8. Patient Mobile App - Dashboard

```
┌───────────────────────────┐
│  ☰  Medical App    🔔 (3) │
├───────────────────────────┤
│                           │
│  Hello, John! 👋          │
│                           │
│  ┌─────────────────────┐ │
│  │  Next Appointment   │ │
│  │  ─────────────      │ │
│  │  Dr. Rajesh Kumar   │ │
│  │  📅 Feb 20, 10:00AM│ │
│  │                     │ │
│  │  [View Details]     │ │
│  └─────────────────────┘ │
│                           │
│  Quick Actions            │
│  ┌────────┬────────┐     │
│  │   📅   │   💊   │     │
│  │  Book  │Medicine│     │
│  │  Appt  │ Order  │     │
│  ├────────┼────────┤     │
│  │   📋   │   🧪   │     │
│  │  Rx    │  Lab   │     │
│  │History │Reports │     │
│  └────────┴────────┘     │
│                           │
│  Recent Activity          │
│  ┌─────────────────────┐ │
│  │ ✅ Lab report ready │ │
│  │    Blood Test       │ │
│  │    [View]           │ │
│  │                     │ │
│  │ 💊 Prescription     │ │
│  │    3 medicines      │ │
│  │    [Download]       │ │
│  └─────────────────────┘ │
│                           │
│  Health Tracker           │
│  ┌─────────────────────┐ │
│  │ BP: 120/80          │ │
│  │ Sugar: 95 mg/dL     │ │
│  │ [Update]            │ │
│  └─────────────────────┘ │
└───────────────────────────┘
```

---

## 🎯 Interactive Elements

### Common UI Components:

1. **Search Bars** - Auto-complete, recent searches
2. **Date Pickers** - Calendar with unavailable dates grayed out
3. **Dropdowns** - Searchable, multi-select where needed
4. **Action Buttons** - Primary (blue), Secondary (gray), Danger (red)
5. **Notifications** - Toast messages, badges
6. **Modals** - Confirmations, quick forms
7. **Tables** - Sortable columns, pagination, row actions
8. **Cards** - For dashboard widgets
9. **Tabs** - For switching between views
10. **Filters** - Side panel or top bar

---

## 📏 Responsive Design

### Desktop (1920x1080)
- 3-column layout
- Sidebars visible
- Full tables with many columns

### Tablet (768x1024)
- 2-column layout
- Collapsible sidebar
- Tables with horizontal scroll

### Mobile (375x667)
- Single column
- Bottom navigation
- Card-based layouts
- Swipeable lists

---

**This wireframe guide provides a visual blueprint for all major screens in the medical application.**
