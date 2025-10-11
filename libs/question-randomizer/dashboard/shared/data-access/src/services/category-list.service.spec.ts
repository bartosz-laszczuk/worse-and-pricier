import { TestBed } from '@angular/core/testing';
import { CategoryListService } from './category-list.service';
import { CategoryRepositoryService } from '../repositories';
import { CategoryListStore, RandomizationStore } from '../store';
import { UserStore } from '@worse-and-pricier/question-randomizer-shared-data-access';
import { QuestionListService } from './question-list.service';
import { RandomizationService } from './randomization.service';
import { UsedQuestionListService } from './used-question-list.service';
import { PostponedQuestionListService } from './postponed-question-list.service';
import { SelectedCategoryListService } from './selected-category-list.service';
import { Category } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { signal } from '@angular/core';

// Mock Firebase modules to prevent module initialization during import
jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/firestore', () => ({}));

interface MockCategoryListStore {
  entities: ReturnType<typeof signal<Record<string, Category> | null>>;
  startLoading: jest.Mock;
  addCategoryToList: jest.Mock;
  updateCategoryInList: jest.Mock;
  deleteCategoryFromList: jest.Mock;
  loadCategoryList: jest.Mock;
  logError: jest.Mock;
}

interface MockUserStore {
  uid: ReturnType<typeof signal<string | null>>;
}

interface MockRandomizationStore {
  entity: ReturnType<typeof signal<{ id: string; currentQuestion?: { id: string; categoryId?: string } } | null>>;
  resetAvailableQuestionsCategoryId: jest.Mock;
}

