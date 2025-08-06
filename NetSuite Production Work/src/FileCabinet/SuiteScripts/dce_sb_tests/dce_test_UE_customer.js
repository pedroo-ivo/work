/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record", "N/redirect"], /**
 * @param{record} record
 * @param{redirect} redirect
 */ (record, redirect) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  // const beforeLoad = (scriptContext) => {

  // }

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  // const beforeSubmit = (scriptContext) => {

  // }

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */

  /**
   *
   * Sending data to another script: dce_test_SL_customer_onboard that is number 1914 in SB
   */
  const afterSubmit = (scriptContext) => {
    var customer = scriptContext.newRecord;

    // if (scriptContext.type == context.UserEventType.CREATE) {
    redirect.toSuitelet({
      scriptId: "1914",
      deploymentId: "1",
      // isExternal: boolean,
      parameters: {
        dce_customer_id: customer.id,
        dce_phone: customer.getValue({ fieldId: "phone" }),
        dce_email: customer.getValue({ fieldId: "email" }),
        dce_salesrep_id: customer.getValue({ fieldId: "salesrep" }),
      },
    });
  };
  //   };

  return {
    // beforeLoad,
    // beforeSubmit,
    afterSubmit,
  };
});
