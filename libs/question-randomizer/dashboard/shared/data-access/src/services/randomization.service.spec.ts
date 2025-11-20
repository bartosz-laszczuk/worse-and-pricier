import { TestBed } from '@angular/core/testing';
import { RandomizationService } from './randomization.service';
import {
  RandomizationRepository,
  SelectedCategoryListRepository,
  UsedQuestionListRepository,
} from '../repositories';
import { RandomizationMapperService } from './randomization-mapper.service';
import { RandomizationStore } from '../store';
import { PostponedQuestionListRepository } from '../repositories/postponed-question-list.repository';
import {
  Question,
  QuestionCategory,
  Randomization,
  RandomizationStatus,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { GetRandomizationResponse } from '../models';
import { signal } from '@angular/core';

// Mock Firebase modules to prevent module initialization during import
jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/firestore', () => ({}));

interface MockRandomizationStore {
  entity: ReturnType<typeof signal<Randomization | null>>;
  startLoading: jest.Mock;
  setRandomization: jest.Mock;
  setCurrentQuestion: jest.Mock;
  clearCurrentQuestion: jest.Mock;
  updateQuestionCategoryListsCategoryId: jest.Mock;
  filteredAvailableQuestionList: jest.Mock;
  filteredPostponedQuestionList: jest.Mock;
  logError: jest.Mock;
}

describe('RandomizationService', () => {
  let service: RandomizationService;
  let randomizationStore: MockRandomizationStore;
  let randomizationRepository: jest.Mocked<RandomizationRepository>;
  let randomizationMapperService: jest.Mocked<RandomizationMapperService>;
  let selectedCategoryListRepository: jest.Mocked<SelectedCategoryListRepository>;
  let usedQuestionListRepository: jest.Mocked<UsedQuestionListRepository>;
  let postponedQuestionListRepository: jest.Mocked<PostponedQuestionListRepository>;

  const mockQuestion: Question = {
    id: 'q1',
    categoryId: 'cat1',
    question: 'Test Question',
    answer: 'Test Answer',
    answerPl: 'Test Answer PL',
    isActive: true,
    userId: 'user1',
  };

  const mockQuestionMap: Record<string, Question> = {
    q1: mockQuestion,
    q2: { ...mockQuestion, id: 'q2', isActive: true },
    q3: { ...mockQuestion, id: 'q3', isActive: false },
  };

  const mockRandomization: Randomization = {
    id: 'rand1',
    showAnswer: false,
    status: RandomizationStatus.Ongoing,
    currentQuestion: mockQuestion,
    usedQuestionList: [],
    postponedQuestionList: [],
    selectedCategoryIdList: ['cat1'],
    availableQuestionList: [{ questionId: 'q2', categoryId: 'cat1' }],
  };

  beforeEach(() => {
    const randomizationEntity = signal<Randomization | null>(null);

    randomizationStore = {
      entity: randomizationEntity,
      startLoading: jest.fn(),
      setRandomization: jest.fn((r: Randomization) => randomizationEntity.set(r)),
      setCurrentQuestion: jest.fn(),
      clearCurrentQuestion: jest.fn(),
      updateQuestionCategoryListsCategoryId: jest.fn(),
      filteredAvailableQuestionList: jest.fn().mockReturnValue([]),
      filteredPostponedQuestionList: jest.fn().mockReturnValue([]),
      logError: jest.fn(),
    };

    randomizationRepository = {
      getRandomization: jest.fn(),
      createRandomization: jest.fn(),
      updateRandomization: jest.fn(),
      clearCurrentQuestion: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    randomizationMapperService = {
      mapGetRandomizationResponseToRandomization: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    selectedCategoryListRepository = {
      getSelectedCategoryIdListForRandomization: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    usedQuestionListRepository = {
      getUsedQuestionIdListForRandomization: jest.fn(),
      updateUsedQuestionCategoryId: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    postponedQuestionListRepository = {
      getPostponedQuestionIdListForRandomization: jest.fn(),
      updatePostponedQuestionCategoryId: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    TestBed.configureTestingModule({
      providers: [
        RandomizationService,
        { provide: RandomizationStore, useValue: randomizationStore },
        { provide: RandomizationRepository, useValue: randomizationRepository },
        { provide: RandomizationMapperService, useValue: randomizationMapperService },
        { provide: SelectedCategoryListRepository, useValue: selectedCategoryListRepository },
        { provide: UsedQuestionListRepository, useValue: usedQuestionListRepository },
        { provide: PostponedQuestionListRepository, useValue: postponedQuestionListRepository },
      ],
    });

    service = TestBed.inject(RandomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadRandomization', () => {
    it('should skip loading if not forced and entity exists', async () => {
      randomizationStore.entity.set(mockRandomization);

      await service.loadRandomization('user1', mockQuestionMap, false);

      expect(randomizationStore.startLoading).not.toHaveBeenCalled();
      expect(randomizationRepository.getRandomization).not.toHaveBeenCalled();
    });

    it('should force reload when forceLoad is true even if entity exists', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationRepository.getRandomization.mockResolvedValue(null);
      randomizationRepository.createRandomization.mockResolvedValue('newRandId');

      await service.loadRandomization('user1', mockQuestionMap, true);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationRepository.getRandomization).toHaveBeenCalledWith('user1');
    });

    it('should create new randomization when none exists', async () => {
      randomizationRepository.getRandomization.mockResolvedValue(null);
      randomizationRepository.createRandomization.mockResolvedValue('newRandId');

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationRepository.createRandomization).toHaveBeenCalledWith('user1');
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'newRandId',
          status: RandomizationStatus.Ongoing,
          showAnswer: false,
        })
      );
    });

    it('should initialize availableQuestionList with all questions when creating new randomization', async () => {
      randomizationRepository.getRandomization.mockResolvedValue(null);
      randomizationRepository.createRandomization.mockResolvedValue('newRandId');

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(
        expect.objectContaining({
          availableQuestionList: expect.arrayContaining([
            { questionId: 'q1', categoryId: 'cat1' },
            { questionId: 'q2', categoryId: 'cat1' },
            { questionId: 'q3', categoryId: 'cat1' },
          ]),
          usedQuestionList: [],
          postponedQuestionList: [],
          selectedCategoryIdList: [],
        })
      );
    });

    it('should load existing randomization', async () => {
      const mockResponse: GetRandomizationResponse = {
        id: 'rand1',
        currentQuestionId: 'q1',
        showAnswer: false,
        status: RandomizationStatus.Ongoing,
        userId: 'user1',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        created: null as any,
      };

      randomizationRepository.getRandomization.mockResolvedValue(mockResponse);
      usedQuestionListRepository.getUsedQuestionIdListForRandomization.mockResolvedValue([]);
      postponedQuestionListRepository.getPostponedQuestionIdListForRandomization.mockResolvedValue([]);
      selectedCategoryListRepository.getSelectedCategoryIdListForRandomization.mockResolvedValue(['cat1']);
      randomizationMapperService.mapGetRandomizationResponseToRandomization.mockReturnValue(mockRandomization);

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationMapperService.mapGetRandomizationResponseToRandomization).toHaveBeenCalled();
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(mockRandomization);
    });

    it('should handle errors', async () => {
      randomizationRepository.getRandomization.mockRejectedValue(new Error('Network error'));

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      randomizationRepository.getRandomization.mockRejectedValue('String error');

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Failed to load Randomization.');
    });
  });

  describe('advanceToNextQuestion', () => {
    it('should return early if no randomization exists', async () => {
      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.setCurrentQuestion).not.toHaveBeenCalled();
    });

    it('should select random question from available questions', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([
        { questionId: 'q1', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestion);
    });

    it('should select first postponed question when no available questions', async () => {
      const randomizationWithPostponed = {
        ...mockRandomization,
        availableQuestionList: [],
        postponedQuestionList: [
          { questionId: 'q2', categoryId: 'cat1' },
          { questionId: 'q1', categoryId: 'cat1' },
        ],
        selectedCategoryIdList: ['cat1'],
      };

      randomizationStore.entity.set(randomizationWithPostponed);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
      randomizationStore.filteredPostponedQuestionList.mockReturnValue([
        { questionId: 'q2', categoryId: 'cat1' },
        { questionId: 'q1', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      // Should select first postponed question (q2)
      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestionMap['q2']);
    });

    it('should skip update when both current and new question are undefined', async () => {
      const randomizationWithoutCurrent = {
        ...mockRandomization,
        currentQuestion: undefined,
      };

      randomizationStore.entity.set(randomizationWithoutCurrent);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
      randomizationStore.filteredPostponedQuestionList.mockReturnValue([]);

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.setCurrentQuestion).not.toHaveBeenCalled();
      expect(randomizationRepository.updateRandomization).not.toHaveBeenCalled();
    });

    it('should reset showAnswer to false when updating current question', async () => {
      const randomizationWithAnswerShown = {
        ...mockRandomization,
        showAnswer: true,
      };

      randomizationStore.entity.set(randomizationWithAnswerShown);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([
        { questionId: 'q1', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationRepository.updateRandomization).toHaveBeenCalledWith(
        expect.objectContaining({
          showAnswer: false,
        })
      );
    });

    it('should clear current question when no questions available', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
      randomizationStore.filteredPostponedQuestionList.mockReturnValue([]);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(undefined);
    });

    it('should filter out inactive questions', async () => {
      const randomizationWithInactive = {
        ...mockRandomization,
        availableQuestionList: [
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q3', categoryId: 'cat1' }, // inactive
        ],
      };

      randomizationStore.entity.set(randomizationWithInactive);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([
        { questionId: 'q1', categoryId: 'cat1' },
        { questionId: 'q3', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      // Should select q1 (active), not q3 (inactive)
      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestionMap['q1']);
    });

    it('should handle errors', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([
        { questionId: 'q1', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockRejectedValue(new Error('Update failed'));

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Update failed');
    });

    it('should handle non-Error exceptions', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([
        { questionId: 'q1', categoryId: 'cat1' },
      ]);
      randomizationRepository.updateRandomization.mockRejectedValue('String error');

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Failed to update current question with next question.');
    });
  });

  describe('updateRandomization', () => {
    it('should update randomization in store and repository', async () => {
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      await service.updateRandomization(mockRandomization);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(mockRandomization);
      expect(randomizationRepository.updateRandomization).toHaveBeenCalledWith(mockRandomization);
    });

    it('should handle errors', async () => {
      randomizationRepository.updateRandomization.mockRejectedValue(new Error('Update error'));

      await service.updateRandomization(mockRandomization);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Update error');
    });
  });

  describe('updateQuestionCategoryAcrossLists', () => {
    const mockQuestionCategory: QuestionCategory = {
      questionId: 'q1',
      categoryId: 'cat2',
    };

    it('should update category in store and repositories', async () => {
      postponedQuestionListRepository.updatePostponedQuestionCategoryId.mockResolvedValue(undefined);
      usedQuestionListRepository.updateUsedQuestionCategoryId.mockResolvedValue(undefined);

      await service.updateQuestionCategoryAcrossLists(mockQuestionCategory);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.updateQuestionCategoryListsCategoryId).toHaveBeenCalledWith(mockQuestionCategory);
      expect(postponedQuestionListRepository.updatePostponedQuestionCategoryId).toHaveBeenCalledWith(
        mockQuestionCategory
      );
      expect(usedQuestionListRepository.updateUsedQuestionCategoryId).toHaveBeenCalledWith(
        mockQuestionCategory
      );
    });

    it('should handle errors', async () => {
      postponedQuestionListRepository.updatePostponedQuestionCategoryId.mockRejectedValue(
        new Error('Repository error')
      );
      usedQuestionListRepository.updateUsedQuestionCategoryId.mockResolvedValue(undefined);

      await service.updateQuestionCategoryAcrossLists(mockQuestionCategory);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Repository error');
    });

    it('should handle non-Error exceptions', async () => {
      postponedQuestionListRepository.updatePostponedQuestionCategoryId.mockRejectedValue('String error');

      await service.updateQuestionCategoryAcrossLists(mockQuestionCategory);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Failed to update question category.');
    });
  });

  describe('setQuestionAsCurrentQuestion', () => {
    it('should set question as current with immutable object', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationRepository.updateRandomization.mockResolvedValue(undefined);

      const newQuestion: Question = { ...mockQuestion, id: 'q2' };

      await service.setQuestionAsCurrentQuestion(newQuestion);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(
        expect.objectContaining({
          currentQuestion: newQuestion,
        })
      );
    });

    it('should return early if no randomization exists', async () => {
      await service.setQuestionAsCurrentQuestion(mockQuestion);

      expect(randomizationStore.setRandomization).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationRepository.updateRandomization.mockRejectedValue(new Error('Set question error'));

      await service.setQuestionAsCurrentQuestion(mockQuestion);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Set question error');
    });

    it('should handle non-Error exceptions', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationRepository.updateRandomization.mockRejectedValue('String error');

      await service.setQuestionAsCurrentQuestion(mockQuestion);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Failed to set question as current question.');
    });
  });

  describe('clearCurrentQuestion', () => {
    it('should clear current question in store and repository', async () => {
      randomizationRepository.clearCurrentQuestion.mockResolvedValue(undefined);

      await service.clearCurrentQuestion('rand1');

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.clearCurrentQuestion).toHaveBeenCalled();
      expect(randomizationRepository.clearCurrentQuestion).toHaveBeenCalledWith('rand1');
    });

    it('should handle errors', async () => {
      randomizationRepository.clearCurrentQuestion.mockRejectedValue(new Error('Clear error'));

      await service.clearCurrentQuestion('rand1');

      expect(randomizationStore.logError).toHaveBeenCalledWith('Clear error');
    });

    it('should handle non-Error exceptions', async () => {
      randomizationRepository.clearCurrentQuestion.mockRejectedValue('String error');

      await service.clearCurrentQuestion('rand1');

      expect(randomizationStore.logError).toHaveBeenCalledWith('Failed to clear current question.');
    });
  });

  describe('Edge Cases', () => {
    describe('Empty question lists', () => {
      it('should handle empty questionMap when advancing to next question', async () => {
        const emptyQuestionMap: Record<string, Question> = {};

        randomizationStore.entity.set(mockRandomization);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([
          { questionId: 'q1', categoryId: 'cat1' },
        ]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(emptyQuestionMap);

        // Should call setCurrentQuestion with undefined since question doesn't exist in map
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(undefined);
      });

      it('should handle empty availableQuestionList when creating new randomization', async () => {
        const emptyQuestionMap: Record<string, Question> = {};
        randomizationRepository.getRandomization.mockResolvedValue(null);
        randomizationRepository.createRandomization.mockResolvedValue('newRandId');

        await service.loadRandomization('user1', emptyQuestionMap);

        expect(randomizationStore.setRandomization).toHaveBeenCalledWith(
          expect.objectContaining({
            availableQuestionList: [],
          })
        );
      });
    });

    describe('Invalid question IDs', () => {
      it('should skip questions with invalid IDs when advancing to next question', async () => {
        const randomizationWithInvalidId = {
          ...mockRandomization,
          availableQuestionList: [
            { questionId: 'invalid-id', categoryId: 'cat1' },
            { questionId: 'q1', categoryId: 'cat1' },
          ],
        };

        randomizationStore.entity.set(randomizationWithInvalidId);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([
          { questionId: 'invalid-id', categoryId: 'cat1' },
          { questionId: 'q1', categoryId: 'cat1' },
        ]);

        // Mock getRandomIndex to return 0 (invalid-id first)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(service as any, 'getRandomIndex').mockReturnValue(0);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(mockQuestionMap);

        // Should handle missing question gracefully
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalled();
      });
    });

    describe('UNCATEGORIZED_ID handling', () => {
      it('should match uncategorized questions when UNCATEGORIZED_ID is in selectedCategoryIdList', async () => {
        const uncategorizedQuestion: Question = {
          ...mockQuestion,
          id: 'q-uncat',
          categoryId: undefined, // Uncategorized
        };

        const questionMapWithUncategorized = {
          ...mockQuestionMap,
          'q-uncat': uncategorizedQuestion,
        };

        const randomizationWithUncategorized = {
          ...mockRandomization,
          availableQuestionList: [],
          postponedQuestionList: [{ questionId: 'q-uncat', categoryId: undefined }],
          selectedCategoryIdList: [''], // UNCATEGORIZED_ID is empty string
        };

        randomizationStore.entity.set(randomizationWithUncategorized);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
        randomizationStore.filteredPostponedQuestionList.mockReturnValue([
          { questionId: 'q-uncat', categoryId: undefined },
        ]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(questionMapWithUncategorized);

        // Should select the uncategorized question
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(uncategorizedQuestion);
      });
    });

    describe('Question activity filtering', () => {
      it('should filter out all inactive questions from available list', async () => {
        const allInactiveMap: Record<string, Question> = {
          q1: { ...mockQuestion, id: 'q1', isActive: false },
          q2: { ...mockQuestion, id: 'q2', isActive: false },
        };

        const randomizationWithInactive = {
          ...mockRandomization,
          availableQuestionList: [
            { questionId: 'q1', categoryId: 'cat1' },
            { questionId: 'q2', categoryId: 'cat1' },
          ],
        };

        randomizationStore.entity.set(randomizationWithInactive);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q2', categoryId: 'cat1' },
        ]);
        randomizationStore.filteredPostponedQuestionList.mockReturnValue([]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(allInactiveMap);

        // Should clear current question since no active questions available
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(undefined);
      });

      it('should filter out inactive questions from postponed list', async () => {
        const mixedActivityMap: Record<string, Question> = {
          q1: { ...mockQuestion, id: 'q1', isActive: false },
          q2: { ...mockQuestion, id: 'q2', isActive: true },
        };

        const randomizationWithPostponed = {
          ...mockRandomization,
          availableQuestionList: [],
          postponedQuestionList: [
            { questionId: 'q1', categoryId: 'cat1' }, // inactive
            { questionId: 'q2', categoryId: 'cat1' }, // active
          ],
          selectedCategoryIdList: ['cat1'],
        };

        randomizationStore.entity.set(randomizationWithPostponed);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
        randomizationStore.filteredPostponedQuestionList.mockReturnValue([
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q2', categoryId: 'cat1' },
        ]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(mixedActivityMap);

        // Should select q2 (active), not q1 (inactive)
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mixedActivityMap['q2']);
      });
    });

    describe('Random selection behavior', () => {
      it('should use getRandomIndex for selecting questions', async () => {
        const availableQuestions = [
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q2', categoryId: 'cat1' },
        ];

        randomizationStore.entity.set(mockRandomization);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue(availableQuestions);

        // Spy on getRandomIndex to verify it's called correctly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getRandomIndexSpy = jest.spyOn(service as any, 'getRandomIndex').mockReturnValue(1);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(mockQuestionMap);

        expect(getRandomIndexSpy).toHaveBeenCalledWith(2); // 2 active questions after filtering
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestionMap['q2']);

        getRandomIndexSpy.mockRestore();
      });
    });

    describe('Category matching in postponed questions', () => {
      it('should return first postponed question matching selected categories', async () => {
        const multiCategoryMap: Record<string, Question> = {
          q1: { ...mockQuestion, id: 'q1', categoryId: 'cat1', isActive: true },
          q2: { ...mockQuestion, id: 'q2', categoryId: 'cat2', isActive: true },
          q3: { ...mockQuestion, id: 'q3', categoryId: 'cat3', isActive: true },
        };

        const randomizationWithMultiCategory = {
          ...mockRandomization,
          availableQuestionList: [],
          postponedQuestionList: [
            { questionId: 'q1', categoryId: 'cat1' },
            { questionId: 'q2', categoryId: 'cat2' },
            { questionId: 'q3', categoryId: 'cat3' },
          ],
          selectedCategoryIdList: ['cat2', 'cat3'], // Only cat2 and cat3 selected
        };

        randomizationStore.entity.set(randomizationWithMultiCategory);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
        randomizationStore.filteredPostponedQuestionList.mockReturnValue([
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q2', categoryId: 'cat2' },
          { questionId: 'q3', categoryId: 'cat3' },
        ]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(multiCategoryMap);

        // Should select q2 (first matching selected categories), not q1
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(multiCategoryMap['q2']);
      });

      it('should return undefined when no postponed questions match selected categories', async () => {
        const multiCategoryMap: Record<string, Question> = {
          q1: { ...mockQuestion, id: 'q1', categoryId: 'cat1', isActive: true },
          q2: { ...mockQuestion, id: 'q2', categoryId: 'cat2', isActive: true },
        };

        const randomizationWithMismatch = {
          ...mockRandomization,
          availableQuestionList: [],
          postponedQuestionList: [
            { questionId: 'q1', categoryId: 'cat1' },
            { questionId: 'q2', categoryId: 'cat2' },
          ],
          selectedCategoryIdList: ['cat3', 'cat4'], // No matches
        };

        randomizationStore.entity.set(randomizationWithMismatch);
        randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
        randomizationStore.filteredPostponedQuestionList.mockReturnValue([
          { questionId: 'q1', categoryId: 'cat1' },
          { questionId: 'q2', categoryId: 'cat2' },
        ]);
        randomizationRepository.updateRandomization.mockResolvedValue(undefined);

        await service.advanceToNextQuestion(multiCategoryMap);

        // Should clear current question since no matches
        expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(undefined);
      });
    });
  });
});
