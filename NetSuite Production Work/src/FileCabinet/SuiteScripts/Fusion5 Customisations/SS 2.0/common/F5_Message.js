define([
    'N/ui/message'
],
    function (message) {
        return {
            Type: message.Type,
            create: function create(options) {
                return message.create(options);
            },
            createConfirmation: function createConfirmation(options) {
                options.type = message.Type.CONFIRMATION;
                return message.create(options);
            },
            createInformation: function createInformation(options) {
                options.type = message.Type.INFORMATION;
                return message.create(options);
            },
            createError: function createError(options) {
                options.type = message.Type.ERROR;
                return message.create(options);
            },
            createWarning: function createWarning(options) {
                options.type = message.Type.WARNING;
                return message.create(options);
            },
            getParameteredMessage: function getParameteredMessage(text, parameters) {
                if (text && parameters && parameters.length > 0) {
                    for (var i = 0, ii = parameters.length; i < ii; i++) {
                        text = text.replace(['(', ')'].join(i + 1), parameters[i]);
                    }
                }
                return text;
            }
        };
    });