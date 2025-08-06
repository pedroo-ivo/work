/**
 * @NApiVersion         2.1
 * @NScriptType         WorkflowActionScript
 */

define(
    [
        'N/log',
        'N/redirect',
        'N/search'
    ],
    (
        nsLog,
        nsRedirect,
        nsSearch
    ) => {
        const MODULE_NAME = `WA|Set Vendor Bill Approver`;
        const FIELDS = {
            CREATED_BY: 'custbody_f5_po_createdby',
            CREATED_FROM_PO: 'createdfrom'
        };

        const onAction = (context) => {
            let title = `WA|BillItemReceipt`;

            let thisRecord = context.newRecord;
            let approver = getApprover(thisRecord);
            if (!approver) {
                nsLog.debug({ title, details: `PO Creator not found. Exiting...` });
                return;
            }

            let createdFrom = thisRecord.getValue({ fieldId: 'createdfrom' })
            if (!createdFrom) {
                nsLog.debug({ title, details: `Item Receipt record does not have any related Purchase Order. Exiting...` });
                return;
            }

            nsRedirect.toRecordTransform({
                fromId: createdFrom,
                fromType: 'purchaseorder',
                toType: 'vendorbill',
                parameters: {
                    nextapprover: approver
                }
            });
        };

        const getApprover = (thisRecord) => {
            let title = `${MODULE_NAME}.GetApprover`;

            let createdFrom = thisRecord.getValue({ fieldId: FIELDS.CREATED_FROM_PO });
            log.debug({ title, details: `createdFrom = ${createdFrom}` });
            let poLookup = nsSearch.lookupFields({
                type: 'purchaseorder',
                id: createdFrom,
                columns: [ FIELDS.CREATED_BY ]
            });
            nsLog.debug({ title: `${title} poLookup`, details: JSON.stringify(poLookup) });

            return poLookup[FIELDS.CREATED_BY][0]?.value;
        };

        return { onAction };
    }
);