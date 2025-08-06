define([
        './F5_Record',
        './F5_Search',
        './F5_Constants'
    ],
    function (f5_record, f5_search, f5_constants) {
        var TYPE = f5_search.Type.SCRIPT_DEPLOYMENT;
        var FIELDS = f5_constants.Field;

        function ScriptDeployment(record) {
            var me = this;
            // inherit from Record
            f5_record.Record.apply(this, [{record: record}]);

            this.getScriptId = function getScriptId() {
                return me.getValue({fieldId: FIELDS.SCRIPT_ID});
            };

            this.setScriptId = function setScriptId(value) {
                me.setValue({fieldId: FIELDS.SCRIPT_ID, value: value});
            };

            this.setTitle = function setTitle(value) {
                me.setValue({fieldId: FIELDS.TITLE, value: value});
            };
        };

        return {
            TYPE: TYPE,
            create: function create(options) {
                options.type = TYPE;
                return new ScriptDeployment(f5_record.create(options));
            },
            copy: function copy(options) {
                options.type = TYPE;
                return new ScriptDeployment(f5_record.copy(options));
            },
            createEntry: function createEntry(options) {
                var record = this.create(options);
                if (options.title) {
                    record.setTitle(options.title);
                }
                if (options.scriptId) {
                    record.setScriptId(options.scriptId);
                }
                return record.save();
            },
            getDeployScriptId: function getDeployScriptID(scriptId) {
                var scriptDeploymentSearch = f5_search.create({
                    type: TYPE,
                    filters: [{name: FIELDS.SCRIPT_ID, operator: f5_search.Operator.IS, values: scriptId}]
                });

                return scriptDeploymentSearch.getFirstResult().id;
            }
        };
    });