/**
 * @NApiVersion         2.1
 * @NScriptType         WorkflowActionScript
 * @NModuleScope        SameAccount
 */

define(
    [
        '../common/F5_Constants',
        '../common/F5_Record',
        '../common/F5_Search'
    ],
    (
        f5_constants,
        f5_record,
        f5_search
    ) => {
        const MODULE = `F5.WA|RateComparison`;
        const FIELDS = f5_constants.TransactionField;
        const SUBLIST = f5_constants.SublistField;

        const onAction = (context) => {
            const TITLE = `${MODULE}.Action`;
            let { newRecord } = context;
            log.debug({ title: TITLE, details: `type = ${newRecord.type}; id = ${newRecord.id}` });

            return compareRates(context);
        }

        const compareRates = (context) => {
            const TITLE = `${MODULE}.CompareRates`;
            let { newRecord } = context;
            let output = 'T';
            let createdFrom = '';

            let effTransaction = newRecord.getValue({ fieldId: FIELDS.EFF_XML2NS_TRANSACTION });
            log.debug({ title: `${TITLE} effTransaction`, details: effTransaction });
            if (effTransaction) {
                const SUBLIST = f5_constants.SublistField;
                let poLines = newRecord.getLineCount({ sublistId: f5_constants.Sublist.PURCHASE_ORDERS });
                if (poLines <= 0) { return false; }

                createdFrom = newRecord.getSublistValue({
                    sublistId: f5_constants.Sublist.PURCHASE_ORDERS,
                    fieldId: SUBLIST.ID,
                    line: 0
                });
                log.debug({ title: `${TITLE} poLines = ${poLines}`, details: `purchaseOrder = ${createdFrom}` });
            }
            else {
                createdFrom = newRecord.getValue({ fieldId: FIELDS.CREATED_FROM_PO });
            }

            if (!createdFrom) {
                log.error({ title: TITLE, details: `Vendor bill is stand-alone. Exiting...` });
                return output;
            }
            log.debug({ title: TITLE, details: `createdFrom = ${createdFrom}` });

            let itemReceiptId = getRelatedItemReceiptId({ purchaseOrder: createdFrom });
            let irLines = getLineValues({ id: itemReceiptId, type: f5_record.Type.ITEM_RECEIPT });
            let poLines = getLineValues({ id: createdFrom, type: f5_record.Type.PURCHASE_ORDER });
            let vbLines = getLineValues({ id: newRecord.id, type: newRecord.type });

            for (let i = 0, count = poLines.length; i < count; i++) {
                let poLine = poLines[i];
                log.debug({ title: `${TITLE} i=${i} poLine`, details: JSON.stringify(poLine) });

                let irLine = irLines.find(line => line.item === poLine.item && line.quantity === poLine.quantity);
                if (!irLine) {
                    log.debug({ title: TITLE, details: `No matching Item Receipt line. Skipping...` });
                    continue;
                }
                log.debug({ title: `${TITLE} i=${i} irLine`, details: JSON.stringify(irLine) });

                let vbLine = vbLines.find(line => line.item === poLine.item && line.quantity === poLine.quantity);
                if (!vbLine) {
                    log.debug({ title: TITLE, details: `No matching Vendor Receipt line. Skipping...` });
                    continue;
                }
                log.debug({ title: `${TITLE} i=${i} vbLine`, details: JSON.stringify(vbLine) });

                if (poLine.rate !== irLine.rate ||
                    poLine.rate !== vbLine.rate ||
                    irLine.rate !== vbLine.rate) {
                    output = 'F';
                    break;
                }
            }

            log.debug({ title: TITLE, details: `output = ${output}` });
            return output;
        };

        const getLineValues = (options) => {
            const TITLE = `${MODULE}.GetLineValues`;
            let { id, type } = options;
            log.debug({ title: TITLE, details: `type = ${type}; id = ${id}` });

            let output = [];
            if (!id) {
                log.error({ title: TITLE, details: `Missing required value (id) for type = ${type}.` });
                return output;
            }

            let transaction = f5_record.load({ id, type });
            let lineCount = transaction.getLineCount({ sublistId: f5_constants.Sublist.ITEM });
            for (let line = 0; line < lineCount; line++) {
                let sublist = {
                    sublistId: f5_constants.Sublist.ITEM,
                    line
                };
                output.push({
                    id: transaction.getSublistValue({ ...sublist, fieldId: SUBLIST.LINE }),
                    item: transaction.getSublistValue({ ...sublist, fieldId: SUBLIST.ITEM }),
                    quantity: transaction.getSublistValue({ ...sublist, fieldId: SUBLIST.QUANTITY }),
                    rate: transaction.getSublistValue({ ...sublist, fieldId: SUBLIST.RATE })
                });
            }
            log.debug({ title: TITLE, details: JSON.stringify(output) });

            return output;
        };

        const getRelatedItemReceiptId = (options) => {
            const TITLE = `${MODULE}.GetRelatedItemReceiptId`;
            let { purchaseOrder } = options;
            log.debug({ title: TITLE, details: `purchaseOrder = ${purchaseOrder}` });

            let irSearch = f5_search.create({
                type: 'itemreceipt',
                filters: [
                    [ FIELDS.CREATED_FROM, 'anyof', purchaseOrder ]
                ]
            });
            let irResults = irSearch.run().getRange({ start: 0, end: 1 });
            log.debug({ title: `${TITLE} irResults`, details: JSON.stringify(irResults) });

            return irResults.length > 0 ? irResults[0].id : '';
        };

        return {
            onAction
        };
    }
);