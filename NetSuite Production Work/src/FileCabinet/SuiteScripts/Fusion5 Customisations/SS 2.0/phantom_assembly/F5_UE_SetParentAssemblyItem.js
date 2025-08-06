/**
 * Module Description
 * Sets the Parent Item based on the assembly level
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Mar 2021     F5-RF            Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([
        '../common/F5_Constants',
        '../common/F5_Record',
    '../common/F5_Transaction'
    ],

    function (f5_constants, f5_record,f5_transaction) {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {
            try{
                var recWO = scriptContext.newRecord;
                if(scriptContext.type != 'create'){
                    var oldRecWO = scriptContext.oldRecord;
                }else{
                    var oldRecWO = recWO;
                }
                var newStatus = recWO.getValue({fieldId:'orderstatus'});
                var oldStatus = oldRecWO.getValue({fieldId:'orderstatus'});
                var runScript = false;
                if(oldStatus == 'B' && newStatus == 'B'){
                    runScript = true;
                }
                if(scriptContext.type != scriptContext.UserEventType.DELETE && runScript) {
                    var headerItem = recWO.getValue({fieldId: f5_constants.TransactionField.ASSEMBLY_ITEM});
                    var itemCount = recWO.getLineCount({sublistId: f5_constants.Sublist.ITEM});
                    var lines = f5_transaction.getPhantomAssembly({record: recWO, itemCount: itemCount});
                    log.error('lines', lines);
                    for (var i = itemCount - 1; i >= 0; i--) {
                        lines[i].headerItem = headerItem;
                        if (lines[i].assemblyLevel == 1) {
                            lines[i].parentAssembly = headerItem;
                        } else {
                            for (var j = i - 1; j >= 0; j--) {
                                if (lines[i].assemblyLevel - lines[j].assemblyLevel == 1) {
                                    lines[i].parentAssembly = lines[j].item;
                                    lines[i].parentAssemblyLine = (j + 1).toString();
                                    break;
                                }
                            }
                        }
                    }
                    f5_transaction.setPhantomAssembly({record: recWO, itemCount: itemCount, lines: lines});
                }
            }catch(e){
                log.error("erron in before submit", e.toString());
            }
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
                var recWO = f5_record.load({id:scriptContext.newRecord.id, type:scriptContext.newRecord.type});
                var status = recWO.getValue({fieldId: 'orderstatus'});
                var itemCount = recWO.getLineCount({sublistId: f5_constants.Sublist.ITEM});
                var lines = f5_transaction.getPhantomAssembly({record: recWO, itemCount: itemCount});
                var headerItem = recWO.getValue({fieldId: f5_constants.TransactionField.ASSEMBLY_ITEM});
                var createdFrom = recWO.getText({fieldId: 'createdfrom'});
                if(scriptContext.type != 'create'){
                    var oldRecWO = scriptContext.oldRecord;
                }else{
                    var oldRecWO = recWO;
                }
                var oldStatus = oldRecWO.getValue({fieldId:'orderstatus'});
                var runScript = false;
                if(oldStatus == 'B' && status == 'B'){
                    runScript = true;
                }
                log.error("createdFrom",createdFrom);
                if(scriptContext.type != scriptContext.UserEventType.DELETE && runScript == false){
                    log.error("after submit","triggered");
                    for (var i = itemCount - 1; i >= 0; i--) {
                        lines[i].headerItem = headerItem;
                        if (lines[i].assemblyLevel == 1) {
                            lines[i].parentAssembly = headerItem;
                        } else {
                            for (var j = i - 1; j >= 0; j--) {
                                if (lines[i].assemblyLevel - lines[j].assemblyLevel == 1) {
                                    lines[i].parentAssembly = lines[j].item;
                                    lines[i].parentAssemblyLineID = lines[j].lineId;
                                    lines[i].parentAssemblyLine = (j + 1).toString();
                                    break;
                                }
                            }
                        }
                    }
                    f5_transaction.setPhantomAssembly({record:recWO, itemCount:itemCount, lines:lines});
                }else{
                    log.error("released status");
                    for (var i = 0; i < itemCount; i++) {
                        var itemLine = recWO.getSublistValue({
                            sublistId: f5_constants.Sublist.ITEM,
                            fieldId: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINE,
                            line: i
                        });
                        var itemLineId;
                        if(itemLine){
                            itemLineId = recWO.getSublistValue({
                                sublistId: f5_constants.Sublist.ITEM,
                                fieldId: 'line',
                                line: itemLine-1
                            });
                            recWO.setSublistValue({
                                sublistId: f5_constants.Sublist.ITEM,
                                fieldId: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINEID,
                                value: itemLineId,
                                line: i
                            });
                        }
                    }
                }
                recWO.save({enableSourcing:true, ignoreMandatoryFields:true});
            }catch (e) {
                log.error("erron in after submit", e.toString());
            }

        }

        return {
            // beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
           afterSubmit: afterSubmit
        }

    });
