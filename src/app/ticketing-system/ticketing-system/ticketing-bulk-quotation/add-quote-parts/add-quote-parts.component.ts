import {
  Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges
} from '@angular/core';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as glob from 'src/app/config/global';

@Component({
  selector: 'app-add-quote-parts',
  templateUrl: './add-quote-parts.component.html',
  styleUrls: ['./add-quote-parts.component.css']
})
export class AddQuotePartsComponent implements OnInit, OnChanges {

  @Input() product: any;
  @Output() partsSubmitted = new EventEmitter<{ product: any; parts: any[] }>();
  @Output() closed = new EventEmitter<void>();

  typeSelected = 'ball-clip-rotate';
  partList: any[] = [];
  searchText: string = '';
  showOnlySelected: boolean = false;
  selectedCount: number = 0;

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private gsxService: GsxService,
    private dynamicService: DynamicService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    if (this.product) {
      this.loadParts();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && !changes['product'].firstChange && this.product) {
      this.resetState();
      this.loadParts();
    }
  }

  private resetState(): void {
    this.partList = [];
    this.searchText = '';
    this.showOnlySelected = false;
    this.selectedCount = 0;
    this.hasError = false;
    this.errorMessage = '';
  }

  loadParts(): void {
    this.isLoading = true;
    this.hasError = false;

    const requestObject = this.buildPartSummaryRequest();
    const data = { Content: JSON.stringify(requestObject) };

    this.gsxService.getPartsSummary(data).subscribe({
      next: (value) => {
        try {
          const response = JSON.parse(value.toString());
          if (response.errors?.length) {
            this.hasError = true;
            this.errorMessage = response.errors.map((e: any) => `${e.code} - ${e.message}`).join('; ');
          } else {
            this.partList = this.sortArrayOfObjects(response, 'selected', 'ascending');
            this.loadResourceList();
          }
        } catch (e) {
          this.hasError = true;
          this.errorMessage = 'Unexpected error parsing parts.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.hasError = true;
        this.errorMessage = 'Server error loading parts. Please retry.';
        this.isLoading = false;
      }
    });
  }

  private buildPartSummaryRequest(): any {
    const repairType = this.product?.repairType ?? '';
    const serial = this.product?.serial ?? '';
    const billingOption = this.product?.billingOption ?? '';

    const isWUMS = repairType === 'WUMS';

    if (isWUMS) {
      return {
        wholeUnitPartsOnly: true,
        repairType,
        devices: [{ id: serial }],
        coverageOption: billingOption,
        componentIssues: null
      };
    }
    return {
      repairType,
      devices: [{ id: serial }]
    };
  }

  private loadResourceList(): void {
    const productCategory = (this.product?.productDescription ?? '').split(' ')[0];
    const requestData = [
      { Key: 'APIType', Value: 'GetResourcePriceList4Quote' },
      { Key: 'ProductCategory', Value: productCategory }
    ];

    this.dynamicService.getDynamicDetaildata({ content: JSON.stringify(requestData) }).subscribe({
      next: (value) => {
        try {
          const response = JSON.parse(value.toString());
          if (response.ReturnCode === '0' || response.ReturnCode === 0) {
            const data = JSON.parse(response?.ExtraData);
            let resources = data?.Resource?.Resource ?? [];
            if (!Array.isArray(resources)) resources = [resources];
            for (const item of resources) {
              this.partList.push({
                number: item.MaterialCode,
                description: item.MaterialName,
                typeDescription: item.ItemType,
                imageUrl: '',
                selected: false,
                inSearch: false
              });
            }
          }
        } catch (e) {
          console.error('ResourceList parse error', e);
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSearchChange(text: string): void {
    for (const item of this.partList) {
      item.inSearch = text.length > 1 &&
        (item.description?.toLowerCase().includes(text.toLowerCase()) ||
          item.number?.toLowerCase().includes(text.toLowerCase()));
    }
  }

  isVisible(item: any): boolean {
    if (this.showOnlySelected) return !!item.selected;
    if (this.searchText.length > 1) return !!item.selected || !!item.inSearch;
    return true;
  }

  updateSelectedCount(): void {
    this.selectedCount = this.partList.filter(x => x.selected).length;
  }

  onSubmit(): void {
    const selected = this.partList.filter(x => x.selected).map(item => ({
      ...item,
      billable: true,
      PriceType: this.product?.billingOption === 'VMI_RED' ? 'StockPrice' : 'ExchangePrice',
      ItemCode: item.number
    }));

    if (!selected.length) {
      this.toast.warning('Please select at least one part before submitting.', 'No parts selected');
      return;
    }

    this.partsSubmitted.emit({ product: this.product, parts: selected });
  }

  onClose(): void {
    this.closed.emit();
  }

  private sortArrayOfObjects<T>(data: T[], key: keyof T, dir: 'ascending' | 'descending'): T[] {
    return data.slice().sort((a, b) => {
      if (a[key] === b[key]) return 0;
      return a[key] > b[key]
        ? (dir === 'ascending' ? 1 : -1)
        : (dir === 'ascending' ? -1 : 1);
    });
  }
}