import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Bus } from '../bus.model';
import { BusService } from '../bus.service';

@Component({
  selector: 'app-buses-show',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './buses-show.html',
})
export class BusesShow implements OnInit {
  private service = inject(BusService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  bus = signal<Bus | null>(null);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      this.bus.set(await this.service.get(this.id));
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
