---
name: "Create Store"
agent: "agent"
description: "Create a Zustand store slice following project conventions"
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    browser,
    "io.github.upstash/context7/*",
    "shadcn/*",
    "playwright/*",
    "next-devtools/*",
    "github/*",
    vscode.mermaid-chat-features/renderMermaidDiagram,
    todo,
  ]
---

Create a Zustand store following the project conventions.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before creating files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Store name / domain** (e.g. `cart`, `ui`, `user-preferences`)
- **State shape**: what data does it hold?
- **Actions**: what can be done to modify the state?
- **Does it need persistence?** (localStorage via `persist` middleware)
- **Does it need DevTools?** (default: yes in development)

## Rules

1. **File location**: `store/<name>.store.ts` — use kebab-case.
2. **TypeScript**: define a strict `State` type and `Actions` type separately, then combine as `Store = State & Actions`.
3. **Slice pattern**: for large stores, use slices. Keep each file focused on one domain.
4. **Never store server data**: Zustand is for client UI state only. Server data (from fetches) stays in Server Components/Server Actions.
5. **No `any`**: type everything strictly.
6. **Immutability**: use Immer middleware only if state updates are deeply nested. Otherwise, spread normally.
7. **Selectors**: export typed selector hooks (e.g. `export const useCartItems = () => useCartStore((s) => s.items)`).

## Middleware to use

- `devtools` — always in development
- `persist` — only when explicitly requested
- `immer` — only for complex nested state

## Example output shape

```ts
// store/cart.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type State = {
  items: CartItem[];
};

type Actions = {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

type CartStore = State & Actions;

export const useCartStore = create<CartStore>()(
  devtools(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] }), false, "addItem"),
      removeItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((i) => i.id !== id) }),
          false,
          "removeItem",
        ),
      clearCart: () => set({ items: [] }, false, "clearCart"),
    }),
    { name: "CartStore" },
  ),
);

// Typed selector hooks
export const useCartItems = () => useCartStore((s) => s.items);
export const useCartTotal = () =>
  useCartStore((s) =>
    s.items.reduce((total, i) => total + i.price * i.quantity, 0),
  );
```

## Also create

A test file `store/<name>.store.test.ts` testing the initial state and each action.
