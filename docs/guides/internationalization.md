# Internationalization (i18n)

This document describes the internationalization setup and workflows for the Question Randomizer application using [Transloco](https://jsverse.github.io/transloco/).

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Translation Files](#translation-files)
- [Usage Patterns](#usage-patterns)
- [Language Switching](#language-switching)
- [Workflows](#workflows)
- [Best Practices](#best-practices)

## Overview

The application uses **@jsverse/transloco** (v8.1.0) for internationalization, providing:

- **Two supported languages**: English (`en`) and Polish (`pl`)
- **Default language**: English
- **Translation storage**: JSON files in `apps/question-randomizer/src/assets/i18n/`
- **Translation key management**: Automated extraction and validation via `@jsverse/transloco-keys-manager`
- **Runtime language switching**: Supported with localStorage persistence

## Configuration

### Transloco Configuration

**Location:** `apps/question-randomizer/src/app/app.config.ts:36-44`

```typescript
provideTransloco({
  config: {
    availableLangs: ['en', 'pl'],
    defaultLang: 'en',
    reRenderOnLangChange: true,
    prodMode: environment.production,
  },
  loader: TranslocoHttpLoader,
})
```

### Translation Loader

**Location:** `apps/question-randomizer/src/app/transloco-loader.ts`

The application uses a custom HTTP loader to fetch translation files dynamically:

```typescript
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
```

### Keys Manager Configuration

**Location:** `transloco.config.js` (root)

```javascript
module.exports = {
  rootTranslationsPath: 'apps/question-randomizer/src/assets/i18n/',
  langs: ['en', 'pl'],
  keysManager: {
    input: [
      'apps/**/*.ts',
      'apps/**/*.html',
      'libs/**/*.ts',
      'libs/**/*.html'
    ],
    output: [
      {
        path: 'apps/question-randomizer/src/assets/i18n',
        fileFormat: 'json'
      }
    ],
    marker: 'transloco',
    addMissingKeys: true,
    emitErrorOnExtraKeys: false,
    replace: false,
    removeExtraKeys: false,
    defaultValue: '{{key}}',
    unflat: true
  }
};
```

**Key settings:**

- `addMissingKeys: true` - Automatically adds new keys found in code to translation files
- `emitErrorOnExtraKeys: false` - Doesn't fail on unused keys in translation files
- `removeExtraKeys: false` - Keeps unused keys (manual cleanup required)
- `unflat: true` - Maintains nested JSON structure

## Translation Files

### File Locations

- English: `apps/question-randomizer/src/assets/i18n/en.json`
- Polish: `apps/question-randomizer/src/assets/i18n/pl.json`

### Translation Structure

Translation files are organized by domain with nested JSON structure:

```json
{
  "common": {
    "actions": { "save": "Save", "cancel": "Cancel", ... },
    "labels": { "yes": "Yes", "no": "No", ... },
    "validation": { "required": "This field is required", ... },
    "messages": { "confirmDelete": "Are you sure...", ... }
  },
  "app": {
    "title": "Question Randomizer",
    "description": "Interview preparation tool"
  },
  "auth": {
    "login": { "title": "Login", ... },
    "registration": { "title": "Registration", ... },
    "email": {
      "verify": { "title": "Please, confirm your email", ... },
      "verified": { ... },
      "notVerified": { ... }
    },
    "errors": { ... }
  },
  "dashboard": {
    "header": { ... },
    "navigation": { ... },
    "actions": { ... }
  },
  "question": { ... },
  "category": { ... },
  "randomization": { ... }
}
```

### Domain Organization

| Domain | Purpose | Example Keys |
|--------|---------|--------------|
| `common` | Shared UI elements, validation messages | `common.actions.save`, `common.validation.required` |
| `app` | Application-level metadata | `app.title`, `app.description` |
| `auth` | Authentication flows (login, registration, email verification) | `auth.login.title`, `auth.errors.invalidCredentials` |
| `dashboard` | Dashboard shell (header, navigation, actions) | `dashboard.navigation.questions`, `dashboard.header.title` |
| `question` | Question management domain | `question.dialog.addTitle`, `question.messages.createSuccess` |
| `category` | Category management domain | `category.table.columns.name`, `category.messages.deleteSuccess` |
| `randomization` | Question randomization interface | `randomization.progress.answered`, `randomization.question.title` |

## Usage Patterns

### Template Usage (Recommended)

Use the `transloco` pipe in Angular templates:

```html
<!-- Simple translation -->
<h1>{{ 'auth.login.title' | transloco }}</h1>

<!-- With binding -->
<lib-input-text
  [label]="'auth.login.emailLabel' | transloco"
  [placeholder]="'auth.login.emailPlaceholder' | transloco"
  formControlName="email"
></lib-input-text>

<!-- Dynamic key construction -->
<span>{{ 'dashboard.navigation.' + item.route | transloco }}</span>
```

**Import requirement:** Add `TranslocoModule` to component imports:

```typescript
@Component({
  selector: 'lib-login',
  imports: [TranslocoModule, /* other imports */],
  // ...
})
export class LoginComponent { }
```

### Programmatic Usage (TypeScript)

Inject `TranslocoService` for runtime translation access:

```typescript
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export class MyComponent {
  private translocoService = inject(TranslocoService);

  someMethod() {
    // Get current translation
    const translation = this.translocoService.translate('auth.login.title');

    // Get translation with parameters
    const message = this.translocoService.translate('common.messages.greeting', { name: 'John' });

    // Get active language
    const lang = this.translocoService.getActiveLang(); // 'en' or 'pl'

    // Set active language
    this.translocoService.setActiveLang('pl');

    // Subscribe to language changes
    this.translocoService.langChanges$.subscribe(lang => {
      console.log('Language changed to:', lang);
    });
  }
}
```

### Language Switching

**Implementation location:** `libs/question-randomizer/dashboard/shell/src/dashboard-shell.facade.ts:24-52`

The application provides language switching functionality with localStorage persistence:

```typescript
export class DashboardShellFacade {
  private readonly translocoService = inject(TranslocoService);

  // Signal for tracking current language
  public currentLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  constructor() {
    // Load saved language preference on initialization
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pl')) {
      this.translocoService.setActiveLang(savedLanguage);
    }
  }

  public changeLanguage(language: string) {
    let langCode: string;
    if (language === 'english') {
      langCode = 'en';
    } else if (language === 'polish') {
      langCode = 'pl';
    } else {
      return; // Invalid value - ignore
    }
    this.translocoService.setActiveLang(langCode);
    localStorage.setItem('language', langCode);
  }
}
```

**UI Implementation:** `libs/question-randomizer/dashboard/shared/ui/src/lib/sidebar/dashboard-sidebar.component.html:3-10`

```html
<lib-button-toggle-group
  [value]="languageToggleValue()"
  [allowDeselect]="false"
  (toggled)="changeLanguage.emit($event ?? '')"
>
  <lib-button-toggle value="english">{{ 'dashboard.header.languages.english' | transloco }}</lib-button-toggle>
  <lib-button-toggle value="polish">{{ 'dashboard.header.languages.polish' | transloco }}</lib-button-toggle>
</lib-button-toggle-group>
```

**Behavior:**

- Language preference persists across sessions (localStorage)
- Page re-renders on language change (`reRenderOnLangChange: true`)
- Language loaded from localStorage on app initialization

## Workflows

### Adding New Translation Keys

#### Option 1: Manual Addition

1. Add translation keys to both `en.json` and `pl.json`:

```json
// en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}

// pl.json
{
  "myFeature": {
    "title": "Moja funkcja",
    "description": "Opis funkcji"
  }
}
```

2. Use the key in your template or TypeScript code:

```html
<h1>{{ 'myFeature.title' | transloco }}</h1>
```

#### Option 2: Automated Extraction

1. Add translation keys to your code using the configured marker:

```html
<!-- Use keys in templates -->
<h1>{{ 'myFeature.newKey' | transloco }}</h1>
```

2. Run the extraction command:

```bash
npm run i18n:extract
```

3. The keys manager will automatically add missing keys to both translation files with placeholder values (`{{key}}`):

```json
{
  "myFeature": {
    "newKey": "myFeature.newKey"
  }
}
```

4. Update the placeholder values with actual translations in both language files.

### Finding Translation Key Usage

To find where a specific translation key is used:

```bash
npm run i18n:find
```

This scans the codebase and reports translation key usage across all TypeScript and HTML files.

### Validating Translation Files

Before committing changes, ensure:

1. **Both language files have the same keys:**
   ```bash
   npm run i18n:extract
   ```

2. **No placeholder values remain** - Search for `"{{` in both files:
   ```bash
   # On Windows
   findstr "{{" apps\question-randomizer\src\assets\i18n\*.json

   # On Unix/Mac
   grep "{{" apps/question-randomizer/src/assets/i18n/*.json
   ```

3. **JSON is valid** - Run linting:
   ```bash
   npm run lint
   ```

## Best Practices

### Key Naming Conventions

1. **Use nested structure** - Organize by domain and feature:
   ```
   domain.feature.element
   ```
   Examples: `auth.login.title`, `question.dialog.addTitle`

2. **Use descriptive names** - Key names should indicate purpose:
   ```
   ✅ auth.errors.invalidCredentials
   ❌ auth.error1
   ```

3. **Group related keys** - Keep related translations together:
   ```json
   {
     "question": {
       "dialog": {
         "addTitle": "Add Question",
         "editTitle": "Edit Question",
         "submitButton": "Save",
         "cancelButton": "Cancel"
       }
     }
   }
   ```

4. **Use common keys** - Leverage the `common` domain for shared UI elements:
   ```
   common.actions.save
   common.validation.required
   common.messages.operationSuccess
   ```

### Translation Quality

1. **Maintain consistency** - Use the same terminology across translations
2. **Avoid hard-coded strings** - All user-facing text should be translatable
3. **Context matters** - Provide enough context in key structure:
   ```
   ✅ question.messages.deleteSuccess
   ❌ messages.success
   ```

4. **Test both languages** - Always verify translations in both English and Polish

### Performance Considerations

1. **Lazy loading** - Translation files are loaded on-demand via HTTP
2. **Caching** - Once loaded, translations are cached in memory
3. **Bundle size** - Translation files are NOT bundled with the application (loaded separately)

### Common Pitfalls

1. **Missing TranslocoModule import** - Components using the `transloco` pipe must import `TranslocoModule`

2. **Hardcoded strings in templates** - Always use translation keys:
   ```html
   ❌ <button>Save</button>
   ✅ <button>{{ 'common.actions.save' | transloco }}</button>
   ```

3. **Inconsistent key structure** - Follow the established domain-based organization

4. **Forgetting to translate** - After adding English keys, always add Polish translations

5. **Using wrong language codes** - Use `'en'` and `'pl'`, not `'english'` or `'polish'` (except in UI toggles)

## Adding a New Language

To add support for a new language (e.g., Spanish):

1. **Update Transloco config** (`app.config.ts`):
   ```typescript
   availableLangs: ['en', 'pl', 'es'],
   ```

2. **Update keys manager config** (`transloco.config.js`):
   ```javascript
   langs: ['en', 'pl', 'es'],
   ```

3. **Create translation file**:
   ```
   apps/question-randomizer/src/assets/i18n/es.json
   ```

4. **Copy structure from `en.json`** and translate all values

5. **Update language switcher UI** in `dashboard-sidebar.component.html`

6. **Update language switcher logic** in `dashboard-shell.facade.ts`:
   ```typescript
   if (savedLanguage && ['en', 'pl', 'es'].includes(savedLanguage)) {
     this.translocoService.setActiveLang(savedLanguage);
   }
   ```

## References

- **Transloco Documentation:** https://jsverse.github.io/transloco/
- **Keys Manager Documentation:** https://jsverse.github.io/transloco/docs/tools/keys-manager
- **Translation Files:** `apps/question-randomizer/src/assets/i18n/`
- **Configuration:** `transloco.config.js`, `app.config.ts`
