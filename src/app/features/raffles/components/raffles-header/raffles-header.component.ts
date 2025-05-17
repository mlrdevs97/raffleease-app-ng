import { Component } from '@angular/core';
import { RafflesToolbarComponent } from '../raffles-toolbar/raffles-toolbar.component';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    imports: [RafflesToolbarComponent, RouterLink],
    selector: 'app-raffles-header',
    templateUrl: './raffles-header.component.html',
})
export class RafflesHeaderComponent {} 