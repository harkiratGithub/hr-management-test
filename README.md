# Employee & Recruitment Management Dashboard (Angular)

Web-based system for HR to manage employees, job applications, departments, and documents with role-based access and an interactive dashboard.

## Tech Stack

- Angular 20 (standalone, lazy routes, signals, Reactive Forms)
- Angular Material + Tailwind CSS
- RxJS, HttpClient, Interceptors, Route Guards
- Chart.js (direct, no wrapper)
- Static JSON + localStorage persistence (JSON Server optional for dev)

## Getting Started

Prereqs: Node.js >= 20 (LTS recommended), npm >= 9

Install deps:

```bash
npm install
```

Run the UI (no external API required):

```bash
npm start
```

- UI: `http://localhost:4200`

Optional (dev only): run mock API and UI together via JSON Server:

```bash
npm run start:all
# or individually
npm run start:api   # JSON Server
npm run start:ui    # Angular dev server
```

## Authentication

Static users are bundled at `src/assets/users.json` with an in-code fallback to ensure login always works without a server.

- Super Admin: `owner@company.com` / `owner123`
- HR User: `hr@company.com` / `hr123`

A mock JWT (base64 payload) is stored in localStorage; an HTTP interceptor attaches it to requests. Route guards protect pages and enforce roles.

## Data Model & Persistence

- Initial dummy data (100+ records) is bundled at `/db.json` and automatically seeded into `localStorage` on first load.
- All CRUD operations persist to `localStorage`, so the data remains stable across reloads and is deployment-friendly (Vercel/Netlify).
- If you ever need to re-seed the app with the bundled data:
  - Open DevTools → Application → Local Storage and clear keys starting with `erd_`
  - Or run in the browser console: `localStorage.clear()`
  - Reload the app

## Features

- Dashboard with key metrics and charts (employees by department, applicants by role)
- Employee management: list, search, filter, add/edit via Material dialog, delete
- Job applications: role/status filtering, update status, resume links
- Department management: CRUD, live employee counts
- Document management: upload (mock via Blob URL), preview, download, delete
- Role-based navigation and route protection
- Dynamic components: reusable Material dialogs and dashboard widgets

## Project Structure

- `src/app/features/*`: auth, dashboard, employees, applications, departments, documents
- `src/app/core/*`: auth service, guards, interceptor, models
- `src/app/shared/*`: layout and shared components (e.g., topbar)

## Scripts

- `npm run start:api` – JSON Server on 3000
- `npm run start:ui` – Angular dev server
- `npm run start:all` – both together
- `npm run build` – production build

## Deployment

Netlify:

- Uses `netlify.toml` for SPA redirect and publish directory
- Build command: `npm run build`
- Publish dir: `dist/employee-recruitment-dashboard/browser`

Vercel:

- Use framework preset “Angular”
- Build command: `npm run build`
- Output directory: `dist/employee-recruitment-dashboard/browser`
- SPA rewrites are configured via `vercel.json` (routes all paths to `/index.html`)

> Note: No backend is required in production. All data is loaded from the bundled `/db.json` once and persisted to `localStorage`.

## Future Enhancements

- Employee add/edit modal (Angular Material Dialog + dynamic component loader)
- Auth refresh/expiry handling and idle timeout
- Server-side pagination, sorting
- File storage service for documents (S3/GCS)
- Better chart theming and more analytics widgets

## Notes

This codebase follows strict typing, clean architecture, and modular organization with standalone components and lazy-loaded routes. Tailwind and Angular Material together provide a modern UI with rapid component development.
