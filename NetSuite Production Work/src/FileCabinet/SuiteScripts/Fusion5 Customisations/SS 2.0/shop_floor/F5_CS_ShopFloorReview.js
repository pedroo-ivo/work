/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./F5_Lib_ShopFloorCustomisation', 'N/url'],

    function (f5_lib, url) {

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
            try {
                var fieldId = scriptContext.fieldId;
                var sublistId = scriptContext.sublistId;
                var currentRecord = scriptContext.currentRecord;

                console.log(fieldId);
                if (fieldId === 'custpage_f5_sfc_time_labour_hours') {

                    // round to nearest quarter
                    var hours = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: fieldId});
                    if (hours) {
                        var roundedValue = f5_lib.roundNearestQuarter(hours);
                        console.log(roundedValue);
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: fieldId,
                            value: roundedValue,
                            ignoreFieldChange: true
                        });
                    }
                }

                if (getFilterFlds().indexOf(fieldId) >= 0) {
                    var oParams = {};
                    getFilterFlds().map(function (fld) {
                        var fldVal = encodeURIComponent(currentRecord.getValue(fld));
                        if(fldVal) {
                            oParams[fld] = fldVal;
                        }
                    })
                    //Get the script deployment
                    var sMode = currentRecord.getValue('custpage_f5_sfc_mode');

                    var redirectUrl = url.resolveScript({
                        scriptId: 'customscript_f5_sl_review_sfc_times',
                        deploymentId: sMode == 'Complete' ? 'customdeploy_f5_sl_complete_shop_floor' :'customdeploy_f5_sl_review_sfc_times',
                        params: oParams
                    });
                    console.log(redirectUrl);
                    // suppress the alert
                    setWindowChanged(window, false);
                    window.location.replace(redirectUrl);
                }
            } catch (e) {
                console.error(e);
            }
        }

        function getFilterFlds() {
            return ['custpage_f5_sfc_cost_ctr','custpage_f5_sfc_department_filter' ,'custpage_f5_sfc_employee', 'custpage_f5_sfc_fromdate', 'custpage_f5_sfc_todate']
        }


        return {
            fieldChanged: fieldChanged,
        };

    });