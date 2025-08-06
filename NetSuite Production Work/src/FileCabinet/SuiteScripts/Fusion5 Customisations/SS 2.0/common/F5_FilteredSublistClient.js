define([
        './F5_Constants',
        './F5_CurrentRecord',
        './F5_Message',
        './F5_Format',
        './F5_Dialog'
    ],
    function (f5_constants, f5_currentRecord, f5_message, f5_format, f5_dialog) {
        return {
            updateAll: function updateAll(options) {
                var record = f5_currentRecord.get();
                var sublistId = options.sublistId;
                var fieldId = options.fieldId;
                var value = options.value;
                var lineCount = record.getLineCount({sublistId: sublistId});
                for (var i = 0; i < lineCount; i++) {
                    record.selectLine({sublistId: sublistId, line: i});
                    record.setCurrentSublistValue({sublistId: sublistId, fieldId: fieldId, value: value, ignoreFieldChange: true});
                    record.commitLine({sublistId: sublistId});
                }
            },
            refreshPage: function refreshPage() {
                // suppress the alert
                setWindowChanged(window, false);
                // submit the form
                document.forms.main_form.submit();
            },
            hasSelection: function hasSelection(options) {
                var returnValue = false
                var record = options.record;
                var sublistId = options.sublistId;
                var fieldId = options.fieldId;
                var lineCount = record.getLineCount({sublistId: sublistId});
                for (var i = 0; i < lineCount; i++) {
                    var select = record.getSublistValue({sublistId: sublistId, fieldId: fieldId, line: i});
                    if (select) {
                        returnValue = true;
                    }
                }

                return returnValue;
            },
            clearFields: function clearFields(options) {
                var record = f5_currentRecord.get();
                var fields = options.fields || [];
                fields.forEach(function (fieldId) {
                    record.setValue({fieldId: fieldId, value: ''});
                });
            },
            clearCheckboxFields: function clearCheckboxFields(options) {
                var record = f5_currentRecord.get();
                var fields = options.fields || [];
                fields.forEach(function (fieldId) {
                    record.setValue({fieldId: fieldId, value: false});
                });
            },
            validateFields: function validateFields(options) {
                var fields = options.fields;
                var record = options.record;
                for (var i = 0; i < fields.length; i++) {
                    var fieldObject = fields[i];
                    for (var fieldId in fieldObject) {
                        var fieldValue = record.getValue({fieldId: fieldId});
                        if (!fieldValue) {
                            f5_dialog.alert({
                                message: f5_message.getParameteredMessage(f5_constants.Message.PLEASE_SELECT_AT_LEAST_ONE, [fieldObject[fieldId]])
                            });

                            return false;
                        }
                    }
                }

                return true;
            },
            displayBannerMessages: function displayBannerMessages(options) {
                var messages = options.messages;
                var actionMap = {
                    errors: f5_message.createError,
                    confirmations: f5_message.createConfirmation,
                    informations: f5_message.createInformation,
                    warnings: f5_message.createWarning
                };
                if (messages) {
                    Object.keys(messages).forEach(function (messageKey) {
                        var action = actionMap[messageKey];
                        var bannerMessages = messages[messageKey] || [];
                        bannerMessages.forEach(function (messageOptions) {
                            var message = action(messageOptions);
                            if (message) {
                                message.show();
                            }
                        });
                    });
                }
            },
            disableColumnField: function disableColumnField(options) {
                var record = f5_currentRecord.get();
                var field = record.getSublistField({
                    sublistId: options.sublistId,
                    fieldId: options.fieldId,
                    line: options.line
                });
                field.isDisabled = options.value;
            }
        };
    });