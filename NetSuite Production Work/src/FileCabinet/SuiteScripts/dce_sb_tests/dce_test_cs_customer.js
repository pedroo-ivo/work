/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

//? couting records linked to a customer record

define(['N/record'], /**
 * @param{record} record
 */ function (record) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  function pageInit(context) {
    var customer = context.currentRecord;

    //* couting how many carriage service records
    var carriageCount = customer.getLineCount({
      sublistId: 'recmachcustrecord_gsr_customer', //need to include recmach for sublist and include the id that is linking my parent record and the subblist record. in this case custrecord_gsr_customer sublist is what link the customer record and the carriage service record. i found this info on the custom record: Carriage Service Report -> fields.
    });
    var notes = 'this customer has: ' + carriageCount + ' carriage reports.\n'; // //if the alert returns -1 is because we need to edit the custom record and activate "ALLOW CHILD RECORD EDITING", this will make display the right quantity.
    //\n line break

    //* counting how many carriage service records are 058 -> might have something not working from the carriage service report, because custom record need to be included on the parent record (please see in obsidian: Custom Records as subtabs)  and also inline editable and this one for some reason is not, might be coz it belongs to NXC idk, but can try with other custom record that can be inline edit. -> custom inline editing also not working for a custom record that i have created.
    var asset058Count = 0;
    for (var i = 0; i < carriageCount; i++) {
      var ffcNo = customer.getSublistValue({
        sublistId: 'recmachcustrecord_gsr_customer', // same here, need to include what is linking the parent record and the custom record, in this case parent record is customer and custom record is carriage service report and what links both is the field i have selected
        fieldId: 'custrecord_gsr_ffcno', //field that i am searching, in this case i am searching the machine number and this is the field. found at custom record: Carriage Service Report -> fields.
        line: i,
      });
      if (ffcNo == '058') {
        asset058Count += 1;
      }
    }
    notes += 'this customer has ' + asset058Count + ' GC058 inspections';

    //* displaying alerts
    alert(notes);
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
  function fieldChanged(scriptContext) {}

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
  function postSourcing(scriptContext) {}

  /**
   * Function to be executed after sublist is inserted, removed, or edited.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  function sublistChanged(scriptContext) {}

  /**
   * Function to be executed after line is selected.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  function lineInit(context) {
    //defaulting value for a sublist field
    var customer = context.currentRecord;
    if (context.sublistId == 'recmachcustrecord_gsr_customer') {
      var ffcNo = customer.getCurrentSublistField({
        fieldId: 'custrecord_gsr_ffcno',
        sublistId: 'recmachcustrecord_gsr_customer',
      });
      if (!ffcNo) {
        customer.setCurrentSublistValue({
          sublistId: 'recmachcustrecord_gsr_customer',
          fieldId: 'custrecord_gsr_ffcno',
          value: 1, //id of ffcno 058 -> values for list are id numbers, if want can be value name, but need to change to text sublist text.
          // ignoreFieldChange: boolean
        });
      }
    }
  }

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
  function validateField(scriptContext) {}

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
  function validateLine(scriptContext) {}

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
  function validateInsert(scriptContext) {}

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
  function validateDelete(scriptContext) {}

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
  function saveRecord(scriptContext) {}

  return {
    pageInit: pageInit,
    // fieldChanged: fieldChanged,
    // postSourcing: postSourcing,
    // sublistChanged: sublistChanged,
    lineInit: lineInit,
    // validateField: validateField,
    // validateLine: validateLine,
    // validateInsert: validateInsert,
    // validateDelete: validateDelete,
    // saveRecord: saveRecord,
  };
});
