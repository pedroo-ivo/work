/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
  "N/search",
  "N/record",
  "N/ui/message",
  "N/ui/serverWidget",
  "./F5_Lib_ShopFloorCustomisation",
], function (search, record, message, serverWidget, f5_lib) {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  function onRequest(scriptContext) {
    try {
      var request = scriptContext.request;
      var method = request.method;
      var form = createShopFloorForm();

      if (method === "GET") {
        var params = request.parameters;
        var timeId = params["timeId"];
        log.debug("time", timeId);

        populateForm(form, timeId);
      } else {
        var parameters = request.parameters;
        log.debug({ title: "PARAMS", details: parameters });
        createSfcTimeEntry(parameters);
        var successMessage = "submitted";
        var savedTimeId = parameters["custpage_f5_sfc_time_id"];
        if (savedTimeId) {
          populateForm(form, savedTimeId);
          successMessage = "updated";
        }

        form.addPageInitMessage({
          type: message.Type.CONFIRMATION,
          message:
            "Successfully " + successMessage + " Time Against Work on Hand",
          duration: 5000,
        });
      }

      scriptContext.response.writePage({ pageObject: form });
    } catch (e) {
      log.error({ title: "F5 Shop Floor Entry", details: JSON.stringify(e) });
    }
  }

  function createShopFloorForm() {
    var form = serverWidget.createForm({
      title: "Enter Time Against Work on Hand",
    });
    form.clientScriptModulePath =
      "SuiteScripts/Fusion5 Customisations/SS 2.0/shop_floor/F5_CS_ShopFloorEntry.js";
    var fgTexts = form.addFieldGroup({
      id: "custpage_f5_fg_texts",
      label: " ",
    });
    fgTexts.isBorderHidden = true;
    fgTexts.isSingleColumn = true;

    var fgSelects = form.addFieldGroup({
      id: "custpage_f5_fg_selects",
      label: " ",
    });
    fgSelects.isBorderHidden = true;
    fgSelects.isSingleColumn = true;

    var fgNote = form.addFieldGroup({
      id: "custpage_f5_fg_Note",
      label: " ",
    });
    fgNote.isBorderHidden = true;

    var dateField = form.addField({
      id: "custpage_f5_sfc_date",
      type: serverWidget.FieldType.DATE,
      label: "Work Date",
      container: "custpage_f5_fg_texts",
    });
    dateField.isMandatory = true;
    dateField.defaultValue = new Date();
    // dateField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

    // var employeeTxtField = form.addField({
    //     id: 'custpage_f5_sfc_employee_text',
    //     type: serverWidget.FieldType.TEXT,
    //     label: 'Employee',
    // });

    var employeeField = form.addField({
      id: "custpage_f5_sfc_employee",
      type: serverWidget.FieldType.SELECT,
      label: "Employee",
      source: search.Type.EMPLOYEE,
      container: "custpage_f5_fg_texts",
    });
    employeeField.isMandatory = true;

    var workOrderTxtField = form.addField({
      id: "custpage_f5_sfc_work_order_text",
      type: serverWidget.FieldType.TEXT,
      label: "Work Order #",
      container: "custpage_f5_fg_texts",
    });

    var operationTxtField = form.addField({
      id: "custpage_f5_sfc_operation_text",
      type: serverWidget.FieldType.TEXT,
      label: "Operation #",
      container: "custpage_f5_fg_texts",
    });

    var hoursField = form.addField({
      id: "custpage_f5_sfc_hours",
      type: serverWidget.FieldType.FLOAT,
      label: "Labour Hours",
      container: "custpage_f5_fg_texts",
    });
    hoursField.isMandatory = true;

    var statusField = form.addField({
      id: "custpage_f5_sfc_status",
      type: serverWidget.FieldType.SELECT,
      label: "Status",
      source: "customlist_f5_sfc_timeentrystatus",
      container: "custpage_f5_fg_selects",
    });
    statusField.defaultValue = "1";
    statusField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    for (var i = 1; i <= 3; i++) {
      var spacerFld = form.addField({
        id: "custpage_f5_sfc_spacer" + i,
        type: serverWidget.FieldType.TEXT,
        label: " ",
        container: "custpage_f5_fg_selects",
      });
      spacerFld.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });
    }

    var workOrderField = form.addField({
      id: "custpage_f5_sfc_work_order",
      type: serverWidget.FieldType.SELECT,
      label: "Work Order",
      container: "custpage_f5_fg_selects",
      // source: search.Type.WORK_ORDER
    });
    workOrderField.isMandatory = true;

    var fldMemo = form.addField({
      id: "custpage_f5_sfc_memo",
      type: serverWidget.FieldType.TEXTAREA,
      label: "Work Order Memo",
      container: "custpage_f5_fg_selects",
    });
    fldMemo.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    //Adding the department field to store the work order department
    var departmentFieldText = form.addField({
      id: "custpage_f5_sfc_department_text",
      type: serverWidget.FieldType.TEXT,
      label: "Department #",
      container: "custpage_f5_fg_selects",
    });
    departmentFieldText.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    var departmentField = form.addField({
      id: "custpage_f5_sfc_department",
      type: serverWidget.FieldType.TEXT,
      label: "Department",
      container: "custpage_f5_fg_selects",
    });
    departmentField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    //aqui - work order item or assembly
    // var woItemText = form.addField({
    //   id: "custpage_f5_sfc_woitem_text",
    //   type: serverWidget.FieldType.TEXT,
    //   label: "WO item #",
    //   container: "custpage_f5_fg_selects",
    // });

    // woItemText.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.INLINE,
    // });
    // var woItemField = form.addField({
    //   id: "custpage_f5_sfc_woitem",
    //   type: serverWidget.FieldType.TEXT,
    //   label: "WO Item",
    //   container: "custpage_f5_fg_selects",
    // });
    // woItemField.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.HIDDEN,
    // });

    var salesRegionFieldText = form.addField({
      id: "custpage_f5_sfc_salesregion_text",
      type: serverWidget.FieldType.TEXT,
      label: "SALES REGION #",
      container: "custpage_f5_fg_selects",
    });
    salesRegionFieldText.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    var salesRegionField = form.addField({
      id: "custpage_f5_sfc_salesregion",
      type: serverWidget.FieldType.TEXT,
      label: "SALES REGION",
      container: "custpage_f5_fg_selects",
    });
    salesRegionField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    var projectFieldText = form.addField({
      id: "custpage_f5_sfc_project_text",
      type: serverWidget.FieldType.TEXT,
      label: "Project",
      container: "custpage_f5_fg_selects",
    });
    projectFieldText.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    var operationField = form.addField({
      id: "custpage_f5_sfc_operation",
      type: serverWidget.FieldType.SELECT,
      label: "Operation #",
      container: "custpage_f5_fg_selects",
      // source: search.Type.MANUFACTURING_OPERATION_TASK
    });
    operationField.isMandatory = true;

    var timeIdField = form.addField({
      id: "custpage_f5_sfc_time_id",
      type: serverWidget.FieldType.TEXT,
      label: "ID",
    });
    timeIdField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    // var workOrders = getWorkOrders();
    var workOrders = getWorkOrdersWithOps();

    workOrderField.addSelectOption({
      value: "",
      text: "",
    });
    workOrders.forEach(function (result) {
      workOrderField.addSelectOption({
        value: result.id,
        // text: result.getValue('tranid')
        text: result.text,
      });
    });

    var fldNotes = form.addField({
      id: "custpage_f5_sfc_notes",
      type: serverWidget.FieldType.TEXTAREA,
      label: "Notes",
      container: "custpage_f5_fg_Note",
    });
    fldNotes.updateDisplaySize({
      height: 5,
      width: 120,
    });
    fldNotes.isMandatory = true;
    // fldNotes.updateLayoutType({
    //     layoutType:serverWidget.FieldLayoutType.OUTSIDE
    // })

    form.addSubmitButton({ label: "Submit" });

    return form;
  }

  function populateForm(form, timeId) {
    if (!timeId) {
      return;
    }

    var sfcTimeEntry = record.load({
      type: "customrecord_f5_sfc_timeentry",
      id: timeId,
    });

    var empId = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_employee",
    });
    var woId = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_workorder",
    });
    var opId = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_operationid",
    });
    var hours = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_durationinhours",
    });
    var startDate = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_date",
    });
    var notes = sfcTimeEntry.getValue({
      fieldId: "custrecord_f5_sfc_te_notes",
    });
    var deptId = sfcTimeEntry.getValue({
      fieldId: "custrecordcustrecord_dce_department_wo",
    });

    var opField = form.getField({ id: "custpage_f5_sfc_operation" });
    form.getField({ id: "custpage_f5_sfc_employee" }).defaultValue = empId;
    form.getField({ id: "custpage_f5_sfc_work_order" }).defaultValue = woId;
    form.getField({ id: "custpage_f5_sfc_hours" }).defaultValue = hours;
    form.getField({ id: "custpage_f5_sfc_date" }).defaultValue = startDate;
    form.getField({ id: "custpage_f5_sfc_notes" }).defaultValue = notes;
    form.getField({ id: "custpage_f5_sfc_department" }).defaultValue = deptId;

    form.getField({ id: "custpage_f5_sfc_time_id" }).defaultValue = timeId;

    var opSearch = search.create({
      type: "manufacturingoperationtask",
      filters: [["workorder", "anyof", woId]],
      columns: ["name"],
    });

    var operations = f5_lib.getResults(opSearch);
    operations.forEach(function (result) {
      opField.addSelectOption({
        value: result.id,
        text: result.getValue("name"),
      });
    });

    opField.defaultValue = opId;
  }

  function getWorkOrders() {
    var filters = [
      ["status", "anyof", [/*"WorkOrd:A",*/ "WorkOrd:B", "WorkOrd:D"]],
      "AND",
      ["mainline", "is", true],
    ];
    var columns = ["tranid"];
    var woSearch = search.create({
      type: search.Type.WORK_ORDER,
      filters: filters,
      columns: columns,
    });

    return f5_lib.getResults(woSearch);
  }

  function getWorkOrdersWithOps() {
    var opSearch = search.load({
      id: "customsearch_f5_wo_with_ops",
    });

    var results = f5_lib.getResults(opSearch);
    var workOrderCol = search.createColumn({
      name: "workorder",
      summary: "group",
    });
    return results.map(function (result) {
      return {
        id: result.getValue(workOrderCol),
        text: result.getText(workOrderCol),
      };
    });
  }

  function createSfcTimeEntry(parameters) {
    log.debug("parameters", JSON.stringify(parameters));
    var empId = parameters["custpage_f5_sfc_employee"];
    var woId = parameters["custpage_f5_sfc_work_order"];
    var opId = parameters["custpage_f5_sfc_operation"];
    var opName = parameters["inpt_custpage_f5_sfc_operation"];
    var department = parameters["custpage_f5_sfc_department"];
    var salesRegion = parameters["custpage_f5_sfc_salesregion"];
    var hours = f5_lib.roundNearestQuarter(
      parseFloat(parameters["custpage_f5_sfc_hours"])
    );
    var minutes = f5_lib.convertHoursToMinutes(hours);

    var startDate = parameters["custpage_f5_sfc_date"];
    var notes = parameters["custpage_f5_sfc_notes"];
    var timeId = parameters["custpage_f5_sfc_time_id"];
    var sfcTimeEntry;
    if (timeId) {
      sfcTimeEntry = record.load({
        type: "customrecord_f5_sfc_timeentry",
        id: timeId,
      });
    } else {
      sfcTimeEntry = record.create({ type: "customrecord_f5_sfc_timeentry" });
    }

    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_employee",
      value: empId,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_workorder",
      value: woId,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_operationid",
      value: opId,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_operationname",
      value: opName,
    });
    sfcTimeEntry.setText({
      fieldId: "custrecord_f5_sfc_te_date",
      text: startDate,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_starttime",
      value: new Date(),
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_durationinhours",
      value: hours,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_durationinmints",
      value: minutes,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_notes",
      value: notes,
    });
    sfcTimeEntry.setValue({ fieldId: "custrecord_f5_sfc_te_status", value: 1 });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sfc_te_update_ts",
      value: true,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecordcustrecord_dce_department_wo",
      value: department,
    });
    sfcTimeEntry.setValue({
      fieldId: "custrecord_f5_sales_region",
      value: salesRegion,
    });
    //RF-F5:Check if rework
    if (
      opName &&
      (opName.toUpperCase().indexOf("REWORK") >= 0 ||
        opName.toUpperCase().indexOf("RE-WORK"))
    ) {
      sfcTimeEntry.setValue({ fieldId: "custrecord_f5_rework", value: true });
    }
    timeId = sfcTimeEntry.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });

    return timeId;
  }

  return {
    onRequest: onRequest,
  };
});
