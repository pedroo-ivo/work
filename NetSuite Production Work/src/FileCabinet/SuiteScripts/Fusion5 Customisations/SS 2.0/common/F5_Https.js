define([
        'N/https'
    ],
    function (https) {
        return {
            get: function get(options) {
                return https.get(options);
            },
            delete: function deleterec(options) {
                return https.delete(options);
            },
            post: function post(options) {
                return https.post(options);
            },
            put: function put(options) {
                return https.put(options);
            },
            getServerRequest: function getServerRequest() {
                return https.getServerRequest();
            },

            createSecretKey: function createSecretKey(options){
                return https.createSecretKey(options)
            },
            createSecureString: function createSecureString(options) {
                return https.createSecureString(options);
            },
            requestRestlet : function requestRestlet(options) {
                return https.requestRestlet(options)
            },
            requestSuiteTalkRest: function requestSuiteTalkRest(options) {
                return https.requestSuiteTalkRest(options)
            }

        };
    });