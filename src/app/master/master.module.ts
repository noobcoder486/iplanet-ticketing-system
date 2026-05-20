import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialMasterComponent } from './material-master/material-master.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NitcControlModule } from 'src/app/nitc-control/nitc-control.module';
import { AddMaterialMasterComponent } from './material-master/add-material-master/add-material-master.component';
import { ResourceMasterComponent } from './resource-master/resource-master.component';
import { AddResourceMasterComponent } from './resource-master/add-resource-master/add-resource-master.component';
import { LocationMasterComponent } from './location-master/location-master.component';
import { AddLocationMasterComponent } from './location-master/add-location-master/add-location-master.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CompanyMaterialResourceMapping } from './company-material-resource-mapping/company-material-resource-mapping.component';
import { AddCompanyMaterialResourceMappingComponent } from './company-material-resource-mapping/add-company-material-resource-mapping/add-company-material-resource-mapping.component';
import { GstComponentComponent } from './gst-component/gst-component.component';
import { AddGstComponentComponent } from './gst-component/add-gst-component/add-gst-component.component';
import { GstGroupComponent } from './gst-group/gst-group.component';
import { AddGstGroupComponent } from './gst-group/add-gst-group/add-gst-group.component';
import { GstSetupComponent } from './gst-setup/gst-setup.component';
import { AddGstSetupComponent } from './gst-setup/add-gst-setup/add-gst-setup.component';
import { UserMasterComponent } from './user-master/user-master.component';
import { AddUserMasterComponent } from './user-master/add-user-master/add-user-master.component';
import { MatCardModule } from '@angular/material/card';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MasterContentComponent } from './master-content/master-content.component';
import { CustomerMasterComponent } from './customer-master/customer-master.component';
import { AddCustomerMasterComponent } from './customer-master/add-customer-master/add-customer-master.component';
import { AddUserLocationMappingComponent } from './user-location-mapping/add-user-location-mapping/add-user-location-mapping.component';
import { UserLocationMappingComponent } from './user-location-mapping/user-location-mapping.component';
import { CompanyMasterComponent } from './company-master/company-master.component';
import { AddCompanyMasterComponent } from './company-master/add-company-master/add-company-master.component';
import { JobroleMasterComponent } from './jobrole-master/jobrole-master.component';
import { AddJobroleMasterComponent } from './jobrole-master/add-jobrole-master/add-jobrole-master.component';
import { ProfileMasterComponent } from './profile-master/profile-master.component';
import { AddProfileMasterComponent } from './profile-master/add-profile-master/add-profile-master.component';
import { ProfileModuleMasterComponent } from './profile-module-master/profile-module-master.component';
import { AddProfileModuleMasterComponent } from './profile-module-master/add-profile-module-master/add-profile-module-master.component';
import { OrgRoleMasterComponent } from './org-role-master/org-role-master.component';
import { AddOrgRoleMasterComponent } from './org-role-master/add-org-role-master/add-org-role-master.component';
import { SalespersonMasterComponent } from './salesperson-master/salesperson-master.component';
import { AddSalespersonMasterComponent } from './salesperson-master/add-salesperson-master/add-salesperson-master.component';
import { MaterialPriceDetailsComponent } from './material-master/material-price-details/material-price-details.component';
import { CreditRequestMasterComponent } from './credit-request-master/credit-request-master.component';
import { AddCreditRequestMasterComponent } from './credit-request-master/add-credit-request-master/add-credit-request-master.component';
import { PriceListComponent } from './price-list/price-list.component';
import { AddPriceListComponent } from './price-list/add-price-list/add-price-list.component';
import { ContractMasterComponent } from './contract-master/contract-master.component';
import { AddContractMasterComponent } from './contract-master/add-contract-master/add-contract-master.component';
import { ApproverSettingMasterComponent } from './approver-setting-master/approver-setting-master.component';
import { AddApproverSettingMasterComponent } from './approver-setting-master/add-approver-setting-master/add-approver-setting-master.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { ModeOfPaymentPermissionComponent } from './mode-of-payment-permission/mode-of-payment-permission.component';
import { CheckInCheckOutDetailsComponent } from './check-in-check-out-details/check-in-check-out-details.component';
import { ToteManagementComponent } from './tote-management/tote-management.component';
import { AddToteManagementComponent } from './tote-management/add-tote-management/add-tote-management.component';

@NgModule({
  declarations: [
    MaterialMasterComponent,
    AddMaterialMasterComponent,
    ResourceMasterComponent,
    AddResourceMasterComponent,
    LocationMasterComponent,
    AddLocationMasterComponent,
    CompanyMaterialResourceMapping,
    AddCompanyMaterialResourceMappingComponent,
    GstComponentComponent,
    AddGstComponentComponent,
    GstGroupComponent,
    AddGstGroupComponent,
    GstSetupComponent,
    AddGstSetupComponent,
    UserMasterComponent,
    AddUserMasterComponent,
    MasterContentComponent,
    CustomerMasterComponent,
    AddCustomerMasterComponent,
    AddUserLocationMappingComponent,
    UserLocationMappingComponent,
    CompanyMasterComponent,
    AddCompanyMasterComponent,
    JobroleMasterComponent,
    AddJobroleMasterComponent,
    ProfileMasterComponent,
    AddProfileMasterComponent,
    ProfileModuleMasterComponent,
    AddProfileModuleMasterComponent,
    OrgRoleMasterComponent,
    AddOrgRoleMasterComponent,
    SalespersonMasterComponent,
    AddSalespersonMasterComponent,
    MaterialPriceDetailsComponent,
    CreditRequestMasterComponent,
    AddCreditRequestMasterComponent,
    PriceListComponent,
    AddPriceListComponent,
    ContractMasterComponent,
    AddContractMasterComponent,
    ApproverSettingMasterComponent,
    AddApproverSettingMasterComponent,
    ModeOfPaymentPermissionComponent,
    CheckInCheckOutDetailsComponent,
    ToteManagementComponent,
    AddToteManagementComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NitcControlModule,
    NgSelectModule,
    MatCardModule,
    NgxSpinnerModule,
    MatExpansionModule,
        
  ]
})
export class MasterModule { }
