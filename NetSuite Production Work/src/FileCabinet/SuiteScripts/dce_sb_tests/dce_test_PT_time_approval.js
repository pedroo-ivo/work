define(["N/query"], function (query) {
  var myCreatedQuery = query.create({
    type: query.Type.TIME_BILL,
    // columns: Object[],
    // condition: Object,
    // sort: Object[]
  });

  //here i am linking a condition to the query
  myCreatedQuery.condition = myCreatedQuery.createCondition({
    fieldId: "approvalstatus",
    operator: query.Operator.ANY_OF,
    values: 2,
  });
  // Here i am storing the condition in a variable
  //   var firstCondition = myCreatedQuery.createCondition({
  //     fieldId: "approvalstatus",
  //     operator: query.Operator.ANY_OF,
  //     values: 2,
  //   });

  myCreatedQuery.columns = myCreatedQuery.createColumn({
    fieldId: "trandate",
    // formula: string,
    // type: string,
    // aggregate: string,
    // alias: string,
    // groupBy: boolean,
    // label: string,
    // context: {
    //     name: string,
    //     params: Object,
    //     params: number,
  });
  myCreatedQuery.columns = myCreatedQuery.createColumn({
    fieldId: "employee",
    // formula: string,
    // type: string,
    // aggregate: string,
    // alias: string,
    // groupBy: boolean,
    // label: string,
    context: query.FieldContext.DISPLAY,
  });
  myCreatedQuery.columns = myCreatedQuery.createColumn({
    fieldId: "customer",
    // formula: string,
    // type: string,
    // aggregate: string,
    // alias: string,
    // groupBy: boolean,
    // label: string,
    context: query.FieldContext.DISPLAY,
  });

  myCreatedQuery.columns = myCreatedQuery.createColumn({
    fieldId: "hours",
    formula: `CONCAT(TO_CHAR({hours}),'hours')`,
    type: query.ReturnType.STRING,
    // aggregate: string,
    // alias: string,
    // groupBy: boolean,
    // label: string,
    // context: query.FieldContext.DISPLAY,
  });
});
