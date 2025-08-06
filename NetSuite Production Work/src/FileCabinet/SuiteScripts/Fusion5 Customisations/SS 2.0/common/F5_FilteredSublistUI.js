define([
        './F5_Constants',
        './F5_ServerWidget',
        './F5_Format'
    ],
    function (f5_constants, f5_serverWidget, f5_format) {
        var FIELDS = f5_constants.CustomField;
        var SUBLISTS = f5_constants.Sublist;
        var BUTTONS = f5_constants.Button;
        var LABELS = f5_constants.Label;

        function FilteredSublistForm(form) {
            var me = this;
            // inherit from serverWidget.Form
            f5_serverWidget.Form.apply(this, [form]);

            this.setClientScript = function setClientScript(scriptFilePath) {
                me.setClientScriptModulePath(scriptFilePath);
            };

            this.addGroupedFields = function addGroupedFields(options) {
                me.addFieldGroup({id: options.groupId, label: options.groupLabel});
                me.addFields({fields: options.fields, container: options.groupId});
            };

            this.addSimpleSublist = function addSimpleSublist(options) {
                var lines = options.lines;
                var sublist = me.addSublist({id: options.id, type: f5_serverWidget.SublistType.LIST, label: options.label});
                if (options.includeMarkAll) {
                    sublist.addButton({id: BUTTONS.MARK_ALL, label: LABELS.MARK_ALL, functionName: 'markAll'});
                    sublist.addButton({id: BUTTONS.UNMARK_ALL, label: LABELS.UNMARK_ALL, functionName: 'unmarkAll'});
                }
                sublist.addFields(options.fields);
                if (lines.length > 0) {
                    sublist.addLineItems(lines);
                }
            };

            this.addInlineEditorSublist = function addInlineEditorSublist(options) {
                var lines = options.lines;
                var sublist = me.addSublist({id: options.id, type: f5_serverWidget.SublistType.INLINEEDITOR, label: options.label});
                sublist.addFields(options.fields);
                if (lines.length > 0) {
                    sublist.addLineItems(lines);
                }
            };

            this.addResetButton = function addResetButton(options) {
                me.addButton({id: BUTTONS.RESET, label: options.label, functionName: 'resetForm'});
            };

            this.addFilterSublistButton = function addFilterSublistButton(options) {
                me.addButton({id: BUTTONS.FILTER, label: options.label, functionName: 'filterSublist'});
            };

            this.addBannerMessages = function addBannerMessages(options) {
                me.addInlineHtmlField({id: FIELDS.BANNER_MESSAGES, label: LABELS.BANNER_MESSAGES, displayType: f5_serverWidget.FieldDisplayType.HIDDEN, defaultValue: JSON.stringify(options.messages)});
            };
        }

        return {
            createForm: function createForm(options) {
                return new FilteredSublistForm(f5_serverWidget.createForm(options));
            }
        };
    });