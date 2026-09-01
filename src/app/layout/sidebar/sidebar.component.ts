import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = signal<boolean>(localStorage.getItem('sidebar_collapsed') === 'true');

  constructor(public authService: AuthService) {}

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
    localStorage.setItem('sidebar_collapsed', String(this.isCollapsed()));
  }

  logout() {
    this.authService.logout();
  }
}
