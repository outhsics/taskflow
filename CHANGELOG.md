# Changelog

All notable changes to TaskFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0.0] - 2026-03-24

### Added
- Initial project scaffolding with React + TypeScript + Vite
- Data layer with Dexie.js (IndexedDB) for local-first storage
- Repository pattern for tasks, categories, and settings
- Type definitions with Zod validation for runtime safety
- Basic UI components: TaskList, TaskCard, CategorySidebar, AddTaskForm, AISuggestionBox
- Theme support (light/dark mode) with useTheme hook
- Offline detection with useOffline hook
- Error boundaries for graceful error handling
- API key encryption using Web Crypto API (PBKDF2 + AES-GCM)
- Export/import functionality for data backup
- Test framework setup with Vitest and @testing-library/react
- Repository tests covering CRUD operations, encryption, and import/export

### Infrastructure
- Package configuration with all required dependencies
- TypeScript configuration with strict mode
- Vite configuration for development and testing
- ESLint configuration ready (not yet enabled)
- Git repository initialized

## [Unreleased]
