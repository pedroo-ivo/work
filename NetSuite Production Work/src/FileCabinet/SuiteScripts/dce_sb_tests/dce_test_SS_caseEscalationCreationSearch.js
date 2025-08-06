/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

//? search for debugger

define(["N/search"], /**
 * @param{search} search
 */ (search) => {
  /**
   * Defines the Scheduled script trigger point.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
   * @since 2015.2
   */
  return {
    //passing the whole function under return, needed to enter execute idk why -> " Return { execute: function (context) { ALL CODE HERE}} "
    execute: function (context) {
      var caseSearch = search.create({
        type: search.Type.SUPPORT_CASE,
        filters: [
          search.createFilter({
            //or remove search.createFilter for an array like columns below)
            name: "status",
            // join: string,
            operator: search.Operator.ANYOF,
            values: 3, //3 escalated, 4 re-opened [3,4]
            // formula: string,
            // summary: string
          }), //, search.createFilter({ //here as an example
          // name:'title' ,
          // join: 'employee',
          // operator: search.Operator.CONTAINS, //haskeywords is faster than contains because look for the keyword and not letters
          // values: 'Support' ,
          // formula: string,
          // summary: string
          // })
        ],
        // filterExpression: Object[],
        columns: ["title", "startdate", "assigned", "status"], //it works like that
        //  [search.createColumn({
        //         name: 'title',
        //         // join: string,
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }), search.createColumn({
        //         name: 'startdate',
        //         // join: string,
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }), search.createColumn({
        //         name: 'assigned',
        //         // join: string,
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }), search.createColumn({
        //         name: 'status',
        //         // join: string,
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }), search.createColumn({
        //         name: 'departments',
        //          join: 'employee',
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }), search.createColumn({
        //         name: 'title',
        //         // join: 'employee',
        //         // summary: string,
        //         // formula: string,
        //         // function: string,
        //         // label: string,
        //         // sort: string
        //     }),] ,
        // packageId: string,
        // settings: search.Setting | search.Setting[] | Object | Object[] | string | string[],
        // title: string,
        // id: string,
        // isPublic: boolean
      });

      var searchResults = caseSearch.run().getRange({
        start: 0,
        end: 10,
      });

      //loop over the results and do something with them
      for (var i = 0; i < searchResults.length; i++) {
        var subject = searchResults[i].getValue("title");
        var assignedTo = searchResults[i].getText("assigned");
        // var status = searchResults[i].getValue({ fieldId: 'status',});// this way it is not working on debugger, i do not know if it would work as a search script, changed to below
        var status = searchResults[i].getValue("status");
        // var department = searchResults[i].getValue({fieldId: 'department',join: 'employee', });since i had loop through the results now i can do whatever i want to do with them, in this case i am debug, but i could load, create or do whatever netsuite can.
        log.debug(
          "case info",
          "subject:" +
            subject +
            "\n" +
            "status:" +
            status +
            "\n" +
            "assignedTo:" +
            assignedTo
        );
      }

      var stop = "this is a stopper for debugger, need to manually check it";
    },
  };
});
