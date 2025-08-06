/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */

//? Created a workflow initially -> after creating an expense report, another expense report page loads immediatly.
//? then created a script so i can use this script on the workflow as a new action -> (workflow total)expense limit: $xxxxx and (expense count)transaction lines = 1 or 2 or any number of lines on the expense transciton this is displayed under notes on the employee record.

//
define(["N/record", "N/runtime"], /**
 * @param{record} record
 * @param{runtime} runtime
 */ (record, runtime) => {
  /**
   * Defines the WorkflowAction script trigger point.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
   * @param {string} scriptContext.type - Event type
   * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
   * @since 2016.1
   */
  const onAction = (context) => {
    var workflowTotal = runtime
      .getCurrentScript() //using method on the module runtime to access the current script
      .getParameter({ name: "custscriptworkflow_total" }); //using the method "getcurrentscripot" to access the object "getparameter" and return a value stored on the parameter i created on the script.
    //on a workflow action script, this above will create an custom action for the workflow -> see pictures in studywrok -> if i do not use this action on the workflow nothing will happen
    //when select on the workflow i will enter a value to be displayed on the employee record on the field notes

    var expRep = context.newRecord; //Expense new record

    var expCount = expRep.getLineCount({
      //counting how many lines on the expense item
      sublistId: "expense",
    });
    var employeeID = expRep.getValue({
      fieldId: "entity",
    }); //getting the employee from the exp record

    var tranid = expRep.getValue({
      fieldId: "tranid",
    });

    /**
     * This function below did not work, because i do not know why. but i was trying to populate the notes field with the expense limit of the record, might not work because the context is expense and not the employee itself i dont know.
     */
    // var total = employeeID.getValue({
    //   fieldId: 'expenselimit',
    // });

    var notes =
      "workflow total:" +
      workflowTotal +
      "\n" +
      "expense count:" +
      expCount +
      "\n" +
      "Transaction #: " +
      tranid; //creating a var to populate notes of the employee
    // +'total: ' + total;

    var employee = record.load({
      //loading the employee record
      type: record.Type.EMPLOYEE,
      id: employeeID,
      // isDynamic: boolean,
      // defaultValues: Object
    });

    employee.setValue("comments", notes); //populating the notes with the var created and saving
    employeeID = employee.save(); //STUDY idk why employeeid = employee.save

    if (!employeeID) {
      return "Failed"; //this is related to the "failed" state created on the workflow
    }
    return "Success"; //this is related to the "success" state created on the workflow
  };

  return { onAction };
});
