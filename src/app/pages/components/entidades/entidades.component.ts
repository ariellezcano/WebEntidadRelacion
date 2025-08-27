import { Component, Output, EventEmitter } from '@angular/core';
import { Atributo, Entidad } from 'src/app/models/index.models';

@Component({
  selector: 'app-entidades',
  templateUrl: './entidades.component.html',
  styleUrls: ['./entidades.component.scss']
})
export class EntidadesComponent {
  entidades: Entidad[] = [];
  nuevaEntidad: Entidad = { nombre: '', atributos: [] };
  nuevoAtributo: Atributo = { nombre: '', tipo: 'VARCHAR(100)', clavePrimaria: false, claveForanea: false, nulo: true };

// Tipos de datos más utilizados en SQL Server
tiposDatos: string[] = [
  // Numéricos
  'INT', 'BIGINT', 'SMALLINT', 'DECIMAL(18,2)', 'NUMERIC(18,2)', 'FLOAT', 'REAL',
  // Texto
  'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)', 'CHAR(1)', 'CHAR(10)', 'TEXT',
  // Fechas y horas
  'DATE', 'DATETIME', 'DATETIME2', 'SMALLDATETIME', 'TIME',
  // Booleano
  'BIT'
];

  @Output() entidadesChange = new EventEmitter<Entidad[]>();

  agregarEntidad() {
    if (!this.nuevaEntidad.nombre.trim()) return;
    this.entidades.push({ ...this.nuevaEntidad, atributos: [] });
    this.nuevaEntidad = { nombre: '', atributos: [] };
    this.entidadesChange.emit(this.entidades);
  }

  agregarAtributo(entidad: Entidad) {
    if (!this.nuevoAtributo.nombre.trim()) return;
    entidad.atributos.push({ ...this.nuevoAtributo });
    this.nuevoAtributo = { nombre: '', tipo: 'VARCHAR(100)', clavePrimaria: false, claveForanea: false, nulo: true };
    this.entidadesChange.emit(this.entidades);
  }
}

