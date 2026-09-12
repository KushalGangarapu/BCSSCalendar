# Wildcat Calendar

### *A Progressive Web App (PWA) Club & Event Management Ecosystem for Burnaby Central Secondary School*

**Live Demo:** [bcss-calendar.vercel.app](https://bcss-calendar.vercel.app/)

---

## Project Impact (At a Glance)
* **Target Audience:** 1,500+ students and faculty at Burnaby Central Secondary.
* **Performance:** Sub-100ms load times using consolidated batch APIs, real-time Server-Sent Events (SSE), backend Gzip compression, and PWA Stale-While-Revalidate caching.

Welcome to the **Wildcat Calendar** project! This is a production-ready, full-stack web application built to serve as a centralized hub for students, teachers, and administrators at Burnaby Central Secondary School (BCSS). It streamlines club discovery, simplifies event scheduling, and builds school community engagement.

The system is designed from the ground up to solve a real-world problem: replacing fragmented social media announcements and physical bulletin boards with an integrated, timezone-safe, and offline-capable interactive calendar and content management platform.

---

## Key Features & Engineering Highlights

### Advanced Multi-View Calendar Engine
* **Four Interactive Views:** Toggle seamlessly between **Month View** (grid layout), **Week View** (detailed weekly columns), **Day View** (time-block scheduler), and **Agenda View** (clean chronological list of cards).
* **Direct In-Calendar Event Editing (`EditEventModal`):** Administrators can edit any event (past, present, or future) directly from the calendar views or event details modal. Features a full right-side frosted glass backdrop portal.
* **Smart Multi-Day Event Rendering:** Multi-day events automatically render on their start date, end date, and currently active day, displaying date ranges (`MMM d – MMM d`) inside cell pills while remaining clean on past/future middle days.
* **Zero-Horizontal-Scroll Responsive Layout:** Responsive navigation bars and calendar toolbars dynamically adapt to avoid horizontal overflow on all screen resolutions from 320px ultra-compact phones to 4K displays.
* **Mobile Bottom Sheets:** Modals automatically morph into touch-friendly slide-up bottom sheets (`max-height: 88dvh`, safe-area insets) on mobile viewports.
* **Print Layouts & Interactive PDF Schedules:** Implements dedicated print styles (`PrintSchedule.tsx`) allowing admins and students to export clean, branded monthly schedules. Recurring series collapse into a single row listing every occurrence date in the month with a human-readable cadence label ("Repeats weekly on Fridays"). All URLs and Markdown links in descriptions compile directly into native, clickable `/URI` hyperlinks inside the exported PDF for instant access to meeting forms and sign-up sheets.

### Rich Event Descriptions & Interactive Links
* **Markdown & Auto-Linked URLs:** Event descriptions support full Markdown syntax (`react-markdown`, `remark-gfm`) and automatic conversion of plain text URLs into interactive hyperlinks.
* **Protocol Security Whitelisting (`linkUtils.ts`):** All URLs are validated to strictly permit safe protocols (`https://`, `http://`, `mailto:`), blocking script execution exploits while gracefully preserving balanced parentheses in URLs (e.g. Wikipedia links).
* **Admin Link Insertion Toolbar (`DescriptionEditor.tsx`):** In-form link insertion modal that auto-populates highlighted text, provides quick preset chips (`+ Form`, `+ Meeting`, `+ Instagram`), keyboard accessibility (`Enter`/`Escape` navigation), and an instant "Write" vs "Preview" tab toggle.
* **External Link Hardening:** Links render with clean visual external indicators (`ExternalLink`), `target="_blank"`, `rel="noopener noreferrer"`, and event propagation stop handlers to avoid unwanted modal closing.

### Recurrence Engine & Cutoff Pruning
* **Automatic Recurrence Spawning:** When administrators create recurring events (weekly, bi-weekly, or monthly), the backend calculates future dates using `date-fns` and writes them to the database as distinct relational entities up to the recurrence end date.
* **Intelligent Cutoff Pruning & Extension:**
  - Moving a recurrence series cutoff date **earlier** automatically prunes and deletes obsolete future occurrences from the database.
  - Moving a recurrence series cutoff date **later** dynamically generates the missing future occurrences.
* **Smart Relational Updates & Deletion:** When editing or deleting a recurring event, the system prompts the administrator to either modify/delete that specific instance or automatically cascade changes to all future instances in the recurrence series.
* **Optional Club Association (General School Events):** Events support optional `clubId` fields (`clubId: null`), enabling general school-wide announcements, holidays, and exam schedules to be posted independently without creating artificial club profiles.

### Real-Time Server-Sent Events (SSE) Sync
* **Zero-Latency Live Broadcast:** An integrated SSE stream (`GET /api/sync/stream`) broadcasts mutations (created, updated, or deleted events, clubs, categories, and featured status) to connected student clients in real time.
* **Compression Bypassing:** Express `compression()` middleware is configured to stream raw `text/event-stream` payloads with zero buffering delay.
* **Unified Global Data Context:** Frontend uses a central `DataContext` with bootstrap synchronization for instantaneous 0ms page loads and seamless background refreshes.

### Progressive Web App (PWA) Integration
* **Installed Application Experience:** Fully installable on iOS, Android, macOS, and Windows with a standalone display mode and custom branding icons (authentic 192×192 and 512×512 maskable). Installs to the home screen as **"Wildcat Clubs"**.
* **Native Install Prompting & Floating Banner (`PwaInstallBanner.tsx`):** Listens to native browser `beforeinstallprompt` and `appinstalled` events. The floating banner is styled with safe mobile bottom-margin elevation to prevent occlusion of navigation gestures, and automatically suppresses itself when running in standalone mode or dismissed.
* **Service Worker & Caching:** Utilizes `vite-plugin-pwa` with custom Workbox caching rules to store static assets and club images.
* **Offline Fallback:** Features offline support with navigation fallbacks to `/index.html` to guarantee that students can access cached schedules inside school hallways where cellular reception is weak.

### Advanced Performance Optimization Suite
* **Consolidated Batch Endpoints:** Replaced separate concurrent dashboard HTTP requests with a single `/api/dashboard` API call. The server queries all database fields concurrently in a single block using `Promise.all` to minimize roundtrips.
* **In-Memory API Caching:** Features a fast TTL cache for public data, providing near-0ms response times for concurrent page hits that automatically invalidates on admin mutations.
* **PWA Runtime Caching (Workbox):** Configured Workbox to dynamically cache dynamic images, API endpoints, and Google Web Fonts using a `StaleWhileRevalidate` strategy, enabling sub-100ms loads on repeat visits.
* **Express Gzip Compression:** Compresses outgoing JSON payloads and static files on the server using `compression` middleware, shrinking packet sizes by up to 70%.
* **Image Host Preconnecting:** Warm-starts image connections by preconnecting to the asset host in `index.html`, accelerating club logo downloads on cold loads.
* **Premium Skeleton Screens:** Replaced flashing blank blocks and layout shifts with smooth CSS-pulsed skeleton loaders matching the exact card geometries.

### Real-world Calendar Integrations
* **Direct Google Calendar App Deep-Linking:** Automatically constructs parameter-mapped Google Calendar creation URLs that leverage App/Universal Links to open the native Google Calendar app directly on mobile devices with pre-filled event details.
* **Native Apple Calendar Integration:** Implements a custom backend streaming endpoint (`/api/events/:id/ics`) serving raw RFC-5545 iCalendar data inline. On Apple devices (iOS, macOS), browsers intercept this stream to launch the native "Add Event" calendar panel directly within the browser tab.

### BCSS Branding Design System (Vanilla CSS)
* **Zero Framework Overhead:** Built entirely with Vanilla CSS (no Tailwind or heavy component libraries), demonstrating clean CSS layout techniques (CSS Grid, Flexbox, custom keyframe transitions, scroll snapping).
* **Strict Brand Identity:** Employs CSS Custom Properties (Variables) to establish a cohesive, strict school-themed design system using BCSS colors (Red, Dark Red, Matte Black, Charcoal, and clean Whites).
* **Fluid Typographic Scaling:** Dynamic `clamp()` tokens for headings and body copy ensure maximum legibility and zero auto-zoom on mobile inputs.

### Interactive Club Directory & Featured Showcase
* **Featured Clubs on Dashboard:** Administrators can toggle featured clubs via a star icon in the admin dashboard to spotlight active organizations on the home page.
* **Strict Alphabetical Directory:** The Clubs Directory renders clubs in strict alphabetical order (A–Z) with instant keyword search and category filtering.
* **Client-Side Persistence:** Students can "follow" clubs, saving preferences locally in the browser's `localStorage` to curate a personalized calendar feed.
* **Integrated Banner Cropper:** Admin panel includes an interactive 21:9 image cropper (`react-easy-crop`) for club banner uploads.

---

## Security Architecture & Hardening

### 1. Timing-Attack Proof Authentication
To prevent attackers from using **response timing analyses** to determine which admin usernames exist, the login controller (`authController.ts`) implements a constant-time execution pathway. If a username is invalid, the system still runs `bcrypt.compare` against a precalculated dummy hash:
```typescript
const dummyHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8pP2K6VZqC.b1kPZ.b1kPZ.b1kPZ.';
const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash);
```
This forces login requests for valid and invalid usernames to consume approximately the same CPU cycles, eliminating username enumeration vulnerabilities.

### 2. Cookie-based Session Hardening
* **HttpOnly Cookies:** JWT tokens are stored strictly inside browser cookies configured with `httpOnly: true`. This hides the token from JavaScript access, making the app immune to token theft via Cross-Site Scripting (XSS) attacks.
* **SameSite Flags:** Configured with `SameSite: Lax` (or `None` in production with HTTPS) and `Secure` to mitigate Cross-Site Request Forgery (CSRF) vectors.
* **Algorithm Pinning:** The JWT validation library explicitly pins the allowed signature verification algorithm to `HS256`, preventing standard signature bypass exploits.

### 3. Proxy-Resilient Rate Limiting
Instead of relying solely on IP-address rate limiting (which fails at schools since hundreds of students share a single public IP, or fails against attackers rotating VPN proxies), the system implements a cookie-backed rate limiter (`rateLimiter.ts`):
1. Upon first contact, the backend sets a secure, 10-year tracking cookie called `deviceId` containing a UUID.
2. The rate limiter counts login requests grouped by this unique `deviceId`.
3. If the browser blocks cookies, the system falls back safely to IP-based tracking.
This allows legitimate students behind the school NAT to browse freely while pinning brute-force attacks directly to individual client terminals.

---

## Database Schema (Prisma)

The application uses a normalized relational database schema mapping relationships between administrators, categories, clubs, events, and page metrics:

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // Salted Bcrypt Hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  name      String   @id
  color     String   @default("var(--red)") // Custom color code used by calendar frontend
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Club {
  id          String   @id @default(uuid())
  name        String   @unique
  category    String   // Foreign Key relation to Category
  description String
  instagram   String?
  discord     String?
  imageUrl    String?  // CDN / Storage URL for cropped logo
  isFeatured  Boolean  @default(false)
  events      Event[]  // One-to-Many relation with Event
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Event {
  id          String   @id @default(uuid())
  title       String
  date        DateTime // Stored in UTC
  endDate     DateTime? // Optional end date/time, stored in UTC
  description String?
  clubId      String?  // Optional relation for General School Events
  club        Club?    @relation(fields: [clubId], references: [id])
  recurring   String?  // null, "weekly", "biweekly", "monthly"
  tags        String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@index([clubId])
}

model Metrics {
  id            String   @id @default(uuid())
  activeUsers   Int      @default(0) // Aggregated page visits
  portalSignups Int      @default(0)
  updatedAt     DateTime @updatedAt
}
```

---

## Architecture & Technology Stack

```mermaid
graph TD
    subgraph Client [Frontend - React SPA & PWA]
        A[Browser / Installed PWA] -->|Real-Time Sync| B(Server-Sent Events / SSE)
        A -->|Caching & Offline Page| C(Service Worker / Workbox)
        A -->|Personalized Feeds| D(LocalStorage)
        A -->|SEO & Meta Tags| E(React Helmet Async)
        A -->|Interactive Cropping| F(React Easy Crop)
    end

    subgraph Server [Backend - Express REST API]
        G[API Router] -->|Rate Limiting| H(Device Cookie Rate Limiter)
        G -->|Authentication| I(JWT Cookie Verification Middleware)
        G -->|Business Logic| J(Controllers: Auth, Events, Content)
        G -->|Real-Time Broadcast| K(Sync Manager SSE)
    end

    subgraph Database [Storage Layer]
        L[Prisma Client] -->|Connection Pool| M[PostgreSQL Database]
    end

    A <==>|HTTPS / CORS / HttpOnly Cookies| G
    J <==> L
```

### Technical Specifications
* **Frontend Framework:** React 19, TypeScript, Vite
* **Routing:** React Router DOM v7
* **Date Library:** `date-fns` & `date-fns-tz` (ensures timezone-agnostic operations, storing all database times in UTC and rendering them in local student timezones)
* **Backend Server:** Node.js, Express (TypeScript), SSE (`text/event-stream`)
* **Database ORM:** Prisma ORM
* **Database Engine:** PostgreSQL (Development & Production)

---

## Project Directory Structure

```text
BCSS-Calendar/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Relational database schema mappings
│   │   └── seed.ts               # Database seed script (creates admin & dummy data)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Timing-attack proof admin authentication logic
│   │   │   ├── contentController.ts  # CRUD handlers for clubs, categories, metrics
│   │   │   └── eventsController.ts   # CRUD handlers and Recurrence Generation engine
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts     # Protected routes cookie-JWT verification
│   │   │   └── rateLimiter.ts        # Cookie-backed rate limit engine
│   │   ├── routes/
│   │   │   └── api.ts                # Express REST API endpoints mapping
│   │   ├── types/
│   │   │   └── express.d.ts          # Express request TS interface extensions
│   │   ├── utils/
│   │   │   ├── cache.ts              # In-memory TTL cache for public API data
│   │   │   └── syncManager.ts        # Server-Sent Events (SSE) broadcast manager
│   │   ├── config.ts                 # Port, JWT secret, environment configuration
│   │   └── index.ts                  # Server entrypoint (Express + CORS setup)
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── public/                       # Favicons, assets, manifest files
    ├── src/
    │   ├── components/
    │   │   ├── calendar/
    │   │   │   ├── AgendaView.tsx        # Chronological timeline component
    │   │   │   ├── DayView.tsx           # Daily time blocks component
    │   │   │   ├── MonthView.tsx         # Monthly calendar grid layout
    │   │   │   ├── WeekView.tsx          # Weekly column blocks layout
    │   │   │   ├── EventDetailModal.tsx  # Detailed popup for events
    │   │   │   ├── EditEventModal.tsx    # Direct event editing modal
    │   │   │   └── PrintSchedule.tsx     # Custom print & PDF schedule generator
    │   │   ├── common/
    │   │   │   ├── DescriptionEditor.tsx # Rich description editor with link modal & live preview
    │   │   │   └── RichDescription.tsx   # Sanitized markdown & link renderer
    │   │   ├── MobileFilterDropdown.tsx  # Touch-friendly multi-select filter dropdown
    │   │   ├── Navbar.tsx                # Zero-overflow responsive navigation bar
    │   │   ├── PwaInstallBanner.tsx      # Elevated PWA installation banner prompt
    │   │   ├── ScrollToTop.tsx           # Route-change scroll restoration
    │   │   ├── Skeleton.tsx              # CSS-pulsed skeleton loading screens
    │   │   └── Toast.tsx                 # Interactive alert messages provider
    │   ├── context/
    │   │   └── DataContext.tsx           # Real-time state store & SSE listener
    │   ├── hooks/
    │   │   ├── useIsMobile.ts            # Dynamic window-resize listener hook
    │   │   └── usePageTitle.ts           # Title & SEO synchronization hook
    │   ├── pages/
    │   │   ├── AdminDashboard.tsx        # Dynamic club/event management and crop panel
    │   │   ├── AdminPortal.tsx           # Admin authentication screen
    │   │   ├── ClubPage.tsx              # Dynamic individual club page
    │   │   ├── ClubsDirectory.tsx        # List of all clubs with filters and search
    │   │   ├── Dashboard.tsx             # Dashboard displaying analytics & feeds
    │   │   ├── EventPage.tsx             # Dedicated full-page event view
    │   │   └── MasterCalendar.tsx        # Calendar page integrating all views
    │   ├── utils/
    │   │   ├── apiCache.ts               # Session cache & core data prefetching
    │   │   ├── calendarExport.ts         # Google & Apple calendar app deep link helpers
    │   │   ├── cropImage.ts              # Easy-crop helper mapping
    │   │   ├── linkUtils.ts              # URL safety validation & link parsing
    │   │   ├── recurringUtils.ts         # Recurring series collapse for list views
    │   │   └── timeUtils.ts              # Timezone conversion & live event calculation
    │   ├── App.tsx                   # Main routes mapping
    │   ├── index.css                 # Custom BCSS design system CSS stylesheet
    │   └── main.tsx                  # Vite render mount
    ├── vite.config.ts                # Vite config (React + PWA Manifest definitions)
    └── package.json
```

---

## Local Development & Setup

Follow these steps to clone the repository and run both the frontend and backend servers locally:

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher recommended)
* [npm](https://www.npmjs.com/) (v9.x or higher)
* PostgreSQL Database (local or cloud instance)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BCSS-Calendar
```

### 2. Configure Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:password@localhost:5432/bcss_calendar?connection_limit=10&pool_timeout=20"
   JWT_SECRET="your_dev_jwt_secret_phrase"
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   ```
4. Generate Prisma Client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Seed the database with default admin account and clubs:
   ```bash
   npm run seed
   ```
   > Default developer administrator credentials seeded are `admin` / `adminpassword123`.

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will start running at:* `http://localhost:3001`

### 3. Configure Frontend Client
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` folder:
   ```env
   VITE_API_URL="http://localhost:3001"
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The client app will launch at:* `http://localhost:5173`

---

## Production Deployment & Scaling

When deploying to production environments, configure these adjustments to ensure enterprise-grade scaling:

* **Database Connection:** Supply your production cloud PostgreSQL server URL in the `DATABASE_URL` environment variable with connection pooling parameters (`?connection_limit=10&pool_timeout=20`).
* **Security Configurations:** Ensure `NODE_ENV` is set to `"production"` in backend settings. This automatically triggers `secure: true` and `sameSite: "none"` cookie options, protecting sessions over HTTPS.
* **CORS Configuration:** Restrict the backend CORS origin strictly to your public web app domain by updating `FRONTEND_URL` in the environment variables.
* **Real-Time Stream:** Verify that your production hosting provider supports long-lived HTTP streaming connections for `/api/sync/stream`.

---

## Engineering Trade-offs & Lessons Learned
* **Vanilla CSS vs. Tailwind:** Chosen to completely eliminate framework overhead and build a deep, first-principles understanding of the CSS box model, grid layouts, and layout reflow performance.
* **Timezone Complexity:** Managing datetimes across client and server boundaries required implementing strict UTC storage policies via `date-fns-tz` to eliminate systemic timezone drift bugs across client devices.
* **Real-Time SSE vs. Polling:** Replacing periodic polling with Server-Sent Events drastically reduced database query frequency while providing instantaneous sub-second UI updates across connected users.

---

## Showcase Context
This system was built with production quality in mind, emphasizing:
* **UX/UI Details:** The styling emphasizes CSS transitions, layout fluidity, and clean aesthetics designed around an existing brand identity.
* **Algorithm Rigor:** Standard calendar implementations often experience bugs when dealing with recurrence. Writing a custom recurrence engine and dealing with datetime calculations shows strong algorithm application.
* **Real World Integration:** Employs standard formatting specifications (RFC-5545 iCalendar) to ensure integration with global tools.
* **Secure Engineering:** Implementing defenses against timing attacks, JWT algorithm bypasses, and proxy rotation showcases a deep understanding of computer security and standard security auditing practices.
