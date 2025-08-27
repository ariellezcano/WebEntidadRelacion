import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';
import { DiagramService } from 'src/app/services/diagram.service';
import { StateService } from 'src/app/services/state.service';
import mermaid from 'mermaid';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, AfterViewChecked {
  entidades: Entidad[] = [];
  relaciones: Relacion[] = [];
  sqlScript: string = '';

  mermaidCode: string = '';
  mermaidHtml: SafeHtml = '';
  private mermaidInitialized = false;

  // Estado del modal
  mostrarModal: boolean = false;

  constructor(
    private diagramService: DiagramService,
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
    });

    this.stateService.entidades$.subscribe((e) => {
      this.entidades = e;
      this.generarMermaid();
    });

    this.stateService.relaciones$.subscribe((r) => {
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

  abrirModal() {
    this.mostrarModal = true;
    this.mermaidInitialized = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
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
    this.diagramService
      .generarSql(this.entidades, this.relaciones)
      .subscribe((res) => (this.sqlScript = res));
  }

  ejecutarSql() {
    this.diagramService
      .ejecutarSql(this.entidades, this.relaciones)
      .subscribe((res) => {
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
    this.mermaidHtml = this.sanitizer.bypassSecurityTrustHtml(mermaidText);
  }

  exportarPdf() {
    const element = document.getElementById('diagram-container');
    if (!element) {
      console.error("No se encontró el contenedor del diagrama");
      return;
    }

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('er-diagram.pdf');
    });
  }

  exportarPng() {
    const element = document.getElementById('diagram-container');
    if (!element) return;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'er-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}
