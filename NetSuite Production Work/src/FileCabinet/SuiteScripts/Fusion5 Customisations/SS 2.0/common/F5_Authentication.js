/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(function (require) {
    var crypto = require('../lib/crypto-js');
    require('../lib/oauth'); // do not change.

    function getAuthDetails(configId) {
        var authDetails = {};
        authDetails.realm = '1234567_SB1';
        authDetails.basic = false;
        authDetails.type = 'oauth';
        authDetails.consumerKey = 'foo';
        authDetails.signatureMethod = 'HMAC-SHA256';
        authDetails.token = 'bar';
        authDetails.consumersecret = 'baz';
        authDetails.tokensecret = 'qux';

        return authDetails;
    }

    function tokenAuthentication(authDetails, request) {
        var oauth = OAuth({
            consumer: {
                key: authDetails.consumerKey, //Manage Integrations
                secret: authDetails.consumersecret //Manage Integrations
            },
            signature_method: authDetails.signatureMethod,
            hash_function: function (base_string, key) {
                return crypto.HmacSHA256(base_string, key).toString(crypto.enc.Base64);
            }
        });
        var token = {
            key: authDetails.token,
            secret: authDetails.tokensecret
        };
        var request_data = {
            url: request.url,
            method: request.method,
            data: {}
        };
        var headerWithRealm = oauth.toHeader(oauth.authorize(request_data, token));
        headerWithRealm.Authorization += ', realm="' + authDetails.realm + '"';

        return headerWithRealm.Authorization;
    }

    function getOauthAuthorization(authDetails, request) {
        var authentication = '';
        authDetails.timeStamp = Math.round(+new Date() / 1000);
        authentication = tokenAuthentication(authDetails, request);

        return authentication;
    }

    return {
        getOauthHeaders: function getOauthHeaders(options) {
            var authDetails = getAuthDetails();
            var authorization = getOauthAuthorization(authDetails, options.request);
            var headerDetail = {};
            headerDetail['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
            headerDetail['Accept'] = '*/*';
            headerDetail['Accept-Encoding'] = 'gzip, deflate, br';
            headerDetail['Connection'] = 'keep-alive';
            headerDetail['HOST'] = 'application.netsuite.com';
            headerDetail['Authorization'] = authorization;
            headerDetail['Content-Type'] = 'application/json';

            return headerDetail;
        },
        getBasicHeaders: function getBasicHeaders() {
            var secret = {
                realm: '4904705_SB1',
                user: {
                    email: 'integration@fusion5.com.au',
                    password: 'integratioN@1689',
                    role: '1007'
                }
            }
            var authString = 'nlauth_account = ' + secret.realm;
            authString += ',nlauth_email=' + secret.user.email
            authString += ',nlauth_signature=' + secret.user.password
            authString += ',nlauth_role=' + secret.user.role

            var headers = {
                'Authorization': 'NLAuth ' + authString
            };

            return headers;
        },
    };
});