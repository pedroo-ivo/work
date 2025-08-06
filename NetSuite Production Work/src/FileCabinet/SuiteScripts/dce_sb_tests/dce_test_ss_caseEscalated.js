/** //^ need to remove for debugger in netsuite
 * @NApiVersion 2.1 //^ need to remove for debugger in netsuite
 * @NScriptType ScheduledScript //^ need to remove for debugger in netsuite
 */ //^ need to remove for debugger in netsuite

//? search for debugger
//^ replace define for require
define(["N/search"], /**
 * @param{search} search
 */ (search) => {
  //^ need to transform it to a annonimous function "function (search) { "
  //^ need to remove for debugger in netsuite below
  /**
   * Defines the Scheduled script trigger point.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
   * @since 2015.2
   */
  //^ need to remove for debugger in netsuite above
  const execute = (context) => {
    //^ need to remove for debugger in netsuite
    var caseSearch = search.load({
      id: "customsearch3010",
      //   type: string,
    });
    var searchResults = caseSearch.run().getRange({
      start: 0,
      end: 10,
    }); //2 types of results: 1st pagerange that gives a set of results and this set has the maximum of only 1k results (saved search with 1k results) if i have more than that i can loop through the page range and each execution i will get a thousand results. 2nd resultset gives individual results and not sets, need to use eachmethod to loop trhough the results, instead of having 1k records as limitation we would have a governance unit as limitation, still to learn about this limitation
    var stop = "this is a stop for debugger";
  }; //^ need to remove for debugger in netsuite

  return { execute };
});
