define([
        './F5_Search',
        './F5_Record',
        './F5_Constants'
    ],
    function (f5_search, f5_record, f5_constants) {
        var TYPE = f5_search.Type.TRANSACTION;
        var FIELDS = f5_constants.TransactionField;
        var SUBLISTS = f5_constants.Sublist;
        var SHORTS = f5_constants.TransactionTypeShort;
        var NAMES = f5_constants.TransactionTypeName;
        var IDS = f5_constants.TransactionTypeInternalId;
        var SUBLIST_FIELDS = f5_constants.SublistField;
        var ADDRESS_FIELDS = f5_constants.AddressField;

        function StandardTransaction(record) {
            var me = this;
            // inherit from Record
            f5_record.Record.apply(this, [{record: record}]);

            this.getTypeShort = function getTypeShort() {
                return SHORTS[me.type.toUpperCase()] || '';
            };

            this.getTypeName = function getTypeName() {
                return NAMES[me.type.toUpperCase()] || '';
            };

            this.getTypeId = function getTypeId() {
                return IDS[me.type.toUpperCase()] || '';
            };

            this.getTranId = function getTranId() {
                return me.getValue({fieldId: FIELDS.TRAN_ID});
            };

            this.getDate = function getDate() {
                return me.getValue({fieldId: FIELDS.DATE});
            };

            this.getTranDate = function getTranDate() {
                return me.getValue({fieldId: FIELDS.TRAN_DATE});
            };

            this.getEntity = function getEntity() {
                return me.getValue({fieldId: FIELDS.ENTITY});
            };

            this.getTotal = function getTotal() {
                return me.getValue({fieldId: FIELDS.TOTAL}) || 0;
            };

            this.getSubsidiary = function getSubsidiary() {
                return me.getValue({fieldId: FIELDS.SUBSIDIARY});
            };

            this.getDepartment = function getDepartment() {
                return me.getValue({fieldId: FIELDS.DEPARTMENT});
            };

            this.getClass = function getClass() {
                return me.getValue({fieldId: FIELDS.CLASS});
            };

            this.getLocation = function getLocation() {
                return me.getValue({fieldId: FIELDS.LOCATION});
            };

            this.getJob = function getJob() {
                return me.getValue({fieldId: FIELDS.JOB});
            };

            this.getStatusRef = function getStatusRef() {
                return me.getValue({fieldId: FIELDS.STATUS_REF});
            };

            this.getCreatedFrom = function getCreatedFrom() {
                return me.getValue({fieldId: FIELDS.CREATED_FROM}) || '';
            };

            this.getMemo = function getMemo() {
                return me.getValue({fieldId: FIELDS.MEMO});
            };

            this.getCreatedFromTranId = function getCreatedFromTranId() {
                var tranId = '';
                var text = me.getText({fieldId: FIELDS.CREATED_FROM}) || '';
                if (text) {
                    var arr = text.split('#');
                    tranId = arr[1];
                }

                return tranId;
            };

            this.getLocation = function getLocation() {
                return me.getValue({fieldId: FIELDS.LOCATION});
            };

            this.getApprovalStatus = function getApprovalStatus() {
                return me.getValue({fieldId: FIELDS.APPROVAL_STATUS});
            };

            this.getEntityStatus = function getEntityStatus() {
                return me.getValue({fieldId: FIELDS.ENTITY_STATUS});
            };

            this.getOrderStatus = function getOrderStatus() {
                return me.getValue({fieldId: FIELDS.ORDER_STATUS});
            };

            this.getLandedCostPerline = function getLandedCostPerline() {
                return me.getValue({fieldId: FIELDS.LANDED_COST_PER_LINE});
            };

            this.getCurrency = function getCurrency() {
                return me.getValue({fieldId: FIELDS.CURRENCY});
            };

            this.getExchangeRate = function getExchangeRate() {
                return me.getValue({fieldId: FIELDS.EXCHANGE_RATE});
            };

            this.isItemSublist = function isItemSublist(sublistId) {
                return sublistId == SUBLISTS.ITEM
            };

            this.setDate = function setDate(value) {
                me.setValue({fieldId: FIELDS.DATE, value: value});
            };

            this.setTranDate = function setTranDate(value) {
                me.setValue({fieldId: FIELDS.TRAN_DATE, value: value});
            };

            this.setMemo = function setMemo(value) {
                me.setValue({fieldId: FIELDS.MEMO, value: value});
            };

            this.setSourceFile = function setSourceFile(value) {
                me.setValue({fieldId: FIELDS.SOURCE_FILE, value: value});
            };

            this.setSubsidiary = function setSubsidiary(value) {
                me.setValue({fieldId: FIELDS.SUBSIDIARY, value: value});
            };

            this.setDepartment = function setDepartment(value) {
                me.setValue({fieldId: FIELDS.DEPARTMENT, value: value});
            };

            this.setClass = function setClass(value) {
                me.setValue({fieldId: FIELDS.CLASS, value: value});
            };

            this.setLocation = function setLocation(value) {
                me.setValue({fieldId: FIELDS.LOCATION, value: value});
            };

            this.setEntity = function setEntity(value) {
                me.setValue({fieldId: FIELDS.ENTITY, value: value});
            };

            this.setNextApprover = function setNextApprover(value) {
                me.setValue({fieldId: FIELDS.NEXT_APPROVER, value: value});
            };

            this.setCustomForm = function setCustomForm(value) {
                me.setValue({fieldId: FIELDS.CUSTOM_FORM, value: value});
            };

            this.setJob = function setJob(value) {
                me.setValue({fieldId: FIELDS.JOB, value: value});
            };

            this.setPostingPeriod = function setPostingPeriod(value) {
                me.setValue({fieldId: FIELDS.POSTING_PERIOD, value: value});
            };

            this.setCurrentItemInventoryAssignments = function setCurrentItemInventoryAssignments(options) {
                var me = this;
                var inventoryFieldId = options.inventoryFieldId;
                var inventoryAssignments = options.inventoryAssignments;
                var sublistId = SUBLISTS.INVENTORY_ASSIGNMENT
                var subRecord = me.getCurrentSublistSubrecord({
                    sublistId: SUBLISTS.ITEM,
                    fieldId: SUBLIST_FIELDS.INVENTORY_DETAIL
                });
                inventoryAssignments.forEach(function (inventoryAssignment) {
                    me.setCurrentItemInventoryAssignment({
                        subRecord: subRecord,
                        inventoryFieldId: inventoryFieldId,
                        number: inventoryAssignment.number,
                        quantity: inventoryAssignment.quantity
                    });
                })
            };

            this.setCurrentItemInventoryAssignment = function setCurrentItemInventoryAssignment(options) {
                var subRecord = options.subRecord;
                if (!subRecord) {
                    subRecord = me.getCurrentSublistSubrecord({
                        sublistId: SUBLISTS.ITEM,
                        fieldId: SUBLIST_FIELDS.INVENTORY_DETAIL
                    });
                }
                subRecord.selectNewLine({sublistId: sublistId});
                subRecord.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: SUBLIST_FIELDS.QUANTITY,
                    value: options.quantity
                });
                subRecord.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: options.inventoryFieldId,
                    value: options.number
                });
                subRecord.commitLine({sublistId: sublistId});
            }

            this.setItemInventoryAssignment = function setItemInventoryAssignment(options) {
                var inventoryFieldId = options.inventoryFieldId;
                var number = options.number;
                var quantity = options.quantity;
                var sublistId = SUBLISTS.INVENTORY_ASSIGNMENT;
                var subRecord = me.getSublistSubrecord({
                    sublistId: SUBLISTS.ITEM,
                    fieldId: SUBLIST_FIELDS.INVENTORY_DETAIL,
                    line: options.line
                });
                if (subRecord) {
                    subRecord.setSublistValue({sublistId: sublistId, fieldId: inventoryFieldId, value: number, line: 0});
                    subRecord.setSublistValue({sublistId: sublistId, fieldId: SUBLIST_FIELDS.QUANTITY, value: quantity, line: 0});
                }
            };

            this.getItemLines = function getItemLines(options) {
                options.sublistId = SUBLISTS.ITEM;
                return this.getSublistLines(options);
            };

            this.getExpenseLines = function getExpenseLines() {
                options.sublistId = SUBLISTS.EXPENSE;
                return this.getSublistLines(options);
            };

            this.getItemSublistValue = function getItemSublistValue(options) {
                return me.getSublistValue({sublistId: SUBLISTS.ITEM, fieldId: options.fieldId, line: options.line});
            };

            this.setShippingAddress = function setShippingAddress(options) {
                var subRecord = me.getSubrecord({fieldId: FIELDS.SHIPPING_ADDRESS});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.COUNTRY, value: options.countryCode || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.CITY, value: options.city || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.STATE, value: options.state || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ZIP, value: options.zip || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ADDR1, value: options.addr1 || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ADDR2, value: options.addr2 || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ADDR3, value: options.addr3 || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ADDRESSEE, value: options.addressee || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.ATTENTION, value: options.attention || ''});
                subRecord.setValue({ fieldId: ADDRESS_FIELDS.PHONE, value: options.phone || ''});
            };
        };

        return {
            StandardTransaction: StandardTransaction
        };
    });