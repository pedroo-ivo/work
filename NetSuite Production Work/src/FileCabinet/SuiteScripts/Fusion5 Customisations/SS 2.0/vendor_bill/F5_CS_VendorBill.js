/**
 * @NApiVersion     2.1
 * @NScriptType     ClientScript
 */

define(
    [],
    () => {
        const pageInit = (context) => {
            setNextApprover(context);
        };

        const setNextApprover = (context) => {
            console.log('>>> mode ', context.mode);
            if (context.mode === 'edit') {
                return;
            }

            let urlParams = new URLSearchParams(window.location.search);
            console.log('urlParams', urlParams);

            let fromType = urlParams.get('transform');
            if (fromType !== 'purchord') {
                return;
            }

            let formParameters = {
                createdFrom: urlParams.get('id'),
                nextApprover: urlParams.get('nextapprover')
            }
            console.log('formParameters', formParameters);

            if (!formParameters.createdFrom) {
                return;
            }

            if (!formParameters.nextApprover) {
                return;
            }

            context.currentRecord.setValue({ fieldId: 'custbody_f5_createdfrompo', value: formParameters.createdFrom });
            context.currentRecord.setValue({ fieldId: 'nextapprover', value: formParameters.nextApprover });
        };

        return {
            pageInit
        };
    }
);