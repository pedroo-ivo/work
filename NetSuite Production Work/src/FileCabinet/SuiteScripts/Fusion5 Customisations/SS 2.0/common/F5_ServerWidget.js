define([
        'N/ui/serverWidget'
    ],
    function (serverWidget) {
        function Field(field) {
            this.updateDisplayType = function updateDisplayType(options) {
                if (field) {
                    field.updateDisplayType(options);
                }
            };
            this.updateLayoutType = function updateLayoutType(options) {
                if (field) {
                    field.updateLayoutType(options);
                }
            };
            this.updateBreakType = function updateBreakType(options) {
                if (field) {
                    field.updateBreakType(options);
                }
            };
            this.hide = function hide() {
                this.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            };
            this.show = function show() {
                this.updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
            };
            this.disable = function disable() {
                this.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            };
            this.require = function require() {
                if (field) {
                    field.isMandatory = true;
                }
            };
            this.unRequire = function unRequire() {
                if (field) {
                    field.isMandatory = false;
                }
            };
            this.setDefaultValue = function setDefaultValue(defaultValue) {
                if (field) {
                    field.defaultValue = defaultValue;
                }
            };
            this.removeSelectOption = function removeSelectOption(options) {
                if (field) {
                    field.removeSelectOption(options);
                }
            };
            this.addSelectOption = function addSelectOption(options) {
                if (field) {
                    field.addSelectOption(options);
                }
            };
        }

        function Sublist(sublist) {
            this.addButton = function addButton(options) {
                if (sublist) {
                    return sublist.addButton(options);
                }
            };
            this.hide = function hide() {
                sublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
            };
            this.addField = function addField(options) {
                return new Field(sublist.addField(options));
            };
            this.getField = function getField(options) {
                return new Field(sublist.getField(options));
            };
            this.addFields = function addFields(fields) {
                var me = this;
                fields.forEach(function (field) {
                    var fld = me.addField({
                        id: field.id,
                        label: field.label,
                        type: field.type,
                        source: field.source || ''
                    });
                    if (field.displayType) {
                        fld.updateDisplayType({
                            displayType: field.displayType
                        });
                    }
                    if (field.isMandatory) {
                        fld.require();
                    }
                    if (field.height && field.width) {
                        fld.updateDisplaySize({
                            height: field.height,
                            width: field.width
                        });
                    }
                    if (field.selectOptions) {
                        field.selectOptions.forEach(function (selectOption) {
                            fld.addSelectOption(selectOption);
                        });
                    }
                    if (field.defaultValue) {
                        field.defaultValue = field.defaultValue;
                    }
                });
            };
            this.addLineItems = function addLineItems(items) {
                for (var i = 0, ii = items.length; i < ii; i++) {
                    var item = items[i];
                    for (var fieldId in item) {
                        var value = item[fieldId];
                        if (value) {
                            sublist.setSublistValue({id: fieldId, line: i, value: value});
                        }
                    }
                }
            };
            this.hideFields = function hideFields(options) {
                options.fields.forEach(function (id) {
                    var field = sublist.getField({id: id});
                    if (field) {
                        field.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                    }
                });
            };
            this.requireFields = function requireFields(options) {
                options.fields.forEach(function (id) {
                    var field = sublist.getField({id: id});
                    if (field) {
                        field.isMandatory = true;
                    }
                });
            };

            this.setSublistValue = function setSublistValue(options) {
                if (sublist) {
                    sublist.setSublistValue(options);
                }
            };

            this.getLineCount = function getLineCount() {
                return sublist ? sublist.lineCount : -1;
            };

            this.addMarkAllButtons = function addMarkAllButtons() {
                sublist.addMarkAllButtons();
            }
        }

        function Form(form) {
            this.nsForm = form;
            this.getField = function getField(options) {
                return new Field(form.getField(options));
            };
            this.addField = function addField(options) {
                var field = new Field(form.addField(options));
                field.setDefaultValue(options.defaultValue);
                if (options.isMandatory) {
                    field.require();
                }
                if (options.selectOptions) {
                    options.selectOptions.forEach(function (selectOption) {
                        field.addSelectOption(selectOption);
                    });
                }
                if (options.displayType) {
                    field.updateDisplayType({displayType: options.displayType});
                }
                if (options.layoutType) {
                    field.updateLayoutType({layoutType: options.layoutType});
                }
                if (options.breakType) {
                    field.updateBreakType({breakType: options.breakType});
                }
                if (options.defaultValue) {
                    field.defaultValue = options.defaultValue;
                }

                return field;
            };
            this.addInlineHtmlField = function addInlineHtmlField(options) {
                options.type = serverWidget.FieldType.INLINEHTML;
                return this.addField(options);
            };
            this.addLongTextField = function addLongTextField(options) {
                options.type = serverWidget.FieldType.LONGTEXT;
                return this.addField(options);
            };
            this.addTextField = function addTextField(options) {
                options.type = serverWidget.FieldType.TEXT;
                return this.addField(options);
            };
            this.addCheckBoxField = function addCheckBoxField(options) {
                options.type = serverWidget.FieldType.CHECKBOX;
                return this.addField(options);
            };
            this.addSelectField = function addSelectField(options) {
                options.type = serverWidget.FieldType.SELECT;
                return this.addField(options);
            };
            this.addDateField = function addDateField(options) {
                options.type = serverWidget.FieldType.DATE;
                return this.addField(options);
            };
            this.addFields = function addFields(options) {
                var me = this;
                options.fields.forEach(function (fieldOptions) {
                    fieldOptions.container = options.container;
                    me.addField(fieldOptions);
                });
            };
            this.insertField = function insertField(options) {
                form.insertField(options);
            };
            this.getSublist = function getSublist(options) {
                return new Sublist(form.getSublist(options));
            };
            this.addSublist = function addSublist(options) {
                return new Sublist(form.addSublist(options));
            };
            this.hideSublist = function hideSublist(options) {
                var sublist = form.getSublist(options);
                if (sublist) {
                    sublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
                }
            };
            this.getButton = function getButton(options) {
                return form.getButton(options);
            };
            this.addButton = function addButton(options) {
                return form.addButton(options);
            };
            this.removeButton = function removeButton(options) {
                form.removeButton(options);
            };
            this.disableFields = function disableFields(fieldIds, editableFieldIds) {
                var me = this;
                editableFieldIds = editableFieldIds || [];
                log.debug('fieldIds', JSON.stringify(fieldIds));
                log.debug('editableFieldIds', JSON.stringify(editableFieldIds));
                fieldIds.forEach(function (id) {
                    if (editableFieldIds.indexOf(id) < 0) {
                        log.debug('id', id);
                        var field = me.getField({id: id});
                        if (field) {
                            log.debug('field.disable()', id);
                            field.disable();
                        }
                    }
                });
            };
            this.addSubtab = function addSubtab(options) {
                return form.addSubtab(options);
            };
            this.addTab = function addTab(options) {
                return form.addTab(options);
            };
            this.insertSubtab = function insertSubtab(options) {
                form.insertSubtab(options);
            };
            this.insertSublist = function insertSublist(options) {
                form.insertSublist(options);
            };
            this.addSubmitButton = function addSubmitButton(options) {
                return form.addSubmitButton(options);
            };
            this.addResetButton = function addResetButton(options) {
                return form.addResetButton(options);
            };
            this.addFieldGroup = function addFieldGroup(options) {
                return form.addFieldGroup(options);
            };
            this.setClientScriptModulePath = function setClientScriptModulePath(path) {
                form.clientScriptModulePath = path;
            };
            this.addPageInitMessage = function addPageInitMessage(options) {
                form.addPageInitMessage(options);
            };
        }

        return {
            FieldType: serverWidget.FieldType,
            FieldDisplayType: serverWidget.FieldDisplayType,
            FieldLayoutType: serverWidget.FieldLayoutType,
            FieldBreakType: serverWidget.FieldBreakType,
            SublistType: serverWidget.SublistType,
            Form: Form,
            castForm: function castForm(form) {
                return new Form(form);
            },
            createForm: function createForm(options) {
                return serverWidget.createForm(options);
            }
        };
    });