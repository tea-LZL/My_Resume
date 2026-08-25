import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./component/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./component/projects/projects.component').then(
        (mod) => mod.ProjectsComponent,
      ),
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('./component/timeline/timeline.component').then(
        (mod) => mod.TimelineComponent,
      ),
  },
  {
    path: 'resume',
    loadComponent: () =>
      import('./component/resume/resume.component').then(
        (mod) => mod.ResumeComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
