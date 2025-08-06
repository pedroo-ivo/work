/**
 * Module Description
 * Map Reduce Script that updates the Item Sales Price based on Mark Up
 *
 * Version    Date            Author          Remarks
 * 1.00       30 Mar 2021     F5-JBA          Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define([
    '../common/F5_Constants',
    '../common/F5_Script',
    '../common/F5_Item',
    '../common/F5_PricingGroupMarkUp'
], function (f5_constants, f5_script, f5_item, f5_pricingGroupMarkUp) {

    return {
        getInputData: function getInputData() {
            try {
                var items;
                var pricingGroupMarkUpId = f5_script.getParameter(f5_constants.ScriptParameter.MR_UISP_PRICING_GROUP_ID);
                if (pricingGroupMarkUpId) {
                    items = f5_item.searchItemsForPriceUpdate(pricingGroupMarkUpId);
                    log.debug('items', items);
                } else {
                    var itemSearchId = f5_script.getParameter(f5_constants.ScriptParameter.ITEM_CHANGED_PRICE_SEARCH);
                    items = f5_item.searchItemChangedPrice(itemSearchId);
                }

                return items;
            } catch (e) {
                log.error('getInputData: Error', e);
            }
        },
        map: function map(context) {
            try {
                var itemObject = JSON.parse(context.value);
                log.debug('map: itemObject', itemObject);
                var markUp = f5_pricingGroupMarkUp.searchMarkUp(itemObject.pricingGroupId);
                log.debug('markUp', markUp);
                if (markUp) {
                    f5_item.updateBasePrice({itemObject: itemObject, markUp: markUp})
                }
            } catch (e) {
                log.error('map: Error', e);
            }
        },
        summarize: function summarize(context) {

        }
    };
});