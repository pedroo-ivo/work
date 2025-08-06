define([
        'N/currentRecord'
    ],
    function (currentRecord) {
        return {
            get: function get() {
                return currentRecord.get();
            }
        };
    });