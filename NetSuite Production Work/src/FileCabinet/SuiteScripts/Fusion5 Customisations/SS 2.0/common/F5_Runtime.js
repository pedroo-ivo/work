define([
        'N/runtime',
        './F5_Constants'
    ],
    function (runtime, f5_constants) {
        return {
            executionContext: runtime.executionContext,
            envType: runtime.envType,
            accountId: runtime.accountId,
            isFeatureInEffect: function isFeatureInEffect(name) {
                return runtime.isFeatureInEffect({feature: name});
            },
            getCurrentUser: function getCurrentUser() {
                return runtime.getCurrentUser();
            },
            getUser: function getUser() {
                return this.getCurrentUser().id + '';
            },
            getCurrentRole: function getCurrentRole() {
                return this.getCurrentUser().role + '';
            },
            getPreference: function getPreference(options) {
                return this.getCurrentUser().getPreference(options);
            },
            getLocale: function getLocale() {
                return this.getPreference({name: f5_constants.Preference.LANGUAGE});
            },
            isUserInterfaceContext: function isUserInterfaceContext() {
                return runtime.executionContext == runtime.ContextType.USER_INTERFACE;
            },
            isLocationEnabled: function isLocationEnabled() {
                return this.isFeatureInEffect(f5_constants.Feature.LOCATIONS);
            },
            isOneWorld: function isOneWorld() {
                return this.isFeatureInEffect(f5_constants.Feature.ONE_WORLD);
            },
            getCurrentScript: function getCurrentScript() {
                return runtime.getCurrentScript();
            },
            getScriptParameter: function getScriptParameter(options) {
                return this.getCurrentScript().getParameter(options);
            },
            getBundleId: function getBundleId() {
                var me = this;
                if (!me.bundleId) {
                    var script = me.getCurrentScript();
                    if (script) {
                        me.bundleId = (script.bundleIds || [""])[0];
                    }
                }
                return me.bundleId;
            },
            getAccountSubdomain: function getAccountSubdomain() {
                var accountId = runtime.accountId;
                return accountId.toLowerCase().replace("_", "-");
            },
            getSuiteAppId: function getSuiteAppId() {
                return f5_constants.SUITEAPP_ID;
            },
            getFolderPath: function getFolderPath(url, folderName) {
                var me = this;
                return [url || '', '/c.', runtime.accountId, (me.getBundleId() ? '/suitebundle' + me.getBundleId() : '/suiteapp'), '/', me.getSuiteAppId(), '/', folderName].join('');
            },
            getSrcPath: function getSrcPath(url) {
                return this.getFolderPath(url, 'src');
            },
            getLibPath: function getLibPath(url) {
                return this.getFolderPath(url, 'lib');
            }
        };
    });