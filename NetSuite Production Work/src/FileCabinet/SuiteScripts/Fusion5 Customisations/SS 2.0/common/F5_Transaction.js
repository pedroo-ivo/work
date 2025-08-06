define([
        './F5_Search',
        './F5_Record',
        './F5_Constants',
        './F5_StandardTransaction'
    ],
    function (f5_search, f5_record, f5_constants, f5_standardTransaction) {
        var TYPE = f5_search.Type.TRANSACTION;
        var TYPE_IDS = f5_constants.TransactionTypeInternalId;
        var FIELDS = f5_constants.TransactionField;
        var SUBLISTS = f5_constants.Sublist;
        var SUBLIST_FIELDS = f5_constants.SublistField;
        var keyFieldIdMap = {
            subsidiary: FIELDS.SUBSIDIARY,
            class: FIELDS.CLASS,
            memo: FIELDS.MEMO
        };
        var lineKeyFieldIdMap = {
            subsidiary: SUBLIST_FIELDS.SUBSIDIARY,
            class: SUBLIST_FIELDS.CLASS,
            quantity: SUBLIST_FIELDS.QUANTITY,
        };

        function Transaction(record) {
            var me = this;
            // inherit from Record
            f5_standardTransaction.StandardTransaction.apply(this, [record]);
            //add setters/getters for custom fields and custom methods

        };

        return {
            Transaction: Transaction,
            cast: function cast(record) {
                return new Transaction(record);
            },
            create: function create(options) {
                return new Transaction(f5_record.create(options));
            },
            load: function load(options) {
                return new Transaction(f5_record.load(options));
            },
            lookupCreatedFrom: function lookupCreatedFrom(options) {
                options.columns = [FIELDS.CREATED_FROM];
                var createdFrom = '';
                var fieldLookUpObj = f5_search.lookupFields(options);
                var column = fieldLookUpObj[FIELDS.CREATED_FROM];
                if (column && column[0]) {
                    createdFrom = column[0].value || ''
                }
                return createdFrom;
            },
            lookupTransactionType: function lookupTransactionType(options) {
                options.columns = [FIELDS.TYPE];
                var transactionType = '';
                var fieldLookUpObj = f5_search.lookupFields(options);
                var column = fieldLookUpObj[FIELDS.TYPE];
                if (column && column[0]) {
                    transactionType = column[0].value || ''
                }
                return transactionType;
            },
            submitOrderStatus: function submitAutomationStatus(options) {
                var values = {};
                values[FIELDS.ORDER_STATUS] = options.value;
                f5_record.submitFields({type: options.type, id: options.id, values: values});
            },
            setPhantomAssembly : function setLineValues(options) {
                var record = options.record;
                var itemCount = options.itemCount;
                var lines = options.lines;
                log.error("lines",lines);
                var keyColumnMap = {
                    headerItem:f5_constants.SublistField.WO_HEADER_ITEM,
                    parentAssembly: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM,
                    parentAssemblyLine: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINE,
                    parentAssemblyLineID: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINEID,
                    woAssemblyLevel:f5_constants.SublistField.WO_ASSEMBLY_LEVEL
                };
                for (var i = 0; i < itemCount; i++) {
                    for (var key in keyColumnMap) {
                        record.setSublistValue({sublistId:f5_constants.Sublist.ITEM, fieldId:keyColumnMap[key], value:lines[i][key], line:i})
                    }
                }
            },
            getPhantomAssembly : function getLineValues(options) {
                var record = options.record;
                var itemCount = options.itemCount;
                var keyColumnMap = {
                    item: f5_constants.SublistField.ITEM,
                    assemblyLevel: f5_constants.SublistField.ASSEMBLY_LEVEL,
                    headerItem:f5_constants.SublistField.WO_HEADER_ITEM,
                    parentAssembly: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM,
                    parentAssemblyLine: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINE,
                    parentAssemblyLineID: f5_constants.SublistField.PARENT_ASSEMBLY_ITEM_LINEID,
                    woAssemblyLevel:f5_constants.SublistField.WO_ASSEMBLY_LEVEL,
                    lineId:f5_constants.SublistField.LINE
                };
                var lines = [];
                for (var i = 0; i < itemCount; i++) {
                    var lineValues = {};
                    for (var key in keyColumnMap) {
                        lineValues[key] = record.getSublistValue({
                            sublistId: f5_constants.Sublist.ITEM,
                            fieldId: keyColumnMap[key],
                            line: i
                        })
                        lineValues.woAssemblyLevel = lineValues.assemblyLevel;
                    }
                    lines.push(lineValues)
                }
                return lines;
            }
        };
    });