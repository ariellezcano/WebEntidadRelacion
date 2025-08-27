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

  // 👇 Estado del modal
  mostrarModal: boolean = false;

  constructor(
    private diagramService: DiagramService,
    private stateService: StateService,
    private sanitizer: DomSanitizer // 👈 inyectamos sanitizer
  ) {}

  ngOnInit() {
    mermaid.initialize({
      startOnLoad: false,
      //theme: 'base'
      theme: 'neutral'

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

  abrirModal() {
    this.mostrarModal = true;
    this.mermaidInitialized = true; // fuerza render
  }

  cerrarModal() {
    this.mostrarModal = false;
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

exportarDrawio() {
  // Estructura mínima de un archivo .drawio (XML con mxGraphModel)
  let xml = `
  <mxfile host="app.diagrams.net">
    <diagram name="ER Diagram">
      <mxGraphModel>
        <root>
          <mxCell id="0"/>
          <mxCell id="1" parent="0"/>
  `;

  // Agregar entidades como rectángulos
  let idCounter = 2;
  for (let entidad of this.entidades) {
    xml += `
      <mxCell id="${idCounter}" value="${entidad.nombre}" style="shape=rectangle;whiteSpace=wrap;html=1;" vertex="1" parent="1">
        <mxGeometry x="${idCounter * 50}" y="50" width="120" height="60" as="geometry"/>
      </mxCell>
    `;
    idCounter++;
  }

  // Agregar relaciones como elipses
  for (let rel of this.relaciones) {
    xml += `
      <mxCell id="${idCounter}" value="${rel.etiqueta}" style="shape=ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
        <mxGeometry x="${idCounter * 50}" y="200" width="100" height="40" as="geometry"/>
      </mxCell>
    `;
    idCounter++;
  }

  xml += `
        </root>
      </mxGraphModel>
    </diagram>
  </mxfile>
  `;

  // Descargar archivo
  const blob = new Blob([xml], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'er-diagram.drawio';
  link.click();
}


}
