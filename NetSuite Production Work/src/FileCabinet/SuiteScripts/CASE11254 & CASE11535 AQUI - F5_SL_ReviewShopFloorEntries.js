/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
  "N/search",
  "N/record",
  "N/ui/serverWidget",
  "N/format",
  "N/url",
  "N/ui/message",
  "./F5_Lib_ShopFloorCustomisation",
  "N/runtime",
  "N/redirect",
], function (
  search,
  record,
  serverWidget,
  format,
  url,
  message,
  f5_lib,
  run,
  redirect
) {
  var HC_STARTED = 1;
  var HC_COMPLETE = 2;
  var HC_REVIEWED = 3;

  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  function onRequest(scriptContext) {
    var form;
    var request = scriptContext.request;
    var method = request.method;
    var parameters = request.parameters;
    var sTitle;
    var sMsg;
    parameters.sMode =
      run
        .getCurrentScript()
        .getParameter("custscript_f5_sl_review_sfc_times_mode") || "Complete";
    parameters.submitStage;
    try {
      var costCentre;
      // log.debug({title: 'PARAMS', details: parameters});
      if (method === "GET") {
        form = createReviewForm(parameters);
        log.debug({ title: "get params", details: parameters });
        log.debug({ title: "get params", details: parameters.submitReview });

        if (
          parameters.submitReview == "finished" &&
          parameters.sMode == "Review"
        ) {
          sTitle = "Reviewed";
          sMsg = "Shop Floor Time Entries have been reviewed.";
          form.addPageInitMessage({
            type: message.Type.CONFIRMATION,
            title: sTitle,
            message: sMsg,
          });
        }

        if (
          parameters.submitReview == "finished" &&
          parameters.sMode == "Complete"
        ) {
          sTitle = "Submitted";
          sMsg = "Shop Floor Time Entries submitted for completion.";
          form.addPageInitMessage({
            type: message.Type.CONFIRMATION,
            title: sTitle,
            message: sMsg,
          });
        }
      } else {
        var formSublistData = "custpage_f5_sfc_time_entriesdata";
        costCentre = parameters["custpage_f5_sfc_cost_ctr"];
        var formPriceData = parameters[formSublistData];
        var lines = f5_lib.getFormData(formPriceData);
        log.debug({ title: "LINES", details: lines });

        completeShopFloorTimeEntries(lines, parameters.sMode);

        form = createReviewForm(parameters);

        var sTitle = "Submitted";
        var sMsg = "Shop Floor Time Entries submitted for completion.";
        if (parameters.sMode == "Review") {
          redirect.toSuitelet({
            scriptId: "737",
            deploymentId: "1",
            parameters: {
              submitReview: "finished",
            },
          });
        }
        if (parameters.sMode == "Complete") {
          redirect.toSuitelet({
            scriptId: "737",
            deploymentId: "2",
            parameters: {
              submitReview: "finished",
            },
          });
        }
      }

      scriptContext.response.writePage({ pageObject: form });
    } catch (e) {
      // form = createReviewForm();
      scriptContext.response.writeLine(JSON.stringify(e));
      log.error({ title: "F5 Review SFC", details: JSON.stringify(e) });
    }
  }

  function completeShopFloorTimeEntries(shopFloorTimeEntryLines, sMode) {
    shopFloorTimeEntryLines.forEach(function (shopFloorTimeEntryLine) {
      log.debug("shopFloorTimeEntryLine", shopFloorTimeEntryLine);
      var isSelected = shopFloorTimeEntryLine[0];
      if (isSelected === "T") {
        // log.debug({title: 'LINES', details: shopFloorTimeEntryLine});
        var hours = shopFloorTimeEntryLine[10];
        var notes = shopFloorTimeEntryLine[12];
        var timeEntryId = shopFloorTimeEntryLine[14];
        var isRework = shopFloorTimeEntryLine[15]; //Rework
        try {
          var timeEntry = record.load({
            type: "customrecord_f5_sfc_timeentry",
            id: timeEntryId,
          });

          log.debug("loaded " + timeEntryId);

          // just to make sure
          hours = f5_lib.roundNearestQuarter(hours);
          var minutes = f5_lib.convertHoursToMinutes(hours);

          timeEntry.setValue({
            fieldId: "custrecord_f5_sfc_te_durationinhours",
            value: hours,
          });
          timeEntry.setValue({
            fieldId: "custrecord_f5_sfc_te_durationinmints",
            value: minutes,
          });
          timeEntry.setValue({
            fieldId: "custrecord_f5_sfc_te_notes",
            value: notes,
          });
          timeEntry.setValue({
            fieldId: "custrecord_f5_sfc_te_status",
            value: sMode == "Complete" ? HC_COMPLETE : HC_REVIEWED,
          });
          timeEntry.save({ enableSourcing: true, ignoreMandatoryFields: true });

          log.debug("created time");
        } catch (e) {
          log.error({ title: "SFC Complete", details: JSON.stringify(e) });
        }
      }
    });
  }

  function createReviewForm(parameters) {
    costCentre = parameters["custpage_f5_sfc_cost_ctr"];

    var form = serverWidget.createForm({
      title: parameters.sMode + " Time against Work on Hand",
    });
    form.clientScriptModulePath =
      "SuiteScripts/Fusion5 Customisations/SS 2.0/shop_floor/F5_CS_ShopFloorReview.js";

    var modeField = form.addField({
      id: "custpage_f5_sfc_mode",
      type: serverWidget.FieldType.TEXT,
      label: "Mode",
    });
    modeField.defaultValue = parameters.sMode;
    modeField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    //Add the Filters

    // var costCentreField = form.addField({
    //     id: 'custpage_f5_sfc_cost_ctr',
    //     type: serverWidget.FieldType.SELECT,
    //     label: 'Cost Centre'
    // });
    // costCentreField.helpText = 'Filter by Employee Cost Centre';

    //aqui adding filter for subsidiary but not working yet
    //           var subsidiaryField = form.addField({
    //   id: 'custpage_f5_sfc_subsidiary_filter',
    //   type: serverWidget.FieldType.SELECT,
    //   label: 'Subsidiary',
    //   source: 'subsidiary'
    // });

    var departmentField = form.addField({
      id: "custpage_f5_sfc_department_filter",
      type: serverWidget.FieldType.SELECT,
      label: "Department",
    });
    departmentField.helpText = "Filter by Employee Department";

    var empField = form.addField({
      id: "custpage_f5_sfc_employee",
      type: serverWidget.FieldType.SELECT,
      label: "Employee",
      source: "employee",
    });
    empField.helpText = "Filter by Employee";
    if (parameters.custpage_f5_sfc_employee) {
      empField.defaultValue = parameters.custpage_f5_sfc_employee;
    }

    var totalField = form.addField({
      id: "custpage_f5_sfc_total",
      type: serverWidget.FieldType.FLOAT,
      label: "Total Hours",
    });
    totalField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    var fromDateField = form.addField({
      id: "custpage_f5_sfc_fromdate",
      type: serverWidget.FieldType.DATE,
      label: "From Date",
    });
    fromDateField.helpText = "Filter on or after this date.";
    if (parameters.custpage_f5_sfc_fromdate) {
      fromDateField.defaultValue = new Date(
        decodeURIComponent(parameters.custpage_f5_sfc_fromdate)
      );
      parameters.custpage_f5_sfc_fromdate = fromDateField.defaultValue;
    }

    var toDateField = form.addField({
      id: "custpage_f5_sfc_todate",
      type: serverWidget.FieldType.DATE,
      label: "To Date",
    });
    toDateField.helpText = "Filter on or before this date.";
    if (parameters.custpage_f5_sfc_todate) {
      toDateField.defaultValue = new Date(
        decodeURIComponent(parameters.custpage_f5_sfc_todate)
      );
      parameters.custpage_f5_sfc_todate = toDateField.defaultValue;
    }

    form.addSubmitButton({ label: parameters.sMode });

    var sublist = form.addSublist({
      id: "custpage_f5_sfc_time_entries",
      label: "Time Entries",
      type: serverWidget.SublistType.LIST,
    });

    sublist.addMarkAllButtons();
    sublist.addField({
      id: "custpage_f5_sfc_time_select",
      type: serverWidget.FieldType.CHECKBOX,
      label: "Select",
    });
    sublist.addField({
      id: "custpage_f5_sfc_time_view",
      type: serverWidget.FieldType.TEXT,
      label: "Action",
    });
    sublist.addField({
      id: "custpage_f5_sfc_time_date",
      type: serverWidget.FieldType.TEXT,
      label: "Date",
    });
    var empField = sublist.addField({
      id: "custpage_f5_sfc_time_employee",
      type: serverWidget.FieldType.SELECT,
      label: "Employee",
      source: search.Type.EMPLOYEE,
    });
    var woField = sublist.addField({
      id: "custpage_f5_sfc_time_wo",
      type: serverWidget.FieldType.SELECT,
      label: "Work Order #",
      source: search.Type.WORK_ORDER,
    });
    var opField = sublist.addField({
      id: "custpage_f5_sfc_time_operation",
      type: serverWidget.FieldType.SELECT,
      label: "Operation Name",
      source: search.Type.MANUFACTURING_OPERATION_TASK,
    });

    //aqui - need to comment out this part so the part below works
    var projectField = sublist.addField({
      id: "custpage_f5_sfc_time_project",
      type: serverWidget.FieldType.SELECT,
      label: "Project",
      source: search.Type.JOB,
    });

    //aqui changing how project is displayed
    //           var projectField = sublist.addField({
    //   id: "custpage_f5_sfc_time_project",
    //   type: serverWidget.FieldType.TEXT,
    //   label: "Project",
    // });

    //aqui - work order item or assembly
    // var woItemField = sublist.addField({
    //   id: "custpage_f5_sfc_time_wo_item",
    //   type: serverWidget.FieldType.SELECT,
    //   label: "WO Item",
    //   source: search.Type.ITEM, //might need to create this search
    // });

    //aqui - adding employee subsidiary field
    //      var empSubsidiaryField = sublist.addField({
    //   id: 'custpage_f5_sfc_time_emp_subsidiary',
    //   type: serverWidget.FieldType.SELECT,
    //   label: 'Employee Subsidiary',
    //   source: 'subsidiary'
    // });

    var department = sublist.addField({
      id: "custpage_f5_sfc_wodepartment",
      type: serverWidget.FieldType.SELECT,
      label: "Department WO",
      source: search.Type.DEPARTMENT,
    });
    var salesRegion = sublist.addField({
      id: "custpage_f5_sfc_wosalesregion",
      type: serverWidget.FieldType.SELECT,
      label: "Sales Region WO",
      source: "customrecord_cseg_dce_sales_regi",
    });
    var wipField = sublist.addField({
      id: "custpage_f5_sfc_time_wip",
      type: serverWidget.FieldType.SELECT,
      label: "Work on Hand",
      source: "customrecord_cseg_wip_project",
    });

    var hoursField = sublist.addField({
      id: "custpage_f5_sfc_time_labour_hours",
      type: serverWidget.FieldType.FLOAT,
      label: "Labour Hours",
    });
    var machineField = sublist.addField({
      id: "custpage_f5_sfc_time_machine_hours",
      type: serverWidget.FieldType.FLOAT,
      label: "Machine Hours",
    });
    var notesField = sublist.addField({
      id: "custpage_f5_sfc_time_notes",
      type: serverWidget.FieldType.TEXTAREA,
      label: "Notes",
      displayType: serverWidget.FieldDisplayType.NORMAL,
    });
    var statusField = sublist.addField({
      id: "custpage_f5_sfc_time_status",
      type: serverWidget.FieldType.SELECT,
      label: "Status",
      source: "customlist_f5_sfc_timeentrystatus",
    });
    var idField = sublist.addField({
      id: "custpage_f5_sfc_time_id",
      type: serverWidget.FieldType.TEXT,
      label: "ID",
    });
    var reworkField = sublist.addField({
      id: "custpage_f5_sfc_rework",
      type: serverWidget.FieldType.CHECKBOX,
      label: "REWORK",
    });
    // var departmentEmployee = sublist.addField({
    //     id: 'custpage_f5_sfc_empdepartment',
    //     type: serverWidget.FieldType.SELECT,
    //     label: 'Department Employee',
    //     source: 'customrecord_cseg_f5_cost_centre'
    // });

    empField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });
    woField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });
    // departmentEmployee.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    department.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });
    opField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });
    projectField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });
    wipField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.INLINE,
    });

    //aqui - work order item or assembly
    // woItemField.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.INLINE,
    // });

    //aqui - adding employee subsidiary field
    //           empSubsidiaryField.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.INLINE
    // });

    hoursField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.ENTRY,
    });
    notesField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.ENTRY,
    });
    machineField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });
    statusField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });
    idField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });
    reworkField.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });
    salesRegion.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });
    var timeEntries = getTimeEntries(parameters);
    var nTotalHours = 0;
    // var wipWorkOrders = getWorkOrders();
    // wipWorkOrders.forEach(function (result) {
    //     woField.addSelectOption({
    //         value: result.id,
    //         text: 'Work Order #' + result.getValue('tranid')
    //     });
    // });

    timeEntries.forEach(function (timeEntry, index) {
      var entryDate = timeEntry.getValue("custrecord_f5_sfc_te_date");
      // var entryDate = format.format({
      //     type: format.Type.DATE,
      //     value: timeEntry.getValue('custrecord_f5_sfc_te_date')
      // });
      var viewUrl = url.resolveRecord({
        recordId: timeEntry.id.toString(),
        recordType: "customrecord_f5_sfc_timeentry",
        isEditMode: false,
      });
      var editUrl = url.resolveScript({
        scriptId: "customscript_f5_sl_shop_floor_v2",
        deploymentId: "customdeploy_f5_sl_shop_floor_v2",
        params: {
          timeId: timeEntry.id,
        },
      });

      var viewLink =
        '<a class="dottedlink" href="' +
        viewUrl +
        '" target="_blank">View</a> | <a class="dottedlink" href="' +
        editUrl +
        '" target="_blank">Edit</a>';

      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_id",
        line: index,
        value: timeEntry.id,
      });
      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_view",
        line: index,
        value: viewLink,
      });
      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_date",
        line: index,
        value: entryDate,
      });
      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_employee",
        line: index,
        value: timeEntry.getValue("custrecord_f5_sfc_te_employee"),
      });
      var idWO = timeEntry.getValue("custrecord_f5_sfc_te_workorder");
      if (idWO) {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_wo",
          line: index,
          value: idWO,
        });
      }

      var idOperation = timeEntry.getValue("custrecord_f5_sfc_te_operationid");
      if (idOperation) {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_operation",
          line: index,
          value: idOperation,
        });
      }

      //aqui - need to comment out this part so the part below works
      var idProject = timeEntry.getValue(
        "custrecord_dce_work_order_project_shop"
      );
      if (idProject) {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_project",
          line: index,
          value: idProject,
        });
      }

      //aqui - project display value
      //    var idProject = timeEntry.getValue("custrecord_dce_work_order_project_shop");
      // if (idProject) {
      //   var projFields = search.lookupFields({
      //     type: search.Type.JOB,
      //     id: idProject,
      //     columns: ["entityid", "jobname"]
      //   });

      //   var entityid = projFields.entityid || "";
      //   var jobname = projFields.jobname || "";

      //   // Monta do jeito que preferir:
      //   var displayValue = entityid;
      //   if (jobname) displayValue += " " + jobname;

      //   sublist.setSublistValue({
      //     id: "custpage_f5_sfc_time_project",
      //     line: index,
      //     value: displayValue
      //   });
      // }

      //aqui wo item - work order item or assembly
      //  var woItem = timeEntry.getValue("custrecord_dce_wo_item");
      //   if (woItem) {
      //     sublist.setSublistValue({
      //       id: "custpage_f5_sfc_time_wo_item",
      //       line: index,
      //       value: woItem,
      //     });
      //   }

      //aqui - adding employee subsidiary field

      //      var empSubsidiary = timeEntry.getValue({
      //   name: "subsidiary",
      //   join: "custrecord_f5_sfc_te_employee"
      // });
      // if (empSubsidiary) {
      //   sublist.setSublistValue({
      //     id: 'custpage_f5_sfc_time_emp_subsidiary',
      //     line: index,
      //     value: empSubsidiary
      //   });
      // }

      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_labour_hours",
        line: index,
        value: timeEntry.getValue("custrecord_f5_sfc_te_durationinhours"),
      });
      // if(timeEntry.getValue({name: 'cseg_f5_cost_centre', join: 'custrecord_f5_sfc_te_employee'})){
      //     sublist.setSublistValue({
      //         id: 'custpage_f5_sfc_empdepartment',
      //         line: index,
      //         value: timeEntry.getValue({name: 'cseg_f5_cost_centre', join: 'custrecord_f5_sfc_te_employee'})
      //     });
      // }
      var idDept = timeEntry.getValue("custrecordcustrecord_dce_department_wo");
      if (idDept) {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_wodepartment",
          line: index,
          value: idDept,
        });
      }

      if (timeEntry.getValue("custrecord_f5_sales_region")) {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_wosalesregion",
          line: index,
          value: timeEntry.getValue("custrecord_f5_sales_region"),
        });
      }

      sublist.setSublistValue({
        id: "custpage_f5_sfc_time_status",
        line: index,
        value: timeEntry.getValue("custrecord_f5_sfc_te_status"),
      });

      var wipProject = timeEntry.getValue("custrecord_f5_sfc_te_wipproject");
      if (wipProject && wipProject !== "") {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_wip",
          line: index,
          value: wipProject,
        });
      }

      var machineHours = timeEntry.getValue(
        "custrecord_f5_sfc_te_durationinmints"
      );
      if (machineHours && machineHours !== "") {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_machine_hours",
          line: index,
          value: machineHours,
        });
      }
      var timeNotes = timeEntry.getValue("custrecord_f5_sfc_te_notes");
      if (timeNotes && timeNotes !== "") {
        sublist.setSublistValue({
          id: "custpage_f5_sfc_time_notes",
          line: index,
          value: timeNotes,
        });
      }
      nTotalHours += parseFloat(
        timeEntry.getValue("custrecord_f5_sfc_te_durationinhours")
      );

      //RF-F5:Add if Rework
      var bIsRework = timeEntry.getValue("custrecord_f5_rework");
      sublist.setSublistValue({
        id: "custpage_f5_sfc_rework",
        line: index,
        value: bIsRework ? "T" : "F",
      });
    });

    // var costCentres = getCostCentres();
    // if (costCentres.length > 0) {
    //     costCentreField.addSelectOption({value: 'BLANK', text: '', isSelected: true});
    //     costCentreField.addSelectOption({value: 'NONE', text: '- None -'});
    //     costCentreField.addSelectOption({value: 'ALL', text: '- All -'});
    //     costCentres.forEach(function (costCtrObj) {
    //         costCentreField.addSelectOption({
    //             value: costCtrObj.id,
    //             text: costCtrObj.text
    //         });
    //     });
    // }
    var departments = getDepartments();
    if (departments.length > 0) {
      departmentField.addSelectOption({
        value: "BLANK",
        text: "",
        isSelected: true,
      });
      departmentField.addSelectOption({ value: "NONE", text: "- None -" });
      departmentField.addSelectOption({ value: "ALL", text: "- All -" });
      departments.forEach(function (departmentObj) {
        departmentField.addSelectOption({
          value: departmentObj.id,
          text: departmentObj.text,
        });
      });
    }
    if (parameters.custpage_f5_sfc_department_filter) {
      departmentField.defaultValue =
        parameters.custpage_f5_sfc_department_filter;
    }

    totalField.defaultValue = nTotalHours;

    return form;
  }

  function getTimeEntries(parameters) {
    var sfcSearch = search.load({
      //aqui - saved search need to have collumns i have added above
      id: "customsearch_f5_sfc_time_completion",
    });
    var filters = sfcSearch.filters;

    if (
      parameters.custpage_f5_sfc_cost_ctr &&
      parameters.custpage_f5_sfc_cost_ctr !== ""
    ) {
      var operator;
      var values;

      switch (parameters.custpage_f5_sfc_cost_ctr) {
        case "BLANK":
          operator = null;
          values = null;
          break;
        case "NONE":
          operator = "anyof";
          values = "@NONE@";
          break;
        case "ALL":
          operator = "isnotempty";
          values = null;
          break;
        default:
          operator = "anyof";
          values = parameters.custpage_f5_sfc_cost_ctr;
          break;
      }

      if (operator) {
        filters.push(
          search.createFilter({
            name: "cseg_f5_cost_centre",
            join: "custrecord_f5_sfc_te_employee",
            operator: operator,
            values: values,
          })
        );
      }
    }
    if (
      parameters.custpage_f5_sfc_department_filter &&
      parameters.custpage_f5_sfc_department_filter !== ""
    ) {
      var operator;
      var values;

      switch (parameters.custpage_f5_sfc_department_filter) {
        case "BLANK":
          operator = null;
          values = null;
          break;
        case "NONE":
          operator = "anyof";
          values = "@NONE@";
          break;
        case "ALL":
          operator = "isnotempty";
          values = null;
          break;
        default:
          operator = "anyof";
          values = parameters.custpage_f5_sfc_department_filter;
          break;
      }

      if (operator) {
        filters.push(
          search.createFilter({
            name: "department",
            join: "custrecord_f5_sfc_te_employee",
            operator: operator,
            values: values,
          })
        );
      }
    }

    if (parameters.custpage_f5_sfc_employee) {
      filters.push(
        search.createFilter({
          name: "custrecord_f5_sfc_te_employee",
          operator: "anyof",
          values: parameters.custpage_f5_sfc_employee,
        })
      );
    }

    if (parameters.custpage_f5_sfc_fromdate) {
      filters.push(
        search.createFilter({
          name: "custrecord_f5_sfc_te_date",
          operator: "onorafter",
          values: parameters.custpage_f5_sfc_fromdate,
        })
      );
    }

    if (parameters.custpage_f5_sfc_todate) {
      filters.push(
        search.createFilter({
          name: "custrecord_f5_sfc_te_date",
          operator: "onorbefore",
          values: parameters.custpage_f5_sfc_todate,
        })
      );
    }

    filters.push(
      search.createFilter({
        name: "custrecord_f5_sfc_te_status",
        operator: "anyof",
        values: parameters.sMode == "Complete" ? HC_REVIEWED : HC_STARTED,
      })
    );

    return f5_lib.getResults(sfcSearch);
  }

  function getCostCentres() {
    var sfcSearch = search.load({
      id: "customsearch_f5_sft_emp_cost_ctr",
    });

    var costCtrCol = search.createColumn({
      name: "cseg_f5_cost_centre",
      join: "custrecord_f5_sfc_te_employee",
      summary: "group",
    });

    var results = f5_lib.getResults(sfcSearch);

    return results.map(function (result) {
      return {
        id: result.getValue(costCtrCol),
        text: result.getText(costCtrCol),
      };
    });
  }
  function getDepartments() {
    var sfcSearch = search.load({
      id: "customsearch_f5_shop_floor_depa",
    });

    var departmentCol = search.createColumn({
      name: "department",
      join: "custrecord_f5_sfc_te_employee",
      summary: "group",
    });

    var results = f5_lib.getResults(sfcSearch);

    return results.map(function (result) {
      return {
        id: result.getValue(departmentCol),
        text: result.getText(departmentCol),
      };
    });
  }

  function getWorkOrders() {
    var filters = [
      ["status", "anyof", [/*"WorkOrd:A",*/ "WorkOrd:B", "WorkOrd:D"]],
      "AND",
      ["mainline", "is", true],
      "AND",
      ["iswip", "is", true],
    ];
    var columns = ["tranid"];
    var woSearch = search.create({
      type: search.Type.WORK_ORDER,
      filters: filters,
      columns: columns,
    });

    return f5_lib.getResults(woSearch);
  }

  return {
    onRequest: onRequest,
  };
});
