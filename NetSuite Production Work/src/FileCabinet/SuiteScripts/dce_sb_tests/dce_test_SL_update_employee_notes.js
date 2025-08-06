/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/record", "N/redirect"], /**
 * @param{serverWidget} serverWidget
 * @param{record} record
 * @param{redirect} redirect
 *
 */ (serverWidget, record, redirect) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (context) => {
    var request = context.request; //to be used to get objects from http module -> sderver request
    var response = context.response; // to be used to get objects from http module -> server response

    if (request.method == "GET") {
      //GET REQUEST FROM URL

      //obs.: Transfering information from another script to my suitelet or if i am clicking in a link(list of transactions, list of invoices, and others), opening a bookmark it will be GET operation

      var form = serverWidget.createForm({
        title: "Update Employee Notes",
        hideNavBar: false,
      });

      //CREATING FIELDS

      var nameField = form.addField({
        //creating fields
        id: "custpage_dce_emp_name",
        label: "Name",
        type: serverWidget.FieldType.TEXT,
      });

      var notesField = form.addField({
        id: "custpage_dce_notes",
        label: "Notes",
        type: serverWidget.FieldType.TEXTAREA,
      });

      var empField = form.addField({
        id: "custpage_dce_emp_id",
        label: "Emp ID",
        type: serverWidget.FieldType.TEXT,
      });

      //GETTING VALUES

      var name = request.parameters.dce_name || ""; //getting value from "DCE_test_UE_Employee code" redirect to suitlet, need to have it here otherwise form will return blank, also  Use default empty string if parameter is not set

      var notes = request.parameters.dce_notes || ""; //getting value from "DCE_test_UE_Employee code" redirect to suitlet, need to have it here otherwise form will return blank, also  Use default empty string if parameter is not set
      var emp = request.parameters.dce_emp || ""; //getting value from "DCE_test_UE_Employee code" redirect to suitlet, need to have it here otherwise form will return blank, also  Use default empty string if parameter is not set

      form.addSubmitButton("Continue");

      //POPULATING fields

      nameField.defaultValue = name; //populating fields
      notesField.defaultValue = notes; //populating fields
      empField.defaultValue = emp; //populating fields

      // Updating display type
      nameField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });

      // empField.updateDisplayType({
      //   displayType: serverWidget.FieldDisplayType.INLINE,
      // });

      // Write form to response
      response.writePage(form);
    } else {
      // POST REQUEST because i am clicking on contonue on the suitlet

      // post request from my form

      //obs.: when saving a record, continueing a record, this is a POST operation, because i am posting something i guess.

      //GETTING VALUE FROM THE SUITLET (because it is post request, it will not use the value of the employee record, but it will use the value of the suitelet page)
      emp = request.parameters.custpage_dce_emp_id;
      notes = request.parameters.custpage_dce_notes;

      var employee = record.load({
        //loading the employee record
        type: record.Type.EMPLOYEE,
        id: emp,
        // isDynamic: boolean,
        // defaultValues: Object
      });

      employee.setValue("comments", notes);
      employee.save();

      redirect.toRecord({
        id: emp,
        type: record.Type.EMPLOYEE,
        // isEditMode: boolean,
        // parameters: Object,
      });
    }
  };

  return { onRequest };
});

// added redirect suitelet on the script "DCE_test_UE_Employee code" to redirect whenever editing employees to this form

//for example the shopfloor time entry, is a GET REQUEST when i click on the links, but when i type information on the suitelet form and save/continue or submiting a form, then this is a POST REQUEST
