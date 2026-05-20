import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'nitc-input-text',
    template: `
    <label for="partner_type" class="x_label">PartnerType :
    </label>
        <div class="x_input_wrapper">
        <input type="text" class="x_input" id="partner_type"
        placeholder="Select Option" />
    </div>
    `
})

export class NitcInputText implements OnInit {
    constructor() { }
    

    ngOnInit() { }
}