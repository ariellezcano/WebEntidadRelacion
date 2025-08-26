import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Entidad, Relacion } from '../models/index.models';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private entidadesSource = new BehaviorSubject<Entidad[]>([]);
  entidades$ = this.entidadesSource.asObservable();

  private relacionesSource = new BehaviorSubject<Relacion[]>([]);
  relaciones$ = this.relacionesSource.asObservable();

  setEntidades(entidades: Entidad[]) { this.entidadesSource.next(entidades); }
  setRelaciones(relaciones: Relacion[]) { this.relacionesSource.next(relaciones); }

  getEntidades(): Entidad[] { return this.entidadesSource.getValue(); }
  getRelaciones(): Relacion[] { return this.relacionesSource.getValue(); }
}
