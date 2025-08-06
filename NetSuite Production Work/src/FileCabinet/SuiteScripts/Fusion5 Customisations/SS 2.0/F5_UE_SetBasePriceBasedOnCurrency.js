/**
 * Module Description
 * User Event Script that set RRP field based on Currency of the customer
 *
 * Version    Date            Author         Remarks
 * 1.00       31 OCT 2022     F5-NC         Initial Development
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define([
    './common/F5_PricingGroupMarkUp',
    './common/F5_Constants',
    './common/F5_Error',
    './common/F5_Record',
    './common/F5_Item',
    './common/F5_Search'

], function (f5_pricingGroupMarkUp, f5_constants, f5_error,f5_record,f5_item,f5_search) {

    return {
        afterSubmit: function afterSubmit(context) {
            try {
                if(context.type != context.UserEventType.DELETE){
                    var invoiceRecord = f5_record.load({id: context.newRecord.id, type: context.newRecord.type});
                    var itemCount = invoiceRecord.getLineCount({sublistId: 'time'});
                    var itemsCount = invoiceRecord.getLineCount({sublistId: 'item'});
					var transactioncurrency = invoiceRecord.getValue({
                                fieldId: 'currency'
                    })
                    for (var i = 0; i < itemCount; i++) {
                        var item = invoiceRecord.getSublistValue({
                            sublistId: 'time',
                            fieldId: f5_constants.SublistField.ITEM,
                            line: i
                        });
                        var itemType = invoiceRecord.getSublistValue({
                            sublistId: 'time',
                            fieldId: 'itemtype',
                            line: i
                        });
                        var timeRecord = invoiceRecord.getSublistValue({
                            sublistId: 'time',
                            fieldId: 'doc',
                            line: i
                        });
                        var priceLevel = '';
                        if(timeRecord){
                            var timeR = f5_record.load({
                                type: 'timebill',
                                id: timeRecord,
                                isDynamic: true
                            });

                            /*var fieldLookUpObj = f5_search.lookupFields({
                                type: f5_search.Type.TIME_BILL,
                                id : timeRecord,
                                columns : ['origprice']
                            });
                            log.debug('fieldLookUpObj',fieldLookUpObj)
                            priceLevel = fieldLookUpObj.price.length > 0 ? fieldLookUpObj.price[0].value : '';*/
                            priceLevel = timeR.getValue({
                                fieldId : 'price'
                            });
                            log.debug("priceLevel",priceLevel);
                            if(priceLevel){
                                priceLevel
                                /*timeR.setValue({
                                     fieldId: 'custcol_f5_time_price_level',
                                     value: priceLevel
                                 });
                                timeR.save();*/
                                invoiceRecord.setSublistValue({
                                    sublistId: 'time',
                                    fieldId: 'custcol_f5_time_price_level',
                                    value: priceLevel,
                                    line: i
                                });
                            }

                        }
                        var type;
                        if (item) {
                            if (itemType) {
                                var type = f5_item.getMatchingItemType(itemType);
                            }
                            if (type) {
                                var itemRecord = f5_record.load({
                                    type: type,
                                    id: item,
                                    isDynamic: true
                                });
                                var currency = itemRecord.getValue({
                                    fieldId: 'currency'
                                })
                                var priceId = 'price' + currency;
                                log.debug("priceId", priceId);
                                itemRecord.selectLine({sublistId: priceId, line: 0});
                                var currentBasePrice = itemRecord.getCurrentSublistValue({
                                    sublistId: priceId,
                                    fieldId: f5_constants.SublistField.PRICE_1_
                                });
                                log.debug("currentBasePrice", currentBasePrice);
                                invoiceRecord.setSublistValue({
                                    sublistId: 'time',
                                    fieldId: 'custcol_f5_currency_base_price',
                                    value: currentBasePrice,
                                    line: i
                                });
                            }
                        }

                    }
                    for (var j = 0; j < itemsCount; j++) {
                        var item = invoiceRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: f5_constants.SublistField.ITEM,
                            line: j
                        });
                        var itemType = invoiceRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',
                            line: j
                        });
                        var type;
                        if (item) {
                            if (itemType) {
                                var type = f5_item.getMatchingItemType(itemType);
                            }
                            if (type) {
                                var itemRecord = f5_record.load({
                                    type: type,
                                    id: item,
                                    isDynamic: true
                                });
                                var currency = itemRecord.getValue({
                                    fieldId: 'currency'
                                })
                                var priceId = 'price' + transactioncurrency;
                                itemRecord.selectLine({sublistId: priceId, line: 0});
                                var currentBasePrice = itemRecord.getCurrentSublistValue({
                                    sublistId: priceId,
                                    fieldId: f5_constants.SublistField.PRICE_1_
                                });
								log.debug('currentBasePrice', currentBasePrice);
                                invoiceRecord.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_f5_currency_base_price',
                                    value: currentBasePrice,
                                    line: j
                                });
                            }
                        }

                    }
                    invoiceRecord.save();
                }

            } catch (e) {
                log.error("error", e.toString());
            }
        }
    }
});