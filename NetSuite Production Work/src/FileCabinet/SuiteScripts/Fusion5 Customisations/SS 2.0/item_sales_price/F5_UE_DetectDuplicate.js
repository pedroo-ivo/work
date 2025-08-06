/**
 * Module Description
 * User Event Script that detects and prevents duplicate on Pricing Group Mark Up custom record
 *
 * Version    Date            Author         Remarks
 * 1.00       26 Apr 2022     F5-JBA         Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([
    '../common/F5_PricingGroupMarkUp',
    '../common/F5_Constants',
    '../common/F5_Error'
], function (f5_pricingGroupMarkUp, f5_constants, f5_error) {

    return {
        beforeSubmit: function beforeSubmit(context) {
            if ([context.UserEventType.CREATE].indexOf(context.type) > -1) {
                var record = f5_pricingGroupMarkUp.cast(context.newRecord);
                var pricingGroupId = record.getPricingGroup();
                var existingPricingGroup = f5_pricingGroupMarkUp.searchPricingGroupMarkUp(pricingGroupId);
                if (existingPricingGroup) {
                    var duplicateError = f5_error.create({
                        name: 'DUPLICATE_RECORD',
                        message: 'Duplicate Pricing Group Found. Please update existing mark up record instead.',
                        notifyOff: true
                    })

                    throw duplicateError;
                }
            }
        }
    }

});
