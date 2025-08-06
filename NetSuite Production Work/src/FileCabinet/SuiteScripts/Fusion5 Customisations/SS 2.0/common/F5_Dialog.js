define([
        'N/ui/dialog'
    ],
    function (dialog) {
        return {
            create: function create(options) {
                return dialog.create(options);
            },
            alert: function alert(options) {
                return dialog.alert(options);
            }
        };
    });