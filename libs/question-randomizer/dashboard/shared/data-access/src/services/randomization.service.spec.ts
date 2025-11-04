import { TestBed } from '@angular/core/testing';
import { RandomizationService } from './randomization.service';
import {
  RandomizationRepositoryService,
  SelectedCategoryListRepositoryService,
  UsedQuestionListRepositoryService,
} from '../repositories';
import { RandomizationMapperService } from './randomization-mapper.service';
import { RandomizationStore } from '../store';
import { PostponedQuestionListRepositoryService } from '../repositories/postponed-question-list-repository.service';
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
  let randomizationRepositoryService: jest.Mocked<RandomizationRepositoryService>;
  let randomizationMapperService: jest.Mocked<RandomizationMapperService>;
  let selectedCategoryListRepositoryService: jest.Mocked<SelectedCategoryListRepositoryService>;
  let usedQuestionListRepositoryService: jest.Mocked<UsedQuestionListRepositoryService>;
  let postponedQuestionListRepositoryService: jest.Mocked<PostponedQuestionListRepositoryService>;

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

    randomizationRepositoryService = {
      getRandomization: jest.fn(),
      createRandomization: jest.fn(),
      updateRandomization: jest.fn(),
      clearCurrentQuestion: jest.fn(),
    } as any;

    randomizationMapperService = {
      mapGetRandomizationResponseToRandomization: jest.fn(),
    } as any;

    selectedCategoryListRepositoryService = {
      getSelectedCategoryIdListForRandomization: jest.fn(),
    } as any;

    usedQuestionListRepositoryService = {
      getUsedQuestionIdListForRandomization: jest.fn(),
      updateUsedQuestionCategoryId: jest.fn(),
    } as any;

    postponedQuestionListRepositoryService = {
      getPostponedQuestionIdListForRandomization: jest.fn(),
      updatePostponedQuestionCategoryId: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        RandomizationService,
        { provide: RandomizationStore, useValue: randomizationStore },
        { provide: RandomizationRepositoryService, useValue: randomizationRepositoryService },
        { provide: RandomizationMapperService, useValue: randomizationMapperService },
        { provide: SelectedCategoryListRepositoryService, useValue: selectedCategoryListRepositoryService },
        { provide: UsedQuestionListRepositoryService, useValue: usedQuestionListRepositoryService },
        { provide: PostponedQuestionListRepositoryService, useValue: postponedQuestionListRepositoryService },
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
      expect(randomizationRepositoryService.getRandomization).not.toHaveBeenCalled();
    });

    it('should create new randomization when none exists', async () => {
      randomizationRepositoryService.getRandomization.mockResolvedValue(null);
      randomizationRepositoryService.createRandomization.mockResolvedValue('newRandId');

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationRepositoryService.createRandomization).toHaveBeenCalledWith('user1');
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'newRandId',
          status: RandomizationStatus.Ongoing,
          showAnswer: false,
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
        created: null as any,
      };

      randomizationRepositoryService.getRandomization.mockResolvedValue(mockResponse);
      usedQuestionListRepositoryService.getUsedQuestionIdListForRandomization.mockResolvedValue([]);
      postponedQuestionListRepositoryService.getPostponedQuestionIdListForRandomization.mockResolvedValue([]);
      selectedCategoryListRepositoryService.getSelectedCategoryIdListForRandomization.mockResolvedValue(['cat1']);
      randomizationMapperService.mapGetRandomizationResponseToRandomization.mockReturnValue(mockRandomization);

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationMapperService.mapGetRandomizationResponseToRandomization).toHaveBeenCalled();
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(mockRandomization);
    });

    it('should handle errors', async () => {
      randomizationRepositoryService.getRandomization.mockRejectedValue(new Error('Network error'));

      await service.loadRandomization('user1', mockQuestionMap);

      expect(randomizationStore.logError).toHaveBeenCalledWith('Network error');
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
      randomizationRepositoryService.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestion);
    });

    it('should clear current question when no questions available', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationStore.filteredAvailableQuestionList.mockReturnValue([]);
      randomizationStore.filteredPostponedQuestionList.mockReturnValue([]);
      randomizationRepositoryService.updateRandomization.mockResolvedValue(undefined);

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
      randomizationRepositoryService.updateRandomization.mockResolvedValue(undefined);

      await service.advanceToNextQuestion(mockQuestionMap);

      // Should select q1 (active), not q3 (inactive)
      expect(randomizationStore.setCurrentQuestion).toHaveBeenCalledWith(mockQuestionMap['q1']);
    });
  });

  describe('updateRandomization', () => {
    it('should update randomization in store and repository', async () => {
      randomizationRepositoryService.updateRandomization.mockResolvedValue(undefined);

      await service.updateRandomization(mockRandomization);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.setRandomization).toHaveBeenCalledWith(mockRandomization);
      expect(randomizationRepositoryService.updateRandomization).toHaveBeenCalledWith(mockRandomization);
    });

    it('should handle errors', async () => {
      randomizationRepositoryService.updateRandomization.mockRejectedValue(new Error('Update error'));

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
      postponedQuestionListRepositoryService.updatePostponedQuestionCategoryId.mockResolvedValue(undefined);
      usedQuestionListRepositoryService.updateUsedQuestionCategoryId.mockResolvedValue(undefined);

      await service.updateQuestionCategoryAcrossLists(mockQuestionCategory);

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.updateQuestionCategoryListsCategoryId).toHaveBeenCalledWith(mockQuestionCategory);
      expect(postponedQuestionListRepositoryService.updatePostponedQuestionCategoryId).toHaveBeenCalledWith(
        mockQuestionCategory
      );
      expect(usedQuestionListRepositoryService.updateUsedQuestionCategoryId).toHaveBeenCalledWith(
        mockQuestionCategory
      );
    });
  });

  describe('setQuestionAsCurrentQuestion', () => {
    it('should set question as current with immutable object', async () => {
      randomizationStore.entity.set(mockRandomization);
      randomizationRepositoryService.updateRandomization.mockResolvedValue(undefined);

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
  });

  describe('clearCurrentQuestion', () => {
    it('should clear current question in store and repository', async () => {
      randomizationRepositoryService.clearCurrentQuestion.mockResolvedValue(undefined);

      await service.clearCurrentQuestion('rand1');

      expect(randomizationStore.startLoading).toHaveBeenCalled();
      expect(randomizationStore.clearCurrentQuestion).toHaveBeenCalled();
      expect(randomizationRepositoryService.clearCurrentQuestion).toHaveBeenCalledWith('rand1');
    });
  });
});
