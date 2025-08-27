import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';
import { DiagramService } from 'src/app/services/diagram.service';
import { StateService } from 'src/app/services/state.service';
import mermaid from 'mermaid';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, AfterViewChecked {

  entidades: Entidad[] = [];
  relaciones: Relacion[] = [];
  sqlScript: string = '';
  //mermaidCode: string = '';
  mermaidCode: SafeHtml = ''; // 👈 ahora es SafeHtml
  private mermaidInitialized = false;

  constructor(
    private diagramService: DiagramService,
    private stateService: StateService,
    private sanitizer: DomSanitizer // 👈 inyectamos sanitizer
  ) {}

  ngOnInit() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base'
    });

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
      mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      this.mermaidInitialized = false;
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

    // 👇 Sanitizamos el código para Angular
    this.mermaidCode = this.sanitizer.bypassSecurityTrustHtml(mermaidText);
    this.mermaidInitialized = true;
  }

}
