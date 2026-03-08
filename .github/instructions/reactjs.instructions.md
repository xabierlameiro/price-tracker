---
description: "ReactJS development standards and best practices"
applyTo: "**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss"
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

> **This file covers React component patterns (architecture, hooks, composition, styling, testing).**
> For this Next.js project, all data fetching, routing, caching, and server/client boundary decisions are governed by `nextjs.instructions.md` and `nextjs-tailwind.instructions.md`. When any rule here conflicts with those files, **the Next.js instructions take precedence**.
> For cross-cutting repository conventions (naming, imports, auth placement, security defaults, and quality gates), use `.github/copilot-instructions.md` as the canonical source.

## Project Context

- Latest React version (React 19+)
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- This project uses Next.js 16 with Turbopack as the bundler — do not add Vite, CRA, or custom Webpack
- Default to Server Components; add `"use client"` only when hooks, event handlers, or browser APIs are needed
- Implement proper component composition and reusability patterns

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- In Next.js App Router, the primary architectural boundary is **Server vs Client Component**, not "container vs presentational". Keep data fetching and async logic in Server Components; isolate interactivity in the smallest possible Client Component
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Prefer direct prop type annotations over `React.FC` (e.g., `({ name }: { name: string }) => JSX.Element`); the React community discourages `React.FC` as it adds implicit `children` and obscures return-type issues
- Leverage `React.ComponentProps` and `React.ComponentPropsWithRef` when extending native element props
- Create union types for component variants and states

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Use Zustand for client-side UI state in complex applications (project convention — see `copilot-instructions.md`); do not introduce Redux Toolkit
- Implement proper state normalization and data structures
- **Do not use React Query, SWR, or `useEffect` for server data fetching.** Data that can be fetched server-side must be fetched in Server Components or Server Actions (see `nextjs.instructions.md`)

### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

### Styling

- Use Tailwind CSS utility classes — this project uses Tailwind CSS v4 with CSS-first configuration (`@theme {}`); avoid CSS Modules, Styled Components, and CSS-in-JS
- Implement responsive design with Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Use Tailwind design tokens (CSS custom properties via `@theme`) for consistent theming; avoid scattered inline hex values
- Implement consistent spacing, typography, and color via the design token layer
- Ensure accessibility with proper ARIA attributes and semantic HTML

### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Use `next/dynamic` for component-level lazy loading — **do not use `React.lazy`** in Next.js (it is not supported in Server Components; `next/dynamic` is the correct abstraction for both Server and Client Components)
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### Data Fetching

> **In this Next.js project, data fetching is not a React concern.** Follow these rules without exception:

- **Server data goes in Server Components.** Use `async` Server Components with `fetch()` and Next.js cache directives (`use cache`, `cacheTag`, `cacheLife`). See `nextjs.instructions.md` §7.
- **Mutations go in Server Actions** (files with `'use server'`). Never perform mutations directly in Client Components.
- **React Query, SWR, Apollo, and similar libraries are prohibited** for fetching data that can be resolved server-side — that is virtually all data in this project.
- The only acceptable use of client-side async requests is for **user-triggered, real-time interactions** (e.g., polling a job status, live search) that genuinely cannot be handled server-side. In that case, use `fetch()` directly inside an event handler or a tightly scoped custom hook; do not introduce a data-fetching library.
- Use Next.js `loading.tsx`, `Suspense`, and `error.tsx` for async UI states instead of manual loading/error state variables.

### Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Forms and Validation

- Use controlled components for form inputs
- Implement proper form validation with React Hook Form + Zod (project convention); avoid Formik
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better user experience
- Handle file uploads and complex form scenarios

### Routing

- This project uses **Next.js App Router** for all routing — do not install React Router
- Use `<Link>` from `next/link` for client-side navigation
- Protect routes via `proxy.ts` with Auth.js session checks (this project uses `proxy.ts` instead of the standard `middleware.ts`)
- Use Next.js dynamic segments (`[id]`, `[[...slug]]`) for parameterized routes
- Route-based code splitting is automatic; use `dynamic()` from `next/dynamic` for component-level lazy loading
- Use `useRouter`, `usePathname`, and `useSearchParams` from `next/navigation` (not `next/router`)

### Testing

- Write unit tests for components using React Testing Library
- Test component behavior, not implementation details
- Use **Vitest** as the test runner (project convention); its API is Jest-compatible — do not install Jest
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

### Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

## Implementation Process

1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with proper styling
5. Add client-side state (Zustand) if needed; fetch data in Server Components
6. Add form handling and validation
7. Implement error handling with `error.tsx` boundaries and loading states with `loading.tsx` / `Suspense`
8. Add testing coverage for components and functionality
9. Optimize performance and bundle size
10. Ensure accessibility compliance
11. Add documentation and code comments

## Additional Guidelines

- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns

- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- **Server/Client boundary** — the App Router equivalent of container/presentational: Server Components own data access and async logic; Client Components own event handling and reactive UI
- Custom hooks for reusable logic extraction

## Learnings
