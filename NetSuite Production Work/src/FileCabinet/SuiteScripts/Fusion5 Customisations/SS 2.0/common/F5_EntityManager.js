define([
        './F5_Constants',
        './F5_Https',
        './F5_Url',
        './F5_Format',
        './F5_Authentication'
    ],
    function (f5_constants, f5_https, f5_url, f5_format, f5_authentication) {
        return {
            // https://netsuite.custhelp.com/app/answers/detail/a_id/41804
            // https://netsuite.custhelp.com/app/answers/detail/a_id/74233
            // https://netsuite.custhelp.com/app/answers/detail/a_id/85880
            createVendorFromCustomer: function createVendorFromCustomer(options) {
                var customer = options.customer;
                var headers = options.headers;
                var customerId = customer.id;
                var hackUrl = f5_url.getRecordUrl({
                    recordType: customer.type,
                    recordId: customerId,
                    isEditMode: false,
                    params: {
                        totype: 'vendor',
                        fromtype: 'custjob',
                    }
                });
                log.debug('createVendorFromCustomer: headers', headers);
                hackUrl = hackUrl.replace('custjob.nl', 'company.nl');
                log.debug('createVendorFromCustomer: hackUrl', hackUrl);
                if (!headers) {
                    // headers =  f5_authentication.getOauthHeaders({request: {url: hackUrl, method: f5_constants.RESTMethod.GET}});
                    headers =  f5_authentication.getBasicHeaders();
                    log.debug('createVendorFromCustomer: oauth headers', headers);
                }

                if (headers) {
                    headers['User-Agent-x'] = 'SuiteScript-Call';
                    try {
                        var response = f5_https.get({url: hackUrl, headers: headers});
                        log.debug('response data', response);
                    } catch (e) {
                        log.error('Unexpected error', f5_format.exceptionToString(e));
                    }
                }
            }
        };
    });