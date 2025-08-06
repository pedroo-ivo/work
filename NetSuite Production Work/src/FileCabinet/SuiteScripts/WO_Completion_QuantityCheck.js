define(["N/search", "N/record", "N/error", "N/log"], /**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

function (search, record, error, log) {
  function saveRecord(context) {
    //from the work order
    var quantity = 0;
    //from the work order
    var built = 0;
    //from the work order completion
    var scrapquantity = 0;

    //get the current record
    var currentRecord = context.currentRecord;
    var currentRecordID = currentRecord.id;
    var currentRecordTranID = currentRecord.getValue({ fieldId: "tranid" });
    console.log(currentRecordID);
    console.log(currentRecordTranID);
    //retrieve the completed work order quantity that a user enters
    var wo_completedquantity = currentRecord.getValue({
      fieldId: "completedquantity",
    });

    if (
      wo_completedquantity == null ||
      wo_completedquantity == undefined ||
      wo_completedquantity == ""
    ) {
      wo_completedquantity = 0;
    }

    //retrieve the scrap quantity that a user enters
    var woc_scrapquantity = currentRecord.getValue({
      fieldId: "scrapquantity",
    });

    if (
      woc_scrapquantity == null ||
      woc_scrapquantity == undefined ||
      woc_scrapquantity == ""
    ) {
      woc_scrapquantity = 0;
    }

    //work order - use the createdfrom field to determine the originating work order
    var workorder = currentRecord.getValue({ fieldId: "createdfrom" });

    //search the work orders based on the 'createdfrom' value from the work order completion
    var quantitySearch = search.create({
      type: "workorder",
      filters: [["internalid", "anyof", workorder]],
      //retrieve the quantity and the built fields from the work order
      columns: ["quantity", "built"],
    });

    //run the search to get the values related to the work order
    quantitySearch.run().each(function (result) {
      quantity = result.getValue("quantity");
      built = result.getValue("built");
    });

    //query for previously entered work order completions - only extracting those with scrap figures
    var scrapSearch = search.create({
      type: search.Type.WORK_ORDER_COMPLETION,
      filters: [
        [["isscrap", "is", "T"], "AND", ["createdfrom", "is", workorder]], //,"AND",["tranid", "isnot", currentRecordTranID]]
      ],
      columns: ["isscrap", "quantity", "tranid", "type", "built"],
    });

    scrapSearch.run().each(function (result) {
      console.log(result.toJSON());
      var transquantity = parseInt(result.getValue("quantity"));

      if (transquantity < 0) {
        scrapquantity = scrapquantity + transquantity * -1;
      }

      return true;
    });

    /*console.log("quantity: " + quantity);
    console.log("wo_completedquantity: " + wo_completedquantity);
    console.log("built: " + built);
    console.log("scrapquantity: " + scrapquantity);
    console.log("woc_scrapquantity: " + woc_scrapquantity);*/

    //compare the user entered value against the original wo quantity
    // if (
    //   parseInt(quantity) <=
    //   parseInt(wo_completedquantity) +
    //     parseInt(built) +
    //     scrapquantity +
    //     parseInt(woc_scrapquantity)
    // ) {
    //   var total_requested_build =
    //     parseInt(wo_completedquantity) + parseInt(built);
    //   var total_requested_build_including_scrap =
    //     total_requested_build + parseInt(woc_scrapquantity) + scrapquantity;

    //   throw error.create({
    //     name: "WO Completed Quantity Violation",
    //     message:
    //       "WO Completed Quantity Entered (" +
    //       wo_completedquantity +
    //       ") greater than WO Build Quantity Requested (" +
    //       quantity +
    //       ") + Already Built Quantity (" +
    //       built +
    //       ") + Scrapped (" +
    //       (scrapquantity + parseInt(woc_scrapquantity)) +
    //       ") i.e. (" +
    //       total_requested_build_including_scrap +
    //       ")",
    //   });
    // }

    return true;
  }
  return {
    saveRecord: saveRecord,
  };
});
