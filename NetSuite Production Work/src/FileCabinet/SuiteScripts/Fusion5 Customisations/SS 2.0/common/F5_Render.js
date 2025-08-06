define([
        'N/render'
    ],
    function (render) {
        return {
            mergeEmail: function mergeEmail(options) {
                return render.mergeEmail(options);
            },
            transaction: function transaction(options) {
                return render.transaction(options);
            },
            create: function create() {
                return render.create();
            },
            PrintMode: render.PrintMode,
            DataSource: render.DataSource
        };
    });