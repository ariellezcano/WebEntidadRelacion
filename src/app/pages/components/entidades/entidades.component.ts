import { Component, Output, EventEmitter } from '@angular/core';
import { Atributo, Entidad } from 'src/app/models/index.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entidades',
  templateUrl: './entidades.component.html',
  styleUrls: ['./entidades.component.scss'],
})
export class EntidadesComponent {
  entidades: Entidad[] = [];
  nuevaEntidad: Entidad = { nombre: '', atributos: [] };
  nuevoAtributo: Atributo = {
    nombre: '',
    tipo: 'VARCHAR(10)',
    clavePrimaria: false,
    claveForanea: false,
    nulo: true,
  };

  @Output() entidadesChange = new EventEmitter<Entidad[]>();

  // Tipos de datos más utilizados en SQL Server
  tiposDatos: string[] = [
    // Numéricos
    'INT',
    'BIGINT',
    'SMALLINT',
    'DECIMAL(18,2)',
    'NUMERIC(18,2)',
    'FLOAT',
    'REAL',
    // Texto
    'VARCHAR(25)',
    'VARCHAR(35)',
    'VARCHAR(50)',
    'VARCHAR(100)',
    'VARCHAR(255)',
    'CHAR(1)',
    'CHAR(10)',
    'TEXT',
    // Fechas y horas
    'DATE',
    'DATETIME',
    'DATETIME2',
    'SMALLDATETIME',
    'TIME',
    // Booleano
    'BIT',
  ];

  agregarEntidad() {
    if (!this.nuevaEntidad.nombre.trim()) return;
    this.entidades.push({ ...this.nuevaEntidad, atributos: [] });
    this.nuevaEntidad = { nombre: '', atributos: [] };
    this.entidadesChange.emit(this.entidades);
  }

  agregarAtributo(entidad: Entidad) {
    if (!this.nuevoAtributo.nombre.trim()) return;
    entidad.atributos.push({ ...this.nuevoAtributo });
    this.nuevoAtributo = {
      nombre: '',
      tipo: 'VARCHAR(10)',
      clavePrimaria: false,
      claveForanea: false,
      nulo: true,
    };
    this.entidadesChange.emit(this.entidades);
  }

  // eliminarAtributo(entidad: any, attr: any) {
  //   entidad.atributos = entidad.atributos.filter((a: any) => a !== attr);
  // }

  // eliminarEntidad(entidad: any) {
  //   this.entidades = this.entidades.filter((e: any) => e !== entidad);
  // }

  eliminarEntidad(entidad: any) {
    Swal.fire({
      title: '¿Eliminar entidad?',
      text: `Se eliminará la entidad "${entidad.nombre}" y todos sus atributos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.entidades = this.entidades.filter((e: any) => e !== entidad);
        this.entidadesChange.emit(this.entidades);
        Swal.fire('Eliminada', 'La entidad ha sido eliminada.', 'success');
      }
    });
  }

  eliminarAtributo(entidad: any, attr: any) {
    Swal.fire({
      title: '¿Eliminar atributo?',
      text: `Se eliminará el atributo "${attr.nombre}" de la entidad "${entidad.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        entidad.atributos = entidad.atributos.filter((a: any) => a !== attr);
        this.entidadesChange.emit(this.entidades); // 🔹 Emitir cambios al padre
        Swal.fire('Eliminado', 'El atributo ha sido eliminado.', 'success');
      }
    });
  }
}
