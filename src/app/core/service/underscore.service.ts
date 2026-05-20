import { Injectable } from '@angular/core';
import * as _ from 'underscore';

@Injectable({
    providedIn: 'root',
})
export class UnderscoreService {
    constructor() { }

    uniqByProp(list, prop) {
        const result = _.uniq(list, x => x.prop);
        return result;
    }

    orderBy(list, prop) {
        return _.sortBy(list, prop);
    }

    orderByDesc(list, propName) {
        return _.sortBy(list, propName).reverse();
    }

    groupBy(list, prop) {
        return _.groupBy(list, prop);
    }

    countBy(list, prop) {
        let resp = _.countBy(list, prop);
        return resp.undefined;
    }

}