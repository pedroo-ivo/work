/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

//? CREATING an assistant page, might use that for services to create sales order, or zaria to create employees and so on
define(["N/ui/serverWidget"], (serverWidget) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    var request = scriptContext.request;
    var response = scriptContext.response;

    var help = serverWidget.createAssistant({
      title: "DCE Test Onboard Assistant",
      // hideNavBar: boolean
    });

    //* Creating pages or steps for the assistant
    var customerStp = help.addStep({
      id: "custpage_dce_customer_stp",
      label: "Customer Information",
    });

    var taskStp = help.addStep({
      id: "custpage_dce_task_stp",
      label: "Task Information",
    });

    var emailStp = help.addStep({
      id: "custpage_dce_email_stp",
      label: "Email Information",
    });

    var finalStp = help.addStep({
      id: "custpage_dce_final_stp",
      label: "Final Information",
    });

    var lastAction = help.getLastAction();

    //* creating the actions next, back, cancel, finish buttons
    if (
      lastAction == serverWidget.AssistantSubmitAction.NEXT ||
      lastAction == serverWidget.AssistantSubmitAction.BACK
    ) {
      help.currentStep = help.getNextStep();
    } else if (lastAction == serverWidget.AssistantSubmitAction.CANCEL) {
      help.currentStep = help.getStep({
        id: "custpage_dce_customer_stp",
      });
    } else if (lastAction == serverWidget.AssistantSubmitAction.FINISH) {
      //^ Finalize process here -> i need to write a process to create the record, need to include the module record
      //^ Create task record and send it to some users
      //^ Send email -> to main stakeholders for example like a kickoff meeting
      help.finishedHtml = "Task Created and Email Sent";
    }

    //* here i am creating the fields in each page
    var currentStepId =
      help.currentStep == null
        ? "custpage_dce_customer_stp"
        : help.currentStep.id;

    switch (currentStepId) {
      case "custpage_dce_customer_stp":
        var nameField = help.addField({
          id: "custpage_name",
          label: "Customer Name",
          type: serverWidget.FieldType.SELECT,
          source: "customer",
          container: "custpage_customer_info_group",
        });
        var salesRepField = help.addField({
          id: "custpage_salesrep",
          label: "Sales Rep",
          type: serverWidget.FieldType.SELECT,
          source: "employee",
          container: "custpage_customer_info_group",
        });
        var phoneField = help.addField({
          id: "custpage_phone",
          label: "Phone",
          type: serverWidget.FieldType.PHONE,
          container: "custpage_customer_info_group",
        });
        break;

      case "custpage_dce_task_stp":
        var taskTitleField = help.addField({
          id: "custpage_task_title",
          label: "Task Title",
          type: serverWidget.FieldType.TEXT,
          container: "custpage_task_group",
        });
        var taskNotesField = help.addField({
          id: "custpage_task_notes",
          label: "Task Notes",
          type: serverWidget.FieldType.TEXTAREA,
          container: "custpage_task_group",
        });
        break;

      case "custpage_dce_email_stp":
        var emSubjectField = help.addField({
          id: "custpage_email_subject",
          label: "Subject",
          type: serverWidget.FieldType.TEXT,
          container: "custpage_email_group",
        });
        var emBodyField = help.addField({
          id: "custpage_email_body",
          label: "Body",
          type: serverWidget.FieldType.TEXTAREA,
          container: "custpage_email_group",
        });
        break;

      case "custpage_dce_final_stp":
        var nameField = help.addField({
          id: "custpage_final_name",
          label: "Customer Name",
          type: serverWidget.FieldType.SELECT,
          source: "customer",
          container: "custpage_final_info_group",
        });
        var salesRepField = help.addField({
          id: "custpage_final_salesrep",
          label: "Sales Rep",
          type: serverWidget.FieldType.SELECT,
          source: "employee",
          container: "custpage_final_info_group",
        });
        var phoneField = help.addField({
          id: "custpage_final_phone",
          label: "Phone",
          type: serverWidget.FieldType.PHONE,
          container: "custpage_final_info_group",
        });
        var taskTitleField = help.addField({
          id: "custpage_final_task_title",
          label: "Task Title",
          type: serverWidget.FieldType.TEXT,
          container: "custpage_final_task_group",
        });
        var taskNotesField = help.addField({
          id: "custpage_final_task_notes",
          label: "Task Notes",
          type: serverWidget.FieldType.TEXTAREA,
          container: "custpage_final_task_group",
        });
        var emSubjectField = help.addField({
          id: "custpage_final_email_subject",
          label: "Subject",
          type: serverWidget.FieldType.TEXT,
          container: "custpage_final_email_group",
        });
        var emBodyField = help.addField({
          id: "custpage_final_email_body",
          label: "Body",
          type: serverWidget.FieldType.TEXTAREA,
          container: "custpage_final_email_group",
        });
        //SET INLINE FIELDS 27.49min
        //^ need to make the fields for the finish page, like inline, so no one changes that
        //^ need to populate the fields on the finish page

        customerStp = help.getStep({
          id: "custpage_dce_customer_stp",
        });
        taskStp = help.getStep({
          id: "custpage_dce_customer_stp",
        });
        emailStp = help.getStep({
          id: "custpage_dce_customer_stp",
        });

        nameField.defaultValue = customerStp.getValue({
          id: "custpage_name",
        });

        salesRepField.defaultValue = customerStp.getValue({
          id: "custpage_salesrep",
        });
        phoneField.defaultValue = customerStp.getValue({
          id: "custpage_phone",
        });
        taskTitleField.defaultValue = taskStp.getValue({
          id: "custpage_task_title",
        });
        taskNotesField.defaultValue = taskStp.getValue({
          id: "custpage_task_notes",
        });
        emSubjectField.defaultValue = emailStp.getValue({
          id: "custpage_email_subject",
        });
        emBodyField.defaultValue = emailStp.getValue({
          id: "custpage_email_body",
        });

        break;
    }
    response.writePage(help);
  };

  return { onRequest };
});
