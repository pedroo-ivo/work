/**
 * Module Description
 * User Event Script that triggers MR Sales Price Update whenever Mark Up is changed
 *
 * Version    Date            Author         Remarks
 * 1.00       10 Oct 2022     F5-JBA         Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([
    '../common/F5_PricingGroupMarkUp',
    '../common/F5_Constants',
    '../common/F5_Task'
], function (f5_pricingGroupMarkUp, f5_constants, f5_task) {

    return {
        afterSubmit: function afterSubmit(context) {
            try {
                if ([context.UserEventType.EDIT].indexOf(context.type) > -1) {
                    var pricingGroupMarkUp = f5_pricingGroupMarkUp.cast(context.newRecord);
                    var oldPricingGroupMarkUp = f5_pricingGroupMarkUp.cast(context.oldRecord);
                    var markUp = pricingGroupMarkUp.getMarkUp();
                    var oldMarkUp = oldPricingGroupMarkUp.getMarkUp();
                    if (markUp !== oldMarkUp) {
                        var pricingGroupId = pricingGroupMarkUp.getPricingGroup();
                        f5_task.runMapReduce({
                            scriptId: f5_constants.ScriptId.MR_UPDATE_ITEM_SALES_PRICE,
                            deploymentId: f5_constants.DeploymentId.MR_UISP_PRICING_GROUP_UPDATE,
                            params: {
                                custscript_f5_mr_uisp_pricing_group_id: pricingGroupId
                            }
                        })
                    }
                }
            } catch (e) {
                log.error('F5_UE_UpdateItemSalesPrice.js afterSubmit Error', e)
            }
        }
    }

});
