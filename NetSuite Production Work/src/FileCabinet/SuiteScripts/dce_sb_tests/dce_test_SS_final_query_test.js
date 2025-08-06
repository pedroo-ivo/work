require(["N/query"], (query) => {
  //*creating query
  var myQuery = query.load({
    id: "custworkbook_sdr_wb_employee_cases",
  });

  //*creating joins
  var customerJoin = myQuery.joinTo({
    // joining results from the customer, here i am acessing the info from the customer
    fieldId: "company",
    target: "Customer",
  });
  var contactJoin = customerJoin.autoJoin({
    //joining a level deep, contact list inside of the customer
    fieldId: "contactlist",
  });

  var firstCondition = myQuery.createCondition({
    fieldId: "category",
    operator: query.Operator.ANY_OF,
    values: [1, 2, 3],
    // internal id of the items in category list
  });
  var secondCondition = myQuery.createCondition({
    fieldId: "timeelapsed",
    operator: query.Operator.GREATER,
    values: 0,
  });
  var thirdCondition = myQuery.createCondition({
    fieldId: "phone",
    operator: query.Operator.EMPTY_NOT,
  });

  //*applying conditions to the query
  myQuery.condition = myQuery.and(
    firstCondition,
    secondCondition,
    thirdCondition
  ); //if it was only one condition i could've done "myQuery.condition = firstCondition;"

  //*creating columns
  myQuery.columns = [
    myQuery.createColumn({
      fieldId: "casenumber",
    }),
    myQuery.createColumn({
      fieldId: "startdate",
    }),
    myQuery.createColumn({
      fieldId: "title",
    }),
    myQuery.createColumn({
      fieldId: "status",
      context: query.FieldContext.DISPLAY,
    }),
    myQuery.createColumn({
      fieldId: "assigned",
      context: query.FieldContext.DISPLAY,
    }),
    myQuery.createColumn({
      fieldId: "company",
      context: query.FieldContext.DISPLAY,
    }),
    myQuery.createColumn({
      fieldId: "escalateto",
      context: query.FieldContext.DISPLAY,
    }),
    myQuery.createColumn({
      fieldId: "lastcustomermessagereceived",
    }),
    contactJoin.createColumn({
      fieldId: "phone",
    }),
    myQuery.createColumn({
      //^Creating a formula column
      type: query.ReturnType.STRING,
      formula: `concat('Days:', to_char(floor({timeelapsed} / 24)), '| Hours:', to_char(mod(floor({timeelapsed} / 3600), 24)))`, //^formula is wrong, but valid idea
      alias: "Days|Hours",
    }),

    myQuery.createColumn({
      type: query.ReturnType.STRING,
      formula: `case when ({timeelapsed} /24) * 20 > 0 then to_char(({timeelapsed} /24) * 20) else case when {timeelapsed} > 0 then concat('Days:', to_char(floor({timeelapsed} / 24)), '| Hours:', to_char(mod(floor({timeelapsed} / 3600), 24))) else concat('Days: 0 | Hours: 0'})`, //^formula is wrong, but valid idea
    }),
  ];

  //* Creating sort
  myQuery.sort = [
    myQuery.createSort({
      column: myQuery.columns[0],
      ascending: false,
      caseSensitive: true,
      locale: query.SortLocale.EN_CA,
      nullsLast: true,
    }),
  ];

  var resultSet = myQuery.run();
  var results = resultSet.results; // returns an array of results

  log.debug({
    title: "query length",
    details: results.length, //length of the array
  });

  for (var i = 0; i < results.length; i++) {
    log.debug({
      title: results[i].asMap(), //get values from the array, using as map to display results in pairs to reduce the amount of results
    });
  }
});
