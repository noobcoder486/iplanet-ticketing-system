import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import * as glob from 'src/app/config/global';
import { Router } from '@angular/router';
@Component({
    selector: 'app-ticket-dashboard',
    templateUrl: './ticket-dashboard.component.html',
    styleUrls: ['./ticket-dashboard.component.sass']
})
export class TicketDashboardComponent implements OnInit {

    totalTickets: number = 0;
    statusCards: any[] = [];

    statusColorMap: { [key: string]: string } = {
        'NEW': '#1a73e8',
        'IN-PROGRESS': '#d97706',
        'CLOSED': '#94a3b8',
        'COMPLETED': '#059669',
        'PARTIALLY-COMPLETED': '#7c3aed'
    };

    constructor(
        private dynamicService: DynamicService,
        private cdr: ChangeDetectorRef,
        private router : Router
    ) {}

    ngOnInit(): void {
        this.getDashboardData();
    }

    getDashboardData() {
        let requestData = [];
        requestData.push({ Key: 'ApiType', Value: 'GetTicketDashboard' });

        this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
            next: (value) => {
                try {
                    let response = JSON.parse(value.toString());
                    if (response.ReturnCode == '0') {
                        let data = JSON.parse(response?.ExtraData);

                        this.totalTickets = parseInt(data?.TotalTickets) || 0;

                        let statuses = Array.isArray(data?.StatusWiseCount?.Status)
                            ? data.StatusWiseCount.Status
                            : [data.StatusWiseCount.Status];

                        this.statusCards = statuses.map((s: any) => ({
                            status: s.TicketStatus,
                            count: parseInt(s.TicketCount) || 0,
                            color: this.statusColorMap[s.TicketStatus] || '#64748b'
                        }));

                        this.cdr.detectChanges();
                    }
                } catch (ext) {
                    console.log(ext);
                }
            },
            error: err => {
                console.log(err);
            }
        });
    }
navigateToTickets(status: string) {
    sessionStorage.setItem('ticketStatusFilter', status);
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/ticketing-system']);
}
}