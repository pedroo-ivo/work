define([
        'N/error'
    ],
    function (error) {
        return {
            create: function create(options) {
                return error.create(options);
            }
        };
    });