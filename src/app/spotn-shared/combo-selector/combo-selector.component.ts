import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combo-selector',
  template:   `
  <ng-select [(ngModel)]="selectedCar" class="spotn_combo">
    <ng-option *ngFor="let car of cars" [value]="car.id">{{car.name}}</ng-option>
  </ng-select>
  `
})
export class ComboSelectorComponent implements OnInit {
  
  selectedCar: number;
  cars = [];
  constructor() { }

  ngOnInit(): void {
    this.cars = [
        { id: 1, name: 'Volvo' },
        { id: 2, name: 'Saab' },
        { id: 3, name: 'Opel' },
        { id: 4, name: 'Audi' },
    ];
  }

}
