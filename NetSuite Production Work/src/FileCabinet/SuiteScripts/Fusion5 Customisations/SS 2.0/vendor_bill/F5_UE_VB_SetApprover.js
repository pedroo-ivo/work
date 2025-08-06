/**
 * @NApiVersion     2.1
 * @NScriptType     UserEventScript
 */

define(
    [
        'N/log',
        'N/record',
        'N/search',
        '../common/F5_Constants'
    ],
    (
        nsLog,
        nsRecord,
        nsSearch,
        f5_constants
    ) => {
        const MODULE_NAME = `UE|Set Vendor Bill Approver`;
        const FIELDS = f5_constants.TransactionField;
        /*{
            CREATED_BY: 'custbody_f5_po_createdby',
            CREATED_FROM_PO: 'custbody_f5_createdfrompo',
            EFF_XML2NS_TRANSACTION: 'custbody_eff_nsp2p_xml2nstrans'
        };*/

        const afterSubmit = (context) => {
            setNextApprover(context);
        };

        const getApprover = (options) => {
            let title = `${MODULE_NAME}.GetApprover`;
            let { purchaseOrder } = options;

            // let createdFrom = thisRecord.getValue({ fieldId: FIELDS.CREATED_FROM_PO });
            let poLookup = nsSearch.lookupFields({
                type: 'purchaseorder',
                id: purchaseOrder,
                columns: [ FIELDS.CREATED_BY ]
            });
            nsLog.debug({ title: `${title} poLookup`, details: JSON.stringify(poLookup) });

            return poLookup[FIELDS.CREATED_BY][0]?.value;
        };

        const setOCRApprover = (thisRecord) => {
            let title = `${MODULE_NAME}.SetOCRApprover`;
            let output = false;

            let effTransaction = thisRecord.getValue({ fieldId: FIELDS.EFF_XML2NS_TRANSACTION });
            log.debug({ title: `${title} effTransaction`, details: effTransaction });
            if (!effTransaction) {
                return false;
            }

            const SUBLIST = f5_constants.SublistField;
            let poLines = thisRecord.getLineCount({ sublistId: f5_constants.Sublist.PURCHASE_ORDERS });
            if (poLines <= 0) { return false; }

            let purchaseOrder = thisRecord.getSublistValue({
                sublistId: f5_constants.Sublist.PURCHASE_ORDERS,
                fieldId: SUBLIST.ID,
                line: 0
            });
            log.debug({ title: `${title} poLines = ${poLines}`, details: `purchaseOrder = ${purchaseOrder}` });
            let nextApprover = getApprover({ purchaseOrder });
            if (nextApprover) {
                thisRecord.setValue({ fieldId: 'nextapprover', value: nextApprover });
            }

            return true;
        };

        const setNextApprover = (context) => {
            let title = `${MODULE_NAME}.SetNextApprover`;
            let { newRecord, type } = context;
            log.debug({ title: `${title} type = ${type}`, details: JSON.stringify(newRecord) });

            if ([ context.UserEventType.CREATE ].includes(type) === false) { return; }
            let thisRecord = nsRecord.load({ type: newRecord.type, id: newRecord.id });

            let ocrStatus = setOCRApprover(thisRecord);
            if (ocrStatus === true) {
                thisRecord.save();
                return;
            }

            let createdFrom = thisRecord.getValue({ fieldId: FIELDS.CREATED_FROM_PO });
            if (!createdFrom) {
                nsLog.debug({ title: title, details: `Created From value not found. Exiting...` });
                return;
            }

            let nextApprover = thisRecord.getValue({ fieldId: 'nextapprover' }) || getApprover({ purchaseOrder: createdFrom });
            if (nextApprover && nextApprover >= 0) {
                thisRecord.setValue({ fieldId: 'nextapprover', value: nextApprover });
            }
            thisRecord.save();
        };

        return {
            afterSubmit
        };
    }
);