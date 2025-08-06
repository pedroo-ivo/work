require(["N/query"], (query) => {
  var myQuery = query.load({
    id: "custworkbook_sdr_wb_employee_cases",
  });
  var mySQLQuery = myQuery.toSuiteQL();
  var resultSet = mySQLQuery.run();
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
