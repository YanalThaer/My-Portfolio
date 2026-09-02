import { Routes } from '@angular/router';
import { Contact } from './pages/contact/contact';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { Projects } from './pages/projects/projects';
import { Resume } from './pages/resume/resume';
import { Services } from './pages/services/services';

export const routes: Routes = [
  { path: '', component: Home, title: 'Yanal Al-hasan | Software Engineer' },
  { path: 'work', component: Services, title: 'Work | Yanal Al-hasan' },
  { path: 'resume', component: Resume, title: 'Resume | Yanal Al-hasan' },
  { path: 'projects', component: Projects, title: 'Projects | Yanal Al-hasan' },
  { path: 'contact', component: Contact, title: 'Contact | Yanal Al-hasan' },
  { path: '**', component: NotFound, title: 'Page not found | Yanal Al-hasan' },
];
