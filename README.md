# HospitalCare UI

A modern React application for managing hospital operations - patients, doctors, and appointments.

## Features

- **Authentication** - JWT-based login with role-based access control
- **Dashboard** - Overview statistics and upcoming appointments
- **Patients Management** - CRUD operations with search functionality
- **Doctors Management** - Add/delete doctors with specialization filter
- **Appointments Management** - Create, reschedule, cancel, and complete appointments

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching and caching
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at http://localhost:5239

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Access at http://localhost:3000

### Build

```bash
npm run build
```

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage doctors, patients, appointments, users |
| **HospitalEmployee** | Manage patients, create/reschedule appointments, register users |
| **Doctor** | View patients, appointments, doctors; complete appointments |

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospitalcare.com | Admin@123 |
| Employee | reception@hospitalcare.com | Employee@123 |

## Project Structure

```
src/
├── api/              # API client and service functions
├── components/       # Reusable components
│   ├── Layout.tsx
│   └── modals/       # Modal components
├── context/          # React context providers
├── pages/            # Page components
├── types/            # TypeScript interfaces
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## API Proxy

Development server proxies `/api` requests to `http://localhost:5239`

## License

MIT
