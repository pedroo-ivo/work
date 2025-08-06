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
            let title = `WA|BillPurchaseOrder`;

            let thisRecord = context.newRecord;
            /*let approver = getApprover(thisRecord);
            if (!approver) {
                nsLog.debug({ title, details: `PO Creator not found. Exiting...` });
                return;
            }*/

            /*let createdFrom = thisRecord.getValue({ fieldId: 'createdfrom' })
            if (!createdFrom) {
                nsLog.debug({ title, details: `Item Receipt record does not have any related Purchase Order. Exiting...` });
                return;
            }*/

            nsRedirect.toRecordTransform({
                fromId: thisRecord.id,
                fromType: 'purchaseorder',
                toType: 'vendorbill',
                parameters: {
                    nextapprover: thisRecord.getValue({ fieldId: FIELDS.CREATED_BY })
                }
            });
        };

        const getApprover = (thisRecord) => {
            let title = `${MODULE_NAME}.GetApprover`;

            let createdFrom = thisRecord.getValue({ fieldId: FIELDS.CREATED_FROM_PO });
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