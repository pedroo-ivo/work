/**
 * Module Description
 * Client script to calculate the total amount of the transaction
 *
 * Version    Date            Author           Remarks
 * 1.00       04 May 2021     F5-JA            Initial Development
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['../common/F5_Constants'],

function(f5_constants) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var sublistId = f5_constants.Sublist.ITEM;
        var currentRecord = scriptContext.currentRecord;
        var itemCount = currentRecord.getLineCount({sublistId: sublistId});
        var total = 0;
        for(var i = 0; i < itemCount; i++){
            var itemReceive = currentRecord.getSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.ITEM_RECEIVE, line: i});
            if(itemReceive){
                total += parseFloat(currentRecord.getSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.CUSTOM_AMOUNT, line: i})) || 0;
            }
        }
        currentRecord.setValue({fieldId: f5_constants.TransactionField.TOTAL_AMOUNT, value: total, ignoreFieldChange: true});
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var sublistId = scriptContext.sublistId;
        var fieldId = scriptContext.fieldId
        if(sublistId == 'item' && (fieldId == f5_constants.SublistField.RATE || fieldId == f5_constants.SublistField.QUANTITY || fieldId == f5_constants.SublistField.ITEM_RECEIVE)){
            var currentRecord = scriptContext.currentRecord;
            var rate = parseFloat(currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.RATE})) || 0;
            var quantity = parseFloat(currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.QUANTITY})) || 0;
            currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.CUSTOM_AMOUNT, value: rate * quantity});
        }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {
        var sublistId = scriptContext.sublistId;
        if(sublistId != 'item'){
            return;
        }
        var currentRecord = scriptContext.currentRecord;
        var itemCount = currentRecord.getLineCount({sublistId: sublistId});
        var total = 0;
        for(var i = 0; i < itemCount; i++){
            var itemReceive = currentRecord.getSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.ITEM_RECEIVE, line: i});
            if(itemReceive){
                total += parseFloat(currentRecord.getSublistValue({sublistId: sublistId, fieldId: f5_constants.SublistField.CUSTOM_AMOUNT, line: i})) || 0;
            }
        }
        currentRecord.setValue({fieldId: f5_constants.TransactionField.TOTAL_AMOUNT, value: total, ignoreFieldChange: true});
    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        //postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        /*lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord*/
    };
    
});
