---
name: ngrx-signals-normalized-state
description: Normalized state pattern for @ngrx/signals SignalStore. Use when creating or modifying NgRx signal stores that manage collections of entities.
compatibility: Angular projects using @ngrx/signals
---

## Normalized State Pattern

When managing a collection of entities in a SignalStore, always use the normalized state structure:

```typescript
type NormalizedState = {
  entities: Record<string, T> | null;  // O(1) lookups by id, null = not loaded
  ids: string[] | null;                 // maintains order, null = not loaded
  isLoading: boolean | null;
  error: string | null;
};
```

`null` means not yet loaded. `{}` / `[]` means loaded but empty. Never conflate these two states.

## Initial state

```typescript
const initialState: NormalizedState = {
  entities: null,
  ids: null,
  isLoading: null,
  error: null,
};
```

## Computed selectors

Always derive the entity list from `ids` + `entities`. Never store derived or sorted data directly in state.

```typescript
withComputed((store) => {
  const allEntities = computed(() => {
    const entities = store.entities();
    const ids = store.ids();
    if (!entities || !ids) return [];
    return ids.map((id) => entities[id]);
  });

  return { allEntities };
})
```

## CRUD methods

**Load list** (normalize from array):
```typescript
loadList(items: T[]) {
  const normalized = items.reduce(
    (acc, item) => {
      acc.entities[item.id] = item;
      acc.ids.push(item.id);
      return acc;
    },
    { entities: {} as Record<string, T>, ids: [] as string[] }
  );
  patchState(store, { ...normalized, isLoading: false, error: null });
}
```

**Add single**:
```typescript
addToList(item: T) {
  patchState(store, (state) => ({
    entities: { ...(state.entities ?? {}), [item.id]: item },
    ids: [...(state.ids ?? []), item.id],
    isLoading: false,
    error: null,
  }));
}
```

**Update**:
```typescript
updateInList(id: string, data: Partial<T>) {
  patchState(store, (state) => {
    if (!state.entities?.[id]) return state;
    return {
      entities: { ...state.entities, [id]: { ...state.entities[id], ...data } },
      isLoading: false,
      error: null,
    };
  });
}
```

**Delete**:
```typescript
deleteFromList(id: string) {
  patchState(store, (state) => {
    if (!state.entities || !state.ids) return state;
    const { [id]: _, ...remainingEntities } = state.entities;
    return {
      entities: remainingEntities,
      ids: state.ids.filter((i) => i !== id),
      isLoading: false,
      error: null,
    };
  });
}
```

## Loading state methods

```typescript
startLoading() {
  patchState(store, { isLoading: true, error: null });
}

logError(error: string) {
  patchState(store, { isLoading: false, error });
}
```
