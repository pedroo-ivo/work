define([
        './F5_Record',
        './F5_Search',
        './F5_Constants'
    ],
    function (f5_record, f5_search, f5_constants) {
        var TYPE = f5_search.Type.ENTITY;
        var FIELDS = f5_constants.EntityField;

        function Entity(record) {
            var me = this;
            // inherit from Record
            f5_record.Record.apply(this, [{record: record}]);

            this.getSubsidiary = function getSubsidiary() {
                return me.getValue({fieldId: FIELDS.SUBSIDIARY});
            };

            this.getStatus = function getStatus() {
                return me.getValue({fieldId: FIELDS.STATUS});
            };
        };

        return {
            TYPE: TYPE,
            Entity: Entity,
            cast: function cast(record) {
                return new Entity(record);
            },
            create: function create(options) {
                return new Entity(f5_record.create(options));
            },
            load: function load(options) {
                return new Entity(f5_record.load(options));
            }
        };
    });