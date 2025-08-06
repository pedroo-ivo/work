/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

//? Setting values for employee record
//? Getting alerts from employee record related to a condition

define([], function () {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  // function pageInit(scriptContext) {} //`everything that i comment out will be removed from the script page -> script subtab in netsuite (need to remember to comment out the return and also the funtion above)

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
  function fieldChanged(context) {
    var employee = context.currentRecord; //examining employee record on the script deployment
    if (context.fieldId === 'phone') {
      //if/when i am using field phone
      var fax = employee.getValue({
        //get value of field fax
        fieldId: 'fax',
      });

      if (!fax) {
        //if fax field is empty
        var phone = employee.getValue({
          fieldId: 'phone', //get value of phone field
        });

        employee.setValue({
          //set value from phone field to fax field
          fieldId: 'fax',
          value: phone,
          ignoreFieldChange: false,
        });
      }
    }
  }

  /**
   * Function to be executed when field is slaved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
  // function postSourcing(scriptContext) {} /

  /**
   * Function to be executed after sublist is inserted, removed, or edited.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  // function sublistChanged(scriptContext) {} /

  /**
   * Function to be executed after line is selected.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  // function lineInit(scriptContext) {} /

  /**
   * Validation function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @returns {boolean} Return true if field is valid
   *
   * @since 2015.2
   */
  function validateField(context) {
    var employee = context.currentRecord;
    var empCode = employee.getValue({
      fieldId: 'custentity_dce_employee_code',
    });

    if (context.fieldId === empCode) {
      empCode; //need to return something from the if statement, in this case i am returning the value of the field
    } else if (empCode === 'x') {
      //however if the empcode is 'x' it will return an alert
      alert('invalid employee code, please try again');
      return false; // it wont allow me to move away from the field
    } else {
      return true; //if it is different than x, it will allow me to move away from the field
    }
  }

  /**
   * Validation function to be executed when sublist line is committed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  // function validateLine(scriptContext) {} /

  /**
   * Validation function to be executed when sublist line is inserted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  // function validateInsert(scriptContext) {} /

  /**
   * Validation function to be executed when record is deleted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  // function validateDelete(scriptContext) {} /

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
  function saveRecord(context) {
    //I can use it to define some fields that cant be missed for sales order or other things, better than workflow
    var employee = context.currentRecord;
    var empCode = employee.getValue({
      fieldId: 'custentity_dce_employee_code',
    });

    if (empCode === 'x') {
      alert('invalid employee code, please try again');
      return false; // to return save record false, stopping the user to save the record
    } else {
      return true; // to allow the user to save the record if no error
    }
  }

  return {
    //pageInit: pageInit,
    fieldChanged: fieldChanged,
    // postSourcing: postSourcing, //`everything that i comment out will be removed from the script page -> script subtab in netsuite (need to remember to comment out the return and also the funtion above)
    // sublistChanged: sublistChanged,
    // lineInit: lineInit,
    validateField: validateField,
    // validateLine: validateLine,
    // validateInsert: validateInsert,
    // validateDelete: validateDelete,
    saveRecord: saveRecord,
  };
});
