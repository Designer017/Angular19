import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  template: `
    <mat-form-field appearance="outline" class="searchable-dropdown-field">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        type="text"
        [placeholder]="placeholder"
        [formControl]="searchControl"
        [matAutocomplete]="auto"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onOptionSelected($event.option.value)"
      >
        <mat-option *ngFor="let item of filteredOptions$ | async" [value]="item">
          {{ item }}
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class SearchableDropdownComponent implements OnInit {
  @Input() label = 'Select';
  @Input() placeholder = 'Search...';
  @Input() items: readonly string[] = [];
  @Input() value?: string;

  @Output() valueChange = new EventEmitter<string>();

  searchControl = new FormControl('');
  filteredOptions$!: Observable<readonly string[]>;

  ngOnInit(): void {
    this.filteredOptions$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value ?? ''),
      map((value) => this.filterOptions(typeof value === 'string' ? value : ''))
    );
  }

  private filterOptions(search: string): readonly string[] {
    const term = search.trim().toLowerCase();
    if (!term) {
      return [...this.items];
    }
    return this.items.filter((item) => item.toLowerCase().includes(term));
  }

  onOptionSelected(option: string): void {
    this.valueChange.emit(option);
    this.searchControl.setValue(option, { emitEvent: false });
  }
}
