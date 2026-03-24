# TaskFlow

AI-Powered Personal Task Manager - A local-first task management application with intelligent suggestions.

## 🚀 Live Demo

**[https://outhsics.github.io/taskflow/](https://outhsics.github.io/taskflow/)**

## Features

- **Task Management**: Create, edit, delete, and complete tasks
- **Categories**: Organize tasks by category (Work, Personal, Ideas, etc.)
- **Priority Levels**: Normal, Important, and Urgent priorities
- **Recurring Tasks**: Daily, weekly, monthly, or custom recurring patterns
- **Smart Reminders**: Browser notifications for due tasks (with quiet hours)
- **Natural Language Parsing**: Create tasks using natural language (e.g., "Call mom every Sunday at 6pm")
- **AI-Powered Suggestions**: Learn your patterns and get smart suggestions
- **Data Ownership**: All data stored locally in IndexedDB
- **Export/Import**: Backup and restore your data as JSON
- **Offline Support**: Full functionality offline, AI requests queue when online
- **Theme Support**: Light and dark themes

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: React Context API
- **Storage**: IndexedDB via Dexie.js
- **Validation**: Zod for runtime type safety
- **Date Handling**: date-fns
- **Virtual Scrolling**: react-virtuoso
- **Testing**: Vitest + @testing-library/react
- **Encryption**: Web Crypto API (PBKDF2 + AES-GCM)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, bun, or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Development

```bash
# Development server (http://localhost:5173)
npm run dev

# Run tests in watch mode
npm test --watch

# Run tests with UI
npm run test:ui

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
taskflow/
├── src/
│   ├── components/          # React components
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── CategorySidebar.tsx
│   │   ├── AddTaskForm.tsx
│   │   └── AISuggestionBox.tsx
│   ├── repositories/        # Data access layer
│   │   ├── db.ts            # Dexie database setup
│   │   ├── TaskRepository.ts
│   │   ├── CategoryRepository.ts
│   │   └── SettingsRepository.ts
│   ├── services/           # Business logic (to be implemented)
│   ├── hooks/              # Custom React hooks
│   │   ├── useOffline.ts
│   │   └── useTheme.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions (to be implemented)
│   ├── test/               # Test setup
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                  # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CHANGELOG.md
```

## Data Model

### Task
- `id`: UUID
- `title`: string (max 500 chars)
- `description`: string (optional, max 5000 chars)
- `completed`: boolean
- `priority`: 'normal' | 'important' | 'urgent'
- `categoryId`: UUID
- `dueDate`: Date (local time)
- `recurring`: RecurringConfig (optional)
- `createdAt`: Date
- `completedAt`: Date (optional)
- `nextOccurrence`: Date (for recurring tasks)

### Category
- `id`: UUID
- `name`: string (max 100 chars)
- `color`: hex color
- `icon`: emoji (optional)

### RecurringConfig
- `frequency`: 'daily' | 'weekly' | 'monthly' | 'custom'
- `interval`: number (for custom frequency)
- `daysOfWeek`: number[] (for weekly)
- `dayOfMonth`: number (for monthly)
- `endDate`: Date (optional stop date)
- `occurrenceCount`: number (optional stop after N completions)
- `forever`: boolean (never stop)

## Security

- API keys are encrypted using Web Crypto API
- PBKDF2 with 100,000 iterations for key derivation
- AES-GCM for encryption
- Encrypted keys stored in localStorage
- Passphrase required for decryption (minimum 8 characters)

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## License

MIT

## Design Document

See [design document](~/.gstack/projects/taskflow-design-20260323.md) for full specifications.
