import { Routes } from '@angular/router';
// import { HomeComponent } from './component/home/home.component';

export const routes: Routes = [
    // {
    //     path:'',
    //     component:HomeComponent
    // },
    {
        path: '',
        loadComponent: () => import('./component/home/home.component').then(mod => mod.HomeComponent)
    },
    {
        path: 'projects',
        loadComponent: () => import('./component/projects/projects.component').then(mod => mod.ProjectsComponent)
    },
    {
        path: 'timeline',
        loadComponent: ()=> import('./component/timeline/timeline.component').then(mod => mod.TimelineComponent)
    },
    {
        path: 'files',
        loadComponent: ()=> import('./component/file/file.component').then(mod => mod.FileComponent)
    }
];
