define([
        'N/xml'
    ],
    function (xml) {
        return {
            escape: function escape(options) {
                return xml.escape(options);
            }
        };
    });
