/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

//?GETTING FIELDS FROM EMPLOYEEE
//?CREATING A TASK WHENEVER A EMPLOYEE IS CREATED (can use it to send manuals, training videos and ask users to contact me in case of any problems or more knowledge needed and complete the task when netsuit onboarding is done)
//creating event when a employee is created

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
  const afterSubmit = (context) => {
    //it is triggered when record is saved
    //context: it is setup on the script -> deployment subtab; if multiple records i can use current record, if only one, then i can use record. This case deployment is for employee, therefore context refer to employee record

    var employee = context.newRecord;

    //newRecord -> is used only for server script or user event script
    //newrecord gives information after record is saved
    //var employee = context.oldrecord // old record gives information before record is saved
    //var employeeOld = context.oldRecord; // old record gives information before record is saved

    var empCode = employee.getValue({
      //objects of record module
      //getvalue to extract value from normal fields, in dropdowns it will return id
      fieldId: "custentity_dce_employee_code",
    });

    // var supervisorName = employee.getText({//todo FIXME getText is not working when creating a record
    //   //getText to extract value from dropdown fields
    //   fieldId: 'supervisor',
    // });

    var supervisorId = employee.getValue({
      fieldId: "supervisor",
    });
    var notes = employee.getText({
      fieldId: "comments",
    });

    //employee.setValue({fieldId: "custentity_dce_employee_code",value:"employee_test_JS",ignoreFieldChange: true,});

    //this set value will only work if the script is beforesubmit and not aftersubmit
    //from chatgpt n your script, you're trying to set a field value (custentity_dce_employee_code) after the record is saved, which might not be allowed due to governance restrictions. Try using beforeSubmit context instead, where you can modify field values before the record is saved. Here's the modified script:

    log.debug({
      //more than 100k log per 60min, it will move from the current log level to the next one, for exxample, if the script is set to debug, it will move to audit, from audit to error and from error to emergency.

      // i am using log.debug to return the value of each variable create on the script, if i do not do that, it will not show any log.
      title: "Employee Code",
      details: empCode,
    });

    log.debug({
      title: "Supervisor ID",
      details: supervisorId,
    });

    log.debug({
      title: "Notes",
      details: notes,
    });

    // log.debug({
    //   title: 'Supervisor Name',
    //   details: supervisorName,
    // });

    //? CREATING A TASK WHENEVER A EMPLOYEE IS CREATED (can use it to send manuals, training videos and ask users to contact me in case of any problems or more knowledge needed and complete the task when netsuit onboarding is done) need to include the department because it is mandatory for task
    if (context.type == context.UserEventType.CREATE) {
      //only when user create a new record
      //from user event script and not module
      var task = record.create({
        //when selection a module i will choose :
        // first the method to be used
        //second the enum of the method
        //third the objects members of the method (gettext, setvalue....)
        type: record.Type.TASK,
        // isDynamic: boolean, this is used for sublists, when creating a sublist item if this is default to true it will create individual lines, however if not defaulted it will lump all lines into one.
        // defaultValues: Object,
        // defaultValues: { customform: -120 }, //defining the standard form with no restrictions
      });

      task.setValue({
        //third part, object of record.record module
        fieldId: "title",
        value: "Email NetSuite Admin pedro@dce.co.nz for NetSuite Induction",
        // ignoreFieldChange: boolean
      });

      task.setValue({
        fieldId: "assigned",
        value: employee.id, //to return the id of the record
        // ignoreFieldChange: boolean
      });
      task.setValue({
        fieldId: "custevent_case_dept_wkflw",
        value: "122",
        // ignoreFieldChange: boolean
      });
      task.save({
        //IF I AM CREATING A RECORD I NEED TO SAVE IT
        // enableSourcing: boolean,
        // ignoreMandatoryFields: boolean
      });
      var event = record.create({
        type: record.Type.CALENDAR_EVENT,
        isDynamic: true, //this is used for sublists, when creating a sublist item if this is default to true it will create individual lines, however if not defaulted it will lump all lines into one.
        // defaultValues: Object
      });
      event.setValue({
        fieldId: "title",
        value: "Welcom",
        // ignoreFieldChange: boolean
      });
      event.selectNewLine({
        //entering sublist values 1st select new line -> i need to select all new lines individiaully
        //sublist
        sublistId: "attendee",
      });

      event.setCurrentSublistValue({
        ///entering sublist values 2nd enter sublist value or text or wahtever -> i need to enter values for all lines individiaully
        sublistId: "attendee",
        fieldId: "attendee",
        value: employee.id,
        // ignoreFieldChange: boolean
      });
      event.commitLine({
        // /entering sublist values 3rd comit line or save thing as press the ok button when adding a new line in any record -> i need to commite all lines individiaully
        sublistId: "attendee",
        // ignoreRecalc: boolean
      });
      event.save({
        //-> save, saves it all
        // enableSourcing: boolean,
        // ignoreMandatoryFields: boolean
      });
    }
    /**
     * sending to the new suitlet that i have created "dce_test_SL_update_employee_notes"
     * whenever i edit an employee record it redirect to the new custom page, if i want that only when creating  a new record a need to move above whitin the if create statement
     */
    redirect.toSuitelet({
      scriptId: "customscriptdce_test_sl_update_employee_",
      deploymentId: "customdeploydce_test_sl_update_employee_",
      // isExternal: boolean,
      parameters: {
        dce_name: employee.getValue("entityid"),
        dce_notes: employee.getValue("comments"),
        dce_emp: employee.getValue("employee.id"),
      },
    });
  };

  return {
    //*beforeLoad,
    //* beforeSubmit,
    afterSubmit,
  };
});
