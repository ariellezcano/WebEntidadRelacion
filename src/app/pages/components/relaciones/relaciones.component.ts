import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';

@Component({
  selector: 'app-relaciones',
  templateUrl: './relaciones.component.html'
})
export class RelacionesComponent {
  @Input() entidades: Entidad[] = [];            // Recibe entidades del componente padre
  @Output() relacionesChange = new EventEmitter<Relacion[]>();  // Envía cambios al padre

  relaciones: Relacion[] = [];

  nuevaRelacion: Relacion = {
    origen: '',
    destino: '',
    cardinalidad: '||--o{',
    etiqueta: ''
  };

  agregarRelacion() {
    if (!this.nuevaRelacion.origen || !this.nuevaRelacion.destino) return;
    this.relaciones.push({ ...this.nuevaRelacion });
    this.relacionesChange.emit(this.relaciones);  // Emitir array actualizado
    this.nuevaRelacion = { origen: '', destino: '', cardinalidad: '||--o{', etiqueta: '' };
  }
}
