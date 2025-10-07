import {
  Filters,
  PageParameters,
  SortDefinition,
} from '@worse-and-pricier/shared-util';

export const filterEntities = <T>(entities: T[], filters: Filters<T>): T[] => {
  return entities.filter((entity) =>
    Object.entries(filters).every(([key, value]) =>
      value
        ? String((entity as any)[key])
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : true
    )
  );
};

export const sortEntities = <T>(
  entities: T[],
  sort: SortDefinition<T>
): T[] => {
  if (!sort.direction) return [...entities]; // Return a copy

  return [...entities].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (aValue === bValue) return 0;
    if (aValue == null) return sort.direction === 'asc' ? -1 : 1;
    if (bValue == null) return sort.direction === 'asc' ? 1 : -1;

    return sort.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
};

export const paginateEntities = <T>(
  entities: T[],
  page: PageParameters
): T[] => {
  const start = page.index * page.size;
  const end = start + page.size;
  return entities.slice(start, end);
};

// export const filterSortPageEntities = <T>(
//   entities: T[],
//   filters: Filters<T>,
//   sort: SortDefinition<T>,
//   page: PageParameters
// ): T[] => {
//   const filtered = filterEntities(entities, filters);
//   const sorted = sortEntities(filtered, sort);
//   return paginateEntities(sorted, page);
// };

// export const filterSortPageEntities = <T>(
//   entities: T[],
//   filters: Filters<T>,
//   sort: SortDefinition<T>,
//   page: PageParameters
// ): T[] => {
//   // 1. Filter
//   const filtered = entities.filter((q) =>
//     Object.entries(filters).every(([key, value]) =>
//       value
//         ? String((q as any)[key])
//             .toLowerCase()
//             .includes((value as string).toLowerCase())
//         : true
//     )
//   );

//   // 2. Sort
//   if (sort.direction) {
//     filtered.sort((a, b) => {
//       const aValue = a[sort.field];
//       const bValue = b[sort.field];

//       if (aValue === bValue) return 0;
//       if (aValue == null) return sort.direction === 'asc' ? -1 : 1;
//       if (bValue == null) return sort.direction === 'asc' ? 1 : -1;

//       return sort.direction === 'asc'
//         ? String(aValue).localeCompare(String(bValue))
//         : String(bValue).localeCompare(String(aValue));
//     });
//   }

//   // 3. Pagination
//   const start = page.index * page.size;
//   const end = start + page.size;

//   return filtered.slice(start, end);
// };

export const filterByTextUsingORLogic = <T>(
  entities: T[],
  fields: (keyof T)[],
  searchText: string
): T[] => {
  return searchText
    ? entities.filter((entity) =>
        fields.some((field) => {
          const value = entity[field];
          return (
            typeof value === 'string' &&
            value.toLowerCase().includes(searchText.toLowerCase())
          );
        })
      )
    : entities;
};
