# UW Exchange

A full-stack web platform built for University of Waterloo students planning, managing, and reflecting on exchange programs. Students can track application deadlines, browse and submit course equivalencies, message each other, manage their exchange profile, and access contacts and advisors — all in one place.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Sprint History](#sprint-history)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, custom CSS (DM Sans / DM Serif Display) |
| Backend | Node.js, Express (ES modules) |
| Database | MySQL / MariaDB |
| Authentication | Firebase Auth + Firebase Admin SDK |
| File uploads | Multer |
| Testing | Jest, React Testing Library |
| Dev tooling | Concurrently, Nodemon, Yarn |

---

## Project Structure

```
project-root/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App/               # Root app, routing, navbar
│   │   │   ├── Timeline/          # Exchange timeline & milestones
│   │   │   ├── ExchangeCalendar/  # Calendar view + checklist
│   │   │   ├── CourseSearch/      # Course equivalency search & bookmarks
│   │   │   ├── CourseSubmit/      # Submit a course equivalency
│   │   │   ├── ContactsList/      # Study abroad contacts
│   │   │   ├── AdvisorsList/      # Academic advisors
│   │   │   ├── DeleteAccount/     # Account deletion flow
│   │   │   ├── UserTypeSelect/    # User type selection
│   │   │   ├── SignOut/           # Sign out
│   │   │   ├── UserTags/          # Profile tags display
│   │   │   ├── Messaging/         # In-app messaging
│   │   │   ├── Profile/           # User profile
│   │   │   └── Firebase/          # Firebase config & authFetch helper
│   │   └── index.js
│   ├── babel.config.js
│   ├── jest.config.js
│   └── package.json
├── uploads/                       # Uploaded post images (auto-created)
├── server.js                      # Express backend (ES modules)
├── config.js                      # MySQL connection config
├── serviceAccountKey.json         # Firebase Admin key (not in git)
├── package.json
└── README.md
```

---

## Database Schema

The app uses a MySQL database. The main tables are:

| Table | Purpose |
|---|---|
| `users` | User accounts — username (PK), display name, email, faculty, program, grad year, exchange term, user type, password hash, destination info, UW verified flag |
| `posts` | Photo posts linked to a username |
| `conversations` | Messaging threads between two users |
| `messages` | Individual messages within a conversation |
| `course_equivalencies` | Student-submitted course matches between UW and host universities, includes `is_anonymous` flag |
| `course_reviews` | Ratings attached to course equivalencies |
| `user_saved_courses` | Bookmarked course equivalencies per user |
| `timeline_milestones` | Application deadlines and checklist items, with phase, destination, and prerequisite support |
| `profile_tags` | Tags derived from user profile (program, year, destination, school, term) |
| `study_abroad_contacts` | Study abroad office staff contacts |
| `academic_advisors` | Faculty-specific exchange advisors |
| `user_expenses` | Cost-of-living estimates per user |
| `user_ratings` | Exchange experience ratings per user |

### Required migrations (run once after cloning)

```sql
-- UW email verification flag
ALTER TABLE users ADD COLUMN uw_verified BOOLEAN DEFAULT FALSE;

-- Anonymous course posting (Sprint 3)
ALTER TABLE course_equivalencies ADD COLUMN is_anonymous TINYINT(1) DEFAULT 0;

-- Checklist milestone type (Sprint 2)
ALTER TABLE timeline_milestones
  MODIFY milestone_type ENUM('UW Internal', 'Host University', 'Checklist');

-- Sprint 2 fields on users
ALTER TABLE users
  ADD COLUMN user_type ENUM('current_exchange', 'prospective', 'alumni', 'browsing'),
  ADD COLUMN password_hash VARCHAR(255),
  ADD COLUMN destination_country VARCHAR(100),
  ADD COLUMN destination_school VARCHAR(100);

-- Sprint 2 fields on timeline_milestones
ALTER TABLE timeline_milestones
  ADD COLUMN phase ENUM('Info Session', 'Research', 'Application', 'Course Matching', 'Pre-departure Training'),
  ADD COLUMN destination_country VARCHAR(100);

-- Sprint 2 new tables
CREATE TABLE IF NOT EXISTS study_abroad_contacts (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  faculty VARCHAR(100),
  department VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS academic_advisors (
  advisor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  office VARCHAR(100),
  faculty VARCHAR(100),
  programs TEXT,
  office_hours VARCHAR(200)
);

-- Seed contacts and advisors
INSERT INTO study_abroad_contacts (name, role, email, phone, faculty, department) VALUES
('Dr. Sarah Thompson',  'Study Abroad Coordinator',    'sarah.thompson@uwaterloo.ca',  '519-888-4567 x12345', NULL,          'Waterloo International'),
('Michael Chen',        'Exchange Program Advisor',     'michael.chen@uwaterloo.ca',    '519-888-4567 x12346', NULL,          'Waterloo International'),
('Lisa Park',           'Engineering Exchange Advisor', 'lisa.park@uwaterloo.ca',       '519-888-4567 x22101', 'Engineering', 'Engineering Undergraduate Office'),
('James Wilson',        'Math Exchange Coordinator',    'james.wilson@uwaterloo.ca',    '519-888-4567 x33201', 'Math',        'Math Undergraduate Office'),
('Amanda Foster',       'Arts Exchange Coordinator',    'amanda.foster@uwaterloo.ca',   '519-888-4567 x44301', 'Arts',        'Arts Undergraduate Office');

INSERT INTO academic_advisors (name, email, office, faculty, programs, office_hours) VALUES
('Prof. David Kim',     'david.kim@uwaterloo.ca',     'E7 4412',  'Engineering', 'SE,CE,ECE',      'Mon/Wed 2–4pm'),
('Prof. Aisha Nwosu',   'aisha.nwosu@uwaterloo.ca',   'MC 5304',  'Math',        'CS,CFM,MATH',    'Tue/Thu 1–3pm'),
('Prof. Rachel Stein',  'rachel.stein@uwaterloo.ca',  'PAS 2082', 'Arts',        'ECON,PSYCH,SOC', 'Mon/Fri 10am–12pm'),
('Prof. Carlos Rivera', 'carlos.rivera@uwaterloo.ca', 'STC 3004', 'Science',     'BIOL,CHEM,PHYS', 'Wed 3–5pm');
```

---

## Features

### Exchange Timeline
- View milestones grouped by application phase (Info Session → Research → Application → Course Matching → Pre-departure Training)
- Filter by milestone type (UW Internal / Host University) and destination country
- Days remaining counter on each incomplete milestone
- Mark milestones complete / incomplete with prerequisite locking
- Export all milestones as a `.ics` calendar file
- Destination-specific milestone highlighting

### Exchange Calendar
- Monthly calendar view with colour-coded milestone dots
- Filter by program type and destination
- Click any day to see that day's deadlines in a detail panel
- Application Checklist tab with 29 default items seeded across all 5 phases
- Add, edit, and delete custom checklist items
- Real-time progress bar

### Course Equivalency Database
- Search by university, course name, course code, or student name
- Filter by continent, country, faculty, and term
- Sort by most recently updated, average rating, or university name
- Bookmark courses to a personal shortlist
- View who posted each equivalency; click their name to go to their profile
- Post anonymously — name shown as "Anonymous" to other students
- Submit new course equivalencies with proof document upload
- Duplicate detection and pending review status on submission

### Messaging
- Conversation list with unread counts
- Real-time message thread view
- Send messages to other students

### Profile
- View and edit your own profile (display name, bio, faculty, program, grad year, exchange term)
- Photo post gallery
- Profile tags showing program, year, destination, host school, and exchange term

### Contacts & Advisors
- Study abroad office contacts with email and phone
- Academic advisors filtered by faculty, with office and hours information

### Account Management
- Firebase email/password authentication with UW email verification
- User type selection (current exchange student, prospective, alumni, just browsing)
- Delete account with password confirmation
- Sign out

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18+
- **Yarn** (`npm install -g yarn`)
- **MySQL** or **MariaDB**
- A **Firebase project** with Email/Password auth enabled

---

## Environment Setup

### 1. Clone the repo and install dependencies

```bash
git clone <repo-url>
cd <project-folder>

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure the database connection

Edit `config.js` in the project root:

```js
export default {
  host: 'your-db-host',
  user: 'your-db-user',
  password: 'your-db-password',
  database: 'your-db-name',
  multipleStatements: true,
};
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → Project Settings → Service Accounts
2. Click **Generate new private key** and download the JSON file
3. Rename it `serviceAccountKey.json` and place it in the project root

> ⚠️ Never commit `serviceAccountKey.json` to version control. It is listed in `.gitignore`.

### 4. Configure the React app (optional)

If your backend runs on a port other than 5000, create `client/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

If you leave this blank, the React app proxies to `localhost:5000` by default (configured in `client/package.json`).

### 5. Start the database

```bash
# On the course server (mse-msci-245):
# Connect via SSH, then start your local MySQL session if needed.

# On a local machine with MariaDB:
sudo service mariadb start
```

### 6. Run database migrations

Connect to your database and run all the SQL in the [Required migrations](#required-migrations-run-once-after-cloning) section above.

---

## Running the App

### Start everything (recommended)

From the project root:

```bash
yarn dev
```

This uses `concurrently` to start:
- **Server** on `http://localhost:5000` (via Nodemon, auto-restarts on changes)
- **Client** on `http://localhost:3000` (React dev server with hot reload)

### If port 5000 is already in use

```bash
fuser -k 5000/tcp && yarn dev
```

### Start server and client separately

```bash
# Terminal 1 — backend
yarn server

# Terminal 2 — frontend
yarn client
```

---

## Running Tests

All tests live co-located with their component (`ComponentName.test.jsx`).

```bash
# Run all frontend tests
cd client
npm test

# Run tests once (no watch mode, useful for CI)
npm test -- --watchAll=false
```

### Test coverage by component

| Component | Tests |
|---|---|
| `CourseSearch` | Sprint 1 (search, filters, shortlist) + Sprint 2 (sort) + Sprint 3 (bookmarks, poster name) |
| `CourseSubmit` | Sprint 1 (validation, submission) + Sprint 3 (anonymous posting) |
| `Timeline` | Sprint 1 (milestones, progress) + Sprint 2 (phases, days remaining, destination filter) |
| `ExchangeCalendar` | Story 1 (program/destination filters, clear, empty state) |
| `ContactsList` | AC1–AC11 (render, search, email links, faculty badge, empty state) |
| `AdvisorsList` | AC1–AC10 (render, search, faculty filter, programs, office hours) |
| `DeleteAccount` | AC1–AC7 (confirm flow, password verification, farewell, redirect) |
| `UserTypeSelect` | AC1–AC8 (options, selection, save, pre-fill) |
| `SignOut` | AC1–AC5 (sign out, callback, navigate, confirm prompt) |
| `UserTags` | AC1–AC8 (fetch, tag types, empty state, error handling) |

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users` | ✓ | Create a new user account |
| `GET` | `/api/users/by-email/:email` | — | Look up user by email (for Firebase login) |
| `POST` | `/api/auth/signout` | — | Sign out (stateless) |

### Users & Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user/:username` | — | Get a user's profile |
| `PUT` | `/api/user/:username` | ✓ | Update profile (display name, bio, faculty, etc.) |
| `DELETE` | `/api/users/:username` | — | Delete account (requires password in body) |
| `PUT` | `/api/users/:username/type` | — | Update user type |
| `GET` | `/api/users/:username/tags` | — | Get profile tags |
| `POST` | `/api/users/:username/tags` | — | Upsert profile tags from profile fields |
| `GET` | `/api/users/:username/expenses` | — | Get cost-of-living estimates |
| `PUT` | `/api/users/:username/expenses` | ✓ | Save cost-of-living estimates |
| `GET` | `/api/users/:username/ratings` | — | Get exchange experience ratings |
| `PUT` | `/api/users/:username/ratings` | ✓ | Save exchange experience ratings |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | ✓ | Upload a photo post |
| `GET` | `/api/posts/:username` | — | Get all posts for a user |
| `DELETE` | `/api/posts/:id` | ✓ | Delete a post |

### Messaging
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/messages-list` | — | Get conversation list (`?username=`) |
| `GET` | `/api/conversations/:id/messages` | — | Get messages in a conversation |
| `POST` | `/api/conversations/:id/messages` | ✓ | Send a message |

### Course Equivalencies
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/courses` | — | Search courses (`?q=&country=&sort=&page=`) |
| `GET` | `/api/courses/meta/filters` | — | Get filter dropdown options |
| `GET` | `/api/courses/:id` | — | Get a single course with author info |
| `GET` | `/api/courses/user/:username` | — | Get all courses submitted by a user |
| `POST` | `/api/courses` | ✓ | Submit a new course equivalency |
| `PUT` | `/api/courses/:id` | ✓ | Update a course equivalency |
| `DELETE` | `/api/courses/:id` | ✓ | Delete a course equivalency |
| `GET` | `/api/users/:username/saved-courses` | — | Get bookmarked courses |
| `POST` | `/api/users/:username/saved-courses` | ✓ | Toggle bookmark on a course |

### Timeline & Milestones
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/:username/milestones` | — | Get milestones (`?type=&phase=&destination=`) |
| `POST` | `/api/users/:username/milestones` | — | Create a milestone |
| `PATCH` | `/api/milestones/:id` | — | Update a milestone (complete, edit fields) |
| `DELETE` | `/api/milestones/:id` | — | Delete a milestone |
| `GET` | `/api/users/:username/milestones/export` | — | Download milestones as `.ics` file |

### Contacts & Advisors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/contacts` | — | Get all study abroad contacts |
| `GET` | `/api/advisors` | — | Get all academic advisors |

> **Auth** column: ✓ means the route requires a valid Firebase ID token in the `Authorization` header. Routes marked — are public.

---

## Sprint History

### Sprint 1
- Course equivalency search with filters, pagination, and partial search
- Course equivalency submission with proof upload and validation
- Exchange timeline with milestone tracking, prerequisites, and `.ics` export
- User profile with photo posts and biography
- In-app messaging between students

### Sprint 2
- Timeline phase grouping and days-remaining counter
- Filter calendar by program type and destination
- Study abroad contacts list
- Academic advisors list with faculty filter
- Sort course equivalencies by date, rating, or university
- Delete account with password confirmation
- User type selection
- Sign out
- Profile tags

### Sprint 3
- Exchange Calendar with monthly grid view and day detail panel
- Application Checklist with 29 default items across 5 phases (add, edit, delete)
- Bookmark course equivalencies (shortlist)
- View and click course poster's name; anonymous posting option
- Search course equivalencies by student name
- Firebase authentication integrated throughout