define([
        './F5_Record',
        './F5_Search',
        './F5_Constants'
    ],
    function (f5_record, f5_search, f5_constants) {
        var TYPE = f5_constants.CustomRecordType.PRICING_GROUP_MARK_UP;
        var FIELDS = f5_constants.PricingGroupMarkUpField;

        function PricingGroupMarkUp(record) {
            var me = this;
            // inherit from Record
            f5_record.Record.apply(this, [{record: record}]);

            this.getPricingGroup = function getPricingGroup() {
                return me.getValue({fieldId: FIELDS.PRICING_GROUP});
            };

            this.getMarkUp = function getMarkUp() {
                return me.getValue({fieldId: FIELDS.MARK_UP});
            };
        };

        return {
            type: TYPE,
            cast: function cast(record) {
                return new PricingGroupMarkUp(record);
            },
            create: function create(options) {
                options.type = TYPE;
                return new PricingGroupMarkUp(f5_record.create(options));
            },
            load: function load(options) {
                options.type = TYPE;
                return new PricingGroupMarkUp(f5_record.load(options));
            },
            searchMarkUp: function searchMarkUp(pricingGroupId) {
                var columnMap = {
                    markUp: {name: FIELDS.MARK_UP}
                };
                var search = f5_search.create({
                    type: TYPE,
                    filters: [
                        [FIELDS.PRICING_GROUP, f5_search.Operator.ANYOF, pricingGroupId]
                    ],
                    columnMap: columnMap
                });
                var result = search.getJSONResults(columnMap);

                return result.length > 0 ? result[0].markUp : '';
            },
            searchPricingGroupMarkUp: function searchPricingGroupMarkUp(pricingGroupId) {
                var columnMap = {
                    internalId: {name: FIELDS.INTERNAL_ID}
                };
                var search = f5_search.create({
                    type: TYPE,
                    filters: [
                        [FIELDS.PRICING_GROUP, f5_search.Operator.ANYOF, pricingGroupId]
                    ],
                    columnMap: columnMap
                });
                var result = search.getJSONResults(columnMap);

                return result.length > 0 ? result[0].internalId : '';
            }
        };
    });