/**
 * Module Description
 * Complete Shop Floor Time
 *
 * Version      Date                Author              Remarks
 * 1.1          22 Jun 2021         Karl Sebastian      iHelp 380233 - Added updateTimeEntryApprover
 * 1.2          21 Nov 2024         JBA                 iHelp 526982 - Update Project field
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record','N/runtime', './F5_Lib_ShopFloorCustomisation'],

    function (record,runtime,f5_lib) {


        function beforeSubmit(scriptContext) {
            try {
                if ([scriptContext.UserEventType.CREATE, scriptContext.UserEventType.COPY, scriptContext.UserEventType.EDIT].indexOf(scriptContext.type) > -1) {
                    var recordObj = scriptContext.newRecord;
                    var workOrderId = recordObj.getValue({fieldId: 'custrecord_f5_sfc_te_workorder'});
                    if (workOrderId) {
                        var workOrderRec = record.load({type: record.Type.WORK_ORDER, id: workOrderId});
                        var projectId = workOrderRec.getValue({fieldId: 'job'});
                        recordObj.setValue({fieldId: 'custrecord_dce_work_order_project_shop', value: projectId});
                    }
                }
            } catch (e) {
                log.error('Unexpected Error', e);
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

            if (scriptContext.type !== 'edit') {
                return;
            }

            var newRecord = scriptContext.newRecord;
            var oldRecord = scriptContext.oldRecord;
            var recordId = newRecord.id;

            var currUser = runtime.getCurrentUser();
            var oldStatus = oldRecord.getValue('custrecord_f5_sfc_te_status').toString();
            var status = newRecord.getValue('custrecord_f5_sfc_te_status').toString();
            var workOrderCompletion = newRecord.getValue('custrecord_f5_sfc_te_wocompletion');
            var durationMints = newRecord.getValue('custrecord_f5_sfc_te_durationinmints');
            var quantity = newRecord.getValue('custrecord_f5_sfc_te_quantity');
            var workOrderId = newRecord.getValue('custrecord_f5_sfc_te_workorder');
            var operationId = newRecord.getValue('custrecord_f5_sfc_te_operationid');
            var notes = newRecord.getValue('custrecord_f5_sfc_te_notes');
            var date = newRecord.getValue('custrecord_f5_sfc_te_date');
            var empCostCentre = newRecord.getValue('custrecord_f5_sfc_te_emp_cost_centre');
            var empDepartment = newRecord.getValue('custrecord_dce_emp_department');
            var statusApprover = false;

            //Time approver - automatic complete
            if (oldStatus == '3') {
                updateTimeEntryApprover(newRecord,currUser);
                statusApprover = true;
            }
            //Time approver - automatic complete

            log.debug({
                title: 'after submit: status',
                details: status
            });

            log.debug({
                title: 'after submit: WO',
                details: 'WO: ' + workOrderId + ' OP: ' + operationId + ' WOC: ' + workOrderCompletion
            });

            log.debug({
                title: 'after submit: quantity, duration',
                details: 'QTY: ' + quantity + ' MINUTES: ' + durationMints
            });

            var woCompletion;
            var woCompletionId;
            var hasCompletionErrors = true;
            try {
                // if SFC time entry status is 'Completed'
                if (status === '2' && status !== oldStatus || statusApprover == true ) {
                    // update existing work order completion
                    if (workOrderCompletion) {
                        log.debug({
                            title: 'Update WO Completion',
                            details: 'Existing work order completion: ' + workOrderCompletion
                        });

                        woCompletion = record.load({type: 'workordercompletion', id: workOrderCompletion});
                        woCompletion.setValue({fieldId: 'completedquantity', value: quantity});

                        setCompletionLaborRunTime(newRecord, woCompletion);

                        woCompletionId = woCompletion.save({enableSourcing: true, ignoreMandatoryFields: true});
                    }
                    // create new work order completion
                    else {
                        log.debug({
                            title: 'Create WO Completion',
                            details: 'creating new work order completion'
                        });
                        var workOrderRec = record.load({type: record.Type.WORK_ORDER, id: workOrderId});
                        var projectId = workOrderRec.getValue({fieldId: 'job'});

                        woCompletion = record.transform({fromType: 'workorder', fromId: workOrderId, toType: 'workordercompletion'});
                        woCompletion.setValue({fieldId: 'trandate', value: date});
                        woCompletion.setValue({fieldId: 'startoperation', value: operationId});
                        woCompletion.setValue({fieldId: 'endoperation', value: operationId});
                        woCompletion.setValue({fieldId: 'completedquantity', value: quantity});
                        woCompletion.setValue({fieldId: 'quantity', value: 0});
                        woCompletion.setValue({fieldId: 'memo', value: notes});
                        woCompletion.setValue({fieldId: 'custbody_dce_work_order_project', value: projectId});
                        //woCompletion.setValue({fieldId: 'cseg_f5_cost_centre', value: empCostCentre});
                        woCompletion.setValue({fieldId: 'department', value: empDepartment});


                        //updateTimeEntryApprover(newRecord,currUser);
                        setCompletionLaborRunTime(newRecord, woCompletion);

                        woCompletionId = woCompletion.save({enableSourcing: true, ignoreMandatoryFields: true});
                        log.debug({
                            title: 'new work completion created',
                            details: woCompletionId
                        });
                    }

                    hasCompletionErrors = false;
                }




            } catch (e) {
                log.error({
                    title: 'Error in After Submit',
                    details: JSON.stringify(e)
                });
                hasCompletionErrors = true;
                record.submitFields({
                    type: 'customrecord_f5_sfc_timeentry',
                    id: recordId,
                    values: {
                        custrecord_f5_sfc_te_status: 1,
                        custrecord_f5_sfc_te_error_msg: e.message
                    }
                });
            }

            try {
                if (!hasCompletionErrors && woCompletionId) {
                    var idTime = createEmployeeTime(newRecord);
                    updateShopFloorTimeEntry(recordId, woCompletionId, idTime);
                }

            } catch (e) {
                log.error({
                    title: 'Error in Time Creation',
                    details: JSON.stringify(e)
                });
            }
        }



        function updateTimeEntryApprover(nRecord,currentU){

            var recId = nRecord.id;
            var currentUserId = currentU.id;
            var currentUserRole = currentU.role
            var emp = nRecord.getValue('custrecord_f5_sfc_te_employee');
            var emp_load = record.load({type: 'employee' ,id: emp})
            var timeApprover = emp_load.getValue('timeapprover');


            if (currentUserRole == '1044'|| currentUserRole == '1075' || currentUserRole == '1049' || currentUserRole =='1081'|| currentUserRole == '3' ){


                var flrTimeRec = record.load({type: 'customrecord_f5_sfc_timeentry',id: recId,})
                flrTimeRec.setValue({fieldId: 'custrecord_f5_sfc_te_status', value: 2})
                var flrTimeRecSave = flrTimeRec.save({enableSourcing: true, ignoreMandatoryFields: true});


                log.debug({
                    title: 'Floor time Rec Save',
                    details: flrTimeRecSave
                })
                log.debug({
                    title: 'current user role',
                    details: currentUserRole
                })

            }



        }


        function setCompletionLaborRunTime(shopFloorTime, woCompletion) {
            var durationMints = shopFloorTime.getValue('custrecord_f5_sfc_te_durationinmints');
            var operationName = shopFloorTime.getValue('custrecord_f5_sfc_te_operationname');
            var count = woCompletion.getLineCount({sublistId: 'operation'});
            for (var j = 0; j < count; j++) {
                var existingOpName = woCompletion.getSublistValue({sublistId: 'operation', fieldId: 'operationname', line: j});
                var existingOpSequence = woCompletion.getSublistValue({sublistId: 'operation', fieldId: 'operationsequence', line: j});

                if (operationName === existingOpName) {
                    log.debug({
                        title: 'operation name, sequence',
                        details: existingOpName + '***' + existingOpSequence
                    });
                    woCompletion.setSublistValue({sublistId: 'operation', fieldId: 'laborruntime', line: j, value: durationMints});
                }
            }
        }

        function createEmployeeTime(shopTimeEntry) {
            try {
                var timeEntry = record.create({type: 'timebill', isDynamic: true});
                timeEntry.setValue({fieldId: 'employee', value: shopTimeEntry.getValue('custrecord_f5_sfc_te_employee')});
                timeEntry.setValue({fieldId: 'trandate', value: shopTimeEntry.getValue('custrecord_f5_sfc_te_date')});
                timeEntry.setValue({fieldId: 'cseg_wip_project', value: shopTimeEntry.getValue('custrecord_f5_sfc_te_wipproject')});
                timeEntry.setValue({fieldId: 'hours', value: shopTimeEntry.getValue('custrecord_f5_sfc_te_durationinhours')});
                timeEntry.setValue({fieldId: 'department', value: shopTimeEntry.getValue('custrecord_dce_emp_department')});
                timeEntry.setValue({fieldId: 'cseg_dce_sales_regi', value: shopTimeEntry.getValue('custrecord_f5_sales_region')});
                timeEntry.setValue({fieldId: 'customer', value: shopTimeEntry.getValue('custrecord_dce_work_order_project_shop')});
                var idWO = shopTimeEntry.getValue('custrecord_f5_sfc_te_workorder');
                if(idWO) {
                    //var bIsNonProd = f5_lib.isWONonProd(idWO);
                    timeEntry.setValue({fieldId: 'isproductive', value: true});
                }

                var memo = shopTimeEntry.getText('custrecord_f5_sfc_te_workorder') + ' : ' + shopTimeEntry.getText('custrecord_f5_sfc_te_operationid');
                var notes = shopTimeEntry.getText('custrecord_f5_sfc_te_notes').trim();
                if (notes && notes !== '') {
                    memo += ' : ' + shopTimeEntry.getText('custrecord_f5_sfc_te_notes');
                }

                timeEntry.setValue({fieldId: 'memo', value: memo});
                //Set the Rework
                var isRework = shopTimeEntry.getValue('custrecord_f5_rework');
                timeEntry.setValue({fieldId: 'custcol_f5_rework', value: isRework});
                //Set to Approved
                timeEntry.setValue({fieldId: 'supervisorapproval', value:true});

                var idTime = timeEntry.save({enableSourcing: true, ignoreMandatoryFields: true});

                return idTime;
            } catch (e) {
                log.error('Error in creating time', e.message);
                return null;
            }

        }


        function updateShopFloorTimeEntry(recordId, woCompletionId, idTime) {
            record.submitFields({
                type: 'customrecord_f5_sfc_timeentry',
                id: recordId,
                values: {
                    custrecord_f5_sfc_te_wocompletion: woCompletionId,
                    custrecord_f5_sfc_te_update_ts: false,
                    custrecord_f5_sfc_te_error_msg: '',
                    custrecord_f5_sfc_te_wo_time_entry:idTime
                }
            });
        }


        return {
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }

    });