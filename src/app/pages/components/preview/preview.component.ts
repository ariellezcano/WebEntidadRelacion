import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';
import { DiagramService } from 'src/app/services/diagram.service';
import { StateService } from 'src/app/services/state.service';
import mermaid from 'mermaid';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, AfterViewChecked {

  entidades: Entidad[] = [];
  relaciones: Relacion[] = [];
  sqlScript: string = '';
  mermaidCode: string = '';
  private mermaidInitialized = false;

  constructor(
    private diagramService: DiagramService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#e8e8ff',
        primaryBorderColor: '#4a90e2',
        primaryTextColor: '#1a1a1a',
        lineColor: '#4a90e2',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }
    });
    this.mermaidInitialized = true;

    this.stateService.entidades$.subscribe(e => {
      this.entidades = e;
      this.generarMermaid();
    });
    this.stateService.relaciones$.subscribe(r => {
      this.relaciones = r;
      this.generarMermaid();
    });
  }

  ngAfterViewChecked() {
    if (this.mermaidInitialized && this.mermaidCode) {
      mermaid.contentLoaded();
    }
  }

  actualizarEntidades(entidades: Entidad[]) {
    this.entidades = entidades;
    this.generarMermaid();
  }

  actualizarRelaciones(relaciones: Relacion[]) {
    this.relaciones = relaciones;
    this.generarMermaid();
  }

  generarSql() {
    this.diagramService.generarSql(this.entidades, this.relaciones)
      .subscribe(res => this.sqlScript = res);
  }

  ejecutarSql() {
    this.diagramService.ejecutarSql(this.entidades, this.relaciones)
      .subscribe(res => {
        alert('SQL ejecutado en SQL Server');
        this.sqlScript = res.script;
      });
  }

  generarMermaid() {
    let mermaidText = 'erDiagram\n';
    for (let entidad of this.entidades) {
      mermaidText += `  ${entidad.nombre} {\n`;
      for (let attr of entidad.atributos) {
        mermaidText += `    ${attr.tipo} ${attr.nombre}\n`;
      }
      mermaidText += `  }\n`;
    }
    for (let rel of this.relaciones) {
      // Para el estilo que querés, usamos cardinalidad tipo ||--o{ o similar
      mermaidText += `  ${rel.origen} ${rel.cardinalidad} ${rel.destino} : ${rel.etiqueta}\n`;
    }
    this.mermaidCode = mermaidText;
  }
}
