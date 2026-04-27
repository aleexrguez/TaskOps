# 🚀 TaskOps

TaskOps is a modern SaaS-style task management application focused on **clean UX, real product behavior, and scalable architecture**.

It is not a simple CRUD app — it’s designed as a production-ready system with advanced features like **kanban boards, recurring tasks, reminders, and persistent ordering**.

---

## ✨ Features

### 🧱 Core Task Management

* Create, edit and delete tasks
* Status workflow: `Todo`, `In Progress`, `Done`
* Priority system (low, medium, high)
* Due dates
* Archive / unarchive tasks

### 📊 Kanban Board

* Drag & drop with smooth animations
* Reordering within columns
* Moving tasks across columns
* Persistent ordering stored in database

### 🔁 Recurring Tasks

* Daily, weekly and monthly templates
* Automatic task generation
* Editable recurrence templates
* Sync between template updates and active tasks

### 🔔 Smart Reminders

* Overdue / today / upcoming task detection
* Toast notifications
* Click → navigate to task
* Temporary highlight system

### 🎯 Task Detail UX

* Inline editing (no modal clutter)
* Clear action flow
* Better user control

### 🎨 UX & Accessibility

* Fully interactive UI (pointer states everywhere)
* Keyboard navigation support
* Accessible labels (aria)
* Dark / Light mode with persistence

---

## 🧠 Tech Stack

* **Frontend:** React 19 + TypeScript
* **State Management:**

  * React Query (server state)
  * Zustand (UI state)
* **Styling:** TailwindCSS
* **Testing:** Vitest + Testing Library
* **Backend:** Supabase (Auth + Database)
* **Architecture:** Feature-first + container/presentational

---

## 🏗️ Architecture Highlights

* Strict separation between UI and logic
* No server data in global state
* Reusable hooks for domain logic
* Optimistic updates for smooth UX
* Clean domain modeling (tasks, recurrences, reminders)

---

## 📸 Screenshots

<img width="1886" height="1081" alt="image" src="https://github.com/user-attachments/assets/669db06e-c771-4568-93ba-66b986f8f8ac" />
<img width="1909" height="1035" alt="image" src="https://github.com/user-attachments/assets/38f4a15f-aa0a-49b3-a914-e085b6a149fa" />
<img width="1877" height="1033" alt="image" src="https://github.com/user-attachments/assets/e0592cc8-1091-4996-ac2a-5cb68c322e4c" />
<img width="1885" height="1029" alt="image" src="https://github.com/user-attachments/assets/f0dac740-2d2b-46f0-995a-9ce28ac212f6" />




---

## 🚀 Live Demo

👉 [Pagina Web Desplegada](https://taskops-project.vercel.app/)

---

## ⚙️ Setup

```bash
git clone https://github.com/your-repo/taskops.git
cd taskops
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## 🧪 Tests

```bash
npm run test
npm run lint
npm run build
```

---

## 🛣️ Roadmap

### V2

* Code splitting & performance improvements
* i18n (EN / ES)
* Projects / Workspaces
* Activity history

### V3

* Task sharing & permissions
* Roles (viewer, editor, owner)

### V4

* AI features (task breakdown, priority suggestions)

---

## 🧠 Why this project?

This project was built to:

* simulate a real SaaS product
* apply production-level architecture
* focus on UX decisions, not just features

---

## 📄 License

MIT
