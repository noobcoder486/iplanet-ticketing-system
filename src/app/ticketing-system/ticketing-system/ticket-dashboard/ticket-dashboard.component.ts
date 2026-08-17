import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from 'src/app/config/global';

interface LocationItem {
  code: string;
  name: string;
  displayName: string;
}

@Component({
  selector: 'app-ticket-dashboard',
  templateUrl: './ticket-dashboard.component.html',
  styleUrls: ['./ticket-dashboard.component.sass']
})
export class TicketDashboardComponent implements OnInit {

  totalTickets: number = 0;
  statusCards: any[] = [];
  storeData: any[] = [];
  engineerData: any[] = [];
  masterLocationList: LocationItem[] = [];

  selectedStoreLocation: string = 'ALL';
  selectedEngineerLocation: string = 'ALL';
  selectedBreachLocation: string = 'ALL';

  breachLocations: string[] = [];
  firstResponseBreaches: number[] = [];
  diagnosisTATBreaches: number[] = [];

  private readonly statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
    'OPEN': { bg: '#e0f2fe', text: '#0369a1', icon: 'fa-folder-open' },
    'IN-PROGRESS': { bg: '#fef3c7', text: '#b45309', icon: 'fa-spinner' },
    'CLOSED': { bg: '#f1f5f9', text: '#475569', icon: 'fa-check-circle' }
  };

  constructor(
    private dynamicService: DynamicService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDashboardData(); 
  }

  getDashboardData(): void {
    const requestData = [
      { Key: 'ApiType', Value: 'GetTicketDashboard' },
      { Key: 'StoreLocationCode', Value: this.extractCode(this.selectedStoreLocation) },
      { Key: 'EngineerLocationCode', Value: this.extractCode(this.selectedEngineerLocation) },
      { Key: 'BreachLocationCode', Value: this.extractCode(this.selectedBreachLocation) }
    ];

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (res: any) => {
        try {
          const response = typeof res === 'string' ? JSON.parse(res) : res;
          if (response?.ReturnCode !== '0' || !response?.ExtraData) return;

          const data = typeof response.ExtraData === 'string' 
            ? JSON.parse(response.ExtraData) 
            : response.ExtraData;

          this.totalTickets = Number(data?.TotalTickets) || 0;

          // Parse Locations Dropdown
          if (this.masterLocationList.length === 0 && data?.LocationsMaster?.Location) {
            this.masterLocationList = this.ensureArray(data.LocationsMaster.Location)
              .map((loc: any) => {
                const code = String(loc?.LocationCode || '').trim();
                const name = String(loc?.LocationName || code).trim();
                return {
                  code,
                  name,
                  displayName: code && name && code !== name ? `${code} - ${name}` : (code || name)
                };
              })
              .filter(item => item.code);
          }

          // Parse Status Cards
          this.processStatusCards(this.ensureArray(data?.StatusWiseCount?.Status));

          // Parse Table Data
          this.storeData = this.ensureArray(data?.StoreData?.StoreWise);
          this.engineerData = this.ensureArray(data?.EngineerData?.EngineerWise);

          // Parse Breach Data
          const breachList = this.ensureArray(data?.BreachCases?.LocationBreach);
          this.breachLocations = breachList.map((b: any) => b?.LocationCode || b?.LocationName || 'N/A');
          this.firstResponseBreaches = breachList.map((b: any) => Number(b?.FirstResponseBreach) || 0);
          this.diagnosisTATBreaches = breachList.map((b: any) => Number(b?.DiagnosisTATBreach) || 0);

          this.cdr.detectChanges();
        } catch (err) {
          console.error('Error parsing dashboard data:', err);
        }
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  onStoreLocationChange(): void {
    this.getDashboardData();
  }

  onEngineerLocationChange(): void {
    this.getDashboardData();
  }

  onBreachLocationChange(): void {
    this.getDashboardData();
  }

  getCompletionRate(resolved: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round(((resolved || 0) / total) * 100)));
  }

  navigateToTickets(status: string): void {
    if (!status) return;
    sessionStorage.setItem('ticketStatusFilter', status);
    this.router.navigate([`/auth/${glob.getCompanyCode()}/ticketing-system`]);
  }

  private processStatusCards(rawStatuses: any[]): void {
    let openCount = 0;
    let inProgressCount = 0;
    let closedCount = 0;

    rawStatuses.forEach((s: any) => {
      const key = String(s?.StatusCode || s?.TicketStatus || '').toUpperCase().trim();
      const count = Number(s?.TicketCount) || 0;

      if (key === 'OPEN') openCount += count;
      else if (key === 'CLOSED') closedCount += count;
      else inProgressCount += count;
    });

    this.statusCards = [
      { status: 'Open', rawStatus: 'OPEN', count: openCount, style: this.statusConfig['OPEN'] },
      { status: 'In-Progress', rawStatus: 'IN-PROGRESS', count: inProgressCount, style: this.statusConfig['IN-PROGRESS'] },
      { status: 'Closed', rawStatus: 'CLOSED', count: closedCount, style: this.statusConfig['CLOSED'] }
    ].filter(card => card.count > 0);
  }

  private extractCode(value: string): string {
    if (!value || value === 'ALL') return 'ALL';
    return value.includes(' - ') ? value.split(' - ')[0].trim() : value.trim();
  }

  private ensureArray(data: any): any[] {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }
}