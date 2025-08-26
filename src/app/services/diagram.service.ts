import { Injectable } from '@angular/core';
import { Entidad, Relacion } from '../models/index.models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  private apiUrl = `${environment.URL}Diagrama`;

  constructor(private http: HttpClient) {}

  generarSql(entidades: Entidad[], relaciones: Relacion[]): Observable<string> {
    return this.http.post(`${this.apiUrl}/generar-sql`, { entidades, relaciones }, { responseType: 'text' });
  }

  ejecutarSql(entidades: Entidad[], relaciones: Relacion[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/ejecutar-sql`, { entidades, relaciones });
  }
}
