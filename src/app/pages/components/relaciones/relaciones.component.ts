import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-relaciones',
  templateUrl: './relaciones.component.html',
  styleUrls: ['./relaciones.component.scss']
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


  eliminarRelacion(index: number) {
  Swal.fire({
    title: '¿Eliminar relación?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.relaciones.splice(index, 1);
      this.relacionesChange.emit(this.relaciones); // 🔹 Emitir cambios
      Swal.fire('Eliminada', 'La relación fue eliminada', 'success');
    }
  });
}

}
