import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-ticketing-bulk-quotation',
  templateUrl: './ticketing-bulk-quotation.component.html',
  styleUrls: ['./ticketing-bulk-quotation.component.css']
})
export class TicketingBulkQuotationComponent implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dynamicService: DynamicService,
    private gsxService: GsxService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ticketGuid = '';
  typeSelected = 'ball-clip-rotate';
  ticket: any = null;
  products: any[] = [];
  selectedProduct: any = null;

  isLoading = false;
  hasError = false;
  errorMessage = '';

  showAddPartsPopup = false;
  popupProduct: any = null;

  lockedProductCaseId: string | null = null;
  productPartsMap: { [caseId: string]: any[] } = {};
  quoteMap: { [caseId: string]: any } = {};
  quoteFormMap: { [caseId: string]: FormGroup } = {};

  saveCooldownMap: { [caseId: string]: boolean } = {};

  PricingOptionDD: DropDownValue = DropDownValue.getBlankObject();
  Math = Math;

  ngOnInit(): void {
    this.ticketGuid = sessionStorage.getItem('bq_ticketGuid') || '';
    if (!this.ticketGuid) {
      this.hasError = true;
      this.errorMessage = 'No ticket selected. Please go back and select a ticket.';
      return;
    }
    this.onPricingOptionSearch('');
    this.fetchTicketDetail();
  }

  onPricingOptionSearch(term: string): void {
    this.dropdownDataService.fetchDropDownData(DropDownType.PricingOption, term, {}).subscribe({
      next: v => { if (v) this.PricingOptionDD = v; },
      error: () => { this.PricingOptionDD = DropDownValue.getBlankObject(); }
    });
  }

  fetchTicketDetail(): void {
    this.isLoading = true;
    this.hasError = false;
    const req = [
      { Key: 'APIType', Value: 'GetTicketByGUID' },
      { Key: 'TicketGuid', Value: this.ticketGuid }
    ];
    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(req) }).subscribe({
      next: (value) => {
        try {
          const response = JSON.parse(value.toString());
          if (response.ReturnCode === '0' || response.ReturnCode === 0) {
            const data = JSON.parse(response?.ExtraData);
            let raw = data?.TicketDetail?.Ticket;
            if (Array.isArray(raw)) raw = raw[0];
            if (raw) {
              try {
                raw.parsedTicketBody = typeof raw.TicketBody === 'string'
                  ? JSON.parse(raw.TicketBody.replace(/\u00A0/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, ''))
                  : raw.TicketBody;
              }
              catch {
                raw.parsedTicketBody = null;
              }
              this.ticket = raw;
              const jobHeader = raw?.JobInfo?.JobHeader;
              if (jobHeader) {
                let details = jobHeader?.JobDetails?.JobDetail ?? [];
                if (!Array.isArray(details)) details = [details];
                this.products = details.map((jd: any) => this._mapJobDetail(jd, jobHeader));
                this.products.forEach(p => this._loadExistingQuote(p));
              }
              else {
                this.products = [];
              }
              if (this.products.length > 0) this.selectedProduct = this.products[0];
            } else {
              this.hasError = true;
              this.errorMessage = 'Ticket not found.';
            }
          } else {
            this.hasError = true;
            this.errorMessage = response.ReturnMessage || 'Failed to load ticket.';
          }
        } catch {
          this.hasError = true;
          this.errorMessage = 'Unexpected error loading ticket.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.errorMessage = 'Server error. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private _mapJobDetail(jd: any, jobHeader: any): any {
    let diagnosis = jd?.DiagnosisObject?.Diagnosis ?? null;
    return {
      caseId: jd.CaseId ?? '',
      caseGuid: jd.CaseGUID ?? '',
      caseDate: jd.CaseDate ?? null,
      jobStatus: jd.JobStatus ?? '',
      serial: jd.SerialNo1 ?? '',
      imei: jd.imei ?? '',
      imei2: jd.imei2 ?? '',
      productDescription: jd.productDescription ?? '',
      configCode: jd.ConfigurationCode ?? '',
      configDescription: jd.ConfigurationDescription ?? '',
      productImageURL: jd.productImageURL ?? '',
      productType: jd.ProductType ?? '',
      warrantyStatusCode: jd.warrantyStatusCode ?? '',
      warrantyStatusDescription: jd.warrantyStatusDescription ?? '',
      billingOption: jd?.DiagnosisObject?.Diagnosis?.BillingOption ?? '',
      repairType: jd?.DiagnosisObject?.Diagnosis?.RepairType ?? '',
      isContractApplicable: jd.IsContractApplicable === 'true' || jd.IsContractApplicable === '1',
      contractCode: jd.ContractCode ?? '',
      contractStartDate: jd.ContractStartDate ?? null,
      contractEndDate: jd.ContractEndDate ?? null,
      laborCovered: jd.laborCovered === 'true' || jd.laborCovered === '1',
      partCovered: jd.partCovered === 'true' || jd.partCovered === '1',
      locationCode: jd.LocationCode ?? '',
      quoteFlag: jd.QuoteFlag ?? 0,
      QUOTE: jd.QuotationObject?.Quotation ?? null,
      headerCaseId: jobHeader.HeaderCaseId ?? '',
      jobHeaderGuid: jobHeader.JOBHeaderGUID ?? '',
      jobDocStatus: jobHeader.JobDocStatus ?? '',
      jobDocDate: jobHeader.JobDocDate ?? null,
      _isBillable: diagnosis?.BillableRepair || null
    };
  }

  private _loadExistingQuote(product: any): void {
    const q = product.QUOTE;
    if (!q?.QuoteCode) return;
    const quote = {
      quoteGuid: q.QuoteGuid ?? uuidv4(),
      quoteCode: q.QuoteCode ?? 'NEW',
      quoteDate: q.QuoteDate ?? new Date(),
      quoteStatus: q.QuoteStatus ?? 'OPEN',
      baseAmount: parseFloat(q.TotalBaseAmount ?? 0),
      taxAmount: parseFloat(q.TotalTaxAmount ?? 0),
      taxableAmount: parseFloat(q.TotalTaxableAmount ?? 0),
      netAmount: parseFloat(q.TotalNetAmount ?? 0),
      discount: parseFloat(q.TotalDiscountAmount ?? 0),
      items: [] as any[],
      sliderIndex: 0,
      saved: true,
      caseGuid: product.caseGuid,
      locationCode: product.locationCode ?? ''
    };
    if (q?.QuotationDetails) {
      let raw = q.QuotationDetails;
      if (!Array.isArray(raw)) raw = [raw];
      quote.items = raw.map((item: any, idx: number) => this._mapQuoteItem(item, idx + 1));
    }
    this.quoteMap[product.caseId] = quote;
    this._ensureQuoteForm(product.caseId, quote.items);
  }

  private _mapQuoteItem(item: any, rowno: number): any {
    return {
      quotationDetailGuid: item.QuoteDetailGuid ?? uuidv4(),
      itemCode: item.ItemCode ?? '',
      itemDescription: item.ItemDescription ?? '',
      imageUrl: item.ImageUrl ?? '',
      itemType: item.ItemType ?? '',
      type: item.Type ?? '',
      partType: item.PartType ?? '',
      priceType: item.PriceType ?? 'StockPrice',
      unitPrice: parseFloat(item.UnitPrice ?? 0),
      baseAmount: parseFloat(item.BaseAmount ?? 0),
      discountAmount: parseFloat(item.DiscountAmount ?? 0),
      discountCouponCode: item.DiscountCouponCode ?? '',
      taxableAmount: parseFloat(item.TaxableAmount ?? 0),
      taxAmount: parseFloat(item.TaxAmount ?? 0),
      netAmount: parseFloat(item.NetAmount ?? 0),
      gstPercentage: parseFloat(item.GSTPercentage ?? 0),
      cgstPercentage: parseFloat(item.CGSTPercentage ?? 0),
      sgstPercentage: parseFloat(item.SGSTPercentage ?? 0),
      igstPercentage: parseFloat(item.IGSTPercentage ?? 0),
      cgstAmount: parseFloat(item.CGSTAmount ?? 0),
      sgstAmount: parseFloat(item.SGSTAmount ?? 0),
      igstAmount: parseFloat(item.IGSTAmount ?? 0),
      quantity: parseFloat(item.Quantity ?? 1),
      coverage: item.Coverage ?? '',
      coverageDescription: item.CoverageDescription ?? '',
      componentCode: item.ComponentCode ?? '',
      componentDescription: item.ComponentDescription ?? '',
      issueCode: item.IssueCode ?? '',
      issueDescription: item.IssueDescription ?? '',
      warranty: item.Warranty ?? '',
      warrantyDescription: item.WarrantyDescription ?? '',
      sacHsnCode: item.SAC_HSNCode ?? '',
      gstGroupCode: item.GSTGroupCode ?? '',
      gstJuridiction: item.GSTJuridiction ?? '',
      priceRangeApplicable: item.PriceRangeApplicable ?? 0,
      priceRangeStart: item.PriceRangeStart ?? 0,
      priceRangeEnd: item.PriceRangeEnd ?? 0,
      isContractApplicable: item.IsContractApplicable ?? '0',
      contractCode: item.ContractCode ?? '',
      contractStartDate: item.ContractStartDate ?? null,
      contractEndDate: item.ContractEndDate ?? null,
      exchangePrice: parseFloat(item.ExchangePrice ?? 0),
      stockPrice: parseFloat(item.StockPrice ?? 0),
      margin: parseFloat(item.Margin ?? 0),
      isDeleted: item.isDeleted ?? 0,
      rowno,
      editingPriceType: false
    };
  }

  private _ensureQuoteForm(caseId: string, items: any[]): void {
    if (!this.quoteFormMap[caseId]) {
      this.quoteFormMap[caseId] = this.fb.group({});
    }
    const form = this.quoteFormMap[caseId];
    items.forEach(item => {
      const key = `priceType_${item.rowno}`;
      if (!form.contains(key)) form.addControl(key, new FormControl(item.priceType));
    });
  }

  getQuoteForm(caseId: string): FormGroup {
    if (!this.quoteFormMap[caseId]) this.quoteFormMap[caseId] = this.fb.group({});
    return this.quoteFormMap[caseId];
  }

  getQuote(caseId: string): any { return this.quoteMap[caseId] ?? null; }
  getPartsForProduct(caseId: string): any[] { return this.productPartsMap[caseId] ?? []; }
  getVisibleItems(caseId: string): any[] { return (this.quoteMap[caseId]?.items ?? []).filter((i: any) => i.isDeleted == "0"); }

  isSaveDisabled(caseId: string): boolean {
    const quote = this.quoteMap[caseId];
    if (!quote) return true;
    if (this.saveCooldownMap[caseId]) return true;
    if (quote.saved) return true;
    const visible = this.getVisibleItems(caseId);
    if (visible.length === 0) return true;
    const total = visible.reduce((sum: number, i: any) => sum + (i.netAmount ?? 0), 0);
    if (total <= 0) return true;
    return false;
  }

  isLocked(product: any): boolean {
    return !!this.lockedProductCaseId && this.lockedProductCaseId !== product.caseId;
  }

  selectProduct(product: any): void {
    if (this.isLocked(product)) {
      this.toast.warning('Save or discard pending parts for the active device first.', 'Unsaved Parts', { closeButton: true, timeOut: 4000 });
      return;
    }
    this.selectedProduct = product;
    this.cdr.detectChanges();
  }

  openAddPartsPopup(product: any): void {
    if (this.isLocked(product)) {
      this.toast.warning('Save or discard pending parts for the active device first.', 'Unsaved Parts', { closeButton: true, timeOut: 4000 });
      return;
    }
    this.popupProduct = product;
    this.showAddPartsPopup = true;
    this.cdr.detectChanges();
  }

  closeAddPartsPopup(): void {
    this.showAddPartsPopup = false;
    this.popupProduct = null;
    this.cdr.detectChanges();
  }

  onPartsSubmitted(event: { product: any; parts: any[] }): void {
    const { product, parts } = event;
    const caseId = product.caseId;
    if (!this.productPartsMap[caseId]) this.productPartsMap[caseId] = [];
    parts.forEach(p => {
      if (!this.productPartsMap[caseId].some(x => x.number === p.number)) {
        this.productPartsMap[caseId].push(p);
      }
    });
    if (this.productPartsMap[caseId].length > 0) this.lockedProductCaseId = caseId;
    this.closeAddPartsPopup();
    this._fetchPriceAndBuildQuote(product);
  }

  private _fetchPriceAndBuildQuote(product: any): void {
    const caseId = product.caseId;
    const parts = this.productPartsMap[caseId] ?? [];
    if (!parts.length) return;
    const xml = this._buildPartListXml(parts, product);
    const req = [
      { Key: 'ApiType', Value: 'GetPriceGSTDetails' },
      { Key: 'CompanyCode', Value: glob.getCompanyCode() },
      { Key: 'CaseGuid', Value: product.caseGuid },
      { Key: 'ItemType', Value: 'MaterialCode' },
      { Key: 'ItemList', Value: xml }
    ];
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(req) }).subscribe({
      next: (value) => {
        this.spinner.hide();
        const response = JSON.parse(value.toString());
        if (response.ReturnCode === '0') {
          const retValue = JSON.parse(response.ExtraData);
          this._mergeIncomingItems(caseId, product, retValue);
        } else {
          this.toast.error('Failed to fetch price details.', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: () => { this.spinner.hide(); this.toast.error('Server error fetching prices.'); }
    });
  }

  private _mergeIncomingItems(caseId: string, product: any, retValue: any): void {
    if (!this.quoteMap[caseId]) {
      this.quoteMap[caseId] = {
        quoteGuid: uuidv4(), quoteCode: 'NEW', quoteDate: new Date(),
        quoteStatus: 'OPEN', baseAmount: 0, taxAmount: 0, taxableAmount: 0,
        netAmount: 0, discount: 0, items: [], sliderIndex: 0, saved: false,
        caseGuid: product.caseGuid, locationCode: product.locationCode ?? ''
      };
    }
    const quote = this.quoteMap[caseId];
    let incoming: any[] = Array.isArray(retValue.QuoteItem) ? retValue.QuoteItem : [retValue.QuoteItem];
    incoming.forEach(item => {
      if (!quote.items.some((i: any) => i.itemCode === item.ItemCode)) {
        const rowno = quote.items.length + 1;
        const mapped = this._mapQuoteItem(item, rowno);
        this._calculateItem(mapped);
        quote.items.push(mapped);
      }
    });
    this._ensureQuoteForm(caseId, quote.items);
    this._recalcTotals(caseId);
    quote.saved = false;
    delete this.productPartsMap[caseId];
    if (this.lockedProductCaseId === caseId) this.lockedProductCaseId = null;
  }

  private _buildPartListXml(parts: any[], product: any): string {
    const rawData = {
      rows: parts.map(item => ({
        row: {
          ItemType: 'Material',
          ItemCode: item.number,
          ExchangePrice: this.dynamicService.removeCommas(item.exchangePrice ?? '0'),
          StockPrice: this.dynamicService.removeCommas(item.stockPrice ?? '0'),
          ImageUrl: item.imageUrl ?? '',
          Type: item.type ?? '',
          DiscountCouponCode: '',
          Billable: item.billable ? 1 : 0,
          Coverage: product.billingOption ?? '',
          CoverageDescription: product.billingOption ?? '',
          ItemDescription: item.description ?? '',
          Warranty: product.warrantyStatusCode ?? '',
          WarrantyDescription: product.warrantyStatusDescription ?? '',
          ComponentCode: '', ComponentDesc: '', IssueCode: '', IssueDesc: '',
          Quantity: 1,
          PriceType: item.PriceType ?? 'StockPrice',
          UnitPrice: item.UnitPrice ?? 0
        }
      }))
    };
    const builder = new xml2js.Builder();
    return builder.buildObject(rawData)
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '')
      .replace(/(\r\n|\n|\r|\t)/gm, '');
  }

  private _calculateItem(item: any): void {
    const r = (v: number) => isNaN(v) ? 0 : Math.round(v * 100) / 100;
    const discount = parseFloat(item.discountAmount ?? 0);
    if (discount < 0) { item.discountAmount = 0; }
    if (discount > item.unitPrice) { item.discountAmount = 0; }
    item.baseAmount = r(item.unitPrice * item.quantity);
    item.taxableAmount = r(item.baseAmount - item.discountAmount);
    item.cgstAmount = r(item.taxableAmount * (item.cgstPercentage / 100));
    item.sgstAmount = r(item.taxableAmount * (item.sgstPercentage / 100));
    item.igstAmount = r(item.taxableAmount * (item.igstPercentage / 100));
    item.taxAmount = r(item.taxableAmount * (item.gstPercentage / 100));
    item.netAmount = r(item.taxableAmount + item.taxAmount);
  }

  private _recalcTotals(caseId: string): void {
    const quote = this.quoteMap[caseId];
    if (!quote) return;
    quote.baseAmount = 0; quote.taxAmount = 0; quote.taxableAmount = 0; quote.netAmount = 0; quote.discount = 0;
    quote.items.filter((i: any) => i.isDeleted == "0").forEach((item: any) => {
      quote.baseAmount += item.baseAmount;
      quote.taxAmount += item.taxAmount;
      quote.taxableAmount += item.taxableAmount;
      quote.discount += item.discountAmount;
      quote.netAmount += item.netAmount;
    });
    ['baseAmount', 'taxAmount', 'taxableAmount', 'discount', 'netAmount'].forEach(k => {
      quote[k] = Math.round(quote[k] * 100) / 100;
    });
  }

  discardPendingParts(caseId: string): void {
    delete this.productPartsMap[caseId];
    if (this.lockedProductCaseId === caseId) this.lockedProductCaseId = null;
    this.toast.info('Pending parts discarded.', '', { timeOut: 2500 });
    this.cdr.detectChanges();
  }

  sliderPrev(caseId: string): void {
    const q = this.quoteMap[caseId];
    if (q && q.sliderIndex > 0) { q.sliderIndex--; this.cdr.detectChanges(); }
  }

  sliderNext(caseId: string): void {
    const q = this.quoteMap[caseId];
    if (!q) return;
    const visible = this.getVisibleItems(caseId);
    if (q.sliderIndex + 2 < visible.length) { q.sliderIndex++; this.cdr.detectChanges(); }
  }

  toggleDeleteItem(caseId: string, item: any): void {
    item.isDeleted = item.isDeleted ? 0 : 1;
    this._calculateItem(item);
    this._recalcTotals(caseId);
    this.quoteMap[caseId].saved = false;
    this.cdr.detectChanges();
  }

  onUnitPriceChange(caseId: string, item: any): void {
    if (item.unitPrice == null) { this.toast.error('Invalid unit price.'); return; }
    item.unitPrice = parseFloat(Number(item.unitPrice).toFixed(2));
    if (item.priceRangeApplicable == '1' && item.unitPrice < item.priceRangeStart) {
      this.toast.error(`Unit price below range start (${item.priceRangeStart}) for ${item.itemCode}`); return;
    }
    if (item.priceRangeApplicable == '1' && item.unitPrice > item.priceRangeEnd) {
      this.toast.error(`Unit price above range end (${item.priceRangeEnd}) for ${item.itemCode}`); return;
    }
    this._calculateItem(item);
    this._recalcTotals(caseId);
    this.quoteMap[caseId].saved = false;
    this.cdr.detectChanges();
  }

  onDiscountAmountChange(caseId: string, item: any): void {
    item.discountAmount = parseFloat(Number(item.discountAmount ?? 0).toFixed(2));
    if (item.discountAmount < 0) { this.toast.error(`Discount cannot be negative for ${item.itemCode}`); item.discountAmount = 0; return; }
    if (item.discountAmount > item.unitPrice) { this.toast.error(`Discount exceeds unit price for ${item.itemCode}`); item.discountAmount = 0; return; }
    this._calculateItem(item);
    this._recalcTotals(caseId);
    this.quoteMap[caseId].saved = false;
    this.cdr.detectChanges();
  }

  async onPriceTypeChange(caseId: string, item: any, newType: string): Promise<void> {
    item.priceType = newType;
    item.editingPriceType = false;
    this.spinner.show();
    try {
      const data = { Content: JSON.stringify({ partNumbers: [item.itemCode] }) };
      const value = await this.gsxService.getPartsSummary(data).toPromise();
      const response = JSON.parse(value.toString());
      const matched = response.find((x: any) => x?.number === item.itemCode);
      if (matched) {
        if (newType === 'ExchangePrice') item.unitPrice = this.dynamicService.removeCommas(matched.exchangePrice ?? 0);
        else if (newType === 'StockPrice') item.unitPrice = this.dynamicService.removeCommas(matched.stockPrice ?? 0);
        else {
          const opt = matched.pricingOptions?.find((x: any) => x?.description === newType);
          item.unitPrice = this.dynamicService.removeCommas(opt?.price ?? 0);
        }
      }
    } catch { } finally { this.spinner.hide(); }
    this._calculateItem(item);
    this._recalcTotals(caseId);
    this.quoteMap[caseId].saved = false;
    this.cdr.detectChanges();
  }

  saveQuote(product: any): void {
    const caseId = product.caseId;
    if (this.isSaveDisabled(caseId)) return;
    const quote = this.quoteMap[caseId];
    if (!quote) return;

    this.saveCooldownMap[caseId] = true;
    setTimeout(() => {
      this.saveCooldownMap[caseId] = false;
      this.cdr.detectChanges();
    }, 5000);

    const valid = quote.items.filter((i: any) => i.isDeleted == "0").every((item: any) => {
      if (item.discountAmount > item.unitPrice) { this.toast.error(`Discount exceeds unit price for ${item.itemCode}`); return false; }
      if (item.taxAmount < 0) { this.toast.error(`Invalid tax for ${item.itemCode}`); return false; }
      return true;
    });
    if (!valid) return;

    const req = [
      { Key: 'ApiType', Value: 'SaveQuote4Job' },
      { Key: 'CompanyCode', Value: glob.getCompanyCode() },
      { Key: 'CaseGuid', Value: product.caseGuid },
      { Key: 'QuoteCode', Value: quote.quoteCode },
      { Key: 'QuoteGuid', Value: quote.quoteGuid },
      { Key: 'QuoteDate', Value: quote.quoteDate },
      { Key: 'LocationCode', Value: product.locationCode ?? '' },
      { Key: 'RetailCustomerCode', Value: this.ticket?.CustomerCode ?? '' },
      { Key: 'TotalBaseAmount', Value: quote.baseAmount },
      { Key: 'TotalDiscountAmount', Value: quote.discount },
      { Key: 'TotalTaxableAmount', Value: quote.taxableAmount },
      { Key: 'TotalTaxAmount', Value: quote.taxAmount },
      { Key: 'TotalNetAmount', Value: quote.netAmount },
      { Key: 'QuoteStatus', Value: quote.quoteStatus ?? 'OPEN' },
      { Key: 'RejectReason', Value: '' },
      { Key: 'QuotationDetails', Value: this._buildSaveXml(quote) }
    ];
    this.spinner.show();
    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(req) }).subscribe({
      next: (value) => {
        this.spinner.hide();
        const response = JSON.parse(value.toString());
        if (response.ReturnCode === '0') {
          quote.saved = true;
          this.toast.success('Quote saved successfully.', '', { timeOut: 3000 });
        } else {
          this.toast.error(response.ErrorMessage || 'Save failed.', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: () => { this.spinner.hide(); this.toast.error('Server error saving quote.'); }
    });
  }

  private _buildSaveXml(quote: any): string {
    const rawData = {
      rows: quote.items.map((item: any) => ({
        row: {
          QuoteDetailGuid: item.quotationDetailGuid,
          QuoteGUID: quote.quoteGuid,
          ItemType: item.itemType,
          DiscountCouponCode: item.discountCouponCode,
          Type: item.type,
          ItemCode: item.itemCode,
          ItemDescription: item.itemDescription,
          ImageUrl: item.imageUrl,
          ComponentCode: item.componentCode,
          ComponentDescription: item.componentDescription,
          IssueCode: item.issueCode,
          IssueDescription: item.issueDescription,
          Coverage: item.coverage,
          CoverageDescription: item.coverageDescription,
          Warranty: item.warranty,
          WarrantyDescription: item.warrantyDescription,
          GSTGroupCode: item.gstGroupCode ?? '',
          GSTJuridiction: item.gstJuridiction ?? '',
          SAC_HSNCode: item.sacHsnCode ?? '',
          Quantity: item.quantity,
          UnitPrice: item.unitPrice,
          BaseAmount: item.baseAmount,
          DiscountAmount: item.discountAmount,
          TaxableAmount: item.taxableAmount,
          TaxPercentage: item.gstPercentage,
          NetAmount: item.netAmount,
          TaxAmount: item.taxAmount,
          PriceType: item.priceType,
          GSTPercentage: item.gstPercentage,
          CGSTPercentage: item.cgstPercentage,
          SGSTPercentage: item.sgstPercentage,
          IGSTPercentage: item.igstPercentage,
          CGSTAmount: item.cgstAmount,
          SGSTAmount: item.sgstAmount,
          IGSTAmount: item.igstAmount,
          StockPrice: item.stockPrice,
          ExchangePrice: item.exchangePrice,
          Margin: item.margin,
          isDeleted: item.isDeleted ?? 0,
          PriceRangeApplicable: item.priceRangeApplicable,
          PriceRangeStart: item.priceRangeStart,
          PriceRangeEnd: item.priceRangeEnd,
          IsContractApplicable: item.isContractApplicable,
          ContractCode: item.contractCode,
          ContractStartDate: item.contractStartDate,
          ContractEndDate: item.contractEndDate,
          PartType: item.partType
        }
      }))
    };
    const builder = new xml2js.Builder();
    return builder.buildObject(rawData)
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '')
      .replace(/(\r\n|\n|\r|\t)/gm, '')
      .replace(/[^\x20-\x7E]/g, '');
  }

  getTicketStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'NEW': return 'bq-ts--new';
      case 'IN-PROGRESS': return 'bq-ts--inprogress';
      case 'CLOSED': return 'bq-ts--closed';
      default: return 'bq-ts--new';
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/ticketing-system']);
  }

  openJobDetail(caseGuid: string): void {
    this.router.navigate(['/auth/' + glob.getCompanyCode() + '/repair-process'], { queryParams: { guid: caseGuid } });
  }
}