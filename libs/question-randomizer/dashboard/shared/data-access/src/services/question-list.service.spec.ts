import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { QuestionListService } from './question-list.service';
import { QuestionRepository } from '../repositories';
import { QuestionListStore, RandomizationStore } from '../store';
import { QuestionMapperService } from './question-mapper.service';
import { RandomizationService } from './randomization.service';
import { UsedQuestionListService } from './used-question-list.service';
import { PostponedQuestionListService } from './postponed-question-list.service';
import { UserStore } from '@worse-and-pricier/question-randomizer-shared-data-access';
import {
  Category,
  EditQuestionFormValue,
  Qualification,
  Question,
  UsedQuestion,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

describe('QuestionListService', () => {
  let service: QuestionListService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userStore: any;
  let questionRepository: jest.Mocked<QuestionRepository>;
  let questionMapperService: jest.Mocked<QuestionMapperService>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let questionListStore: any;
  let randomizationService: jest.Mocked<RandomizationService>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let randomizationStore: any;
  let usedQuestionListService: jest.Mocked<UsedQuestionListService>;
  let postponedQuestionListService: jest.Mocked<PostponedQuestionListService>;

  const mockUserId = 'user-123';
  const mockQuestionId = 'question-123';

  const mockQuestion: Question = {
    id: mockQuestionId,
    question: 'Test question?',
    answer: 'Test answer',
    answerPl: 'Test answer PL',
    categoryId: 'category-1',
    qualificationId: 'qualification-1',
    isActive: true,
    userId: mockUserId,
    categoryName: 'Angular',
    qualificationName: 'Junior',
  };

  const mockEditQuestionFormValue: EditQuestionFormValue = {
    question: 'Test question?',
    answer: 'Test answer',
    answerPl: 'Test answer PL',
    categoryId: 'category-1',
    categoryName: 'Angular',
    qualificationId: 'qualification-1',
    qualificationName: 'Junior',
    isActive: true,
    tags: 'tag1, tag2',
  };

  const mockCategory: Category = {
    id: 'category-1',
    name: 'Angular',
    userId: mockUserId,
  };

  const mockQualification: Qualification = {
    id: 'qualification-1',
    name: 'Junior',
    userId: mockUserId,
  };

  beforeEach(() => {
    const mockQuestionListStoreEntities = signal<Record<string, Question> | null>({
      [mockQuestionId]: mockQuestion,
    });

    const userStoreMock = {
      uid: jest.fn().mockReturnValue(mockUserId),
    };

    const questionRepositoryMock = {
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      getQuestions: jest.fn(),
      removeCategoryIdFromQuestions: jest.fn(),
      removeQualificationIdFromQuestions: jest.fn(),
    };

    const questionMapperServiceMock = {
      mapEditQuestionFormValueToCreateQuestionRequest: jest.fn(),
      mapEditQuestionFormValueToQuestion: jest.fn(),
      mapEditQuestionFormValueToUpdateQuestionRequest: jest.fn(),
    };

    const questionListStoreMock = {
      startLoading: jest.fn(),
      addQuestionToList: jest.fn(),
      updateQuestionInList: jest.fn(),
      restoreQuestion: jest.fn(),
      deleteQuestionFromList: jest.fn(),
      loadQuestionList: jest.fn(),
      deleteCategoryIdFromQuestions: jest.fn(),
      deleteQualificationIdFromQuestions: jest.fn(),
      logError: jest.fn(),
      entities: jest.fn().mockReturnValue(mockQuestionListStoreEntities()),
    };

    const randomizationServiceMock = {
      updateQuestionCategoryAcrossLists: jest.fn(),
      advanceToNextQuestion: jest.fn(),
      clearCurrentQuestion: jest.fn(),
    };

    const randomizationStoreMock = {
      addAvailableQuestionsToRandomization: jest.fn(),
      deleteAvailableQuestionFromRandomization: jest.fn(),
      entity: jest.fn().mockReturnValue(null),
    };

    const usedQuestionListServiceMock = {
      deleteUsedQuestionFromRandomization: jest.fn(),
    };

    const postponedQuestionListServiceMock = {
      deletePostponedQuestionFromRandomization: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        QuestionListService,
        { provide: UserStore, useValue: userStoreMock },
        { provide: QuestionRepository, useValue: questionRepositoryMock },
        { provide: QuestionMapperService, useValue: questionMapperServiceMock },
        { provide: QuestionListStore, useValue: questionListStoreMock },
        { provide: RandomizationService, useValue: randomizationServiceMock },
        { provide: RandomizationStore, useValue: randomizationStoreMock },
        { provide: UsedQuestionListService, useValue: usedQuestionListServiceMock },
        { provide: PostponedQuestionListService, useValue: postponedQuestionListServiceMock },
      ],
    });

    service = TestBed.inject(QuestionListService);
    userStore = TestBed.inject(UserStore);
    questionRepository = TestBed.inject(QuestionRepository) as jest.Mocked<QuestionRepository>;
    questionMapperService = TestBed.inject(QuestionMapperService) as jest.Mocked<QuestionMapperService>;
    questionListStore = TestBed.inject(QuestionListStore);
    randomizationService = TestBed.inject(RandomizationService) as jest.Mocked<RandomizationService>;
    randomizationStore = TestBed.inject(RandomizationStore);
    usedQuestionListService = TestBed.inject(UsedQuestionListService) as jest.Mocked<UsedQuestionListService>;
    postponedQuestionListService = TestBed.inject(PostponedQuestionListService) as jest.Mocked<PostponedQuestionListService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createQuestionByForm', () => {
    it('should create a question successfully', async () => {
      // Arrange
      const createQuestionRequest = { text: 'Test' };
      const newQuestionId = 'new-question-123';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest.mockReturnValue(createQuestionRequest as any);
      questionRepository.createQuestion.mockResolvedValue(newQuestionId);
      questionMapperService.mapEditQuestionFormValueToQuestion.mockReturnValue(mockQuestion);

      // Act
      await service.createQuestionByForm(mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest).toHaveBeenCalledWith(
        mockEditQuestionFormValue,
        mockUserId
      );
      expect(questionRepository.createQuestion).toHaveBeenCalledWith(createQuestionRequest);
      expect(questionMapperService.mapEditQuestionFormValueToQuestion).toHaveBeenCalledWith(
        newQuestionId,
        mockEditQuestionFormValue,
        mockUserId
      );
      expect(questionListStore.addQuestionToList).toHaveBeenCalledWith(mockQuestion);
      expect(randomizationStore.addAvailableQuestionsToRandomization).toHaveBeenCalledWith([
        { questionId: mockQuestion.id, categoryId: mockQuestion.categoryId },
      ]);
    });

    it('should return early if userId is null', async () => {
      // Arrange
      userStore.uid.mockReturnValue(null);

      // Act
      await service.createQuestionByForm(mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.startLoading).not.toHaveBeenCalled();
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should handle errors and log them', async () => {
      // Arrange
      const error = new Error('Creation failed');
      questionRepository.createQuestion.mockRejectedValue(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest.mockReturnValue({} as any);

      // Act
      await service.createQuestionByForm(mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.logError).toHaveBeenCalledWith('Creation failed');
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      questionRepository.createQuestion.mockRejectedValue('String error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToCreateQuestionRequest.mockReturnValue({} as any);

      // Act
      await service.createQuestionByForm(mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.logError).toHaveBeenCalledWith('Question creation failed');
    });
  });

  describe('updateQuestion', () => {
    it('should update a question successfully', async () => {
      // Arrange
      const updateQuestionRequest = { text: 'Updated' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToUpdateQuestionRequest.mockReturnValue(updateQuestionRequest as any);
      questionRepository.updateQuestion.mockResolvedValue();
      randomizationService.updateQuestionCategoryAcrossLists.mockResolvedValue();

      // Act
      await service.updateQuestion(mockQuestionId, mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionListStore.updateQuestionInList).toHaveBeenCalledWith(mockQuestionId, mockEditQuestionFormValue);
      expect(questionRepository.updateQuestion).toHaveBeenCalledWith(mockQuestionId, updateQuestionRequest);
      expect(randomizationService.updateQuestionCategoryAcrossLists).toHaveBeenCalledWith({
        questionId: mockQuestionId,
        categoryId: mockEditQuestionFormValue.categoryId,
      });
    });

    it('should rollback optimistic update on error', async () => {
      // Arrange
      const error = new Error('Update failed');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToUpdateQuestionRequest.mockReturnValue({} as any);
      questionRepository.updateQuestion.mockRejectedValue(error);

      // Act
      await service.updateQuestion(mockQuestionId, mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.updateQuestionInList).toHaveBeenCalledTimes(1); // Optimistic update
      expect(questionListStore.restoreQuestion).toHaveBeenCalledWith(mockQuestion); // Rollback
      expect(questionListStore.logError).toHaveBeenCalledWith('Update failed');
    });

    it('should not rollback if previousQuestion is null', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue({});
      const error = new Error('Update failed');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionMapperService.mapEditQuestionFormValueToUpdateQuestionRequest.mockReturnValue({} as any);
      questionRepository.updateQuestion.mockRejectedValue(error);

      // Act
      await service.updateQuestion(mockQuestionId, mockEditQuestionFormValue);

      // Assert
      expect(questionListStore.updateQuestionInList).toHaveBeenCalledTimes(1); // Only optimistic update
      expect(questionListStore.restoreQuestion).not.toHaveBeenCalled(); // No rollback
      expect(questionListStore.logError).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('deleteQuestion', () => {
    it('should delete a question successfully', async () => {
      // Arrange
      questionRepository.deleteQuestion.mockResolvedValue();
      usedQuestionListService.deleteUsedQuestionFromRandomization.mockResolvedValue();
      postponedQuestionListService.deletePostponedQuestionFromRandomization.mockResolvedValue();

      // Act
      await service.deleteQuestion(mockQuestionId);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionListStore.deleteQuestionFromList).toHaveBeenCalledWith(mockQuestionId);
      expect(randomizationStore.deleteAvailableQuestionFromRandomization).toHaveBeenCalledWith(mockQuestionId);
      expect(questionRepository.deleteQuestion).toHaveBeenCalledWith(mockQuestionId);
    });

    it('should rollback optimistic deletion on error', async () => {
      // Arrange
      const error = new Error('Deletion failed');
      questionRepository.deleteQuestion.mockRejectedValue(error);

      // Act
      await service.deleteQuestion(mockQuestionId);

      // Assert
      expect(questionListStore.deleteQuestionFromList).toHaveBeenCalledWith(mockQuestionId); // Optimistic delete
      expect(questionListStore.addQuestionToList).toHaveBeenCalledWith(mockQuestion); // Rollback
      expect(randomizationStore.addAvailableQuestionsToRandomization).toHaveBeenCalledWith([
        { questionId: mockQuestion.id, categoryId: mockQuestion.categoryId },
      ]); // Rollback
      expect(questionListStore.logError).toHaveBeenCalledWith('Deletion failed');
    });

    it('should not rollback if previousQuestion is null', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue({});
      const error = new Error('Deletion failed');
      questionRepository.deleteQuestion.mockRejectedValue(error);

      // Act
      await service.deleteQuestion(mockQuestionId);

      // Assert
      expect(questionListStore.deleteQuestionFromList).toHaveBeenCalledWith(mockQuestionId);
      expect(questionListStore.addQuestionToList).not.toHaveBeenCalled(); // No rollback
      expect(questionListStore.logError).toHaveBeenCalledWith('Deletion failed');
    });
  });

  describe('loadQuestionList', () => {
    const categoryMap: Record<string, Category> = {
      'category-1': mockCategory,
    };
    const qualificationMap: Record<string, Qualification> = {
      'qualification-1': mockQualification,
    };

    it('should load questions successfully', async () => {
      // Arrange
      const rawQuestions = [
        {
          id: 'q1',
          question: 'Question 1',
          answer: 'Answer 1',
          answerPl: 'Answer 1 PL',
          categoryId: 'category-1',
          qualificationId: 'qualification-1',
          isActive: true,
          userId: mockUserId,
        },
      ] as Question[];
      questionListStore.entities.mockReturnValue(null); // Not loaded yet
      questionRepository.getQuestions.mockResolvedValue(rawQuestions);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionRepository.getQuestions).toHaveBeenCalledWith(mockUserId);
      expect(questionListStore.loadQuestionList).toHaveBeenCalledWith([
        {
          ...rawQuestions[0],
          categoryName: 'Angular',
          qualificationName: 'Junior',
        },
      ]);
    });

    it('should not load if already loaded and forceLoad is false', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue({ [mockQuestionId]: mockQuestion });

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap, false);

      // Assert
      expect(questionRepository.getQuestions).not.toHaveBeenCalled();
    });

    it('should load if forceLoad is true even if already loaded', async () => {
      // Arrange
      const rawQuestions = [mockQuestion];
      questionListStore.entities.mockReturnValue({ [mockQuestionId]: mockQuestion });
      questionRepository.getQuestions.mockResolvedValue(rawQuestions);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap, true);

      // Assert
      expect(questionRepository.getQuestions).toHaveBeenCalledWith(mockUserId);
    });

    it('should return early if userId is null', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue(null);
      userStore.uid.mockReturnValue(null);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap);

      // Assert
      expect(questionListStore.startLoading).not.toHaveBeenCalled();
      expect(questionRepository.getQuestions).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Load failed');
      questionListStore.entities.mockReturnValue(null);
      questionRepository.getQuestions.mockRejectedValue(error);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap);

      // Assert
      expect(questionListStore.logError).toHaveBeenCalledWith('Load failed');
    });

    it('should enrich questions with category and qualification names', async () => {
      // Arrange
      const rawQuestions = [
        {
          id: 'q1',
          question: 'Q1',
          answer: 'A1',
          answerPl: 'A1 PL',
          categoryId: 'category-1',
          qualificationId: 'qualification-1',
          isActive: true,
          userId: mockUserId,
        } as Question,
      ];
      questionListStore.entities.mockReturnValue(null);
      questionRepository.getQuestions.mockResolvedValue(rawQuestions);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap);

      // Assert
      expect(questionListStore.loadQuestionList).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            categoryName: 'Angular',
            qualificationName: 'Junior',
          }),
        ])
      );
    });

    it('should handle questions with null categoryId', async () => {
      // Arrange
      const rawQuestions = [
        {
          id: 'q1',
          question: 'Q1',
          answer: 'A1',
          answerPl: 'A1 PL',
          categoryId: undefined,
          qualificationId: 'qualification-1',
          isActive: true,
          userId: mockUserId,
        } as Question,
      ];
      questionListStore.entities.mockReturnValue(null);
      questionRepository.getQuestions.mockResolvedValue(rawQuestions);

      // Act
      await service.loadQuestionList(categoryMap, qualificationMap);

      // Assert
      expect(questionListStore.loadQuestionList).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            categoryName: undefined,
            qualificationName: 'Junior',
          }),
        ])
      );
    });
  });

  describe('findLastQuestionForCategoryIdList', () => {
    it('should find the last question matching selected categories', () => {
      // Arrange
      const usedQuestions: UsedQuestion[] = [
        { questionId: 'q1', categoryId: 'category-2' },
        { questionId: mockQuestionId, categoryId: 'category-1' },
      ];
      const selectedCategories = ['category-1'];

      // Act
      const result = service.findLastQuestionForCategoryIdList(usedQuestions, selectedCategories);

      // Assert
      expect(result).toEqual(mockQuestion);
    });

    it('should return undefined if no matching question found', () => {
      // Arrange
      const usedQuestions: UsedQuestion[] = [{ questionId: mockQuestionId, categoryId: 'category-1' }];
      const selectedCategories = ['non-existent-category'];

      // Act
      const result = service.findLastQuestionForCategoryIdList(usedQuestions, selectedCategories);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined if questionMap is null', () => {
      // Arrange
      questionListStore.entities.mockReturnValue(null);
      const usedQuestions: UsedQuestion[] = [{ questionId: mockQuestionId, categoryId: 'category-1' }];
      const selectedCategories = ['category-1'];

      // Act
      const result = service.findLastQuestionForCategoryIdList(usedQuestions, selectedCategories);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined if usedQuestionList is empty', () => {
      // Arrange
      const usedQuestions: UsedQuestion[] = [];
      const selectedCategories = ['category-1'];

      // Act
      const result = service.findLastQuestionForCategoryIdList(usedQuestions, selectedCategories);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('deleteCategoryIdFromQuestions', () => {
    it('should delete categoryId from questions successfully', async () => {
      // Arrange
      const categoryId = 'category-1';
      questionRepository.removeCategoryIdFromQuestions.mockResolvedValue();

      // Act
      await service.deleteCategoryIdFromQuestions(categoryId);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionListStore.deleteCategoryIdFromQuestions).toHaveBeenCalledWith(categoryId);
      expect(questionRepository.removeCategoryIdFromQuestions).toHaveBeenCalledWith(categoryId, mockUserId);
    });

    it('should return early if entities is null', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue(null);

      // Act
      await service.deleteCategoryIdFromQuestions('category-1');

      // Assert
      expect(questionListStore.deleteCategoryIdFromQuestions).not.toHaveBeenCalled();
    });

    it('should return early if userId is null', async () => {
      // Arrange
      userStore.uid.mockReturnValue(null);

      // Act
      await service.deleteCategoryIdFromQuestions('category-1');

      // Assert
      expect(questionListStore.deleteCategoryIdFromQuestions).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Delete category failed');
      questionRepository.removeCategoryIdFromQuestions.mockRejectedValue(error);

      // Act
      await service.deleteCategoryIdFromQuestions('category-1');

      // Assert
      expect(questionListStore.logError).toHaveBeenCalledWith('Delete category failed');
    });
  });

  describe('deleteQualificationIdFromQuestions', () => {
    it('should delete qualificationId from questions successfully', async () => {
      // Arrange
      const qualificationId = 'qualification-1';
      questionRepository.removeQualificationIdFromQuestions.mockResolvedValue();

      // Act
      await service.deleteQualificationIdFromQuestions(qualificationId);

      // Assert
      expect(questionListStore.startLoading).toHaveBeenCalled();
      expect(questionListStore.deleteQualificationIdFromQuestions).toHaveBeenCalledWith(qualificationId);
      expect(questionRepository.removeQualificationIdFromQuestions).toHaveBeenCalledWith(
        qualificationId,
        mockUserId
      );
    });

    it('should return early if entities is null', async () => {
      // Arrange
      questionListStore.entities.mockReturnValue(null);

      // Act
      await service.deleteQualificationIdFromQuestions('qualification-1');

      // Assert
      expect(questionListStore.deleteQualificationIdFromQuestions).not.toHaveBeenCalled();
    });

    it('should return early if userId is null', async () => {
      // Arrange
      userStore.uid.mockReturnValue(null);

      // Act
      await service.deleteQualificationIdFromQuestions('qualification-1');

      // Assert
      expect(questionListStore.deleteQualificationIdFromQuestions).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Delete qualification failed');
      questionRepository.removeQualificationIdFromQuestions.mockRejectedValue(error);

      // Act
      await service.deleteQualificationIdFromQuestions('qualification-1');

      // Assert
      expect(questionListStore.logError).toHaveBeenCalledWith('Delete qualification failed');
    });
  });
});
