/**
 * @NApiVersion         2.1
 * @NScriptType         WorkflowActionScript
 * @NModuleScope        SameAccount
 */

define(
    [
        '../common/F5_Record',
        '../common/F5_Search'
    ],
    (
        f5_record,
        f5_search
    ) => {
        const MODULE = `F5.WA|CompareIRPOBill`;

        const onAction = (context) => {
            const TITLE = `${MODULE}.Action`;
            let { newRecord } = context;
            let output = true;

            let poId = newRecord.getValue({ fieldId: 'custbody_f5_createdfrompo' });
            if (!poId) { return output; }

            let tranSearch = f5_search.load({ id: 'customsearch_f5_3way_tran_prices' });
            log.debug({ title: `${TITLE} tranSearch filters`, details: JSON.stringify(tranSearch.getFilterExpression()) });

            tranSearch.addFilterExpression([
                [ 'custbody_f5_createdfrompo', 'anyof', poId ],
                'OR',
                [ 'createdfrom', 'anyof', poId ],
                'OR',
                [ 'internalid', 'anyof', poId ]
            ]);
            let results = tranSearch.getJSONResults({
                'type': tranSearch.columns[0],
                'amount': tranSearch.columns[1]
            });
            log.debug({ title: `${TITLE} results`, details: JSON.stringify(results) });

            let amounts = [ ...new Set(results.map(r => r.amount)) ];
            output = amounts.length === 1;
            log.debug({ title: `${TITLE} output length = ${amounts.length}`, details: output });

            return output;
        };

        return { onAction };
    }
);






















