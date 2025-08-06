// require(["N/query"], (query) => {}); this is how the queroes should look like or the scripts to run under debugger tool and query 2.1
require(["N/query"], (query) => {
  var myQuery = query.create({
    type: query.Type.TIME_BILL,
    // columns: Object[],
    // condition: Object,
    // sort: Object[]
  });
  var firstCondition = myQuery.createCondition({
    fieldId: "memo",
    operator: query.Operator.EMPTY_NOT,
    // values: "",
    // formula: string,
    // type: string,
    // aggregate: string
  });

  myQuery.condition = firstCondition;

  myQuery.columns = [
    myQuery.createColumn({
      fieldId: "trandate",
    }),
    myQuery.createColumn({
      fieldId: "employee",
      context: query.FieldContext.DISPLAY,
    }),
    myQuery.createColumn({
      fieldId: "hours",
    }),
    // myQuery.createColumn({
    //   fieldId: "approvalstatus",
    //   context: query.FieldContext.DISPLAY,
    // }),
  ];

  var resultSet = myQuery.run();
  var results = resultSet.results; // returns an array of results

  log.debug({
    title: "query length",
    details: results.length, //length of the array
  });

  for (var i = 0; i < results.length; i++) {
    log.debug({
      title: results[i].values, //get values from the array
    });
  }
});
