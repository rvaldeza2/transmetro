import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Bus } from '../../buses/bus.model';
import { BusService } from '../../buses/bus.service';
import { Piloto } from '../piloto.model';
import { PilotoService } from '../piloto.service';

@Component({
  selector: 'app-pilotos-show',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './pilotos-show.html',
})
export class PilotosShow implements OnInit {
  private service = inject(PilotoService);
  private busService = inject(BusService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  piloto = signal<Piloto | null>(null);
  buses = signal<Bus[]>([]);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [piloto, buses] = await Promise.all([this.service.get(this.id), this.busService.list()]);
      this.piloto.set(piloto);
      this.buses.set(buses);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  placaBus(id: number | null) {
    return this.buses().find((b) => b.id_bus === id)?.placa ?? 'Sin bus';
  }
}
