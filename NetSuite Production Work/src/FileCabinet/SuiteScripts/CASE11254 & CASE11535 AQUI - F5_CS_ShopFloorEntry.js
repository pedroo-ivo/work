/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
  "N/search",
  "N/record",
  "N/ui/dialog",
  "N/ui/message",
  "./F5_Lib_ShopFloorCustomisation",
], function (search, record, dialog, message, f5_lib) {
  var HC_STARTED = 1;
  var HC_REVIEWED = 3;

  var OPERATION_WARNING_MESSAGE = message.create({
    type: message.Type.WARNING,
    title: "No operations",
    message: "Work Order {1} has no available Operations",
  });

  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  function pageInit(scriptContext) {
    setTimeout(function () {
      setFocus("custpage_f5_sfc_employee_display");
    }, 100);
  }

  /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
  function fieldChanged(scriptContext) {
    var fieldId = scriptContext.fieldId;
    var currentRecord = scriptContext.currentRecord;
    try {
      //Set drop-down fields on change of text fields.

      var textFields = getTxtFields();
      if (textFields.hasOwnProperty(fieldId)) {
        var textField = textFields[fieldId];
        if (textField.filter) {
          //Get the value of the text field
          var sTextVal = currentRecord.getValue(fieldId);
          if (sTextVal && sTextVal.trim() != "") {
            textField.filter["value"] = sTextVal;
            if (textField.additionalFldVal) {
              var aAddlFldVals = [];
              for (var fld in textField.additionalFldVal) {
                var oAddlFldVal = textField.additionalFldVal[fld];
                var fldVal = currentRecord.getValue(fld);
                if (!fldVal) {
                  alert(oAddlFldVal.emptyMsg);
                  return false;
                }
                aAddlFldVals.push({
                  name: oAddlFldVal.name,
                  operator: oAddlFldVal.operator,
                  value: fldVal,
                });
              }
              textField.additionalFldVal = aAddlFldVals;
            }
            var idRecord = f5_lib.getRecordFromText(textField);
            if (idRecord) {
              currentRecord.setValue({
                fieldId: textField.fieldToSet,
                value: idRecord,
              });
            } else {
              alert("No Match");
              return;
            }
          }
        }
      }

      if (fieldId === "custpage_f5_sfc_work_order") {
        var workOrder = currentRecord.getValue(fieldId);

        if (workOrder === "") {
          OPERATION_WARNING_MESSAGE.hide();
          return;
        }
        //Get the project
        //iHelp 526982 - loading the record as look up does not work
        var workOrderRec = record.load({
          type: record.Type.WORK_ORDER,
          id: workOrder,
        });
        var projectText = workOrderRec.getText({ fieldId: "job" });

        //Get the memo
        //DevOps 5658
        var sMemo = search.lookupFields({
          type: "workorder",
          id: workOrder,
          columns: ["memo", "department", "cseg_dce_sales_regi", "item"],
        });
        console.log("Smemo", sMemo);

        //aqui wo item - work order item or assembly
        // currentRecord.setValue({
        //   fieldId: "custpage_f5_sfc_woitem",
        //   value: sMemo.item && sMemo.item.length > 0 ? sMemo.item[0].value : "",
        // });
        // currentRecord.setValue({
        //   fieldId: "custpage_f5_sfc_woitem_text",
        //   value: sMemo.item && sMemo.item.length > 0 ? sMemo.item[0].text : "",
        // });

        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_memo",
          value: sMemo.memo,
        });
        var department = "",
          salesRegion = "",
          departmentText = "",
          salesRegionText = "";
        if (sMemo.department.length > 0) {
          department = sMemo.department[0].value;
          departmentText = sMemo.department[0].text;
        }
        if (sMemo.cseg_dce_sales_regi.length > 0) {
          salesRegion = sMemo.cseg_dce_sales_regi[0].value;
          salesRegionText = sMemo.cseg_dce_sales_regi[0].text;
        }

        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_department",
          value: department,
        });
        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_department_text",
          value: departmentText,
        });
        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_salesregion_text",
          value: salesRegionText,
        });
        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_salesregion",
          value: salesRegion,
        });
        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_project_text",
          value: projectText,
        });

        var opSearch = search.create({
          type: "manufacturingoperationtask",
          filters: [["workorder", "anyof", workOrder]],
          columns: ["name"],
        });

        var opField = currentRecord.getField("custpage_f5_sfc_operation");
        opField.removeSelectOption({ value: null });
        var operations = f5_lib.getResults(opSearch);
        console.log(JSON.stringify(operations));
        if (operations.length > 0) {
          OPERATION_WARNING_MESSAGE.hide();
          operations.forEach(function (result) {
            opField.insertSelectOption({
              value: result.id,
              text: result.getValue("name"),
            });
          });
        } else {
          OPERATION_WARNING_MESSAGE = message.create({
            type: message.Type.WARNING,
            title: "No operations",
            message:
              currentRecord.getText("custpage_f5_sfc_work_order") +
              " has no available Operations!",
          });
          OPERATION_WARNING_MESSAGE.show();
        }
      }

      if (fieldId === "custpage_f5_sfc_hours") {
        // round to nearest quarter
        var hours = currentRecord.getValue(fieldId);
        if (hours) {
          var roundedValue = f5_lib.roundNearestQuarter(hours);
          currentRecord.setValue({
            fieldId: fieldId,
            value: roundedValue,
            ignoreFieldChange: true,
          });
        }
        setFocus("custpage_f5_sfc_notes");
      }

      //Set the Status of the Employee
      if (fieldId === "custpage_f5_sfc_employee") {
        var idEmp = currentRecord.getValue(fieldId);
        var idStatus = HC_STARTED;
        if (idEmp) {
          var isEmpForRev = f5_lib.isEmpForReview(idEmp);
          idStatus = isEmpForRev ? HC_STARTED : HC_REVIEWED;
          //to set department of the employee on the department for time entry, already have the department of the employee, dont need this.
          // var departmentValue = search.lookupFields({
          //     type:'employee',
          //     id:idEmp,
          //     columns:['department']
          // });
          // if(departmentValue.department.length > 0) {
          //     department = departmentValue.department[0].value;
          //     departmentText = departmentValue.department[0].text;
          //     currentRecord.setValue({
          //         fieldId: 'custpage_f5_sfc_department',
          //         value: department
          //     });
          //     currentRecord.setValue({
          //         fieldId: 'custpage_f5_sfc_department_text',
          //         value: departmentText
          //     });
          // }
        }
        currentRecord.setValue({
          fieldId: "custpage_f5_sfc_status",
          value: idStatus,
        });
      }
    } catch (e) {
      console.error(fieldId);
      console.error(e);
    }
  }

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
  function saveRecord(scriptContext) {
    try {
      var currentRecord = scriptContext.currentRecord;
      var operation = currentRecord.getValue("custpage_f5_sfc_operation");
      var currentEmployee = currentRecord.getValue("custpage_f5_sfc_employee");
      var operationDetails = search.lookupFields({
        type: "manufacturingoperationtask",
        id: operation,
        columns: ["manufacturingworkcenter"],
      });
      var workCenterId = operationDetails["manufacturingworkcenter"][0].value;
      console.log("MFG " + workCenterId);

      var isValidResource = false;
      var workCenter = record.load({
        type: "entitygroup",
        id: workCenterId,
        isDynamic: true,
      });
      console.log("workCenter " + JSON.stringify(workCenter));

      var sublistId = "groupmembers";
      var lineCount = workCenter.getLineCount(sublistId);
      for (var i = 0; i < lineCount; i++) {
        var groupEmployee = workCenter.getSublistValue({
          sublistId: sublistId,
          fieldId: "memberkey",
          line: i,
        });
        if (parseInt(groupEmployee) === parseInt(currentEmployee)) {
          isValidResource = true;
          break;
        }
        // console.log(groupEmployee);
      }

      if (!isValidResource) {
        var operationName = currentRecord.getText("custpage_f5_sfc_operation");
        // alert('Employee is not a valid Resource for Operation #: ' + operationName);
        message
          .create({
            type: message.Type.ERROR,
            title: "Invalid Employee",
            message:
              "Employee " +
              currentRecord.getText("custpage_f5_sfc_employee") +
              " is not a valid Resource for Operation # " +
              operationName,
            duration: 5000,
          })
          .show();
      }

      return isValidResource;
    } catch (e) {
      message
        .create({
          type: message.Type.ERROR,
          title: e.name,
          message: e.message,
          duration: 5000,
        })
        .show();
      return false;
      console.error(e);
    }

    return true;
  }

  function setFocus(elemName) {
    var nextElement = document.getElementsByName(elemName);
    if (nextElement[0]) {
      nextElement[0].focus();
    }
  }

  function getTxtFields() {
    return {
      custpage_f5_sfc_employee_text: {
        recordType: "employee",
        filter: { name: "entityid", operator: "contains" },
        fieldToSet: "custpage_f5_sfc_employee",
      },
      custpage_f5_sfc_work_order_text: {
        recordType: "workorder",
        filter: { name: "tranid", operator: "contains" },
        fieldToSet: "custpage_f5_sfc_work_order",
        additionalFilter: { name: "mainline", operator: "is", value: "T" },
      },
      custpage_f5_sfc_operation_text: {
        recordType: "manufacturingoperationtask",
        filter: { name: "sequence", operator: "equalto" },
        fieldToSet: "custpage_f5_sfc_operation",
        additionalFldVal: {
          custpage_f5_sfc_work_order: {
            name: "workorder",
            operator: "anyof",
            emptyMsg: "Please enter value for Work Order #",
          },
        },
      },
    };
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    saveRecord: saveRecord,
  };
});
