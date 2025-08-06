//SQL IN NETSUITE

require(["N/query"], (query) => {
  // SELECT are the collumns
  //FROM criteria records
  // WHERE criteria from the records

  //need to use customer. then enter what i am looking for the customer, probably, vendor, employees, projects follow the same logic.
  //idk why BUILTIN or where it comes from
  //DF is default value but idk why BUILTIN or where it comes from
  // idk why CURRENCY_CONVERT or where it comes from
  // explaining the above: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_161950565221.html
  //round to 2 decimal places
  //!need to fix for a valid salesrep

  var custUnbilledQuery = `
  SELECT
    customer.entityid,  
    BUILTIN.DF(customer.defaultbillingaddress),
    ROUND(BUILTIN.CURRENCY_CONVERT(customer.balancesearch),2),
    BUILTIN.CURRENCY_CONVERT(customer.unbilledorderssearch),
    ROUND(((customer.creditlimit - customer.balancesearch) / NULLIF(customer.creditlimit,0))*100,2)
  FROM
    customer,
    customersubsidiaryrelationship

  WHERE
    customer.salesrep = -5 AND
    customer.id = customersubsidiaryrelationship.entity AND
    customersubsidiaryrelationship.subsidiary = 2 AND
    customer.entityStatus = 13  AND
    customer.unbilledorderssearch > 0
    ORDER BY
    customer.entityid ASC`;

  //customersubsidiaryrelationship -> this is from records catalog customer and then look for subsidiary in the join tab
  //customer.id = customersubsidiaryrelationship.entity -> this is from records catalog customer and then subsidiary in the join tab and look for the i information sign

  // SHOW RESULTS IN ONE PAGE
  var resultSet = query.runSuiteQL({
    query: custUnbilledQuery,
    // params: Array<string | number | boolean>
  });

  var results = resultSet.results; // returns an array of results

  log.debug({
    title: "query length",
    details: results.length, //length of the array
  });

  for (var i = 0; i < results.length; i++) {
    log.debug(
      results[i].values //get values from the array
    );
  }
});

// SHOW RESULTS IN MULTIPLE PAGES
//   //! dont get it
//   var resultSet = query
//     .runSuiteQLPaged({
//       query: custUnbilledQuery,
//       pageSize: 10,
//       // params: Array<string | number | boolean>
//     })
//     .iterator();

//   //! dont get it
//   resultSet.each(function (page) {
//     var pageIterator = page.value.data.iterator();
//     log.debug({
//       title: "NEW PAGE MARKER",
//       // details: any
//     });

//     //! dont get it
//     pageIterator.each(function (row) {
//       log.debug({
//         title:
//           "ID:" +
//           row.value.getValue(0) +
//           "Address:" +
//           row.value.getValue(1) +
//           "Balance:" +
//           row.value.getValue(2) +
//           "Unbilled:" +
//           row.value.getValue(3) +
//           "Credit:" +
//           row.value.getValue(4),
//       });
//     });
//   });
//   return true;
// });
