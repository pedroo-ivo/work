/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/message'], /**
 * @param{record} record
 * @param{message} message
 */ (record, message) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  //const beforeLoad = (scriptContext) => {        }

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (context) => {
    var newRecord = context.newRecord;

    // Check if the project is closed
    var isClosed = newRecord.getValue({ fieldId: 'entitystatus' }) === 'Closed';

    if (isClosed) {
      // Display an error message and prevent submission
      var errorMessage = 'This project is closed and cannot be edited.';
      showMessage(errorMessage);
      context.cancel = true;
    }
  };

  function showMessage(messageText) {
    var myMessage = message.create({
      title: 'Error',
      message: messageText,
      type: message.Type.ERROR,
    });
    myMessage.show();
  }

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  // const afterSubmit = (scriptContext) => {

  // }

  return {
    //beforeLoad,
    beforeSubmit,
    //afterSubmit}
  };
});
