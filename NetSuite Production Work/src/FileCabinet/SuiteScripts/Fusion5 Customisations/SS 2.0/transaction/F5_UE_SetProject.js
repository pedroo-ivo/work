/**
 * Module Description
 * User Event Script sets the project field
 *
 * Version    Date            Author         Remarks
 * 1.00       25 Nov 2024     F5-JBA         Initial Development
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/record',
], (record) => {

    const beforeSubmit = (context) => {
        try {
            if ([context.UserEventType.CREATE, context.UserEventType.COPY, /*context.UserEventType.EDIT*/].includes(context.type)) {
                var recordObj = context.newRecord;
                var workOrderId = recordObj.getValue({fieldId: 'createdfrom'});
                if (workOrderId) {
                    var workOrderRec = record.load({type: record.Type.WORK_ORDER, id: workOrderId});
                    var projectId = workOrderRec.getValue({fieldId: 'job'});
                    recordObj.setValue({fieldId: 'custbody_dce_work_order_project', value: projectId});
                }
            }
        } catch (e) {
            log.error('Unexpected Error', e);
        }
    }

    return {
        beforeSubmit
    }
});
