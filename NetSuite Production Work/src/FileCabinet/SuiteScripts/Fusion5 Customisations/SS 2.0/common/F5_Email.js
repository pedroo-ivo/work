define([
        'N/email'
    ],
    function (email) {
        return {
            send: function send(options) {
                return email.send(options);
            }
        };
    });