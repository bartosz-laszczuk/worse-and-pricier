import { combineLatest, map, Observable, tap } from 'rxjs';
import { SortDefinition } from './sort-definition.model';
import { TableParametersState } from './table-parameters-state.model';
import { FieldSearchParameter } from './filter-definitions.model';
import { SortDirection } from './sort-direction.model';

export class TableResults<T> {
  untouched$: Observable<T[]>;
  filtered$: Observable<T[]>;
  sorted$: Observable<T[]>;
  paged$: Observable<T[]>;
  tableLength = 0;

  constructor(
    resultsSource$: Observable<T[]>,
    tableParamsState: TableParametersState<T>
  ) {
    this.untouched$ = resultsSource$.pipe(
      map((resultsSource) => [...resultsSource])
    );

    this.filtered$ = combineLatest([
      this.untouched$,
      tableParamsState.filters$,
    ]).pipe(
      map(([results, filtersDefinitions]) => {
        if (filtersDefinitions.size > 0 && results && results.length > 0) {
          return this.filter(results, filtersDefinitions);
        }
        return results;
      }),
      tap((results) => (this.tableLength = results.length))
    );

    this.sorted$ = combineLatest([this.filtered$, tableParamsState.sort$]).pipe(
      map(([filteredResults, sortDefiniotion]) => {
        if (sortDefiniotion && filteredResults && filteredResults.length > 0) {
          const sortedResults = [...filteredResults];
          this.sortResults(sortedResults, sortDefiniotion);
          return sortedResults;
        }
        return filteredResults;
      })
    );

    this.paged$ = combineLatest([this.sorted$, tableParamsState.page$]).pipe(
      map(([sortedResults, page]) => {
        const offset = page.index * page.size;
        return sortedResults.filter(
          (_, index) => index >= offset && index < offset + page.size
        );
      })
    );
  }

  private filter = (
    entities: T[],
    filters: Map<keyof T, FieldSearchParameter>
  ): T[] => {
    const filteredEntities = entities.filter((item) => {
      let itemIsValid = false;
      for (const [key, value] of filters) {
        if (
          (item[key] as any)
            .toLowerCase()
            .includes((value as string).toLowerCase().trim())
        ) {
          itemIsValid = true;
          break;
        }
      }
      return itemIsValid;
    });
    return filteredEntities;
  };

  private sortResults(results: T[], sortDefiniotion: SortDefinition<T>) {
    const field = sortDefiniotion.field;
    if (
      typeof results[0][field] === 'string' ||
      results[0][field] instanceof String
    ) {
      results.sort((a, b) =>
        sortByString(
          a[field] as unknown as string,
          b[field] as unknown as string,
          sortDefiniotion.direction
        )
      );
    }
  }
}

// przeniesc do shared
const sortByString = (
  value1: string,
  value2: string,
  direction: SortDirection
) => {
  const valueToCompare1 = value1.toLowerCase();
  const valueToCompare2 = value2.toLowerCase();
  return direction === SortDirection.Asc
    ? valueToCompare1 > valueToCompare2
      ? 1
      : -1
    : valueToCompare1 < valueToCompare2
    ? 1
    : -1;
};
