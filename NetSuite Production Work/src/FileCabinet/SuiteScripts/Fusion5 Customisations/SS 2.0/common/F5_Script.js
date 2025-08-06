define([
        './F5_Runtime',
        './F5_Constants',
        './F5_Record',
        './F5_Search'
    ],
    function (f5_runtime, f5_constants, f5_record, f5_search) {
        var FIELDS = f5_constants.Field;

        return {
            Parameter: f5_constants.ScriptParameter,
            ScriptId: f5_constants.ScriptId,
            DeploymentId: f5_constants.DeploymentId,
            getParameter: function getParameter(name) {
                if (!this.script) {
                    this.script = f5_runtime.getCurrentScript();
                }
                return this.script.getParameter({ name: name });
            },
            getMapReduceScriptInternalId: function getMapReduceScriptInternalId(scriptId) {
                var search = f5_search.create({
                    type: f5_search.Type.MAP_REDUCE_SCRIPT,
                    filters: [FIELDS.SCRIPT_ID, f5_search.Operator.IS, scriptId]
                });
                var result = search.getFirstResult();

                return result ? result.id : '';
            },
            createButtonClickPromptScript: function createButtonClickPromptScript(options) {
                return [
                    '<script type="text/javascript">',
                        'function addPrompt(button) {',
                            'if (button && button[0] && button[0].onclick) {',
                                'var onHold = button[0].onclick;',
                                'button[0].onclick = null;',
                                'button.click(function() {',
                                'Ext.MessageBox.show({',
                                    'title: "' + options.title + '",',
                                    'msg: "' + options.message + '",',
                                    'width:300,',
                                    'buttons: Ext.MessageBox.OKCANCEL,',
                                    'multiline: true,',
                                    'fn: function(btn, text) {',
                                        'if (btn == "ok") {',
                                            'Ext.MessageBox.wait("Please wait...", "' + options.waitMessage + '");',
                                                'setTimeout(function() {',
                                                    //TODO: Add script on click OK
                                                    'console.log("test!")',
                                                '}, 1);',
                                            '}',
                                        '}',
                                    '});',
                                '});',
                            '}',
                        '}',
                        'addPrompt(jQuery("input[type=button][id=' + options.buttonId + ']"));',
                    '</script>'
                ].join('\n');
            },
            createSaveButtonClickScript: function createSaveButtonClickScript() {
                return [
                    '<script type="text/javascript">',
                    'function editPurchaseOrder() {',
                        'require(["N/url", "N/currentRecord"], function(url, currentRecord) {',
                            'var record = currentRecord.get();',
                            'var scriptUrl = url.resolveScript({scriptId: "customscript_f5_sl_vendor_purchaseorder", deploymentId: "customdeploy_f5_sl_vendor_purchaseorder", params: {custpage_f5_id: record.id}});',
                            'window.open(scriptUrl);',
                        '});',
                    '}',
                    '</script>'
                ].join('\n');
            }
        };
    });