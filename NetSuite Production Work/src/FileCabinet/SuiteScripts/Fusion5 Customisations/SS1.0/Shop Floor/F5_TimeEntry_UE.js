/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       25 May 2016     marcus.ma
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
    try {
        if (type == "edit") {
            var recordID = nlapiGetNewRecord().getId();
            var recordType = nlapiGetNewRecord().getRecordType();
            var status = nlapiGetFieldValue("custrecord_f5_sfc_te_status");
            var workOrderCompletion = nlapiGetFieldValue("custrecord_f5_sfc_te_wocompletion");
            var operationName = nlapiGetFieldValue("custrecord_f5_sfc_te_operationname");
            var durationMints = nlapiGetFieldValue("custrecord_f5_sfc_te_durationinmints");
            var quantity = nlapiGetFieldValue("custrecord_f5_sfc_te_quantity");
            var workOrderID = nlapiGetFieldValue("custrecord_f5_sfc_te_workorder");
            var operationID = nlapiGetFieldValue("custrecord_f5_sfc_te_operationid");
            var notes = nlapiGetFieldValue("custrecord_f5_sfc_te_notes");
            nlapiLogExecution("DEBUG", "after submit:status, work order,operation, work order completion,quantity,duration", status + "***" + workOrderID + "***" + operationID + "***" + workOrderCompletion + "***" + quantity + "***" + durationMints);
            //if time entry status is "Finished"
            if (status == 2) {
                //update existing work order completion
                if (workOrderCompletion) {
                    nlapiLogExecution("DEBUG", "log", "found existing work order completion: " + workOrderCompletion);
                    var rec_wocompletion = nlapiLoadRecord("workordercompletion", workOrderCompletion);
                    rec_wocompletion.setFieldValue("completedquantity", quantity);
                    var count = rec_wocompletion.getLineItemCount("operation");
                    for (var i = 1; i <= count; i++) {
                        var operationName_temp = rec_wocompletion.getLineItemValue("operation", "operationname", i);
                        var operationSequent_temp = rec_wocompletion.getLineItemValue("operation", "operationsequence", i);
                        if (operationName == operationName_temp) {
                            nlapiLogExecution("DEBUG", "operation name, sequence", operationName_temp + "***" + operationSequent_temp);
                            rec_wocompletion.setLineItemValue("operation", "laborruntime", i, durationMints);
                        }
                    }
                    nlapiSubmitRecord(rec_wocompletion, true, true);
                }
                //create new work order completion
                else {
                    nlapiLogExecution("DEBUG", "log", "creating work order completion");
                    var rec_wocompletion = nlapiTransformRecord("workorder", workOrderID, "workordercompletion");
                    rec_wocompletion.setFieldValue("startoperation", operationID);
                    rec_wocompletion.setFieldValue("endoperation", operationID);
                    rec_wocompletion.setFieldValue("completedquantity", quantity);
                    rec_wocompletion.setFieldValue("quantity", 0);
                    rec_wocompletion.setFieldValue("memo", notes);
                    var count = rec_wocompletion.getLineItemCount("operation");
                    for (var i = 1; i <= count; i++) {
                        var operationName_temp = rec_wocompletion.getLineItemValue("operation", "operationname", i);
                        var operationSequent_temp = rec_wocompletion.getLineItemValue("operation", "operationsequence", i);

                        if (operationName == operationName_temp) {
                            nlapiLogExecution("DEBUG", "operation name, sequence", operationName_temp + "***" + operationSequent_temp);
                            rec_wocompletion.setLineItemValue("operation", "laborruntime", i, durationMints);
                        }
                    }
                    var woCompletionID = nlapiSubmitRecord(rec_wocompletion, true, true);
                    nlapiLogExecution("DEBUG", "new work completion created", woCompletionID);

                    nlapiSubmitField(recordType, recordID, "custrecord_f5_sfc_te_wocompletion", woCompletionID, false);
                }
            }
        }
    } catch (e) {
        nlapiLogExecution("DEBUG", "error in After Submit: " + type, e);
        var context = nlapiGetContext();
        var email = context.getSetting("SCRIPT", "custscript_f5_ue_shopfloor_recipient");
        if (email) {
            var workOrderID = nlapiGetFieldValue("custrecord_f5_sfc_te_workorder");
            var operationName = nlapiGetFieldValue("custrecord_f5_sfc_te_operationname");
            var recordID = nlapiGetNewRecord().getId();
            var subject = "Error Occurs When Completing Work Order Operation";
            var errorMsg = "Following error occurs when creating work order opertaion completion for work order " + workOrderID + ", operation " + operationName + ", related to time entry record " + recordID + ".\n\n" + e + "\n\nRegards,\nNetSuite Admin";
            nlapiSendEmail(5915, email, subject, errorMsg, null, null, recordID);
        }

    }
}
