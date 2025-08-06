/**
 * @author              Marlon Villarama
 * @NApiVersion         2.0
 * @NScriptType         MapReduceScript
 * @NModuleScope        SameAccount
 */

define(
    [
        '../common/F5_Constants',
        '../common/F5_Record',
        '../common/F5_Script',
        '../common/F5_Search'
    ],
    function (
        f5_constants,
        f5_record,
        f5_script,
        f5_search
    ) {
        var MODULE = 'F5.MR.UpdateItemPurchasePrice';

        function getInputData () {
            var TITLE = MODULE + '.GetInputData';

            var searchId = f5_script.getParameter(f5_constants.ScriptParameter.ITEMS_RECEIVED);
            if (!searchId) {
                log.debug({ title: TITLE, details: 'Missing required parameter: Items saved search.' });
                return;
            }

            var itemSearch = f5_search.load({ id: searchId });
            var itemResults = itemSearch.getJSONResults();
            log.debug({ title: TITLE, details: JSON.stringify(itemResults) });

            var output = {};
            itemResults.forEach(function (r) {
                log.debug({ title: TITLE + ' r', details: JSON.stringify(r) });
                var item = r.item;
                var itemObject = output[item] || { currency: r.currency, type: r.item_type, vendors: [] };

                var vendor = r.vendor_id.toString();
                var itemVendor = itemObject.vendors.filter(function (v) { return v.vendor.toString() === vendor; });
                if (itemVendor.length > 0) {
                    log.debug({ title: TITLE, details: 'Vendor ' + r.vendor_name + ' (' + vendor + ') has already been added.' });
                    return true;
                }

                itemObject.vendors.push({
                    vendor: r.vendor_id,
                    rate: r.rate
                });
                output[item] = itemObject
                log.debug({ title: TITLE + ' ' + item, details: JSON.stringify(output[item]) });

                return true;
            });

            return output;
        }

        function map (context) {
            var TITLE = MODULE + '.Map';
            var key = context.key;
            var value = context.value;
            log.debug({ title: TITLE + ' key = ' + key, details: value });
            value = JSON.parse(value);
            log.debug({ title: TITLE + ' values', details: value });

            var itemType = getItemType({ type: value.type });
            var itemRecord = f5_record.load({ id: key, type: itemType });

            var vendorCount = itemRecord.getLineCount({ sublistId: 'itemvendor' });
            for (var i = 0; i < vendorCount; i++) {
                var isPreferred = itemRecord.getSublistValue({ sublistId: 'itemvendor', fieldId: 'vendor', line: i });
                if (isPreferred === false) { continue; }

                var itemVendor = itemRecord.getSublistValue({ sublistId: 'itemvendor', fieldId: 'vendor', line: i });
                var vendorFound = value.vendors.filter(function (v) { return v.vendor === itemVendor; });
                if (vendorFound.length <= 0) { continue; }
                log.debug({ title: TITLE + ' vendorFound', details: JSON.stringify(vendorFound) });

                var params = {
                    currency: value.currency,
                    item: key,
                    line: i,
                    rate: vendorFound[0].rate
                };
                updateItemVendorPrices({
                    params: params,
                    record: itemRecord
                });
            }

            var itemId = itemRecord.save();
            log.debug({ title: TITLE, details: 'Successfully updated item ID ' + itemId });
            context.write({ key: key, value: true });
        }

        function updateItemVendorPrices (options) {
            var TITLE = MODULE + '.UpdateItemVendorPrices';
            var record = options.record;
            var params = options.params;
            log.debug({ title: TITLE + ' params', details: JSON.stringify(params) });

            var vendorPrices = record.getSublistSubrecord({
                sublistId: 'itemvendor',
                fieldId: 'itemvendorprice',
                line: params.line
            });
            // var vendorPriceCount = vendorPrices.getLineCount({ sublistId: 'itemvendorpricelines' });
            var priceLine = vendorPrices.findSublistLineWithValue({
                sublistId: 'itemvendorpricelines',
                fieldId: 'vendorcurrency',
                value: params.currency
            });
            if (priceLine < 0) { return; }
            log.debug({ title: TITLE + ' priceLine', details: priceLine });

            vendorPrices.setSublistValue({
                sublistId: 'itemvendorpricelines',
                fieldId: 'vendorprice',
                line: priceLine,
                value: params.rate * 1
            });
            log.debug({
                title: TITLE,
                details: 'Updated vendor price line = ' + priceLine + ': Item = ' + params.item + '; Rate = ' + params.rate
            });
        }

        function summarize (summary) {
            var TITLE = MODULE + '.Summarize';

            if (handleErrors(summary.mapSummary) === false) { return; }

            var count = 0;
            summary.output.iterator().each(function (k, v) {
                count++;
                return true;
            });

            log.debug({ title: TITLE, details: 'processed = ' + count });
        }

        function getItemType (options) {
            var type = options.type;
            var output = '';

            switch (type.toLowerCase()) {
                case 'invtpart': { output = 'inventoryitem'; break; }
                case 'assembly': { output = 'assemblyitem'; break; }
            }

            log.debug({ title: 'getItemType output', details: output });
            return output;
        }

        function handleErrors (summary) {
            var TITLE = MODULE + '.HandleErrors';
            var hasErrors = false;

            summary.errors.iterator().each(function (k, v) {
                log.error({ title: TITLE + ' ' + k, details: v });
                hasErrors = true;
                return true;
            });

            return true;
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    }
);