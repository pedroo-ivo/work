/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

//?GETTING FIELDS FROM EMPLOYEEE
//?CREATING A TASK WHENEVER A EMPLOYEE IS CREATED (can use it to send manuals, training videos and ask users to contact me in case of any problems or more knowledge needed and complete the task when netsuit onboarding is done)
//creating event when a employee is created

define(["N/record", "N/email"], /**
 * @param{record} record
 * @param{email} email
 */ (record, email) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */

  //const beforeLoad = (scriptContext) => {}

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */

  // const beforeSubmit = (scriptContext) => {}

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (context) => {
    var employee = context.newRecord;

    var employeeEmail = employee.getText({
      fieldId: "email",
    });

    if (context.type == context.UserEventType.CREATE) {
      email.send({
        author: 11,
        body: '"Hi there, Welcome to DCE.  My name is Pedro and I am responsible for NetSuite. If you are receiving this email/task means that your access to NetSuite has been sorted. Please be aware that @suzanne will be in contact with you to schedule a meeting to go through the activities related to your role in the ERP.                                     1. For the general knowledge and manuals, please refer to:https://moutere-my.sharepoint.com/:o:/r/personal/pedro_dce_co_nz/_layouts/15/Doc.aspx?sourcedoc=%7B892e3584-992c-4b71-b54e-6726413e980f%7D&action=edit&wd=target(General%20Netsuite%20Manuals.one%7C7ae80a6d-43d3-47ce-9ab6-339565e978fd%2FGM%5C%7C01.1_Steps%20to%20Duplicate%20and%20%7C2094e950-3bb8-431b-a3ed-966957fc322b%2F)&wdorigin=NavigationUrl                              2. For helpdesk (asking for support) please use this form: https://4902186.extforms.netsuite.com/app/site/crm/externalcasepage.nl/compid.4902186/.f?formid=4&h=AAFdikaI1t8kHB7C6uLKLbMQ47fv6GcTWY2_9EsFyAXFd4mMduw&whence=&redirect_count=1&did_javascript_redirect=T    3. NetSuite induction video: Still being prepared.Please complete this task in NetSuite once you have accessed manuals and Suzanne done the induction with you. Thanks",',
        recipients: [employeeEmail],
        subject: "Email NetSuite Admin pedro@dce.co.nz for NetSuite Induction",
        // attachments: | file.File[],
        // bcc: number[] | string[],
        cc: ["suzanne@dce.co.nz"],
        // isInternalOnly: boolean,
        // relatedRecords: Object,
        // replyTo: string
      });
    }
  };

  return {
    //*beforeLoad,
    beforeSubmit,
    // afterSubmit,
  };
});
