/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/ui/dialog', 'N/ui/message','./common/F5_Constants','./common/F5_Record','./common/F5_Item'],

    function (search, record, dialog, message,f5_constants,f5_record,f5_item) {
        var SUBLISTS = f5_constants.Sublist;
        var itemField =  f5_constants.SublistField.ITEM

        function postSourcing(scriptContext) {
            var fieldId = scriptContext.fieldId;
            var currentRecord = scriptContext.currentRecord;
            try {
                if (scriptContext.sublistId === SUBLISTS.ITEM && scriptContext.fieldId === itemField) {
                    var item = currentRecord.getCurrentSublistValue({
                        sublistId: f5_constants.SublistField.ITEM,
                        fieldId: itemField
                    });
                    var itemType = currentRecord.getCurrentSublistValue({
                        sublistId: f5_constants.SublistField.ITEM,
                        fieldId: 'itemtype'
                    });
                    var type;
                    if(item){
                        if(itemType){
                            var type = f5_item.getMatchingItemType(itemType);
                        }
                       log.debug("itemType",itemType);
                        if(type){
                            var itemRecord = f5_record.load({
                                type: type,
                                id: item,
                                isDynamic: true
                            });
                            var currency = currentRecord.getValue({
                                fieldId: 'currency'
                            })
                            var priceId = 'price'+currency;
                          var bodyCurrency = currentRecord.getValue({fieldId:'currency'});
log.debug("body currency", currentRecord.getValue({fieldId:'currency'}));
//need to test if the priceId matches the currency id of the body element
                          
                            log.debug("priceId",priceId);
                            itemRecord.selectLine({sublistId: priceId, line: 0});
                            var currentBasePrice = itemRecord.getCurrentSublistValue({
                                sublistId: priceId,
                                fieldId: f5_constants.SublistField.PRICE_1_
                            });
                            log.debug("currentBasePrice",currentBasePrice);

                          //new test for item currency v body currency
                          if (currency == bodyCurrency)
                          {
                            currentRecord.setCurrentSublistValue({
                                sublistId: f5_constants.SublistField.ITEM,
                                fieldId : 'custcol_f5_currency_base_price',
                                value : currentBasePrice
                            });
                          }
                            
                        }
                    }
                }
            } catch (e) {
                console.error(fieldId);
                console.error(e);
            }
        }
        return {
            postSourcing: postSourcing
        }

    });