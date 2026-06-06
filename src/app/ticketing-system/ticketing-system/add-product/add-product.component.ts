import { Component, Inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { AddProduct } from './AddProduct.metadata';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  product: AddProduct = new AddProduct();
  isSearching: boolean = false;
  serialNumber: string = '';
  productList: any[] = [];
  StoreAllResponse: any = {};
  unitReceivedDateTime: Date = new Date();

  appleCare: string = '';
  partCover: string = '';
  laborCover: string = '';
  onSiteCoverage: string = '';

  days: number = 0;
  day1: any;
  day2: any;

  displayedColumns: string[] = [
    'image',
    'serial',
    'product',
    'config',
    'imei',
    'warranty',
    'purchaseDate',
    'coverageEnd',
    'country',
    'carrier',
    'soldTo',
    'laborCover',
    'partCover',
    'onsite',
    'appleCare',
    'action'
  ];

  constructor(
    private toasty: ToastrService,
    private gsxService: GsxService,
    private ngxSpinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddProductComponent>
  ) { }

  ngOnInit(): void {
    this.product = new AddProduct();
  }

  Search_Serialno() {
    if (this.isSearching) return;
    if (!this.serialNumber?.trim()) {
      this.toasty.warning('Please enter a serial number');
      return;
    }

    const alreadyExists = this.productList.some(
      p => p.serial?.toLowerCase() === this.serialNumber.trim().toLowerCase()
    );
    if (alreadyExists) {
      this.toasty.warning('This serial number is already added');
      return;
    }
    this.isSearching = true;
    this.ngxSpinnerService.show();
    const searchData = {
      unitReceivedDateTime: this.unitReceivedDateTime,
      device: { id: this.serialNumber.trim() }
    };
    const contentRequest = { content: JSON.stringify(searchData) };

    this.gsxService.getDeviceDetails(contentRequest).subscribe({
      next: (value) => {
        this.StoreAllResponse = JSON.parse(value.toString());
        if (this.StoreAllResponse['errors'] != null && this.StoreAllResponse['errors'] != undefined) {
          this.toasty.error(
            this.StoreAllResponse['errors'][0].code + ' - ' + this.StoreAllResponse['errors'][0].message
          );
          this.ngxSpinnerService.hide();
          return;
        }
        const device = this.StoreAllResponse.device;
        const warranty = device?.warrantyInfo;
        const identifiers = device?.identifiers;
        const activation = device?.activationDetails;
        this.product = new AddProduct();
        this.product.ImageUrl = device?.productImageURL;
        this.product.ProductDescription = device?.productDescription;
        this.product.ConfigCode = device?.configCode;
        this.product.ConfigDescription = device?.configDescription;
        this.product.SoldToName = device?.soldToName;
        this.product.Imei = identifiers?.imei;
        this.product.Meid = identifiers?.meid;
        this.product.GsxWarrantyStatusCode = warranty?.warrantyStatusCode;
        this.product.GsxWarrantyStatusDescription = warranty?.warrantyStatusDescription;
        this.product.OnsiteCoverage = warranty?.onsiteCoverage;
        this.product.LaborCovered = warranty?.laborCovered;
        this.product.PartCovered = warranty?.partCovered;
        this.product.PurchaseCountryDesc = warranty?.purchaseCountryDesc;
        this.product.PurchaseCountryCode = warranty?.purchaseCountryCode;
        this.product.DeviceCoverageDetails = warranty?.deviceCoverageDetails;
        this.product.PurchaseDate = warranty?.purchaseDate;
        this.product.CoverageEndDate = warranty?.coverageEndDate;
        this.product.CoverageStartDate = warranty?.purchaseDate
          ? warranty.purchaseDate.toString().replace('Z', '')
          : '';

        // Eligibility
        this.checkPartCover();
        this.checkLaborCover();
        this.checkCoverageCover();
        this.DateCalculate();

        this.productList.push({
          serial: identifiers?.serial || this.serialNumber,
          imei: identifiers?.imei || '—',
          imei2: identifiers?.imei2 || '—',
          productDescription: device?.productDescription,
          configCode: device?.configCode,
          configDescription: device?.configDescription,
          productImageURL: device?.productImageURL,
          warrantyStatusCode: warranty?.warrantyStatusCode,
          warrantyStatusDescription: warranty?.warrantyStatusDescription,
          purchaseDate: warranty?.purchaseDate,
          coverageEndDate: warranty?.coverageEndDate,
          deviceCoverageDetails: warranty?.deviceCoverageDetails,
          purchaseCountryCode: warranty?.purchaseCountryCode,
          purchaseCountryDesc: warranty?.purchaseCountryDesc,
          laborCovered: warranty?.laborCovered,
          partCovered: warranty?.partCovered,
          onsiteCoverage: warranty?.onsiteCoverage,
          soldToName: device?.soldToName,
          carrierName: activation?.carrierName || '—',
          appleCareEligible: this.appleCare,
          laborCoverLabel: this.laborCover,
          partCoverLabel: this.partCover,
          onsiteLabel: this.onSiteCoverage,
          _raw: this.product
        });
        this.productList = [...this.productList];
        this.serialNumber = '';
        this.toasty.success('Serial number added successfully');
        this.ngxSpinnerService.hide();
        this.getFindMyStatus(identifiers?.serial || this.serialNumber);
        this.isSearching = false;
      },
      error: (err) => {
        this.ngxSpinnerService.hide();
        console.error(err);
        this.toasty.error('Error fetching device details');
        this.isSearching = false;  // ← ADD THIS LINE
      }
    });
  }



  getFindMyStatus(serial: string) {
    const searchData = {
      unitReceivedDateTime: this.unitReceivedDateTime,
      repairType: 'SVNR',
      device: { id: serial }
    };
    const contentRequest = { content: JSON.stringify(searchData) };

    this.gsxService.getRepairEligibilityWOJob(contentRequest).subscribe({
      next: (value) => {
        const response = JSON.parse(value.toString());

        if (response['errors'] != null && response['errors'] != undefined) {
          this.toasty.error(response['errors'][0].code + ' - ' + response['errors'][0].message);
          return;
        }
        const messageObj = response?.eligibilityDetails?.outcome?.[0]?.reasons?.[0]?.messages?.[0];
        const messageText = messageObj?.description ?? '';
        if (typeof messageText === 'string' && messageText.includes('Find My for this device is active')) {
          this.toasty.show(messageText);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  removeProduct(index: number) {
    this.productList.splice(index, 1);
    this.productList = [...this.productList];
  }

  submitProducts() {
    if (this.productList.length === 0) {
      this.toasty.warning('No products to submit');
      return;
    }
    this.dialogRef.close({ success: true, products: this.productList });
  }


  checkLaborCover() {
    this.laborCover = (!this.product?.LaborCovered) ? 'Not Eligible' : 'Eligible';
  }

  checkPartCover() {
    this.partCover = (!this.product?.PartCovered) ? 'Not Eligible' : 'Eligible';
  }

  checkCoverageCover() {
    this.onSiteCoverage = (!this.product?.OnsiteCoverage) ? 'Not Eligible' : 'Eligible';
  }

  DateCalculate() {
    if (!this.product.PurchaseDate) {
      this.appleCare = 'Not Eligible';
      return;
    }
    this.day1 = new Date(this.product.PurchaseDate).toISOString().split('T')[0];
    this.day2 = new Date().toISOString().split('T')[0];
    this.days = (new Date(this.day2).getTime() - new Date(this.day1).getTime()) / (1000 * 3600 * 24);
    this.appleCare = this.days <= 60 ? 'Eligible' : 'Not Eligible';
    if (this.days <= 60) this.toasty.info('Eligible For Apple Care');
  }

  testExcelUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      // Reset file input early so the same file can be re-uploaded if needed
      event.target.value = '';

      // ── 1. Validate that a SerialNumber column exists ──────────────────────
      const hasSerialColumn = json.length > 0 &&
        json.some(r => r.SerialNumber || r.SerialNo || r.serial || r.Serial);

      if (!hasSerialColumn) {
        this.toasty.error('Invalid file: No SerialNumber column found');
        return;
      }

      // ── 2. Extract serial values ───────────────────────────────────────────
      const allSerials: string[] = json
        .map(r => r.SerialNumber || r.SerialNo || r.serial || r.Serial)
        .filter(s => !!s)
        .map(s => s.toString().trim());

      // ── 3. Enforce max 30 rows ─────────────────────────────────────────────
      if (allSerials.length > 30) {
        this.toasty.error(`Import limit exceeded: file has ${allSerials.length} serials. Maximum allowed is 30.`);
        return;
      }

      // ── 4. Filter out already-added serials ───────────────────────────────
      const newSerials = allSerials.filter(
        s => !this.productList.some(
          p => p.serial?.toLowerCase() === s.toLowerCase()
        )
      );

      if (newSerials.length === 0) {
        this.toasty.warning('All serials in the file are already added');
        return;
      }

      // ── 5. Feed each serial into Search_Serialno sequentially ─────────────
      this.toasty.info(`Importing ${newSerials.length} device(s)...`);
      this.importSerialsSequentially(newSerials);
    };

    reader.readAsArrayBuffer(file);
  }

  private async importSerialsSequentially(serials: string[]): Promise<void> {
    for (const serial of serials) {
      this.serialNumber = serial;
      await this.searchSerialAsync();
    }
  }

  private searchSerialAsync(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.serialNumber?.trim()) { resolve(); return; }

      const alreadyExists = this.productList.some(
        p => p.serial?.toLowerCase() === this.serialNumber.trim().toLowerCase()
      );
      if (alreadyExists) { resolve(); return; }

      this.isSearching = true;
      const searchData = {
        unitReceivedDateTime: this.unitReceivedDateTime,
        device: { id: this.serialNumber.trim() }
      };
      const contentRequest = { content: JSON.stringify(searchData) };

      this.gsxService.getDeviceDetails(contentRequest).subscribe({
        next: (value) => {
          this.StoreAllResponse = JSON.parse(value.toString());

          if (this.StoreAllResponse['errors']?.[0]) {
            this.toasty.error(
              `${this.serialNumber}: ${this.StoreAllResponse['errors'][0].code} - ${this.StoreAllResponse['errors'][0].message}`
            );
            this.isSearching = false;
            resolve();
            return;
          }

          const device = this.StoreAllResponse.device;
          const warranty = device?.warrantyInfo;
          const identifiers = device?.identifiers;
          const activation = device?.activationDetails;

          this.product = new AddProduct();
          this.product.ImageUrl = device?.productImageURL;
          this.product.ProductDescription = device?.productDescription;
          this.product.ConfigCode = device?.configCode;
          this.product.ConfigDescription = device?.configDescription;
          this.product.SoldToName = device?.soldToName;
          this.product.Imei = identifiers?.imei;
          this.product.Meid = identifiers?.meid;
          this.product.GsxWarrantyStatusCode = warranty?.warrantyStatusCode;
          this.product.GsxWarrantyStatusDescription = warranty?.warrantyStatusDescription;
          this.product.OnsiteCoverage = warranty?.onsiteCoverage;
          this.product.LaborCovered = warranty?.laborCovered;
          this.product.PartCovered = warranty?.partCovered;
          this.product.PurchaseCountryDesc = warranty?.purchaseCountryDesc;
          this.product.PurchaseCountryCode = warranty?.purchaseCountryCode;
          this.product.DeviceCoverageDetails = warranty?.deviceCoverageDetails;
          this.product.PurchaseDate = warranty?.purchaseDate;
          this.product.CoverageEndDate = warranty?.coverageEndDate;
          this.product.CoverageStartDate = warranty?.purchaseDate
            ? warranty.purchaseDate.toString().replace('Z', '') : '';

          this.checkPartCover();
          this.checkLaborCover();
          this.checkCoverageCover();
          this.DateCalculate();

          this.productList.push({
            serial: identifiers?.serial || this.serialNumber,
            imei: identifiers?.imei || '—',
            imei2: identifiers?.imei2 || '—',
            productDescription: device?.productDescription,
            configCode: device?.configCode,
            configDescription: device?.configDescription,
            productImageURL: device?.productImageURL,
            warrantyStatusCode: warranty?.warrantyStatusCode,
            warrantyStatusDescription: warranty?.warrantyStatusDescription,
            purchaseDate: warranty?.purchaseDate,
            coverageEndDate: warranty?.coverageEndDate,
            deviceCoverageDetails: warranty?.deviceCoverageDetails,
            purchaseCountryCode: warranty?.purchaseCountryCode,
            purchaseCountryDesc: warranty?.purchaseCountryDesc,
            laborCovered: warranty?.laborCovered,
            partCovered: warranty?.partCovered,
            onsiteCoverage: warranty?.onsiteCoverage,
            soldToName: device?.soldToName,
            carrierName: activation?.carrierName || '—',
            appleCareEligible: this.appleCare,
            laborCoverLabel: this.laborCover,
            partCoverLabel: this.partCover,
            onsiteLabel: this.onSiteCoverage,
            _raw: this.product
          });
          this.productList = [...this.productList];
          this.serialNumber = '';
          this.isSearching = false;
          this.getFindMyStatus(identifiers?.serial || this.serialNumber);
          resolve();
        },
        error: (err) => {
          console.error(err);
          this.toasty.error(`Error fetching: ${this.serialNumber}`);
          this.isSearching = false;
          resolve();
        }
      });
    });
  }
}