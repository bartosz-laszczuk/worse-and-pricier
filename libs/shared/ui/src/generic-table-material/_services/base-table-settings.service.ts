import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { IColumn, SortDefinition, SortDirection } from '../_models';
import { TableResults } from '../_models/table-results.model';
import { TableParametersState } from '../_models/table-parameters-state.model';
import { TableParameters } from '../_models/table-parameters.model';
import { PageParameters } from '../_models/page-parameters.model';
import { FieldSearchParameter } from '../_models/filter-definitions.model';
import { PageEvent } from '../../paginator/_models/page-event.model';

export abstract class BaseTableSettingsService<T> {
  private results!: TableResults<T>;

  private tableParamsState!: TableParametersState<T>;

  protected get tableParametersInitialValues() {
    return new TableParameters<T>();
  }

  protected abstract resultsSource$: Observable<T[]>;

  public abstract columns: IColumn[];

  public dataChanged = new Subject<void>();

  public displayResults$!: Observable<T[]>;

  public get tableLength(): number {
    return this.results.tableLength;
  }

  public get pageParameters(): PageParameters | null {
    return this.tableParamsState.page$.getValue();
  }

  public get sortDefinition(): SortDefinition<T> | null {
    return this.tableParamsState.sort$.getValue();
  }

  public init(): void {
    this.tableParamsState = new TableParametersState<T>(
      this.tableParametersInitialValues
    );
    this.results = new TableResults<T>(
      this.resultsSource$,
      this.tableParamsState
    );
    this.initDisplayResults();
  }

  public filterByField(field: keyof T, value: FieldSearchParameter) {
    const newFilters = this.tableParamsState.filters$
      .getValue()
      .set(field, value);
    this.tableParamsState.filters$.next(newFilters);
    this.tableParamsState.page$.next({
      ...this.tableParamsState.page$.getValue(),
      index: 0,
    } as PageParameters);
  }

  public filterByFields(newFilters: Map<keyof T, FieldSearchParameter>) {
    const allFilters = mergeMaps(
      this.tableParamsState.filters$.getValue(),
      newFilters
    );
    this.tableParamsState.filters$.next(allFilters);
    this.tableParamsState.page$.next({
      ...this.tableParamsState.page$.getValue(),
      index: 0,
    } as PageParameters);
  }

  public sort(column: IColumn) {
    const sortDefinition = this.tableParamsState.sort$.getValue()!;
    if (
      sortDefinition &&
      sortDefinition.field === column.propertyName &&
      sortDefinition.direction === SortDirection.Desc
    ) {
      this.tableParamsState.sort$.next(null);
    } else {
      this.tableParamsState.sort$.next({
        field: column.propertyName as keyof T,
        direction: sortDefinition
          ? sortDefinition.field === column.propertyName &&
            sortDefinition.direction === SortDirection.Asc
            ? SortDirection.Desc
            : SortDirection.Asc
          : SortDirection.Asc,
      });
    }
  }

  public pageChange(page: PageEvent) {
    const pageParams = {
      index: page.pageIndex,
      size: page.pageSize,
    } as PageParameters;
    this.tableParamsState.page$.next(pageParams);
  }

  private initDisplayResults() {
    let displayResults$;
    if (this.pageParameters) {
      displayResults$ = this.results.paged$;
    } else {
      displayResults$ = this.results.sorted$;
    }
    this.displayResults$ = displayResults$.pipe(
      tap(() => this.dataChanged.next())
    );
  }
}

// przeniesc do shared
const mergeMaps = (map1: Map<any, any>, map2: Map<any, any>) =>
  new Map([...Array.from(map1.entries()), ...Array.from(map2.entries())]);
