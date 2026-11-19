# EduManage Pro — School Management System (Frontend Only)

A production-grade, responsive **School Management System** built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React. Persisted entirely on the frontend via LocalStorage with instant one-click demo role switching.

---

## 🌟 Portals Overview

The system provides 4 dedicated portal interfaces:

### 1. Admin Portal
- **Dashboard Overview**: Key metrics (total students, faculty, parents, classes, sections, today's attendance rate, monthly tuition collected in PKR, and total outstanding dues) with interactive Bar & Line analytics charts.
- **Student Management**: Enrolled student roster, admission profiles, multi-tab detailed view (Overview, Attendance history, Fee ledgers, Test results), new student enrollment, promotion workflow, and CSV export.
- **Teacher Management**: Faculty directory, qualification profiles, assigned courses and timetable class sections, and contact modification.
- **Parent Management**: Guardian database, phone/email contact information, and multi-child enrollment linkages.
- **Class & Section Management**: Grade levels, class teacher assignments, sections, student capacity quotas, and monthly tuition fee schedules in PKR.
- **Subject Curriculum**: Course definitions, class allocations, and designated faculty instructors.
- **Academic Session Management**: Academic school years with real-time reactive switching.
- **Attendance Administration**: Daily roll call review by date, class, and section with "Mark All Present" shortcut and instant LocalStorage saving.
- **Fee Management**: Billing challans in Pakistani Rupees (PKR), monthly voucher batch generation, full and partial payment recording, and official printable fee receipts.
- **Assessments & Grading**: Test management, student marks ledger, percentage & grade calculations, and publishing workflow.
- **Institutional Reports**: Fee recovery rates, attendance demographics, academic distributions, printable layouts, and CSV export.
- **Users & Roles**: Demo user profiles, permission matrix, and simulated password change dialog.
- **School Settings**: Institutional identity, PKR currency configuration, light/dark mode, and one-click demo data reset.

### 2. Teacher Portal
- **Teacher Dashboard**: Assigned cohorts, total students taught, today's attendance rate, and upcoming assessments.
- **My Classes**: Assigned cohort class lists, student information cards, and contact information.
- **Student Attendance**: Mark roll call (Present, Late, Absent, Leave) for assigned cohorts with "Mark All Present" and instant saving.
- **Tests & Grading**: Create evaluations, enter student scores with automatic percentage & grade calculations, validation, save as draft, and publish to parent and student portals.
- **Published Results**: Historical score archives and cohort average percentages.
- **Faculty Profile**: Official credentials, timetable assignments, and editable contact details.

### 3. Parent Portal
- **Parent Dashboard**: Multi-child switcher, ward attendance rates, fee liabilities in PKR, and verified examination outcomes.
- **My Children**: Student registration cards, roll numbers, admission details, and session status.
- **Attendance Log**: Daily attendance history, punctuality records, and leave tracking.
- **Fee Challans**: Monthly tuition ledgers, concession notes, paid amounts, outstanding balances in PKR, and official printable bank deposit slips.
- **Official Results**: Verified and published test results only (in-progress drafts are strictly excluded).
- **School Notices**: Official circulars, exam datesheets, and event reminders.
- **Guardian Profile**: Emergency phone, residential address, and linked student roster.

### 4. Student Portal
- **Student Dashboard**: Welcome strip, roll number, class & section, attendance rate, and report cards.
- **My Profile**: Official student identification card with emergency contacts (read-only).
- **My Attendance**: Daily attendance history and punctuality logs.
- **My Results**: Published test scores, percentages, grades, and faculty remarks.
- **My Fees**: Read-only tuition fee ledgers and printable bank payment challans.
- **Notice Board**: School circulars with interactive "Mark as Read / Unread" status.

---

## 🔑 Demo Access Credentials

| Role | Demo Email | Password | Assigned Persona / Entity |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.edu` | `admin123` | Prof. Dr. Mansoor Ahmad (Principal) |
| **Teacher** | `teacher@school.edu` | `teacher123` | Mr. Tariq Mahmood (Physics & Math, Class 9-A & 10-A) |
| **Parent** | `parent@school.edu` | `parent123` | Muhammad Imran (Parent of Bilal Imran & Ayesha Imran) |
| **Student** | `student@school.edu` | `student123` | Bilal Imran (Class 10-A, Roll #1001) |

*Tip*: You can also switch between portals at any time via the **Portal Selector** in the top navigation bar!

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run TypeScript linter
npm run lint

# Build for production
npm run build
```

---

## 🛡️ Architecture & Data Persistence

- Built **strictly frontend-only** using React 19 and LocalStorage.
- Initial launch seeds realistic Pakistani school data (currencies in PKR, classes, faculty, parents, students, attendance, invoices, tests, notices).
- Full state persistence: reloads preserve all added students, recorded fees, updated attendance, and newly published tests.
- Reusable service layer (`src/services/storageService.ts`) enables drop-in backend API replacement without refactoring UI components.
