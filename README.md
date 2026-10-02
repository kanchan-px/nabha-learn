# Nabha Learn

An offline-first digital learning platform built for rural government schools, based on Smart India Hackathon Problem Statement 25019 (Nabha, Punjab). Designed around the reality that internet connectivity in target schools is intermittent, not guaranteed.

## Why This Project Exists

Government schools in rural India face a persistent digital literacy gap — not from a lack of policy intent, but from unreliable connectivity, outdated infrastructure, and limited digital training. Most commercial EdTech platforms assume continuous internet access. Nabha Learn is built the opposite way: offline access is the default assumption, not an edge case.

## Architecture

A monorepo containing three applications sharing one backend:

- **`backend/`** — Node.js, Express, TypeScript REST API with PostgreSQL (via Prisma), JWT authentication, and role-based access control.
- **`web/`** — React + Vite + Tailwind CSS dashboard for teachers and administrators.
- **`mobile/`** — React Native (Expo) app for students, with offline-first local storage and sync.

## Key Features

- **Role-based access control** — Student, Teacher, and Administrator roles with distinct permissions.
- **School and grade-based multi-tenancy** — teachers manage content only for their assigned school and grade; students see only content matching their own school and grade, enforced entirely on the backend.
- **Course authoring** — Course → Module → Lesson hierarchy with text, video, and PDF content, built through a web dashboard.
- **Quiz system** — multiple-choice quizzes with server-side scoring online and on-device scoring offline.
- **Offline-first mobile learning** — students download lesson and quiz content to a local SQLite database and can learn, take quizzes, and track progress entirely without a network connection.
- **Automatic synchronization** — offline-generated progress and quiz attempts sync to the server automatically once connectivity returns.
- **Teacher progress dashboard** — a live, class-wide view of student progress per course.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon) |
| Web | React, Vite, Tailwind CSS, React Router |
| Mobile | React Native (Expo SDK 54), React Navigation, Expo SQLite |
| Auth | JWT, bcrypt |
| Validation | Zod |

## Notable Engineering Decisions

- **UUID primary keys throughout** — enables the mobile app to generate records offline without ID collisions once synced.
- **Append-only progress events** rather than a single mutable status field — avoids conflict-resolution complexity for offline-generated data.
- **"Try network, fall back to local"** pattern on mobile, rather than trusting a persisted connectivity flag — found to be more reliable than available network-state libraries during testing.
- **School/grade authorization derived from the authenticated user**, never trusted from client input — enforced identically across course creation, course access, and content download endpoints.

## Project Status

Core MVP complete: authentication, course/quiz/progress management, offline download/view/quiz/sync for text-based lesson content, and school/grade-scoped multi-tenancy. Video/PDF offline download is a documented, in-progress extension.

## Getting Started

Setup instructions for each application are documented within their respective folders (`backend/`, `web/`, `mobile/`).