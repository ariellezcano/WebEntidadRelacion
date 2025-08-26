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
    // Inicializar Mermaid
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
    this.mermaidInitialized = true;

    // Suscribirse al estado global
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
      // Renderiza todos los div.mermaid en la página
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
      mermaidText += `  ${rel.origen} ${rel.cardinalidad} ${rel.destino} : ${rel.etiqueta}\n`;
    }
    this.mermaidCode = mermaidText;
  }
}
