import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownDataService, DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { MatDialog } from '@angular/material/dialog';
import { AddTicketComponent } from './add-ticket/add-ticket.component';
import { AddCustomerMasterComponent } from 'src/app/master/customer-master/add-customer-master/add-customer-master.component';
import { ToastrService } from 'ngx-toastr';
import { ViewCustomerComponent } from './view-customer/view-customer.component';
import { MapLocationComponent } from './map-location/map-location.component';
import { AddProductComponent } from './add-product/add-product.component';
import { CustomerExistsAlertComponent } from './customer-exists-alert/customer-exists-alert.component';
import { DatePipe } from '@angular/common';
import * as glob from 'src/app/config/global';
import xml2js from 'xml2js';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ticketing-system',
  templateUrl: './ticketing-system.component.html',
  styleUrls: ['./ticketing-system.component.css'],
  providers: [DatePipe]
})
export class TicketingSystemComponent implements OnInit {
  countArray: any[] = [];
  constructor(
    private route: Router,
    private toaster: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dynamicService: DynamicService,
    private dropdownDataService: DropdownDataService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe
  ) { }

  ticketStatusDD: DropDownValue = DropDownValue.getBlankObject();
  selectedStatus: any;
  tickets: any = [];
  pageNo: number = 1;
  typeSelected = 'ball-clip-rotate';
  pageSize: number = 10;
  totalRecords: number = 0;
  selectedTicket: any;
  drawerOpen: boolean = true;
  productsSubmitted: boolean = false;
  customerData: any = null;
  locationData: any = null;
  customerVoice: string = '';
  creVoice: string = '';
  customerVoiceTouched: boolean = false;
  creVoiceTouched: boolean = false;
  ELSStatusType: DropDownValue = this.getBlankObject();
  RepairTypeDD: DropDownValue = this.getBlankObject();
  BillingOptionDD: DropDownValue = this.getBlankObject();

  ngOnInit(): void {
    this.fetchTicketStatusDropdown({ term: '', items: [] });
    this.onELSStatusSearch({ term: '', items: [] });
    this.GetTicketList();
    this.onRepairTypeSearch({ term: '', items: [] });
    this.onBillingOptionSearch({ term: '', items: [] });
  }

  onRepairTypeSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.RepairType,
      $event.term, {}).
      subscribe({
        next: (value: any) => {
          if (value != null) this.RepairTypeDD = value;
        },
        error: () => { this.RepairTypeDD = this.getBlankObject(); }
      });
  }

  onBillingOptionSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.CovarageOption, $event.term, {}).subscribe({
      next: (value) => { if (value != null) this.BillingOptionDD = value; },
      error: () => { this.BillingOptionDD = this.getBlankObject(); }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
  private noSpecialCharsPattern = /^[a-zA-Z0-9 .,'\-\n\r]*$/;

  hasSpecialChars(value: string): boolean {
    if (!value) return false;
    return !this.noSpecialCharsPattern.test(value);
  }

  isCustomerVoiceInvalid(): boolean {
    if (!this.hasNewProducts()) return false;
    return this.customerVoiceTouched && (!this.customerVoice?.trim() || this.hasSpecialChars(this.customerVoice));
  }

  isCreVoiceInvalid(): boolean {
    if (!this.hasNewProducts()) return false;
    return this.creVoiceTouched && (!this.creVoice?.trim() || this.hasSpecialChars(this.creVoice));
  }

  hasNewProducts(): boolean {
    return this.submittedProducts.some(p => !p._fromJob);
  }

  newProductCount(): number {
    return this.submittedProducts.filter(p => !p._fromJob).length;
  }

  selectTicket(ticket: any) {
    this.productsSubmitted = false;
    this.submittedProducts = [];
    this.customerData = null;
    this.locationData = null;
    this.customerVoice = '';
    this.creVoice = '';
    this.customerVoiceTouched = false;
    this.creVoiceTouched = false;
    this.GetTicketDetail(ticket);
  }

  fetchTicketStatusDropdown($event: { term: String; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.TicketStatus, $event.term, {}).subscribe({
      next: (value) => { if (value != null) this.ticketStatusDD = value; },
      error: (err) => { this.ticketStatusDD = this.getBlankObject(); }
    });
  }

  onELSStatusSearch($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.ELSStatus, $event.term, {}).subscribe({
      next: (value) => { if (value != null) this.ELSStatusType = value; },
      error: (err) => { this.ELSStatusType = this.getBlankObject(); }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'NEW': return 'new';
      case 'IN-PROGRESS': return 'in-progress';
      case 'CLOSED': return 'closed';
      case 'PARTIALLY-COMPLETED': return 'partially-closed';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  }

  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  fetchRecordsForStatus() {
    this.pageNo = 1;
    this.pageSize = 10;
    this.totalRecords = 0;
    this.selectedTicket = null;
    this.customerData = null;
    this.locationData = null;
    this.productsSubmitted = false;
    this.submittedProducts = [];
    this.customerVoice = '';
    this.creVoice = '';
    this.customerVoiceTouched = false;
    this.creVoiceTouched = false;
    this.GetTicketList();
  }

  GetTicketList() {
    let requestData = [];
    requestData.push({ Key: 'APIType', Value: 'GetTicketQueueList' });
    requestData.push({
      Key: 'TicketStatus',
      Value: this.selectedStatus == null || this.selectedStatus == undefined ? ''
        : (this.selectedStatus == 'ALL' ? '' : this.selectedStatus)
    });
    requestData.push({ Key: 'TicketNo', Value: '' });
    requestData.push({ Key: 'PageNo', Value: this.pageNo.toString() });
    requestData.push({ Key: 'PageSize', Value: this.pageSize.toString() });
    const contentRequest = { content: JSON.stringify(requestData) };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value: any) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            this.totalRecords = data.TotalRecords || 0;
            this.tickets = [];
            if (Array.isArray(data?.TicketList?.Ticket)) {
              this.tickets = data?.TicketList?.Ticket;
            } else if (data?.TicketList?.Ticket) {
              this.tickets.push(data?.TicketList?.Ticket);
            }
            this.parseTicketBodies(this.tickets);
            this.cdr.detectChanges();
          }
        } catch (ext) { console.log(ext); }
      },
      error: err => { console.log(err); }
    });
  }

  GetTicketDetail(ticketobj: any) {
    this.spinner.show();
    let requestData = [];
    requestData.push({ Key: 'APIType', Value: 'GetTicketQueueList' });
    requestData.push({ Key: 'TicketStatus', Value: '' });
    requestData.push({ Key: 'TicketNo', Value: ticketobj?.TicketNo });
    requestData.push({ Key: 'PageNo', Value: '1' });
    requestData.push({ Key: 'PageSize', Value: '1' });
    const contentRequest = { content: JSON.stringify(requestData) };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (Value: any) => {
        this.spinner.hide();
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            let data = JSON.parse(response?.ExtraData);
            let fetchedTicket = Array.isArray(data?.TicketList?.Ticket)
              ? data?.TicketList?.Ticket[0]
              : data?.TicketList?.Ticket;

            if (fetchedTicket) {
              try {
                if (typeof fetchedTicket.TicketBody === 'string') {
                  const cleanedJson = fetchedTicket.TicketBody
                    .replace(/\u00A0/g, ' ')
                    .replace(/[\u200B-\u200D\uFEFF]/g, '');
                  fetchedTicket.parsedTicketBody = JSON.parse(cleanedJson);
                } else {
                  fetchedTicket.parsedTicketBody = fetchedTicket.TicketBody;
                }

                if (Array.isArray(fetchedTicket?.JobStatusCounts?.Status)) {
                  this.countArray = fetchedTicket?.JobStatusCounts?.Status

                }
                else {
                  this.countArray.push(fetchedTicket?.JobStatusCounts?.Status)
                }
              } catch (e) {
                fetchedTicket.parsedTicketBody = null;
              }
              this.selectedTicket = fetchedTicket;
              const idx = this.tickets.findIndex((t: any) => t.TicketGuid === fetchedTicket.TicketGuid);
              if (idx !== -1) this.tickets[idx] = { ...fetchedTicket };
              this.fetchCustomerData(fetchedTicket?.CustomerCode);
              this.fetchLocationData(fetchedTicket?.LocationCode);
              this._loadJobProducts(fetchedTicket);
              this.cdr.detectChanges();
            }
          }
        } catch (ext) {
          this.spinner.hide();
          console.log(ext);
        }
      },
      error: err => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }

  GetTicketQueueList(ticketobj: any) {
    if (ticketobj == null) {
      this.GetTicketList();
    } else {
      this.GetTicketDetail(ticketobj);
    }
  }

  private parseTicketBodies(tickets: any[]) {
    for (let item of tickets) {
      try {
        if (typeof item.TicketBody === 'string') {
          const cleanedJson = item.TicketBody
            .replace(/\u00A0/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
          item.parsedTicketBody = JSON.parse(cleanedJson);
        } else {
          item.parsedTicketBody = item.TicketBody;
        }
      } catch (e) {
        item.parsedTicketBody = null;
      }
    }
  }

  openAddTicketPopup() {
    const dialogRef = this.dialog.open(AddTicketComponent, {
      width: '500px', height: '500px', disableClose: true,
      data: { formTitle: 'Create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.GetTicketList();
    });
  }

  openCustomerPopup(ticket: any) {
    const existingCustomer = ticket?.CustomerObject?.Customer ?? null;
    if ((ticket?.CustomerCode == null || ticket?.CustomerCode === '') && existingCustomer != null) {
      const alertRef = this.dialog.open(CustomerExistsAlertComponent, {
        width: '420px', disableClose: true,
        data: { customer: existingCustomer, ticket }
      });
      alertRef.afterClosed().subscribe(result => {
        if (result?.action === 'mapped') {
          this.mapCode(result.CustomerCode, 'CUSTOMER', ticket?.TicketGuid);
          this._updateTicketCode(ticket?.TicketGuid, 'CustomerCode', result.CustomerCode);
        } else if (result?.action === 'add_new') {
          this._openAddCustomerForm(ticket);
        }
      });
    } else {
      this._openAddCustomerForm(ticket);
    }
  }

  private _openAddCustomerForm(ticket: any) {
    const dialogRef = this.dialog.open(AddCustomerMasterComponent, {
      width: '700px', height: '500px', disableClose: true,
      data: {
        formTitle: 'Add',
        CustomerEmail: ticket?.parsedTicketBody?.mails[0]?.from,
        CustomerPhone: ticket?.CustomerNo
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.mapCode(result?.CustomerCode, 'CUSTOMER', ticket?.TicketGuid);
        this._updateTicketCode(ticket?.TicketGuid, 'CustomerCode', result?.CustomerCode);
        this.fetchCustomerData(result?.CustomerCode);
      }
    });
  }

  private _updateTicketCode(ticketGuid: string, field: string, value: string) {
    for (const item of this.tickets) {
      if (item.TicketGuid === ticketGuid) { item[field] = value; break; }
    }
    if (this.selectedTicket?.TicketGuid === ticketGuid) {
      this.selectedTicket = { ...this.selectedTicket, [field]: value };
    }
    this.cdr.detectChanges();
  }

  openLocationPopUp(ticket: any) {
    const dialogRef = this.dialog.open(MapLocationComponent, {
      width: '400px', disableClose: true,
      data: { CustomerEmail: ticket?.parsedTicketBody?.mails[0]?.from, CustomerPhone: ticket?.CustomerNo }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success && result?.LocationCode) {
        this.mapCode(result?.LocationCode, 'LOCATION', ticket?.TicketGuid);
        this._updateTicketCode(ticket?.TicketGuid, 'LocationCode', result?.LocationCode);
        this.fetchLocationData(result?.LocationCode);
      }
    });
  }

  mapCode(code: string, mapType: string, ticketguid: any) {
    if (mapType != 'CUSTOMER' && mapType != 'LOCATION' && mapType != 'TECH') {
      this.toaster.error('Invalid Mapping'); return;
    }
    let requestData = [];
    requestData.push({ Key: 'APIType', Value: 'SaveTicketCodeMapping' });
    requestData.push({ Key: 'MappingType', Value: mapType });
    requestData.push({ Key: 'MappingCode', Value: code });
    requestData.push({ Key: 'TicketGuid', Value: ticketguid });

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (Value: any) => {
        try {
          let response = JSON.parse(Value.toString());
          if (response.ReturnCode == '0') {
            mapType == 'CUSTOMER' ? this.toaster.success('Customer Added Successfully') :
              (mapType == 'LOCATION' ? this.toaster.success('Location Mapped Successfully') :
                this.toaster.success('Technician Assigned'));
          }
        } catch (ext) { console.log(ext); }
      },
      error: err => { console.log(err); }
    });
  }

  openCustomerDetails(ticket: any) {
    this.dialog.open(ViewCustomerComponent, { width: '500px', data: { data: ticket } });
  }

  openTechPopup(ticket: any) {
    const dialog = this.dialog.open(MapLocationComponent, {
      width: '500px', disableClose: true, data: { data: ticket }
    });
    dialog.afterClosed().subscribe(result => {
      if (result?.success) {
        let techId = result?.techIds.join(',');
        this.mapCode(techId, 'TECH', ticket?.TicketGuid);
        for (let item of this.tickets) {
          if (item.TicketGuid == ticket?.TicketGuid) {
            item.TechIds = techId;
            item.TicketStatus = 'IN-PROGRESS';
            break;
          }
        }
        if (this.selectedTicket?.TicketGuid === ticket?.TicketGuid) {
          this.selectedTicket = { ...this.selectedTicket, TechIds: techId, TicketStatus: 'IN-PROGRESS' };
        }
        this.cdr.detectChanges();
      }
    });
  }

  submittedProducts: any[] = [];

  addProduct(ticket: any) {
    const dialog = this.dialog.open(AddProductComponent, {
      width: '600px', disableClose: true, data: { data: ticket }
    });

    dialog.afterClosed().subscribe(result => {
      if (result?.success && result?.products?.length > 0) {
        let added = 0;
        let dupes = 0;
        for (const incoming of result.products) {
          const serial = incoming.serial?.toLowerCase();
          const exists = this.submittedProducts.some(p => p.serial?.toLowerCase() === serial);
          if (!exists) {
            const enriched = this._enrichProduct(incoming);
            this.submittedProducts.push(enriched);
            this._fetchContractCodesForProduct(enriched, ticket);
            added++;
          } else {
            dupes++;
          }
        }
        if (dupes > 0) this.toaster.warning(`${dupes} duplicate serial(s) skipped`);
        if (added > 0) {
          this.productsSubmitted = true;
          this.drawerOpen = false;
          if (!this.customerVoice) this.customerVoice = '';
          if (!this.creVoice) this.creVoice = '';
          this.customerVoiceTouched = false;
          this.creVoiceTouched = false;
        }
        this.cdr.detectChanges();
      }
    });
  }


  private _loadJobProducts(ticket: any) {
    this.submittedProducts = [];
    this.productsSubmitted = false;

    const jobHeader = ticket?.JobInfo?.JobHeader;
    if (!jobHeader) return;
    let details = jobHeader?.JobDetails?.JobDetail ?? null;
    let diagnosis = jobHeader?.JobDetails?.JobDetail?.DiagnosisObject?.Diagnosis ?? null;
    if (!details) return;
    if (!Array.isArray(details)) details = [details];
    if (details.length === 0) return;

    for (const jd of details) {
      const product: any = {
        serial: jd.SerialNo1 ?? '',
        SerialNo1: jd.SerialNo1 ?? '',
        imei: jd.imei ?? '',
        imei2: jd.imei2 ?? '',
        productDescription: jd.productDescription ?? '',
        configCode: jd.configCode ?? '',
        configDescription: jd.ConfigurationDescription ?? '',
        productImageURL: jd.productImageURL ?? '',
        warrantyStatusCode: jd.warrantyStatusCode ?? '',
        warrantyStatusDescription: jd.warrantyStatusDescription ?? '',
        purchaseDate: null,
        coverageStartDate: jd.coverageStartDate ?? null,
        coverageEndDate: jd.coverageEndDate ?? null,
        deviceCoverageDetails: jd.deviceCoverageDetails ?? '',
        purchaseCountryCode: jd.purchaseCountryCode ?? '',
        purchaseCountryDesc: jd.purchaseCountryDesc ?? '',
        laborCovered: jd.laborCovered === 'true' || jd.laborCovered === '1',
        partCovered: jd.partCovered === 'true' || jd.partCovered === '1',
        onsiteCoverage: false,
        soldToName: jd.soldToName ?? '',
        carrierName: '',
        appleCareEligible: 'Not Eligible',
        _elsStatus: jd.ElsStatus || null,
        _contractCode: jd.ContractCode || null,
        _contractStartDate: jd.ContractStartDate == '1900-01-01' ? '' : jd.ContractStartDate || null,
        _contractEndDate: jd.ContractEndDate == '1900-01-01' ? '' : jd.ContractEndDate || null,
        _contractDD: { TotalRecord: 0, Data: [] },
        _elsTouched: false,
        customerVoice: jd.customerVoice ?? '',
        creVoice: jd.creVoice ?? '',
        _fromJob: true,
        _caseId: jd.CaseId ?? '',
        _caseGuid: jd.CaseGUID ?? '',
        _jobStatus: jd.JobStatus ?? '',
        IsContractApplicable: jd.IsContractApplicable === 'true' || jd.IsContractApplicable === '1',
        _repairType: diagnosis?.RepairType || null,
        _billingOption: diagnosis?.BillingOption || null,
        _repairTypeTouched: false,
        _billingOptionTouched: false,
      };

      this.submittedProducts.push(product);
      if (product._contractCode) {
        this._fetchContractCodesForProduct(product, ticket);
      }
    }

    if (details.length > 0) {
      this.customerVoice = details[0]?.customerVoice ?? '';
      this.creVoice = details[0]?.creVoice ?? '';
    }

    this.selectedTicket = {
      ...ticket,
      _jobHeaderCaseId: jobHeader.HeaderCaseId ?? '',
      _jobHeaderGuid: jobHeader.JOBHeaderGUID ?? '',
      _jobStatus: jobHeader.JobDocStatus ?? ''
    };

    this.productsSubmitted = true;
    this.drawerOpen = false;
    this.cdr.detectChanges();
  }


  private _enrichProduct(product: any): any {
    const p = { ...product };

    p.coverageStartDate = p.purchaseDate
      ? new Date(p.purchaseDate).toISOString().replace('Z', '')
      : null;

    if (p.purchaseDate) {
      const day1 = new Date(p.purchaseDate).toISOString().split('T')[0];
      const day2 = new Date().toISOString().split('T')[0];
      const days = (new Date(day2).getTime() - new Date(day1).getTime()) / (1000 * 3600 * 24);
      p.appleCareEligible = days <= 60 ? 'Eligible' : 'Not Eligible';
    } else {
      p.appleCareEligible = 'Not Eligible';
    }

    p._elsStatus = null;
    p._contractCode = null;
    p._contractStartDate = null;
    p._contractEndDate = null;
    p._contractDD = { TotalRecord: 0, Data: [] };
    p._elsTouched = false;
    p._repairType = null;
    p._billingOption = null;
    p._repairTypeTouched = false;
    p._billingOptionTouched = false;
    return p;
  }

  private _fetchContractCodesForProduct(product: any, ticket: any) {
    const serial = product.serial;
    const customerCode = ticket?.CustomerCode || '';

    this.dropdownDataService.fetchDropDownData(
      DropDownType.BindAmcContractDetails,
      '',
      {
        CompanyCode: glob.getCompanyCode().toString(),
        SerialNo: serial,
        CustomerCode: customerCode
      }
    ).subscribe({
      next: (value: any) => {
        if (value != null) {
          product._contractDD = value;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        product._contractDD = this.getBlankObject();
      }
    });
  }


  onProductContractChange(product: any, contractCode: string) {
    product._contractCode = contractCode;
    const selectedContract = product._contractDD?.Data?.find((item: any) => item.Id === contractCode);
    const startdate = selectedContract?.extraDataJson?.Data?.CoverageStartDate?.[0];
    const enddate = selectedContract?.extraDataJson?.Data?.CoverageEndDate?.[0];
    product._contractStartDate = this.datePipe.transform(startdate, 'yyyy-MM-dd') || null;
    product._contractEndDate = this.datePipe.transform(enddate, 'yyyy-MM-dd') || null;
    this.cdr.detectChanges();
  }

  removeSubmittedProduct(index: number) {
    this.submittedProducts.splice(index, 1);
    this.submittedProducts = [...this.submittedProducts];
    if (this.submittedProducts.length === 0) {
      this.productsSubmitted = false;
    }
    this.cdr.detectChanges();
  }

  private _buildProductXml(): string {
    const rawData: any = { rows: [] };

    const newProducts = this.submittedProducts.filter(p => !p._fromJob);

    for (const p of newProducts) {
      rawData.rows.push({
        row: {
          SerialNo1: p.serial || '',
          imei: p.imei || '',
          imei2: p.imei2 || '',
          productDescription: p.productDescription || '',
          configCode: p.configCode || '',
          configDescription: p.configDescription || '',
          productImageURL: p.productImageURL || '',
          warrantyStatusCode: p.warrantyStatusCode || '',
          warrantyStatusDescription: p.warrantyStatusDescription || '',
          purchaseDate: p.purchaseDate ? this.datePipe.transform(p.purchaseDate, 'yyyy-MM-dd') : '',
          coverageStartDate: p.coverageStartDate ? this.datePipe.transform(p.coverageStartDate, 'yyyy-MM-dd') : '',
          coverageEndDate: p.coverageEndDate ? this.datePipe.transform(p.coverageEndDate, 'yyyy-MM-dd') : '',
          deviceCoverageDetails: p.deviceCoverageDetails || '',
          purchaseCountryDesc: p.purchaseCountryDesc || '',
          purchaseCountryCode: p.purchaseCountryCode || '',
          laborCovered: p.laborCovered ? '1' : '0',
          partCovered: p.partCovered ? '1' : '0',
          onsiteCoverage: p.onsiteCoverage ? '1' : '0',
          soldToName: p.soldToName || '',
          carrierName: p.carrierName || '',
          appleCareEligible: p.appleCareEligible || '',
          ElsStatus: p._elsStatus || '',
          RepairType: p._repairType,
          BillingOption: p._billingOption,
          IsContractApplicable: (p._contractCode != null && p._contractCode !== '') ? '1' : '0',
          ContractCode: p._contractCode || '',
          ContractStartDate: p._contractStartDate || '',
          ContractEndDate: p._contractEndDate || ''
        }
      });
    }

    const builder = new xml2js.Builder();
    let xml = builder.buildObject(rawData);
    xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '');
    xml = xml.replace(/(\r\n|\n|\r|\t)/gm, '');
    return xml;
  }

  private _validateSubmission(): boolean {
    const newProducts = this.submittedProducts.filter(p => !p._fromJob);

    if (newProducts.length === 0) {
      this.toaster.error('Please add at least one new product');
      return false;
    }

    for (let i = 0; i < newProducts.length; i++) {
      const p = newProducts[i];

      if (!p._elsStatus || p._elsStatus === '') {
        this.toaster.error(`Please select ELS Status for Serial: ${p.serial}`);
        p._elsTouched = true;
        this.cdr.detectChanges();
        return false;
      }

      if (!p._repairType || p._repairType === '') {
        this.toaster.error(`Please select Repair Type for Serial: ${p.serial}`);
        p._repairTypeTouched = true;
        this.cdr.detectChanges();
        return false;
      }

      if (!p._billingOption || p._billingOption === '') {
        this.toaster.error(`Please select Billing Option for Serial: ${p.serial}`);
        p._billingOptionTouched = true;
        this.cdr.detectChanges();
        return false;
      }
    }

    this.customerVoiceTouched = true;
    this.creVoiceTouched = true;

    if (!this.customerVoice?.trim()) {
      this.toaster.error('Customer Voice cannot be blank');
      return false;
    }
    if (this.hasSpecialChars(this.customerVoice)) {
      this.toaster.error('Customer Voice contains invalid special characters');
      return false;
    }
    if (!this.creVoice?.trim()) {
      this.toaster.error('CRE Voice cannot be blank');
      return false;
    }
    if (this.hasSpecialChars(this.creVoice)) {
      this.toaster.error('CRE Voice contains invalid special characters');
      return false;
    }
    if (!this.selectedTicket?.CustomerCode) {
      this.toaster.error('Customer not mapped to this ticket');
      return false;
    }
    if (!this.selectedTicket?.LocationCode) {
      this.toaster.error('Location not mapped to this ticket');
      return false;
    }

    return true;
  }

  submitTicketProducts() {
    if (!this._validateSubmission()) return;

    const productXml = this._buildProductXml();
    const isAppend = !!this.selectedTicket?._jobHeaderGuid;   // true = append to existing job

    let requestData = [];
    requestData.push({ Key: 'ApiType', Value: 'SaveTicketJobDetails' });
    requestData.push({ Key: 'TicketGuid', Value: this.selectedTicket?.TicketGuid });
    requestData.push({ Key: 'TicketNo', Value: this.selectedTicket?.TicketNo });
    requestData.push({ Key: 'CompanyCode', Value: glob.getCompanyCode() });
    requestData.push({ Key: 'RetailCustomerCode', Value: this.selectedTicket?.CustomerCode });
    requestData.push({ Key: 'LocationCode', Value: this.selectedTicket?.LocationCode });
    requestData.push({ Key: 'ComplainDesc', Value: this.customerVoice.trim() });
    requestData.push({ Key: 'Remark', Value: this.creVoice.trim() });
    requestData.push({ Key: 'ProductDetails', Value: productXml });
    requestData.push({ Key: 'JobHeaderGuid', Value: this.selectedTicket?._jobHeaderGuid || '' });
    const contentRequest = { content: JSON.stringify(requestData) };
    this.dynamicService.getDynamicDetaildata(contentRequest).subscribe({
      next: (value: any) => {
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.toaster.success(isAppend ? 'Products appended to job successfully' : 'Products submitted successfully');
            this.customerVoice = '';
            this.creVoice = '';
            this.customerVoiceTouched = false;
            this.creVoiceTouched = false;
            this.submittedProducts = [];
            this.productsSubmitted = false;
            this.drawerOpen = true;
            this.GetTicketDetail(this.selectedTicket);
          } else {
            if (response.ErrorMessage) {
              try {
                const parser = new xml2js.Parser({ strict: false, trim: true });
                parser.parseString(response.ErrorMessage, (err: any, result: any) => {
                  var error = err;
                  const errorMessages = result?.ERRORLIST?.ERRORMESSAGE;
                  if (Array.isArray(errorMessages)) {
                    errorMessages.forEach((em) => this.toaster.error(em.ERRORMESSAGE));
                  } else {
                    this.toaster.error(response.ReturnMessage || 'Error submitting products');
                  }
                });
              } catch (e) {
                this.toaster.error(response.ReturnMessage || 'Error submitting products');
              }
            } else {
              this.toaster.error(response.ReturnMessage || 'Error submitting products');
            }
          }
        } catch (ext) {
          console.log(ext);
          this.toaster.error('Unexpected error submitting products');
        }
      },
      error: err => {
        console.log(err);
        this.toaster.error('Server error while submitting products');
      }
    });
  }

  fetchCustomerData(customerCode: string) {
    if (!customerCode) return;
    let requestData = [];
    requestData.push({ Key: 'ApiType', Value: 'GetRtlCustomerObject' });
    requestData.push({ Key: 'CompanyCode', Value: glob.getCompanyCode() });
    requestData.push({ Key: 'CustomerCode', Value: customerCode });

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (value: any) => {
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.customerData = JSON.parse(response.ExtraData)?.Customer;
            this.cdr.detectChanges();
          }
        } catch (e) { console.log(e); }
      },
      error: err => { console.log(err); }
    });
  }

  fetchLocationData(locationCode: string) {
    if (!locationCode) return;
    let requestData = [];
    requestData.push({ Key: 'ApiType', Value: 'GetLocationObject' });
    requestData.push({ Key: 'CompanyCode', Value: glob.getCompanyCode() });
    requestData.push({ Key: 'LocationCode', Value: locationCode });

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (value: any) => {
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.locationData = JSON.parse(response.ExtraData)?.Location;
            this.cdr.detectChanges();
          }
        } catch (e) { console.log(e); }
      },
      error: err => { console.log(err); }
    });
  }

  onPageChange(event: any) {
    this.pageNo = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.selectedTicket = null;
    this.productsSubmitted = false;
    this.submittedProducts = [];
    this.customerData = null;
    this.locationData = null;
    this.customerVoice = '';
    this.creVoice = '';
    this.customerVoiceTouched = false;
    this.creVoiceTouched = false;
    this.GetTicketList();
  }

  openJobDetail(caseguid: any) {
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: caseguid } })
  }

  openBulkQuotation(ticket: any) {
    sessionStorage.setItem('bq_ticketGuid', ticket?.TicketGuid || '');
    this.route.navigate(['/auth/' + glob.getCompanyCode() + '/ticketing-bulk-quotation']);
  }

  // ── Status inline-edit state ─────────────────────────────────────────
  isEditingStatus = false;
  editingStatus: string = '';

  /** Enter edit mode – pre-patch with current status */
  startEditStatus(): void {
    this.editingStatus = this.selectedTicket?.TicketStatus ?? '';
    this.isEditingStatus = true;
  }

  /** Revert to view mode without saving */
  cancelEditStatus(): void {
    this.isEditingStatus = false;
    this.editingStatus = '';
  }


  saveTicketStatus() {
    this.spinner.show()
    let requestData = [];
    requestData.push({ Key: 'ApiType', Value: 'UpdateTicketStatus' });
    requestData.push({ Key: 'CompanyCode', Value: glob.getCompanyCode() });
    requestData.push({ Key: 'TicketGuid', Value: this.selectedTicket?.TicketGuid });
    requestData.push({ Key: 'TicketStatus', Value: this.editingStatus });

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (value: any) => {
        this.spinner.hide()
        try {
          let response = JSON.parse(value.toString());
          if (response.ReturnCode == '0') {
            this.isEditingStatus = false;
            this.editingStatus = '';
            this.GetTicketDetail(this.selectedTicket)
          }
        } catch (e) {
          this.spinner.hide()
          console.log(e);
        }
      },
      error: err => {
        this.spinner.hide()
        console.log(err);
      }
    });
  }
}