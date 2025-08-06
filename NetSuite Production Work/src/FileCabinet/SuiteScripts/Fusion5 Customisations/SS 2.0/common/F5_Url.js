define([
        'N/url'
    ],
    function (url) {
        return {
            resolveDomain: function resolveDomain(options) {
                return url.resolveDomain(options);
            },
            resolveRecord: function resolveRecord(options) {
                return url.resolveRecord(options);
            },
            resolveScript: function resolveScript(options) {
                return url.resolveScript(options);
            },
            getTransactionUrl: function getTransactionUrl(tranType, id) {
                var domain = this.resolveDomain({hostType: url.HostType.APPLICATION});

                return ['https://', domain, '/app/accounting/transactions/', tranType.toLowerCase(), '.nl?id=', id].join('');
            },
            getRecordUrl: function getRecordUrl(options) {
                var domain = this.resolveDomain({hostType: url.HostType.APPLICATION});
                var recordUrl = this.resolveRecord(options)

                return ['https://', domain, recordUrl].join('');
            },
            getScriptStatusUrl: function (scriptId) {
                var domain = this.resolveDomain({hostType: url.HostType.APPLICATION});
                var scriptStatusUrl = '/app/common/scripting/mapreducescriptstatus.nl?daterange=TODAY&scripttype={id}&primarykey=';

                return ['https://', domain, scriptStatusUrl.replace('{id}', scriptId)].join('');
            }
        };
    });