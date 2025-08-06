/**
 * @NApiVersion 2.1
 */
define(['N/search'],

    function (search) {

        function roundNearestQuarter(value) {
            return (Math.round(value * 4) / 4).toFixed(2);
        }

        function convertHoursToMinutes(hours) {
            var minutes = hours * 60;
            return Math.round(minutes * 100) / 100;
        }

        function getResults(mySearch) {
            var limit = 4000;
            var allResults = [];
            var rs = mySearch.run();

            rs.each(function (result) {
                allResults.push(result);

                return allResults.length < limit;
            });

            if (allResults.length === limit) {
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
        }

        function getFormData(timeEntryData) {
            var lines = [];
            var dataArray = timeEntryData.split("\u0002");
            for (var i = 0; i < dataArray.length; i++) {
                // add items here
                var temp = dataArray[i].split("\u0001");
                if (temp.length > 1 && temp[0] !== "") {
                    lines.push(temp);
                }
            }
            // log.debug('line 1', lines[0]);
            return lines;
        }

        /**
         * complete curing operation prior to current operation
         * @param {int} workOrderId: internal id of work order
         * @param {int} operationId: internal id of operation
         * @returns {int} count of completed curing operation
         */
        function completeCuringOperation(workOrderId, operationId) {
            var completionCount = 0;

            //mma 20160621
            //retrieve working centre for waiting(curing) time
            var arrCurringTime = [];
            var filters = [['isinactive', 'is', false]];
            var groupSearch = search.create({type: 'entitygroup', filters: filters});
            var groupResults = getResults(groupSearch);
            groupResults.forEach(function (result) {
                arrCurringTime.push(result.id);
            });

            //end mma 20160621

            var intOpSequence = search.lookupFields({
                type: 'manufacturingoperationtask',
                id: operationId,
                columns: ['sequence']
            })['sequence'];

            //find recurring operation
            filters = [['workorder', 'anyof', workOrderId],
                'AND', ['manufacturingworkcenter', 'anyof', arrCurringTime],
                'AND', ['sequence', 'lessthan', intOpSequence],
                'AND', ['completedquantity', 'isempty', null]
            ];
            var columns = ['sequence', 'name'];

            var taskSearch = search.create({type: 'manufacturingoperationtask', filters: filters, columns: columns});
            var taskResults = getResults(taskSearch);
            taskResults.forEach(function (result) {
                var operationId = result.id;
                var sequence = result.getValue('sequence');
                var dCompletedQty = 0;

                //get completed quantity in last operation
                var filters2 = [['workorder', 'anyof', workOrderId], 'AND', ['sequence', 'lessthan', sequence]];
                var columns2 = [
                    search.createColumn({name: sequence, sort: search.Sort.ASC}),
                    'completedquantity'
                ];

                var taskSearch2 = search.create({type: 'manufacturingoperationtask', filters: filters2, columns: columns2});
                var taskResults2 = getResults(taskSearch2);

                if (taskResults2.length > 0) {
                    dCompletedQty = taskResults2[0].getValue('completedquantity');
                }

                completeWorkOrder(workOrderId, operationId, dCompletedQty);

                log.debug({
                    title: 'work order id, operation id, completed quantity',
                    details: workOrderId + '***' + operationId + '***' + dCompletedQty
                });

                //complete operation
                if (dCompletedQty > 0) {
                    completionCount++;
                }
            })

            return completionCount;
        }

        function completeWorkOrder(workOrderId, operationId, dCompletedQty) {
            var woCompletion = record.transform({
                fromType: 'workorder',
                fromId: workOrderId,
                toType: 'workordercompletion'
            });
            woCompletion.setValue({fieldId: 'startoperation', details: operationId});
            woCompletion.setValue({fieldId: 'endoperation', details: operationId});
            woCompletion.setValue({fieldId: 'completedquantity', details: dCompletedQty});
            woCompletion.setValue({fieldId: 'quantity', details: 0});
            woCompletion.setValue({fieldId: 'memo', details: 'auto completed'});
            var woCompletionID = woCompletion.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.debug({
                title: 'new work completion automatically created',
                details: woCompletionID
            });
        }

        function getRecordFromText(option) {
            var searchRecord = search.create({
                type:option.recordType
            });
            //Add the text filter
            var filters = [];
            filters.push(search.createFilter({
                name:option.filter.name,
                operator:option.filter.operator,
                values:option.filter.value
            }))

            //Check if there's an additional filter

            if(option.additionalFilter) {
                filters.push(search.createFilter({
                    name:option.additionalFilter.name,
                    operator:option.additionalFilter.operator,
                    values:option.additionalFilter.value
                }));
            }

            if(option.additionalFldVal && option.additionalFldVal.length > 0) {
                option.additionalFldVal.map(function (addlFldVal){
                    filters.push(search.createFilter({
                        name:addlFldVal.name,
                        operator:addlFldVal.operator,
                        values:addlFldVal.value
                    }));

                })
            }

            searchRecord.filters = filters;

            var searchResults = getResults(searchRecord);

            return searchResults[0] ? searchResults[0].id : null;
        }

        function isWONonProd(idWO) {
            var bIsNonProd = search.lookupFields({
                type:'workorder',
                id:idWO,
                columns:'custbody_f5_non_productive_time'
            })
            return bIsNonProd.custbody_f5_non_productive_time;
        }

        function isEmpForReview(idEmp) {
            var isEmpForRev = search.lookupFields({
                type:'employee',
                id:idEmp,
                columns:['subsidiary.custrecordcustrecord_f5_review_time']
            })

            return isEmpForRev['subsidiary.custrecordcustrecord_f5_review_time'];
        }


        return {
            roundNearestQuarter: roundNearestQuarter,
            convertHoursToMinutes: convertHoursToMinutes,
            getResults: getResults,
            getFormData: getFormData,
            completeCuringOperation: completeCuringOperation,
            getRecordFromText: getRecordFromText,
            isWONonProd:isWONonProd,
            isEmpForReview:isEmpForReview
        }

    });