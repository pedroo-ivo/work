define([
        'N/search',
        './F5_Constants'
    ],
    function (search, f5_constants) {
        var module = {
            get Type() { return search.Type; },
            CustomType: f5_constants.CustomRecordType,
            Operator: search.Operator,
            Summary: search.Summary,
            Sort: search.Sort,
            LogicalOperator: {
                AND: 'and',
                OR: 'or'
            },
            DateTime: {
                THIS_FIS_YR: 'thisFiscalYear',
                NEXT_FIS_YR: 'nextFiscalYear',
                THIS_YR: 'thisYear',
                NEXT_YR: 'nextOneYear',
                LAST_YR: 'lastyear',
                TODAY: 'today'
            },
            FormulaTemplate: f5_constants.FormulaTemplate,
            FormulaField: {
                NUMERIC: 'formulanumeric',
                PERCENT: 'formulapercent'
            },
            Value: {
                NONE: '@NONE@',
                TODAY: 'today',
                THIS_MONTH: 'thismonth',
                THIS_FIS_YR: 'thisFiscalYear',
                NEXT_FIS_YR: 'nextFiscalYear',
                THIS_YR: 'thisYear',
                NEXT_YR: 'nextOneYear',
                LAST_YR: 'lastyear',
            },
            CheckBox: f5_constants.CheckBox,
            create: function create(options) {
                if (options.columnMap) {
                    options.columns = Object.keys(options.columnMap).map(function (columnKey) {
                        return options.columnMap[columnKey];
                    });
                }
                return new Search({search: search.create(options)});
            },
            load: function load(options) {
                return new Search({search: search.load(options)});
            },
            createFilter: function createFilter(options) {
                return search.createFilter(options);
            },
            createAnyOfStringFilter: function createAnyOfStringFilter(options) {
                return search.createFilter({
                    name: module.FormulaField.NUMERIC,
                    operator: search.Operator.EQUALTO,
                    values: 1,
                    formula: module.FormulaTemplate.CASE_IN_STRINGS.replace("{name}", name).replace("{values}", options.values.join("', '"))
                });
            },
            createColumn: function createColumn(options) {
                return search.createColumn(options);
            },
            lookupFields: function lookupFields(options) {
                return search.lookupFields(options);
            },
            searchSelectOptions: function searchSelectOptions(options) {
                var selectOptions;
                var valueField = options.valueField;
                var textField = options.textField;

                var optionsSearch = options.id ?
                    this.load({id: options.id})
                    :
                    this.create({
                        type: options.type,
                        filters: options.filters,
                        columns: [valueField, textField]
                    });
                selectOptions = optionsSearch.getJSONResults({
                    text: textField, value: valueField
                });

                if (selectOptions.length && options.emptyText) {
                    selectOptions.unshift({text: options.emptyText, value: ''});
                }

                return selectOptions;
            }
        };

        function Search(options) {
            var me = this;
            this.search = options.search;
            this.columns = options.search.columns;

            this.addColumns = function addColumns(options) {
                var additionalColumns = options.columnMap ? Object.keys(options.columnMap).map(function (key) {
                    return options.columnMap[key];
                }) : options.columns;
                me.search.columns = me.search.columns.concat(additionalColumns);
                me.columns = me.search.columns;
            };

            this.replaceColumns = function replaceColumns(options) {
                me.search.columns = options.columns;
                me.columns = me.search.columns;
            };

            this.addFilterExpression = function addFilterExpression(filterExpression) {
                me.search.filterExpression = [me.search.filterExpression, module.LogicalOperator.AND, filterExpression];
            };
            this.getFilterExpression = function getFilterExpression() {
                return me.search.filterExpression;
            }

            this.addFilter = function addFilter(filter) {
                me.search.filters.push(filter);
            };

            this.createAndAddFilter = function createAndAddFilter(options) {
                var filter = search.createFilter(options);
                me.search.filters.push(filter);
            };

            this.run = function run() {
                return me.search.run();
            };

            this.runPaged = function runPaged(options) {
                return me.search.runPaged(options);
            };

            this.getIds = function getIds() {
                var ids = [];

                me.search.run().each(function (result) {
                    ids.push(result.id);

                    return true;
                });

                return ids;
            };

            this.getResults = function getResults(options) {
                var limit = 4000;
                var allResults = [];
                var rs = me.search.run();

                rs.each(function (result) {
                    allResults.push(result);

                    return allResults.length < limit;
                });

                if (allResults.length == limit) {
                    var start = limit;
                    var results = [];
                    do {
                        results = rs.getRange({
                            start: start,
                            end: start + 1000
                        });
                        allResults = allResults.concat(results);
                        start += 1000;
                    } while (results.length > 0);
                }

                return allResults;
            };

            this.getPagedResults = function getPagedResults(options) {
                options = options || {pageSize: 1000}
                var allResults = [];
                var pagedData = me.search.runPaged(options);
                pagedData.pageRanges.forEach(function (pageRange) {
                    var page = pageRange.fetch({index: pageRange.index});
                    page.data.forEach(function (result) {
                        allResults.push(result);
                    });
                });

                return allResults;
            };

            this.getJSONResults = function getJSONResults(keyColumnMap) {
                var jsonResults = [];

                if (!keyColumnMap) {
                    keyColumnMap = {};
                    me.columns.forEach(function (c) {
                        keyColumnMap[c.label || c.name] = c;
                        return true;
                    });
                }

                (me.getResults() || []).forEach(function (result) {
                    var jsonResult = {};
                    for (var key in keyColumnMap) {
                        var column = keyColumnMap[key];
                        if (column) {
                            jsonResult[key] = key.indexOf('Text') > -1 ? result.getText(column) : result.getValue(column);
                        }
                    }
                    jsonResults.push(jsonResult);
                });

                return jsonResults || [];
            };

            this.getRange = function getRange(options) {
                var results = me.search.run().getRange(options);

                return results || [];
            };

            this.getFirstResult = function getFirstResult() {
                var resultRange = me.getRange({start: 0, end: 1});
                return resultRange.length > 0 ? resultRange[0] : null;
            };
        }

        return module;
    });