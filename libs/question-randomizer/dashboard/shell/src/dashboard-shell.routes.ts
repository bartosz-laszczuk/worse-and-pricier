import { Route } from '@angular/router';
import { AuthVerifiedCanActivate } from '@worse-and-pricier/question-randomizer-shared-data-access';
import { DashboardShellComponent } from './dashboard-shell.component';

export const dashboardShellRoutes: Route[] = [
  {
    path: '',
    component: DashboardShellComponent,
    canActivate: [AuthVerifiedCanActivate],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'randomization',
      },
      {
        path: 'questions',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-question-feature'
          ).then((r) => r.QuestionListComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-category-feature'
          ).then((r) => r.CategoryListComponent),
      },
      {
        path: 'qualifications',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-qualification-feature'
          ).then((r) => r.QualificationListComponent),
      },
      {
        path: 'interview',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-interview-shell'
          ).then((r) => r.InterviewShellComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-settings-shell'
          ).then((r) => r.SettingsShellComponent),
      },
      {
        path: 'randomization',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-randomization-shell'
          ).then((r) => r.RandomizationShellComponent),
      },
      {
        path: 'ai-chat',
        loadComponent: () =>
          import(
            '@worse-and-pricier/question-randomizer-dashboard-ai-chat-shell'
          ).then((r) => r.AiChatShellComponent),
      },
      // {
      //   path: 'static',
      //   loadChildren: () =>
      //     import('../static/static.module').then((m) => m.StaticModule),
      // },
    ],
  },
];
