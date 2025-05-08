import { computed, effect } from '@angular/core';
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { OptionItem } from '@my-nx-monorepo/shared-util';

type QualificationState = {
  entities: Record<string, Qualification> | null;
  ids: string[] | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: QualificationState = {
  entities: null,
  ids: null,
  isLoading: null,
  error: null,
};

export const QualificationListStore = signalStore(
  withState(initialState),

  // withHooks({
  //   onInit(store) {
  //     effect(() => {
  //       console.log('qualification list state', getState(store));
  //     });
  //   },
  // }),

  withComputed((store) => ({
    qualificationList: computed(() => {
      const qualificationDictionary = store.entities();
      return qualificationDictionary
        ? Object.values(qualificationDictionary)
        : undefined;
    }),
    qualificationOptionItemList: computed(() =>
      Object.values(store.entities() ?? {}).map(
        (qualification) =>
          ({
            value: qualification.id,
            label: qualification.name,
          } as OptionItem)
      )
    ),
  })),

  withMethods((store) => ({
    addQualificationToList(qualification: Qualification) {
      patchState(store, (state) => ({
        entities: {
          ...(state.entities ?? {}),
          [qualification.id]: qualification,
        },
        ids: [...(state.ids ?? []), qualification.id],
        isLoading: false,
        error: null,
      }));
    },

    updateQualificationInList(
      qualificationId: string,
      data: Partial<Qualification>
    ) {
      patchState(store, (state) => {
        if (!state.entities || !state.entities[qualificationId]) return state;

        return {
          entities: {
            ...state.entities,
            [qualificationId]: {
              ...state.entities[qualificationId],
              ...data,
            },
          },
          isLoading: false,
          error: null,
        };
      });
    },

    deleteQualificationFromList(qualificationId: string) {
      patchState(store, (state) => {
        if (!state.entities || !state.ids) return state;

        const { [qualificationId]: _, ...remainingEntities } = state.entities;

        return {
          entities: remainingEntities,
          ids: state.ids.filter((id) => id !== qualificationId),
          isLoading: false,
          error: null,
        };
      });
    },

    addQualificationListToStoreList(qualificationList: Qualification[]) {
      patchState(store, (state) => {
        const newEntities = qualificationList.reduce(
          (acc, qualification) => {
            acc[qualification.id] = qualification;
            return acc;
          },
          { ...(state.entities ?? {}) } as Record<string, Qualification>
        );

        const newIds = [
          ...(state.ids ?? []),
          ...qualificationList.map((qualification) => qualification.id),
        ];

        return {
          entities: newEntities,
          ids: newIds,
          isLoading: false,
          error: null,
        };
      });
    },

    loadQualificationList(qualifications: Qualification[]) {
      const normalized = qualifications.reduce(
        (acc, q) => {
          acc.entities[q.id] = q;
          acc.ids.push(q.id);
          return acc;
        },
        {
          entities: {} as Record<string, Qualification>,
          ids: [] as string[],
        }
      );

      patchState(store, {
        ...normalized,
        isLoading: false,
        error: null,
      });
    },

    startLoading() {
      patchState(store, { isLoading: true, error: null });
    },

    logError(error: string) {
      patchState(store, {
        isLoading: false,
        error,
      });
    },
  }))
);
