import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzAlertModule,
    NzInputModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @Input() searchTerm: string = '';
  adminService = inject(AdminService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  summary: { all_users: number, total_sessions: number; total_bookmarks: number; total_rates: number } | null = null;

  constructor() {
    this.checkLoginStatus();
  }

  ngOnInit(): void {
    // Subscribe to query params to initialize searchTerm
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || ''; // Set searchTerm from query params
    });

    this.getSummary();
  }

  checkLoginStatus(): void {
    const isLoggedIn = this.adminService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    console.log('Logging out');
    this.adminService.logout();
    this.router.navigate(['/login']);
  }

  filterTable(): void {
    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge',
    });
  }

 /** Fetch summary data */
  getSummary(): void {
    this.adminService.getSummary().subscribe(
      data => {
        console.log('Summary data:', data);
        this.summary = data;
      },
      error => {
        console.error('Error fetching summary:', error);
      }
    );
  }

  syncData(): void {
    this.adminService.syncData().subscribe(
        response => {
            if (response) {
                console.log('Data synced successfully:', response);
            } else {
                console.log('No data returned from sync.');
            }
        },
        error => {
            console.error('Error during sync:', error);
        }
    );
  }
}
