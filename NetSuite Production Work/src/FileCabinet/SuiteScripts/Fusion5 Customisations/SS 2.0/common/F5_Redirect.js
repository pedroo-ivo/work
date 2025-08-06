define([
        'N/redirect'
    ],
    function (redirect) {
        return {
            toRecord: function toRecord(options) {
                redirect.toRecord(options);
            }
        };
    });