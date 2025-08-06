//? WHEN CREATIN SCRIPT IN NETSUITE, ALWAYS SAVE AND DEPLOY USING THE SAME BUTTON ON THE SCRIPT (do not use script deployment subtab)
//! i do not know why this is not working
require(["N/search"], (search) => {
  var priorityCases = search.create({
    type: search.Type.SUPPORT_CASE,
    filters: [
      search.createFilter({
        name: "assigned",
        // join: string,
        operator: search.Operator.ANYOF,
        values: -5, //string | Date | number | boolean | string[] | Date[] | number[],
        // formula: string,
        // summary: string
      }),
      search.createFilter({
        name: "priority",
        // join: string,
        operator: search.Operator.ANYOF,
        values: 1,
        //   formula: string,
        //   summary: string,
      }),
    ],
    // filterExpression: Object[],
    columns: [
      "title",
      "casenumber",
      "priority",
      "email",
      "status",
      "createddate",
      search.createColumn({
        name: "phone",
        join: "customer",
        // summary: string,
        // formula: string,
        // function: string,
        // label: string,
        // sort: string
      }),
    ],
    // packageId: string,
    //   settings: [],
    //   title: string,
    //   id: string,
    //   isPublic: boolean,
  });

  var searchResults = priorityCases.run().getRange({
    //number o search results showing
    start: 0,
    end: 50,
  });

  for (var i = 0; i < searchResults.length; i++) {
    var title = searchResults[i].getValue({ name: "title" });
    var casenumber = searchResults[i].getValue({ name: "casenumber" });
    var priority = searchResults[i].getValue({ name: "priority" });
    var email = searchResults[i].getValue({ name: "email" });
    var status = searchResults[i].getValue({ name: "status" });
    var createddate = searchResults[i].getValue({ name: "createddate" });
    var phone = searchResults[i].getValue({
      name: "phone",
      join: "customer",
    });

    log.debug({
      title: "high priority cases",
      details:
        "case No.:" +
        casenumber +
        "\n" +
        "subject:" +
        title +
        "\n" +
        "customer email:" +
        email +
        "\n" +
        "case status:" +
        status +
        "\n" +
        "date: " +
        createddate +
        "\n" +
        "contact:" +
        phone +
        "\n",
    });
  }
  var stop = "this is a stopper for debugger, need to manually check it";
});
