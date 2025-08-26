import { NgModule } from '@angular/core';
import { PreviewComponent } from './pages/components/preview/preview.component';
import { EntidadesComponent } from './pages/components/entidades/entidades.component';
import { RelacionesComponent } from './pages/components/relaciones/relaciones.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: PreviewComponent },
  { path: 'entidades', component: EntidadesComponent },
  { path: 'relaciones', component: RelacionesComponent },
  { path: '**', redirectTo: '' } // Redirige cualquier ruta desconocida a la principal
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
