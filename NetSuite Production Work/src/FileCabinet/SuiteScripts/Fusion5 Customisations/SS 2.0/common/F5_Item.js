define([
        './F5_Record',
        './F5_Search',
        './F5_Constants'
    ],
    function (f5_record, f5_search, f5_constants) {
        var TYPE = f5_search.Type.ITEM;
        var FIELDS = f5_constants.ItemField;

        function Item(record) {
            var me = this;
            // inherit from Record
            f5_record.Record.apply(this, [{record: record}]);

            this.getAverageCost = function getAverageCost() {
                return me.getValue({fieldId: FIELDS.AVERAGE_COST});
            };

            this.getLastPurchasePrice = function getLastPurchasePrice() {
                return me.getValue({fieldId: FIELDS.LAST_COST});
            };

            this.setAverageCostHolder = function setAverageCostHolder(value) {
                return me.setValue({fieldId: FIELDS.AVERAGE_COST_HOLDER, value: value});
            };

            this.setLastPurchasePriceHolder = function setLastPurchasePriceHolder(value) {
                return me.setValue({fieldId: FIELDS.LAST_COST_HOLDER, value: value});
            };
        };

        return {
            type: TYPE,
            cast: function cast(record) {
                return new Item(record);
            },
            create: function create(options) {
                return new Item(f5_record.create(options));
            },
            load: function load(options) {
                return new Item(f5_record.load(options));
            },
            searchItemsForPriceUpdate: function searchItemsForPriceUpdate(pricingGroupId) {
                var columnMap = {
                    id: {name: FIELDS.INTERNAL_ID},
                    purchasePrice: {name: f5_search.FormulaField.NUMERIC, formula: f5_search.FormulaTemplate.SALES_PRICE_MULTIPLIER},
                    type: {name: FIELDS.TYPE},
                    pricingGroupId: {name: FIELDS.PRICING_GROUP}
                };
                var search = f5_search.create({
                    type: TYPE,
                    filters: [FIELDS.PRICING_GROUP, f5_search.Operator.ANYOF, pricingGroupId],
                    columnMap: columnMap
                });

                return search.getJSONResults(columnMap).filter(function (result) {
                    return result.purchasePrice > 0
                });
            },
            searchItemChangedPrice: function searchItemChangedPrice(savedSearchId) {
                var search = f5_search.load({id: savedSearchId});
                var columnMap = {
                    id: {name: FIELDS.INTERNAL_ID},
                    purchasePrice: {name: f5_search.FormulaField.NUMERIC},
                    type: {name: FIELDS.TYPE},
                    pricingGroupId: {name: FIELDS.PRICING_GROUP}
                };

                return search.getJSONResults(columnMap);
            },
            getMatchingItemType: function getMatchingItemType(itemType) {
                var type;
                switch(itemType) {
                    case f5_constants.ItemType.ASSEMBLY:
                        type = f5_record.Type.ASSEMBLY_ITEM
                        break;
                    case f5_constants.ItemType.INVENTORY:
                        type = f5_record.Type.INVENTORY_ITEM
                        break;
                    case f5_constants.ItemType.NON_INVENTORY:
                        type = f5_record.Type.NON_INVENTORY_ITEM
                        break;
                    case f5_constants.ItemType.SERVICE_ITEM:
                        type = f5_record.Type.SERVICE_ITEM
                            break;
                    case f5_constants.ItemType.CHARGE_ITEM:
                        type = f5_record.Type.OTHER_CHARGE_ITEM
                        break;
                }

                return type;
            },
            updateBasePrice: function updateBasePrice(options) {
                var itemObject = options.itemObject;
                var markUp = options.markUp;
                var recordType = this.getMatchingItemType(itemObject.type);
                var item = this.load({
                    type: recordType,
                    id: itemObject.id,
                    isDynamic: true
                });
                if (itemObject.purchasePrice) {
                    var newPrice = ((itemObject.purchasePrice * parseFloat(markUp)/100) + parseFloat(itemObject.purchasePrice)).toFixed(2);
                    var sublistId = f5_constants.Sublist.PRICE_1;
                    item.selectLine({sublistId: sublistId, line: 0});
                    var currentBasePrice = item.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: f5_constants.SublistField.PRICE_1_
                    }) || 0;

                    if (parseFloat(newPrice) > parseFloat(currentBasePrice)) {
                        item.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: f5_constants.SublistField.PRICE_1_,
                            value: newPrice
                        });
                        log.debug('Item Price Updated', 'New Price: ' + newPrice);
                    } else {
                        log.debug('Item Price Not Updated - Current Base Price is higher/same', 'New Price: ' + newPrice + ' Current Base Price: ' + currentBasePrice);
                    }
                }
                var averageCost = item.getAverageCost();
                var lastPurchasePrice = item.getLastPurchasePrice();
                item.setAverageCostHolder(averageCost);
                item.setLastPurchasePriceHolder(lastPurchasePrice);
                item.save();
            }
        };
    });