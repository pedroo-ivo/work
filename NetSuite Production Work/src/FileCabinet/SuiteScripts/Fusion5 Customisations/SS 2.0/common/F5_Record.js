define([
        'N/record'
    ],
    function (record) {
        function Record(options) {
            var me = this;
            me.record = options.record;
            me.id = options.record.id || '';
            me.type = options.record.type;

            this.getFields = function getFields() {
                return me.record.getFields();
            };

            this.getField = function getField(options) {
                return me.record.getField(options);
            };

            this.getValue = function getValue(options) {
                return me.record.getValue(options);
            };

            this.getText = function getText(options) {
                return me.record.getText(options);
            };

            this.setText = function setText(options) {
                me.record.setText(options);
            };

            this.setValue = function setValue(options) {
                me.record.setValue(options);
            };

            this.getLineCount = function getLineCount(options) {
                return me.record.getLineCount(options);
            };

            this.insertLine = function insertLine(options) {
                me.record.insertLine(options);
            };

            this.removeLine = function removeLine(options) {
                me.record.removeLine(options);
            };

            this.selectLine = function selectLine(options) {
                me.record.selectLine(options);
            };

            this.selectNewLine = function selectNewLine(options) {
                me.record.selectNewLine(options);
            };

            this.commitLine = function commitLine(options) {
                me.record.commitLine(options);
            };

            this.findSublistLineWithValue = function findSublistLineWithValue(options) {
                return me.record.findSublistLineWithValue(options);
            };

            this.getCurrentSublistValue = function getCurrentSublistValue(options) {
                return me.record.getCurrentSublistValue(options);
            };

            this.getCurrentSublistText = function getCurrentSublistText(options) {
                return me.record.getCurrentSublistText(options);
            };

            this.getCurrentSublistIndex = function getCurrentSublistIndex(options) {
                return me.record.getCurrentSublistIndex(options);
            };

            this.getSublistValue = function getSublistValue(options) {
                return me.record.getSublistValue(options);
            };

            this.getSublistText = function getSublistText(options) {
                return me.record.getSublistText(options);
            };

            this.getSublistField = function getSublistField(options) {
                return me.record.getSublistField(options);
            };

            this.getSublistFields = function getSublistFields(options) {
                return me.record.getSublistFields(options);
            };

            this.getSublistSubrecord = function getSublistSubrecord(options) {
                return me.record.getSublistSubrecord(options);
            };

            this.getSubrecord = function getSubrecord(options) {
                return me.record.getSubrecord(options);
            };

            this.setSublistValue = function setSublistValue(options) {
                me.record.setSublistValue(options);
            };

            this.setSublistText = function setSublistText(options) {
                me.record.setSublistText(options);
            };

            this.setCurrentSublistValue = function setCurrentSublistValue(options) {
                me.record.setCurrentSublistValue(options);
            };

            this.setCurrentSublistText = function setCurrentSublistText(options) {
                me.record.setCurrentSublistText(options);
            };

            this.save = function save(options) {
                me.id = me.record.save(options);
                return me.id;
            };

            this.getValues = function getValues(options) {
                var values = {};
                Object.keys(options.keyFieldIdMap).forEach(function (key) {
                    var fieldId = options.keyFieldIdMap[key];
                    if (fieldId) {
                        values[key] = key.indexOf('Text') > -1 ?me.getText({fieldId: fieldId}) : me.getValue({fieldId: fieldId});
                    }
                });
                return values;
            };

            this.setValues = function setValues(options) {
                Object.keys(options.values).forEach(function (key) {
                    var value = options.values[key];
                    var fieldId = options.keyFieldIdMap ? options.keyFieldIdMap[key] : key;
                    if (fieldId) {
                        var setOptions = {fieldId: options.keyFieldIdMap ? options.keyFieldIdMap[key] : key};
                        if (key.indexOf('Text') > -1) {
                            setOptions.text = value;
                            me.setText(setOptions)
                        } else {
                            setOptions.value = value;
                            me.setValue(setOptions);
                        }
                    }
                });
            };

            this.setCurrentSublistValues = function setCurrentSublistValues(options) {
                var sublistId = options.sublistId;
                var keyFieldIdMap = options.keyFieldIdMap;
                var fieldValues = options.fieldValues;
                var line = options.line;
                me.selectLine({sublistId: sublistId, line: line});
                Object.keys(fieldValues).forEach(function (key) {
                    var fieldId = keyFieldIdMap[key];
                    var value = fieldValues[key];
                    if (fieldId) {
                        me.setCurrentSublistValue({sublistId: sublistId, fieldId: fieldId, value: value});
                    }
                });
                me.commitLine({sublistId: sublistId});
            };

            this.setSublistValues = function setSublistValues(options) {
                var sublistId = options.sublistId;
                var keyFieldIdMap = options.keyFieldIdMap;
                var fieldValues = options.fieldValues;
                var line = options.line;
                Object.keys(fieldValues).forEach(function (key) {
                    var fieldId = keyFieldIdMap[key];
                    var value = fieldValues[key];
                    if (fieldId) {
                        me.setSublistValue({sublistId: sublistId, fieldId: fieldId, value: value, line: line});
                    }
                });
            };

            this.getSublistLine = function getSublistLine(options) {
                var sublistLine = {};
                var sublistId = options.sublistId;
                var line = options.line;
                var keyFieldIdMap = options.keyFieldIdMap;
                Object.keys(keyFieldIdMap).forEach(function (key) {
                    var fieldId = keyFieldIdMap[key];
                    if (fieldId) {
                        var options = {sublistId: sublistId, fieldId: fieldId, line: line};
                        sublistLine[key] = key.indexOf('Text') > -1 ? me.getSublistText(options) : me.getSublistValue(options);
                    }
                });

                return sublistLine;
            };

            this.getSublistLines = function getSublistLines(options) {
                var sublistId = options.sublistId;
                var keyFieldIdMap = options. keyFieldIdMap;
                var sublistLines = [];
                var lineCount = me.getLineCount({sublistId: sublistId});
                for (var line = 0; line < lineCount; line++) {
                    sublistLines.push(me.getSublistLine({sublistId: sublistId,  keyFieldIdMap: keyFieldIdMap, line: line}));
                }

                return sublistLines;
            };

            this.addSublistLines = function addSublistLines(options) {
                var me = this;
                var sublistId = options.sublistId;
                var keyFieldIdMap = options.keyFieldIdMap;
                var lines = options.lines;
                lines.forEach(function (line) {
                    me.selectNewLine({sublistId: sublistId});
                    Object.keys(line).forEach(function (lineKey) {
                        var value = line[lineKey] == null ? '' : line[lineKey];
                        var fieldId = keyFieldIdMap[lineKey];
                        if (fieldId) {
                            var setOptions = {sublistId: sublistId, fieldId: fieldId, value: value};
                            if (lineKey.indexOf('Text') > -1) {
                                setOptions.text = value;
                                me.setCurrentSublistText(setOptions)
                            } else {
                                setOptions.value = value;
                                me.setCurrentSublistValue(setOptions);
                            }
                        }
                    });
                    me.commitLine({sublistId: sublistId});
                });
            };

            this.removeSublistLines = function removeSublistLines(options) {
                var me = this;
                var sublistId = options.sublistId;
                var lineCount = me.getLineCount({sublistId: sublistId});
                for (var i = 0; i < lineCount; i++) {
                    me.removeLine({sublistId: sublistId, line: 0});
                }
            };
        };

        return {
            get Type() { return record.Type; },
            Record: Record,
            submitFields: function submitFields(options) {
                return record.submitFields(options);
            },
            create: function create(options) {
                return record.create(options);
            },
            load: function load(options) {
                return record.load(options);
            },
            copy: function copy(options) {
                return record.copy(options);
            },
            transform: function transform(options) {
                return record.transform(options);
            },
            delete: function del(options) {
                return record.delete(options);
            },
            cast: function cast(record) {
                return new Record({record: record});
            },
            promisedLoad: function promisedLoad(options) {
                return record.load.promise(options);
            }
        };
    });