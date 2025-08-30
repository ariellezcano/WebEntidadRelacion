import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Entidad, Relacion } from 'src/app/models/index.models';
import { DiagramService } from 'src/app/services/diagram.service';
import { StateService } from 'src/app/services/state.service';
import mermaid from 'mermaid';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

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

  nombreBase: string = '';  // para ingresar el nombre de la BD
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
    this.actualizarDiagrama();
  }

  actualizarRelaciones(relaciones: Relacion[]) {
    this.relaciones = relaciones;
    this.actualizarDiagrama();
  }

  // 👉 Método que construye el código Mermaid y vuelve a renderizar
  actualizarDiagrama() {
    this.mermaidCode = this.generarMermaid();

    setTimeout(() => {
      // 🔹 Buscar todos los contenedores
      const mermaidElems = document.querySelectorAll('.mermaid');

      // 🔹 Limpiar su contenido (importante para que no quede el render anterior)
      mermaidElems.forEach((el) => (el.innerHTML = this.mermaidCode));

      // 🔹 Volver a renderizar
      mermaid.init(undefined, mermaidElems);
    }, 50);
  }

  generarSql() {
    this.diagramService
      .generarSql(this.entidades, this.relaciones)
      .subscribe((res) => (this.sqlScript = res));
  }

  // ejecutarSql() {
  //   this.diagramService
  //     .ejecutarSql(this.entidades, this.relaciones)
  //     .subscribe((res) => {
  //       alert('SQL ejecutado en SQL Server');
  //       this.sqlScript = res.script;
  //     });
  // }

  ejecutarSql() {
    if (!this.nombreBase) {
      alert('Debe ingresar un nombre para la base de datos');
      return;
    }

    this.diagramService
      .ejecutarSql(this.entidades, this.relaciones, this.nombreBase)
      .subscribe((res) => {
        alert('SQL ejecutado en SQL Server');
        this.sqlScript = res.script;
      });
  }

  crearBaseDatos() {
  if (!this.nombreBase) {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Debe ingresar un nombre para la base de datos',
    });
    return;
  }

  this.diagramService.crearBaseDatos(this.nombreBase).subscribe({
    next: (res) => {
      Swal.fire({
        icon: 'success',
        title: 'Base creada',
        text: res.mensaje,
      });
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear la base: ' + err.message,
      });
    }
  });
}


  exportarSql() {
  if (!this.sqlScript) return;

  // Crear un Blob con el contenido SQL
  const blob = new Blob([this.sqlScript], { type: 'text/sql' });
  const url = window.URL.createObjectURL(blob);

  // Crear un enlace temporal y hacer click para descargar
  const link = document.createElement('a');
  link.href = url;
  link.download = 'script.sql';
  link.click();

  // Liberar el objeto URL
  window.URL.revokeObjectURL(url);
}

  // generarMermaid() {
  //   let mermaidText = 'erDiagram\n';
  //   for (let entidad of this.entidades) {
  //     mermaidText += `  ${entidad.nombre} {\n`;
  //     for (let attr of entidad.atributos) {
  //       mermaidText += `    ${attr.tipo} ${attr.nombre}\n`;
  //     }
  //     mermaidText += `  }\n`;
  //   }

  //   for (let rel of this.relaciones) {
  //     mermaidText += `  ${rel.origen} ${rel.cardinalidad} ${rel.destino} : ${rel.etiqueta}\n`;
  //   }

  //   this.mermaidCode = mermaidText;
  //   this.mermaidHtml = this.sanitizer.bypassSecurityTrustHtml(mermaidText);
  // }

  generarMermaid(): string {
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

    this.mermaidHtml = this.sanitizer.bypassSecurityTrustHtml(mermaidText);
    return mermaidText;
  }

  exportarPdf() {
    const element = document.getElementById('diagram-container');
    if (!element) {
      console.error('No se encontró el contenedor del diagrama');
      return;
    }

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
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

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'er-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}
