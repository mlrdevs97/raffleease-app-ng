import { Component } from '@angular/core';
import { RafflesToolbarComponent } from '../raffles-toolbar/raffles-toolbar.component';

@Component({
    standalone: true,
    imports: [RafflesToolbarComponent],
    selector: 'app-raffles-header',
    templateUrl: './raffles-header.component.html',
})
export class RafflesHeaderComponent {} 