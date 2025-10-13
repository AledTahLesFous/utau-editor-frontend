import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeiliSearchService } from '../../shared/services/meili-search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  @Input() isLoggedIn = !!localStorage.getItem('token');
  
  searchQuery = '';
  searchResults: any[] = [];
  isDropdownVisible = false;
  typingTimeout: any;

  constructor(
    private router: Router,
    private meiliSearch: MeiliSearchService
  ) {}

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToCreateProjet() {
    if (!this.isLoggedIn) this.router.navigate(['/auth']);
    else this.router.navigate(['/project']);
  }

  goHome() {
    this.router.navigate(['']);
  }

  goToViewProjects() {
    if (!this.isLoggedIn) this.router.navigate(['/auth']);
    else this.router.navigate(['/projects']);
  }

  async onSearchChange() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(async () => {
      if (this.searchQuery.trim().length > 0) {
        this.searchResults = await this.meiliSearch.searchProjects(this.searchQuery);
        this.isDropdownVisible = this.searchResults.length > 0;
      } else {
        this.searchResults = [];
        this.isDropdownVisible = false;
      }
    }, 300);
  }

  goToProject(project: any) {
    this.isDropdownVisible = false;
    this.searchQuery = '';
    this.router.navigate(['/project', project.title]);
  }

  onEnter() {
    if (this.searchResults.length > 0) {
      this.goToProject(this.searchResults[0]);
    }
  }

  closeDropdown() {
    setTimeout(() => this.isDropdownVisible = false, 150);
  }
}
