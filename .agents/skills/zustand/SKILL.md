---
name: zustand
description: Zustand state management guide. Use when working with store code (src/store/**), implementing actions, managing state, or creating slices. Triggers on Zustand store development, state management questions, or action implementation.
---

# Zustand State Management

Zustand is a lightweight, unopinionated state management library for React. In this project, Zustand is used for **client-side UI state only** — keep server data in Server Components and use Next.js caching primitives for fetched data.

## Core Pattern (TypeScript)

Always use the curried `create<State>()()` syntax. This ensures correct type inference with TypeScript:

```ts
import { create } from 'zustand'

interface BearStore {
  bears: number
  increase: (by: number) => void
  reset: () => void
}

const useBearStore = create<BearStore>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  reset: () => set({ bears: 0 }),
}))
```

## Selectors — avoid subscribing to the full store

Select only what a component needs to prevent unnecessary re-renders:

```ts
// ✅ Select a primitive — component only re-renders when `bears` changes
const bears = useBearStore((state) => state.bears)

// ✅ Shallow equality for objects/arrays
import { useShallow } from 'zustand/react/shallow'
const { bears, increase } = useBearStore(
  useShallow((state) => ({ bears: state.bears, increase: state.increase }))
)

// ❌ Avoid — subscribes to entire store, re-renders on any change
const store = useBearStore()
```

## Accessing the store outside React

Use the static methods on the store hook:

```ts
// Read state
const { bears } = useBearStore.getState()

// Write state
useBearStore.setState({ bears: 5 })

// Subscribe to changes (always unsubscribe to avoid leaks)
const unsub = useBearStore.subscribe(
  (state) => state.bears,
  (bears) => console.log('bears:', bears)
)
unsub()
```

## Slices pattern — organizing large stores

Split large stores into focused slices using `StateCreator`:

```ts
import { create, StateCreator } from 'zustand'

interface BearSlice {
  bears: number
  addBear: () => void
}

interface FishSlice {
  fishes: number
  addFish: () => void
}

type StoreState = BearSlice & FishSlice

const createBearSlice: StateCreator<StoreState, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice: StateCreator<StoreState, [], [], FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

const useStore = create<StoreState>()((...args) => ({
  ...createBearSlice(...args),
  ...createFishSlice(...args),
}))
```

## devtools middleware

Wrap with `devtools` to enable Redux DevTools integration. Pass a human-readable label as the third `set` argument for readable action logs:

```ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {} from '@redux-devtools/extension' // required for devtools typing

const useBearStore = create<BearStore>()(
  devtools(
    (set) => ({
      bears: 0,
      increase: (by) =>
        set((state) => ({ bears: state.bears + by }), undefined, 'bear/increase'),
      reset: () => set({ bears: 0 }, undefined, 'bear/reset'),
    }),
    { name: 'bear-store' }
  )
)
```

## persist middleware — localStorage persistence

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'settings' } // localStorage key
  )
)
```

> **v5 breaking change:** The initial state is **no longer written to storage** on store creation. To seed persisted state on first load, call `useSettingsStore.setState({ ... })` after the store is defined.

## Combining middlewares

Apply in innermost-to-outermost order — `devtools` wraps `persist`:

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {} from '@redux-devtools/extension'

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: 'bear-storage' }
    )
  )
)
```

## Rules for this project

- **Client UI state only.** Do not duplicate server data in Zustand; fetch in Server Components and pass as props.
- **No data fetching in stores.** Stores contain state and synchronous actions. Use Server Actions or Route Handlers for mutations.
- **One store per feature domain.** Prefer focused stores (`useCartStore`, `useUIStore`) over a single monolithic store.
- **Co-locate store files** near the feature they serve, e.g., `src/features/cart/cart-store.ts`.
- **`useShallow` for object selectors.** Always use `useShallow` when selecting object/array values to avoid spurious re-renders.
