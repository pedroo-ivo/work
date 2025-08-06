/**
 * Module Description
 * Sets the Parent Item based on the assembly level
 *
 * Version    Date            Author           Remarks
 * 1.00       29 June 2021     F5-NSA           Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([
        '../common/F5_Constants',
        '../common/F5_Record',
        '../common/F5_Search',
        '../common/F5_Script',
        '../common/F5_Transaction'

    ],
    function (f5_constants, f5_record,f5_search,f5_script,f5_transaction) {

        function getPhantonWOInternalValues(options) {
            var record = options.record;
            var itemCount = options.itemCount;
            var lines = [];
            for (var i = 0; i < itemCount; i++) {
                var itemLine = record.getSublistValue({
                    sublistId: f5_constants.Sublist.ITEM,
                    fieldId: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINE,
                    line: i
                });
                var itemLineId;
                if(itemLine){
                    itemLineId = record.getSublistValue({
                        sublistId: f5_constants.Sublist.ITEM,
                        fieldId: 'line',
                        line: itemLine-1
                    });
                }
                lines.push(itemLine);
                lines[itemLine] = itemLineId;
            }
            return lines;
        }
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function afterSubmit(scriptContext) {
            try{
                var poOrder = f5_record.load({id:scriptContext.newRecord.id, type:scriptContext.newRecord.type});
                var workOrderText = poOrder.getText({fieldId: 'createdfrom'});
                var poItemsCount = poOrder.getLineCount({sublistId: f5_constants.Sublist.ITEM});
                var workOrderSystemNotesObj = null;
                var systemNotesSearch = f5_script.getParameter(f5_constants.ScriptParameter.SYSTEM_NOTES_WORKORDER_SEARCH);
                var systemStatus = "";
                if(poOrder.getValue({fieldId: 'createdfrom'})){
                    var workOrderSystemNotesObj = f5_search.load({id:systemNotesSearch });
                    var filters = workOrderSystemNotesObj.filters || [];
                    workOrderSystemNotesObj.addFilter(f5_search.createFilter({
                        name: 'internalid',
                        operator: f5_search.Operator.ANYOF,
                        values: poOrder.getValue({fieldId: 'createdfrom'})
                    }));
                    var result = workOrderSystemNotesObj.getFirstResult();
                    systemStatus = result.getValue({
                        name: "newvalue",
                        join: "systemNotes",
                        label: "New Value"
                    });
                  var createdFrom  = result.getText({
                    name: "createdfrom",
                });
                }
                
                
                if(workOrderText.indexOf('Work Order') != -1 && systemStatus == "Released"){
                    log.error('systemStatus',systemStatus);
                    var recWO = f5_record.load({id: poOrder.getValue({fieldId: 'createdfrom'}), type:'workOrder'});
                    var itemCount = recWO.getLineCount({sublistId: f5_constants.Sublist.ITEM});
                    var lines = getPhantonWOInternalValues({record: recWO, itemCount: itemCount});
                    for (var i = 0; i < poItemsCount; i++) {
                        var itemLine = poOrder.getSublistValue({
                            sublistId: f5_constants.Sublist.ITEM,
                            fieldId: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINE,
                            line: i
                        });
                        if(lines[itemLine]){
                            poOrder.setSublistValue({
                                sublistId: f5_constants.Sublist.ITEM,
                                fieldId: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINEID,
                                value: lines[itemLine],
                                line: i
                            });
                        }
                    }
                    poOrder.save({enableSourcing:true, ignoreMandatoryFields:true});
                }
            }catch (e) {
                log.error('error:::::::::::::', e.toString());
            }
        }
        return {
            // beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }

    });
