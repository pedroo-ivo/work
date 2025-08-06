require(["N/query"], (query) => {
  var myLoadQuery = query.load({
    id: "custworkbook_sdr_wb_employee_cases",
  });

  var resultSet = myLoadQuery.run();
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
