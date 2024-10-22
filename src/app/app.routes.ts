import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';

export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
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
