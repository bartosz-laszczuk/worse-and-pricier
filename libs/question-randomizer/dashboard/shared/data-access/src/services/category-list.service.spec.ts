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

describe('CategoryListService', () => {
  let service: CategoryListService;
  let categoryRepositoryService: jest.Mocked<CategoryRepositoryService>;
  let categoryListStore: any;
  let userStore: any;
  let questionListService: jest.Mocked<QuestionListService>;
  let randomizationService: jest.Mocked<RandomizationService>;
  let randomizationStore: any;
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

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockUserId)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('New Category')
      );
    });

    it('should handle errors without message during category creation', async () => {
      const newCategory: Category = {
        id: '',
        name: 'New Category',
        userId: '',
      };

      categoryRepositoryService.createCategory.mockRejectedValue({});

      await service.createCategory(newCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('Category creation failed')
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockUserId)
      );
    });

    it('should reject empty category names during creation', async () => {
      const newCategory: Category = {
        id: '',
        name: '',
        userId: '',
      };

      await service.createCategory(newCategory);

      expect(categoryRepositoryService.createCategory).not.toHaveBeenCalled();
      expect(categoryListStore.addCategoryToList).not.toHaveBeenCalled();
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        'Category name is required and must be between 1 and 100 characters'
      );
    });

    it('should reject category names with only whitespace during creation', async () => {
      const newCategory: Category = {
        id: '',
        name: '   ',
        userId: '',
      };

      await service.createCategory(newCategory);

      expect(categoryRepositoryService.createCategory).not.toHaveBeenCalled();
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        'Category name is required and must be between 1 and 100 characters'
      );
    });

    it('should reject category names longer than 100 characters during creation', async () => {
      const newCategory: Category = {
        id: '',
        name: 'a'.repeat(101),
        userId: '',
      };

      await service.createCategory(newCategory);

      expect(categoryRepositoryService.createCategory).not.toHaveBeenCalled();
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        'Category name is required and must be between 1 and 100 characters'
      );
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
      expect(categoryRepositoryService.updateCategory).toHaveBeenCalledWith(mockCategoryId, {
        name: 'Updated Category',
      });
      expect(categoryListStore.updateCategoryInList).toHaveBeenCalledWith(mockCategoryId, {
        name: 'Updated Category',
      });

      // Verify Firestore update happens before store update (pessimistic pattern)
      const repositoryCallOrder = categoryRepositoryService.updateCategory.mock.invocationCallOrder[0];
      const storeCallOrder = categoryListStore.updateCategoryInList.mock.invocationCallOrder[0];
      expect(repositoryCallOrder).toBeLessThan(storeCallOrder);
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

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockCategoryId)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('Updated Category')
      );
    });

    it('should handle errors without message during category update', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: 'Updated Category',
        userId: mockUserId,
      };

      categoryRepositoryService.updateCategory.mockRejectedValue({});

      await service.updateCategory(updatedCategory);

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('Category update failed')
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockCategoryId)
      );
    });

    it('should not update local store when Firestore update fails (pessimistic pattern)', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: 'Updated Category',
        userId: mockUserId,
      };

      categoryRepositoryService.updateCategory.mockRejectedValue(new Error('Update failed'));

      await service.updateCategory(updatedCategory);

      expect(categoryListStore.updateCategoryInList).not.toHaveBeenCalled();
      expect(categoryListStore.logError).toHaveBeenCalled();
    });

    it('should reject invalid category names during update', async () => {
      const updatedCategory: Category = {
        id: mockCategoryId,
        name: '',
        userId: mockUserId,
      };

      await service.updateCategory(updatedCategory);

      expect(categoryRepositoryService.updateCategory).not.toHaveBeenCalled();
      expect(categoryListStore.updateCategoryInList).not.toHaveBeenCalled();
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        'Category name is required and must be between 1 and 100 characters'
      );
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
        currentQuestion: undefined,
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

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockCategoryId)
      );
    });

    it('should handle errors without message during category deletion', async () => {
      categoryRepositoryService.deleteCategory.mockRejectedValue({});

      await service.deleteCategory(mockCategoryId);

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('Category deletion failed')
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockCategoryId)
      );
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

    it('should not load categories if already loaded and skipCache is false', async () => {
      categoryListStore.entities.set({ '1': mockCategory });

      await service.loadCategoryList(false);

      expect(categoryRepositoryService.getCategories).not.toHaveBeenCalled();
    });

    it('should reload categories if skipCache is true', async () => {
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

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockUserId)
      );
    });

    it('should handle errors without message during category list loading', async () => {
      categoryRepositoryService.getCategories.mockRejectedValue({});

      await service.loadCategoryList();

      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining('Load category list failed')
      );
      expect(categoryListStore.logError).toHaveBeenCalledWith(
        expect.stringContaining(mockUserId)
      );
    });
  });

  describe('Error Context Information', () => {
    it('should include userId and category name in createCategory error context', async () => {
      const newCategory: Category = {
        id: '',
        name: 'Test Category Name',
        userId: '',
      };
      categoryRepositoryService.createCategory.mockRejectedValue(new Error('Network error'));

      await service.createCategory(newCategory);

      const errorCall = categoryListStore.logError.mock.calls[0][0];
      expect(errorCall).toContain('Network error');
      expect(errorCall).toContain(mockUserId);
      expect(errorCall).toContain('Test Category Name');
    });

    it('should include categoryId and name in updateCategory error context', async () => {
      const updatedCategory: Category = {
        id: 'test-cat-id',
        name: 'Updated Name',
        userId: mockUserId,
      };
      categoryRepositoryService.updateCategory.mockRejectedValue(new Error('Update error'));

      await service.updateCategory(updatedCategory);

      const errorCall = categoryListStore.logError.mock.calls[0][0];
      expect(errorCall).toContain('Update error');
      expect(errorCall).toContain('test-cat-id');
      expect(errorCall).toContain('Updated Name');
    });

    it('should include categoryId in deleteCategory error context', async () => {
      categoryRepositoryService.deleteCategory.mockRejectedValue(new Error('Delete error'));

      await service.deleteCategory(mockCategoryId);

      const errorCall = categoryListStore.logError.mock.calls[0][0];
      expect(errorCall).toContain('Delete error');
      expect(errorCall).toContain(mockCategoryId);
    });

    it('should include userId in loadCategoryList error context', async () => {
      categoryRepositoryService.getCategories.mockRejectedValue(new Error('Fetch error'));

      await service.loadCategoryList();

      const errorCall = categoryListStore.logError.mock.calls[0][0];
      expect(errorCall).toContain('Fetch error');
      expect(errorCall).toContain(mockUserId);
    });
  });

  describe('Edge Cases and Additional Scenarios', () => {
    describe('Network and Timeout Errors', () => {
      it('should handle network timeout during category creation', async () => {
        const newCategory: Category = {
          id: '',
          name: 'New Category',
          userId: '',
        };
        const timeoutError = new Error('Request timeout');
        categoryRepositoryService.createCategory.mockRejectedValue(timeoutError);

        await service.createCategory(newCategory);

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Request timeout')
        );
      });

      it('should handle network errors during category list loading', async () => {
        const networkError = new Error('Network connection failed');
        categoryRepositoryService.getCategories.mockRejectedValue(networkError);

        await service.loadCategoryList();

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Network connection failed')
        );
      });
    });

    describe('Firestore Permission Errors', () => {
      it('should handle permission denied errors during category creation', async () => {
        const newCategory: Category = {
          id: '',
          name: 'New Category',
          userId: '',
        };
        const permissionError = new Error('Permission denied');
        categoryRepositoryService.createCategory.mockRejectedValue(permissionError);

        await service.createCategory(newCategory);

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Permission denied')
        );
      });

      it('should handle permission errors during category deletion', async () => {
        randomizationStore.entity.set({ id: mockRandomizationId });
        const permissionError = new Error('Insufficient permissions');
        categoryRepositoryService.deleteCategory.mockRejectedValue(permissionError);

        await service.deleteCategory(mockCategoryId);

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Insufficient permissions')
        );
      });
    });

    describe('Partial Failure Scenarios', () => {
      it('should log error if questionListService fails during deletion', async () => {
        randomizationStore.entity.set({ id: mockRandomizationId });
        categoryRepositoryService.deleteCategory.mockResolvedValue();
        questionListService.deleteCategoryIdFromQuestions.mockRejectedValue(
          new Error('Failed to update questions')
        );

        await service.deleteCategory(mockCategoryId);

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to update questions')
        );
      });

      it('should log error if selectedCategoryListService fails during deletion', async () => {
        randomizationStore.entity.set({ id: mockRandomizationId });
        categoryRepositoryService.deleteCategory.mockResolvedValue();
        questionListService.deleteCategoryIdFromQuestions.mockResolvedValue();
        selectedCategoryListService.deselectSelectedCategoryFromRandomization.mockRejectedValue(
          new Error('Failed to deselect category')
        );

        await service.deleteCategory(mockCategoryId);

        expect(categoryListStore.logError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to deselect category')
        );
      });
    });

    describe('Empty and Invalid Data', () => {
      it('should reject empty category name during creation (validation)', async () => {
        const newCategory: Category = {
          id: '',
          name: '',
          userId: '',
        };

        await service.createCategory(newCategory);

        expect(categoryRepositoryService.createCategory).not.toHaveBeenCalled();
        expect(categoryListStore.addCategoryToList).not.toHaveBeenCalled();
        expect(categoryListStore.logError).toHaveBeenCalledWith(
          'Category name is required and must be between 1 and 100 characters'
        );
      });

      it('should handle empty categories array during load', async () => {
        categoryRepositoryService.getCategories.mockResolvedValue([]);

        await service.loadCategoryList();

        expect(categoryListStore.loadCategoryList).toHaveBeenCalledWith([]);
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle multiple simultaneous category creations', async () => {
        const category1: Category = { id: '', name: 'Cat1', userId: '' };
        const category2: Category = { id: '', name: 'Cat2', userId: '' };
        categoryRepositoryService.createCategory
          .mockResolvedValueOnce('id1')
          .mockResolvedValueOnce('id2');

        await Promise.all([
          service.createCategory(category1),
          service.createCategory(category2)
        ]);

        expect(categoryListStore.addCategoryToList).toHaveBeenCalledTimes(2);
      });

      it('should handle simultaneous load and create operations', async () => {
        const newCategory: Category = { id: '', name: 'New Cat', userId: '' };
        categoryRepositoryService.getCategories.mockResolvedValue([mockCategory]);
        categoryRepositoryService.createCategory.mockResolvedValue('new-id');

        await Promise.all([
          service.loadCategoryList(),
          service.createCategory(newCategory)
        ]);

        expect(categoryListStore.loadCategoryList).toHaveBeenCalled();
        expect(categoryListStore.addCategoryToList).toHaveBeenCalled();
      });
    });

    describe('State Consistency', () => {
      it('should maintain store state consistency when creation fails', async () => {
        const newCategory: Category = { id: '', name: 'New Category', userId: '' };
        categoryRepositoryService.createCategory.mockRejectedValue(new Error('Creation failed'));

        await service.createCategory(newCategory);

        expect(categoryListStore.startLoading).toHaveBeenCalled();
        expect(categoryListStore.addCategoryToList).not.toHaveBeenCalled();
        expect(categoryListStore.logError).toHaveBeenCalled();
      });

      it('should handle deletion when all cleanup operations complete successfully', async () => {
        randomizationStore.entity.set({
          id: mockRandomizationId,
          currentQuestion: { id: 'q1', categoryId: mockCategoryId }
        });
        categoryRepositoryService.deleteCategory.mockResolvedValue();
        questionListService.deleteCategoryIdFromQuestions.mockResolvedValue();
        selectedCategoryListService.deselectSelectedCategoryFromRandomization.mockResolvedValue();
        usedQuestionListService.resetUsedQuestionsCategoryId.mockResolvedValue();
        postponedQuestionListService.resetPostponedQuestionsCategoryId.mockResolvedValue();

        await service.deleteCategory(mockCategoryId);

        expect(categoryListStore.deleteCategoryFromList).toHaveBeenCalledWith(mockCategoryId);
        expect(randomizationStore.resetAvailableQuestionsCategoryId).toHaveBeenCalledWith(mockCategoryId);
        expect(categoryRepositoryService.deleteCategory).toHaveBeenCalled();
        expect(questionListService.deleteCategoryIdFromQuestions).toHaveBeenCalled();
        expect(selectedCategoryListService.deselectSelectedCategoryFromRandomization).toHaveBeenCalled();
        expect(usedQuestionListService.resetUsedQuestionsCategoryId).toHaveBeenCalled();
        expect(postponedQuestionListService.resetPostponedQuestionsCategoryId).toHaveBeenCalled();
        expect(randomizationService.clearCurrentQuestion).toHaveBeenCalledWith(mockRandomizationId);
      });
    });
  });
});
