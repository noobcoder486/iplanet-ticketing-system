import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AppRouter, BreadCumb, FieldType } from "src/app/config/comman.const";
import { Controller } from "src/app/config/global";
import { ModuleFieldMetaData } from "../models/modulefield.metadata";
import { ApiService } from "./api.service";
import { ToastrService } from 'ngx-toastr';
import { UnderscoreService } from "./underscore.service";
import { Location } from '@angular/common';
import { filter } from "rxjs";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  constructor(
    private apiService: ApiService,
    private msgService: ToastrService,
    private underScore: UnderscoreService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // getRoles() {
  //   return this.apiService.getData(Controller.Register + 'GetRoles()');
  // }

  getAllModules() {
    return this.apiService.getData(Controller.SystemAdministrator + 'GetAllModuleList()');
  }

  phoneNumberRegex(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /* Method to create base64Data Url from fetched image */
  getBase64Image(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    let dataURL: string = canvas.toDataURL("image/png");
    //this.base64DefaultURL = dataURL;
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  getCurrentModuleField() {
    let entityField = JSON.parse(sessionStorage.getItem("ModuleEntityField")) as ModuleFieldMetaData[];
    entityField = this.underScore.orderBy(entityField, "Sequence");
    let currentModuleId = parseInt(JSON.parse(sessionStorage.getItem('CurrentModuleId')));
    return entityField.filter(x => x.ModuleId == currentModuleId);
  }

  getCurrentModuleFieldOnly() {
    let entityField = JSON.parse(sessionStorage.getItem("ModuleEntityField")) as ModuleFieldMetaData[];
    let currentModuleId = parseInt(JSON.parse(sessionStorage.getItem('CurrentModuleId')));
    return entityField.filter(x => x.ModuleId == currentModuleId);
  }

  createFormControl(entityField: ModuleFieldMetaData[], form) {
    let group = {}
    entityField.forEach(ctrl => {
      group[ctrl.FieldName] = new FormControl(ctrl.DefaultValue);
    })
    form = new FormGroup(group);
    return form;
  }

  setFormValidation(entityField: ModuleFieldMetaData[], form) {
    for (var field in form.controls) {
      let filter = entityField.find(x => x.FieldName == field);
      const validators = [];
      if (filter != undefined) {
        if (filter.isMendatory) {
          validators.push(Validators.required);
        }
        if (filter.FieldType == FieldType.Email) {
          validators.push(Validators.email);
        }
        if (filter.MinSize != null && filter.MinSize != 0) {
          validators.push(Validators.minLength(filter.MinSize));
        }
        if (filter.MaxSize != null && filter.MaxSize != 0) {
          validators.push(Validators.maxLength(filter.MaxSize));
        }
      }

      form.get(field).setValidators(validators);
      form.get(field).updateValueAndValidity();
    }
    return form;
  }

  showFormValidationMessage(entityField: ModuleFieldMetaData[], form) {
    for (var field in form.controls) {
      let filter = entityField.find(x => x.FieldName == field);

      if (filter != undefined) {
        if (form.get(field).errors?.required) {
          this.msgService.error(filter.FieldLabel + ' is required!');
        }
        else if (form.get(field).errors?.email) {
          this.msgService.error(filter.FieldLabel + ' email format is not correct!');
        }
        else if (form.get(field).errors?.minlength) {
          this.msgService.error('Minimum ' + filter.MinSize + ' characters is required in ' + filter.FieldLabel);
        }
        else if (form.get(field).errors?.maxlength) {
          this.msgService.error('Maximum ' + filter.MaxSize + ' characters allowed in ' + filter.FieldLabel);
        }
      }

    }
  }

  getAllCtrl(sections) {
    let ctrl = [];
    sections = sections.filter(x => x.SectionType != 'GRID');
    for (let section of sections) {
      for (let sect of section.FormDetail) {
        ctrl.push(sect);
      }
    }
    return ctrl;
  }

  getCtrlName(control, code) {
    let ctrl = control.find(x => x.ControlName == code);
    return ctrl != undefined ? ctrl.DisplayLabel : code;
  }

  showFormValidationMsg(form: FormGroup, sections) {
    let control = this.getAllCtrl(sections);

    for (var field in form.controls) {
      let ctrl = form.get(field);
      let name = this.getCtrlName(control, field);
      if (ctrl.errors?.required) {
        this.msgService.error(name + ' is required!');
      }
      else if (ctrl.errors?.email) {
        this.msgService.error('Email format of ' + name + ' is not correct!');
      }
      else if (ctrl.errors?.minlength) {
        this.msgService.error('Minimum ' + name + ' characters is required in ' + name);
      }
      else if (ctrl.errors?.maxlength) {
        this.msgService.error('Maximum ' + name + ' characters allowed in ' + name);
      }
    }

  }

  getFieldName(entityField: ModuleFieldMetaData[], name) {
    let result = entityField.find(x => x.FieldName == name);
    if (result != undefined) {
      return result.FieldLabel;
    }
    return "";
  }

  checkMandatory(entityField: ModuleFieldMetaData[], name) {
    let result = entityField.find(x => x.FieldName == name);
    if (result != undefined) {
      return result.isMendatory ? true : false;
    }
    return false;
  }


  // loadScript(url, id) {
  //   let body = <HTMLDivElement>document.body;
  //   let script = document.createElement('script');
  //   script.innerHTML = '';
  //   script.src = url;
  //   script.async = true;
  //   script.defer = true;
  //   script.id = id
  //   body.appendChild(script);
  // }

  removeScript(id) {
    let getElem = document.getElementById(id);
    getElem != undefined ? getElem.remove() : null;
  }


  getPermissionByScreenCode(moduleId) {
    let permission: any;
    let allPermission = JSON.parse(sessionStorage.getItem('UserPermission'));
    let result = allPermission?.find(x => x.ModuleId == moduleId);
    if (result != undefined) {
      permission = result;
    }
    return permission;
  }

  backURL() {
    this.location.back();
  }

  getBreadCumbs(url) {
    let breadCumb = [];
    let split = url.split('/');
    if (split.length >= 3) {
      breadCumb.push({ text: this.getBreadCumbString(split[3]), url: this.getUrlString(3, split) });
    }
    if (split.length >= 4) {
      breadCumb.push({ text: this.getBreadCumbString(split[4]), url: this.getUrlString(3, split) });
    }
    if (split.length > 5) {
      breadCumb.push({ text: this.getBreadCumbString(split[5]), url: this.getUrlString(5, split) });
    }
    return breadCumb;
  }

  getUrlString(count, split) {
    let url = '';
    for (let i = 0; i <= count; i++) {
      let str = split[i + 1];
      if (str != null && str != undefined && str.trim() != '') {
        url += '/' + str;
      }
    }
    return url;
  }


  getBreadCumbString(str) {
    switch (str) {
      //Common
      case AppRouter.Add: {
        return BreadCumb.Add;
        break;
      }
      case AppRouter.Edit: {
        return BreadCumb.Edit;
        break;
      }
      case AppRouter.Dashboard: {
        return BreadCumb.Dashboard;
        break;
      }
      case AppRouter.Contact: {
        return BreadCumb.Contact;
        break;
      }

      // Start Marketing
      case AppRouter.Marketing: {
        return BreadCumb.Marketing;
        break;
      }
      case AppRouter.Campaign: {
        return BreadCumb.Campaign;
        break;
      }
      case AppRouter.Lead: {
        return BreadCumb.Lead;
        break;
      }
      case AppRouter.Quote: {
        return BreadCumb.Quote;
        break;
      }
      case AppRouter.Opportunity: {
        return BreadCumb.Opportunity;
        break;
      }

      // Start Sales
      case AppRouter.Sales: {
        return BreadCumb.Sales;
        break;
      }
      case AppRouter.Customer: {
        return BreadCumb.Customer;
        break;
      }
      case AppRouter.SalesOrder: {
        return BreadCumb.SalesOrder;
        break;
      }
      case AppRouter.SalesInvoice: {
        return BreadCumb.SalesInvoice;
        break;
      }
      case AppRouter.SalesReturnOrder: {
        return BreadCumb.SalesReturnOrder;
        break;
      }
      case AppRouter.SalesReturn: {
        return BreadCumb.SalesReturn;
        break;
      }
      case AppRouter.SalesCreditDemo: {
        return BreadCumb.SalesCreditDemo;
        break;
      }
      case AppRouter.SalesDebitDemo: {
        return BreadCumb.SalesDebitDemo;
        break;
      }

      // Start Purchase
      case AppRouter.PurchaseOrder: {
        return BreadCumb.PurchaseOrder;
        break;
      }
      case AppRouter.PurchaseInvoice: {
        return BreadCumb.PurchaseInvoice;
        break;
      }
      case AppRouter.PurchaseReturnOrder: {
        return BreadCumb.PurchaseReturnOrder;
        break;
      }
      case AppRouter.PurchaseReturn: {
        return BreadCumb.PurchaseReturn;
        break;
      }
      case AppRouter.PurchaseCreditDemo: {
        return BreadCumb.PurchaseCreditDemo;
        break;
      }
      case AppRouter.PurchaseDebitDemo: {
        return BreadCumb.PurchaseDebitDemo;
        break;
      }

      // Start Accounts
      case AppRouter.Accounts: {
        return BreadCumb.Accounts;
        break;
      }
      case AppRouter.FiscalYear: {
        return BreadCumb.FiscalYear;
        break;
      }
      case AppRouter.ChartOfAccount: {
        return BreadCumb.ChartOfAccount;
        break;
      }
      case AppRouter.OutgoingPayment: {
        return BreadCumb.OutgoingPayment;
        break;
      }
      case AppRouter.PaymentReceipt: {
        return BreadCumb.PaymentReceipt;
        break;
      }

      // Start Work Order Mgmt
      case AppRouter.WorkOrderMgmt: {
        return BreadCumb.WorkOrderMgmt;
        break;
      }
      case AppRouter.JOBManagement: {
        return BreadCumb.JOBManagement;
        break;
      }
      case AppRouter.JOBDOCType: {
        return BreadCumb.JOBDOCType;
        break;
      }
      case AppRouter.AssignJOBToTechnician: {
        return BreadCumb.AssignJOBToTechnician;
        break;
      }
      case AppRouter.AssignMaterialToTechnician: {
        return BreadCumb.AssignMaterialToTechnician;
        break;
      }
      case AppRouter.ReceiveMaterialFromTechnician: {
        return BreadCumb.ReceiveMaterialFromTechnician;
        break;
      }
      case AppRouter.Quatation: {
        return BreadCumb.Quatation;
        break;
      }
      case AppRouter.RepairProcess: {
        return BreadCumb.RepairProcess;
        break;
      }
      case AppRouter.EscalationOutChallan: {
        return BreadCumb.EscalationOutChallan;
        break;
      }
      case AppRouter.EscalationReceiveChallan: {
        return BreadCumb.EscalationReceiveChallan;
        break;
      }
      case AppRouter.EscalationReturnChallan: {
        return BreadCumb.EscalationReturnChallan;
        break;
      }
      case AppRouter.EscalationReturnReceiveChallan: {
        return BreadCumb.EscalationReturnReceiveChallan;
        break;
      }



      //Start Inventory
      case AppRouter.Inventory: {
        return BreadCumb.Inventory;
        break;
      }
      case AppRouter.TransferOrder: {
        return BreadCumb.TransferOrder;
        break;
      }
      case AppRouter.StockTransferNote: {
        return BreadCumb.StockTransferNote;
        break;
      }
      case AppRouter.Teardown: {
        return BreadCumb.Teardown;
        break;
      }
      case AppRouter.Repack: {
        return BreadCumb.Repack;
        break;
      }
      case AppRouter.StockAdjustment: {
        return BreadCumb.StockAdjustment;
        break;
      }
      case AppRouter.BinTransfer: {
        return BreadCumb.BinTransfer;
        break;
      }


      //Start Masters
      case AppRouter.Masters: {
        return BreadCumb.Masters;
        break;
      }
      case AppRouter.MaterialMaster: {
        return BreadCumb.MaterialMaster;
        break;
      }
      case AppRouter.Resources: {
        return BreadCumb.Resources;
        break;
      }
      case AppRouter.PriceGroup: {
        return BreadCumb.PriceGroup;
        break;
      }
      case AppRouter.CompanyDetails: {
        return BreadCumb.CompanyDetails;
        break;
      }
      case AppRouter.Vendor: {
        return BreadCumb.Vendor;
        break;
      }
      case AppRouter.WarehouseMaster: {
        return BreadCumb.WarehouseMaster;
        break;
      }
      case AppRouter.CompanyMaterialMapping: {
        return BreadCumb.CompanyMaterialMapping;
        break;
      }
      case AppRouter.MaterialTrackingProfiler: {
        return BreadCumb.MaterialTrackingProfiler;
        break;
      }
      case AppRouter.Division: {
        return BreadCumb.Division;
        break;
      }
      case AppRouter.MaterialType: {
        return BreadCumb.MaterialType;
        break;
      }
      case AppRouter.MaterialCategory: {
        return BreadCumb.MaterialCategory;
        break;
      }
      case AppRouter.ModelMaster: {
        return BreadCumb.ModelMaster;
        break;
      }
      case AppRouter.BrandMaster: {
        return BreadCumb.BrandMaster;
        break;
      }
      case AppRouter.MaterialSpecificationDimension: {
        return BreadCumb.MaterialSpecificationDimension;
        break;
      }
      case AppRouter.MaterialSpecificationValues: {
        return BreadCumb.MaterialSpecificationValues;
        break;
      }
      case AppRouter.MaterialSpecification: {
        return BreadCumb.MaterialSpecification;
        break;
      }
      case AppRouter.StockIndicator: {
        return BreadCumb.StockIndicator;
        break;
      }
      case AppRouter.BillsOfMaterial: {
        return BreadCumb.BillsOfMaterial;
        break;
      }
      case AppRouter.ResourcesCompanyMapping: {
        return BreadCumb.ResourcesCompanyMapping;
        break;
      }
      case AppRouter.PricingCondition: {
        return BreadCumb.PricingCondition;
        break;
      }
      case AppRouter.DiscountGroup: {
        return BreadCumb.DiscountGroup;
        break;
      }
      case AppRouter.DiscountConditions: {
        return BreadCumb.DiscountConditions;
        break;
      }
      case AppRouter.UOM: {
        return BreadCumb.UOM;
        break;
      }
      case AppRouter.TerritoryHierarchy: {
        return BreadCumb.TerritoryHierarchy;
        break;
      }
      case AppRouter.TaxType: {
        return BreadCumb.TaxType;
        break;
      }
      case AppRouter.CountryMaster: {
        return BreadCumb.CountryMaster;
        break;
      }
      case AppRouter.StateMaster: {
        return BreadCumb.StateMaster;
        break;
      }
      case AppRouter.VatPostingSetup: {
        return BreadCumb.VatPostingSetup;
        break;
      }
      case AppRouter.GSTComponent: {
        return BreadCumb.GSTComponent;
        break;
      }
      case AppRouter.SubAccountingPeriod: {
        return BreadCumb.SubAccountingPeriod;
        break;
      }
      case AppRouter.GSTConfiguration: {
        return BreadCumb.GSTConfiguration;
        break;
      }
      case AppRouter.GSTPostingSetup: {
        return BreadCumb.GSTPostingSetup;
        break;
      }
      case AppRouter.GSTGroup: {
        return BreadCumb.GSTGroup;
        break;
      }
      case AppRouter.GSTSetup: {
        return BreadCumb.GSTSetup;
        break;
      }
      case AppRouter.GSTClaimSetOff: {
        return BreadCumb.GSTClaimSetOff;
        break;
      }
      case AppRouter.IssueCategory: {
        return BreadCumb.IssueCategory;
        break;
      }
      case AppRouter.SymptomMaster: {
        return BreadCumb.SymptomMaster;
        break;
      }
      case AppRouter.SymptomGroup: {
        return BreadCumb.SymptomGroup;
        break;
      }
      case AppRouter.DefectMaster: {
        return BreadCumb.DefectMaster;
        break;
      }
      case AppRouter.DefectGroup: {
        return BreadCumb.DefectGroup;
        break;
      }
      case AppRouter.RepairMaster: {
        return BreadCumb.RepairMaster;
        break;
      }
      case AppRouter.RepairGroup: {
        return BreadCumb.RepairGroup;
        break;
      }
      case AppRouter.ServiceConfigutaion: {
        return BreadCumb.ServiceConfigutaion;
        break;
      }
      case AppRouter.NumRange: {
        return BreadCumb.NumRange;
        break;
      }

      // Start SystemAdministrator
      case AppRouter.SystemAdministrator: {
        return BreadCumb.SystemAdministrator;
        break;
      }
      case AppRouter.UserManagement: {
        return BreadCumb.UserManagement;
        break;
      }
      case AppRouter.OrgRoleManagement: {
        return BreadCumb.OrgRoleManagement;
        break;
      }
      case AppRouter.JOBRoleManagement: {
        return BreadCumb.JOBRoleManagement;
        break;
      }
      case AppRouter.ProfileSetting: {
        return BreadCumb.ProfileSetting;
        break;
      }

      // Start Settings
      case AppRouter.Settings: {
        return BreadCumb.Settings;
        break;
      }
      case AppRouter.PickList: {
        return BreadCumb.PickList;
        break;
      }
      case AppRouter.SalesOrderDocType: {
        return BreadCumb.SalesOrderDocType;
        break;
      }
      case AppRouter.PurchaseOrderDocType: {
        return BreadCumb.PurchaseOrderDocType;
        break;
      }
      case AppRouter.SalesInvoiceDocType: {
        return BreadCumb.SalesInvoiceDocType;
        break;
      }
      case AppRouter.PurchaseInvoiceDocType: {
        return BreadCumb.PurchaseInvoiceDocType;
        break;
      }
      case AppRouter.TerritorySetting: {
        return BreadCumb.TerritorySetting;
        break;
      }
      case AppRouter.NumRangeSettings: {
        return BreadCumb.NumRangeSettings;
        break;
      }


      default: {
        return "";
      }
    }
  }

  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  getRandomNo() {
    return Math.floor((Math.random() * 99999) + 1)
  }

  getUrlWithCompanyCode(url) {
    try {
      let split = url.split('/');
      url = split.length >= 1 ? split[1] : '';
      url += split.length >= 2 ? '/' + split[2] : '';
      return url;
    }
    catch {
      return '';
    }
  }

  getExactUrl(url) {
    try {
      let split = url.split('/');
      url = split.length >= 3 ? split[3] : '';
      url += split.length >= 4 ? '/' + split[4] : '';
      return url;
    }
    catch {
      return '';
    }
  }

  getBreadCumbList(url) {
    let breadCumb = [];
    let urls = this.getUrlWithCompanyCode(url);
    let exactUrl = this.getExactUrl(url);
    let allMenu = JSON.parse(sessionStorage.getItem('allMenu'));
    let result = allMenu.find(x => x.path == exactUrl);
    result = result == undefined ? allMenu.find(x => x.Url == exactUrl) : result;

    if (result != undefined) {
      if (result?.SubHeadingId) {
        let listUrl = urls + '/' + result.Url;
        urls = urls + '/' + AppRouter.SubMenu;
        result.HeadingName != '' ? breadCumb.push({ text: result.HeadingName, url: urls }) : null;
        result.SubHeadingName != '' ? breadCumb.push({ text: result.SubHeadingName, url: urls }) : null;
        result.ModuleName != '' ? breadCumb.push({ text: result.ModuleName, url: listUrl }) : null;
      }
      else {
        urls = urls + '/' + result.path;
        result.moduleName != '' ? breadCumb.push({ text: result.moduleName, url: urls }) : null;
        result.title != '' ? breadCumb.push({ text: result.title, url: urls }) : null;
      }

      url.includes(AppRouter.Add) ? breadCumb.push({ text: BreadCumb.Add, url: '' }) : null;
      url.includes(AppRouter.Edit) ? breadCumb.push({ text: BreadCumb.Edit, url: '' }) : null;

    }
    return breadCumb;
  }

  checkCompanyPermission() {
    let allPermision = JSON.parse(sessionStorage.getItem('UserPermission'));
    let resp = allPermision.find(x => x.ModuleId == 21);
    return resp != undefined && resp?.View ? true : false;
  }

  onMenuSearch = (event, sidebarItems) => {
    let allSidebarItems = JSON.parse(sessionStorage.getItem('AllSidebarItems'));
    let val = event?.toLowerCase();
    sidebarItems = allSidebarItems;
    if (val) {
      sidebarItems.map(row => {
        let subMenu = [];

        row.submenu.map(menu => {
          if (menu?.title.toLowerCase().includes(val)) {
            subMenu.push(menu);
          }
        })

        row.submenu = subMenu;
        if (subMenu.length == 0) {
          sidebarItems = sidebarItems.filter(x => x.moduleName != row.moduleName);
        }
      })
    }
    return sidebarItems;
  }





}
