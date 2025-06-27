import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-manage-accounts-toolbar',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './manage-accounts-toolbar.component.html',
})
export class ManageAccountsToolbarComponent {
  @Output() searchClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }
}