describe('CategoryListService', () => {
  let service: CategoryListService;
  let categoryRepositoryService: jest.Mocked<CategoryRepositoryService>;
  let categoryListStore: MockCategoryListStore;
  let userStore: MockUserStore;
  let questionListService: jest.Mocked<QuestionListService>;
  let randomizationService: jest.Mocked<RandomizationService>;
  let randomizationStore: MockRandomizationStore;
  let usedQuestionListService: jest.Mocked<UsedQuestionListService>;
  let postponedQuestionListService: jest.Mocked<PostponedQuestionListService>;
  let selectedCategoryListService: jest.Mocked<SelectedCategoryListService>;

  const mockUserId = 'user-123';
  const mockCategoryId = 'category-123';
  const mockRandomizationId = 'randomization-123';

  const mockCategory: Category = {
    id: mockCategoryId,
    name: 'Test Category',
    userId: mockUserId,
  };

  beforeEach(() => {
    // Mock CategoryRepositoryService
    const categoryRepositoryServiceMock = {
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      getCategories: jest.fn(),
    };

    // Mock CategoryListStore
    const categoryListStoreMock = {
      entities: signal<Record<string, Category> | null>(null),
      startLoading: jest.fn(),
      addCategoryToList: jest.fn(),
      updateCategoryInList: jest.fn(),
      deleteCategoryFromList: jest.fn(),
      loadCategoryList: jest.fn(),
      logError: jest.fn(),
    };

    // Mock UserStore
    const userStoreMock = {
      uid: signal<string | null>(mockUserId),
    };

    // Mock RandomizationStore
    const randomizationStoreMock = {
      entity: signal<{ id: string; currentQuestion?: { id: string; categoryId?: string } } | null>(null),
      resetAvailableQuestionsCategoryId: jest.fn(),
    };

    // Mock services
    const questionListServiceMock = {
      deleteCategoryIdFromQuestions: jest.fn(),
    };

    const randomizationServiceMock = {
      clearCurrentQuestion: jest.fn(),
    };

    const usedQuestionListServiceMock = {
      resetUsedQuestionsCategoryId: jest.fn(),
    };

    const postponedQuestionListServiceMock = {
      resetPostponedQuestionsCategoryId: jest.fn(),
    };

    const selectedCategoryListServiceMock = {
      deselectSelectedCategoryFromRandomization: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoryListService,
        { provide: CategoryRepositoryService, useValue: categoryRepositoryServiceMock },
        { provide: CategoryListStore, useValue: categoryListStoreMock },
        { provide: UserStore, useValue: userStoreMock },
        { provide: QuestionListService, useValue: questionListServiceMock },
        { provide: RandomizationService, useValue: randomizationServiceMock },
        { provide: RandomizationStore, useValue: randomizationStoreMock },
        { provide: UsedQuestionListService, useValue: usedQuestionListServiceMock },
        { provide: PostponedQuestionListService, useValue: postponedQuestionListServiceMock },
        { provide: SelectedCategoryListService, useValue: selectedCategoryListServiceMock },
      ],
    });

    service = TestBed.inject(CategoryListService);
    categoryRepositoryService = TestBed.inject(CategoryRepositoryService) as jest.Mocked<CategoryRepositoryService>;
    categoryListStore = TestBed.inject(CategoryListStore);
    userStore = TestBed.inject(UserStore);
    questionListService = TestBed.inject(QuestionListService) as jest.Mocked<QuestionListService>;
    randomizationService = TestBed.inject(RandomizationService) as jest.Mocked<RandomizationService>;
    randomizationStore = TestBed.inject(RandomizationStore);
    usedQuestionListService = TestBed.inject(UsedQuestionListService) as jest.Mocked<UsedQuestionListService>;
    postponedQuestionListService = TestBed.inject(PostponedQuestionListService) as jest.Mocked<PostponedQuestionListService>;
    selectedCategoryListService = TestBed.inject(SelectedCategoryListService) as jest.Mocked<SelectedCategoryListService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const newCategory: Category = {
        id: '',
        name: 'New Category',
        userId: '',
      };
      const createdCategoryId = 'new-category-id';

      categoryRepositoryService.createCategory.mockResolvedValue(createdCategoryId);

      await service.createCategory(newCategory);

      expect(categoryListStore.startLoading).toHaveBeenCalled();
      expect(categoryRepositoryService.createCategory).toHaveBeenCalledWith(newCategory, mockUserId);
      expect(categoryListStore.addCategoryToList).toHaveBeenCalledWith({
        ...newCategory,
        id: createdCategoryId,
        userId: mockUserId,
      });
    });

    it('should not create category if userId is not available', async () => {
      userStore.uid.set(null);
      const newCategory: Category = {
        id: '',
        name: 'New Category',
        userId: '',
      };

      await service.createCategory(newCategory);

      expect(categoryRepositoryService.createCategory).not.toHaveBeenCalled();
      expect(categoryListStore.addCategoryToList).not.toHaveBeenCalled();
    });

    it('should handle errors during category creation', async () => {
      const newCategory: Category = {
        id: '',
        name: 'New Category',
        userId: '',
      };
      const errorMessage = 'Creation failed';

      categoryRepositoryService.createCategory.mockRejectedValue(new Error(errorMessage));

      await service.createCategory(newCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle errors without message during category creation', async () => {
      const newCategory: Category = {
        id: '',
        name: 'New Category',
        userId: '',
      };

      categoryRepositoryService.createCategory.mockRejectedValue({});

      await service.createCategory(newCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith('Category creation failed');
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: 'Updated Category',
        userId: mockUserId,
      };

      categoryRepositoryService.updateCategory.mockResolvedValue();

      await service.updateCategory(updatedCategory);

      expect(categoryListStore.startLoading).toHaveBeenCalled();
      expect(categoryListStore.updateCategoryInList).toHaveBeenCalledWith(mockCategoryId, {
        name: 'Updated Category',
      });
      expect(categoryRepositoryService.updateCategory).toHaveBeenCalledWith(mockCategoryId, {
        name: 'Updated Category',
      });
    });

    it('should handle errors during category update', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: 'Updated Category',
        userId: mockUserId,
      };
      const errorMessage = 'Update failed';

      categoryRepositoryService.updateCategory.mockRejectedValue(new Error(errorMessage));

      await service.updateCategory(updatedCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle errors without message during category update', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: 'Updated Category',
        userId: mockUserId,
      };

      categoryRepositoryService.updateCategory.mockRejectedValue({});

      await service.updateCategory(updatedCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith('Category update failed');
    });
  });

  describe('deleteCategory', () => {
    beforeEach(() => {
      randomizationStore.entity.set({ id: mockRandomizationId });
      categoryRepositoryService.deleteCategory.mockResolvedValue();
      questionListService.deleteCategoryIdFromQuestions.mockResolvedValue();
      selectedCategoryListService.deselectSelectedCategoryFromRandomization.mockResolvedValue();
      usedQuestionListService.resetUsedQuestionsCategoryId.mockResolvedValue();
      postponedQuestionListService.resetPostponedQuestionsCategoryId.mockResolvedValue();
    });

    it('should delete a category successfully', async () => {
      await service.deleteCategory(mockCategoryId);

      expect(categoryListStore.startLoading).toHaveBeenCalled();
      expect(categoryListStore.deleteCategoryFromList).toHaveBeenCalledWith(mockCategoryId);
      expect(randomizationStore.resetAvailableQuestionsCategoryId).toHaveBeenCalledWith(mockCategoryId);
      expect(categoryRepositoryService.deleteCategory).toHaveBeenCalledWith(mockCategoryId);
      expect(questionListService.deleteCategoryIdFromQuestions).toHaveBeenCalledWith(mockCategoryId);
      expect(selectedCategoryListService.deselectSelectedCategoryFromRandomization).toHaveBeenCalledWith(
        mockRandomizationId,
        mockCategoryId
      );
      expect(usedQuestionListService.resetUsedQuestionsCategoryId).toHaveBeenCalledWith(
        mockRandomizationId,
        mockCategoryId
      );
      expect(postponedQuestionListService.resetPostponedQuestionsCategoryId).toHaveBeenCalledWith(
        mockRandomizationId,
        mockCategoryId
      );
    });

    it('should clear current question if it belongs to deleted category', async () => {
      randomizationStore.entity.set({
        id: mockRandomizationId,
        currentQuestion: {
          id: 'question-123',
          categoryId: mockCategoryId,
        },
      });

      await service.deleteCategory(mockCategoryId);

      expect(randomizationService.clearCurrentQuestion).toHaveBeenCalledWith(mockRandomizationId);
    });

    it('should not clear current question if it belongs to different category', async () => {
      randomizationStore.entity.set({
        id: mockRandomizationId,
        currentQuestion: {
          id: 'question-123',
          categoryId: 'different-category-id',
        },
      });

      await service.deleteCategory(mockCategoryId);

      expect(randomizationService.clearCurrentQuestion).not.toHaveBeenCalled();
    });

    it('should not clear current question if no current question exists', async () => {
      randomizationStore.entity.set({
        id: mockRandomizationId,
        currentQuestion: null,
      });

      await service.deleteCategory(mockCategoryId);

      expect(randomizationService.clearCurrentQuestion).not.toHaveBeenCalled();
    });

    it('should not perform randomization-related cleanups if no randomization exists', async () => {
      randomizationStore.entity.set(null);

      await service.deleteCategory(mockCategoryId);

      expect(categoryRepositoryService.deleteCategory).toHaveBeenCalled();
      expect(selectedCategoryListService.deselectSelectedCategoryFromRandomization).not.toHaveBeenCalled();
      expect(usedQuestionListService.resetUsedQuestionsCategoryId).not.toHaveBeenCalled();
      expect(postponedQuestionListService.resetPostponedQuestionsCategoryId).not.toHaveBeenCalled();
    });

    it('should handle errors during category deletion', async () => {
      const errorMessage = 'Deletion failed';
      categoryRepositoryService.deleteCategory.mockRejectedValue(new Error(errorMessage));

      await service.deleteCategory(mockCategoryId);

      expect(categoryListStore.logError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle errors without message during category deletion', async () => {
      categoryRepositoryService.deleteCategory.mockRejectedValue({});

      await service.deleteCategory(mockCategoryId);

      expect(categoryListStore.logError).toHaveBeenCalledWith('Category deletion failed');
    });
  });

  describe('loadCategoryList', () => {
    it('should load categories successfully', async () => {
      const categories: Category[] = [
        { id: '1', name: 'Category 1', userId: mockUserId },
        { id: '2', name: 'Category 2', userId: mockUserId },
      ];

      categoryRepositoryService.getCategories.mockResolvedValue(categories);

      await service.loadCategoryList();

      expect(categoryListStore.startLoading).toHaveBeenCalled();
      expect(categoryRepositoryService.getCategories).toHaveBeenCalledWith(mockUserId);
      expect(categoryListStore.loadCategoryList).toHaveBeenCalledWith(categories);
    });

    it('should not load categories if already loaded and forceLoad is false', async () => {
      categoryListStore.entities.set({ '1': mockCategory });

      await service.loadCategoryList(false);

      expect(categoryRepositoryService.getCategories).not.toHaveBeenCalled();
    });

    it('should reload categories if forceLoad is true', async () => {
      categoryListStore.entities.set({ '1': mockCategory });
      const categories: Category[] = [
        { id: '1', name: 'Category 1', userId: mockUserId },
      ];

      categoryRepositoryService.getCategories.mockResolvedValue(categories);

      await service.loadCategoryList(true);

      expect(categoryRepositoryService.getCategories).toHaveBeenCalledWith(mockUserId);
      expect(categoryListStore.loadCategoryList).toHaveBeenCalledWith(categories);
    });

    it('should not load categories if userId is not available', async () => {
      userStore.uid.set(null);

      await service.loadCategoryList();

      expect(categoryRepositoryService.getCategories).not.toHaveBeenCalled();
    });

    it('should handle errors during category list loading', async () => {
      const errorMessage = 'Load failed';
      categoryRepositoryService.getCategories.mockRejectedValue(new Error(errorMessage));

      await service.loadCategoryList();

      expect(categoryListStore.logError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle errors without message during category list loading', async () => {
      categoryRepositoryService.getCategories.mockRejectedValue({});

      await service.loadCategoryList();

      expect(categoryListStore.logError).toHaveBeenCalledWith('Load category list failed');
    });
  });
});
