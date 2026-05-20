import { Component, Inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { AddProduct } from './AddProduct.metadata';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
}