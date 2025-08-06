/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/email", "N/record", "N/redirect", "N/ui/serverWidget"], /**
 * @param{email} email
 * @param{record} record
 * @param{redirect} redirect
 * @param{serverWidget} serverWidget
 */ (email, record, redirect, serverWidget) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    var request = scriptContext.request; //to be used to get objects from http module -> server request
    var response = scriptContext.response; // to be used to get objects from http module -> server response

    if (request.method == "GET") {
      //GET REQUEST FROM URL

      //* getting values from dce_test_ue_customer
      var customerId = request.parameters.dce_customer_id;
      var phone = request.parameters.dce_phone;
      var email = request.parameters.dce_email;
      var salesRep = request.parameters.dce_salesrep_id;

      var webForm = serverWidget.createForm({
        title: "Customer Onboarding",
        // hideNavBar: true,
      });

      //~groups
      var customerInfoGroup = webForm.addFieldGroup({
        id: "custpage_customer_info_group",
        label: "Customer Information Group",
      });
      var taskGroup = webForm.addFieldGroup({
        id: "custpage_task_group",
        label: "Onboarding Task Group",
      });
      var emailGroup = webForm.addFieldGroup({
        id: "custpage_email_group",
        label: "Welcome Email Group",
      });
      emailGroup.isBorderHidden = false;

      //~fields
      var nameField = webForm.addField({
        id: "custpage_name",
        label: "Customer Name",
        type: serverWidget.FieldType.SELECT,
        source: "customer",
        container: "custpage_customer_info_group",
      });
      var salesRepField = webForm.addField({
        id: "custpage_salesrep",
        label: "Sales Rep",
        type: serverWidget.FieldType.SELECT,
        source: "employee",
        container: "custpage_customer_info_group",
      });

      var phoneField = webForm.addField({
        id: "custpage_phone",
        label: "Phone",
        type: serverWidget.FieldType.PHONE,
        source: "Phone",
        container: "custpage_customer_info_group",
      });

      //~taskfields
      var tasktitleField = webForm.addField({
        id: "custpage_task_title",
        label: "Task Title",
        type: serverWidget.FieldType.TEXT,
        container: "custpage_task_group",
      });

      var taskNotesField = webForm.addField({
        id: "custpage_task_notes",
        label: "Task Notes",
        type: serverWidget.FieldType.TEXTAREA,
        container: "custpage_task_group",
      });

      //~email fields
      var emsubjectFld = webForm.addField({
        id: "custpage_email_subject",
        label: "Subject",
        type: serverWidget.FieldType.TEXT,
        container: "custpage_email_group",
      });

      var emBodyFld = webForm.addField({
        id: "custpage_email_body",
        label: "Body",
        type: serverWidget.FieldType.TEXTAREA,
        container: "custpage_email_group",
      });

      var noteFld = webForm.addField({
        id: "custpage_note",
        label: "Note: these tasks are important",
        type: serverWidget.FieldType.HELP,
        container: "custpage_email_group",
      });
      webForm.addSubmitButton("complete process");

      //~MODIFICATIONS
      nameField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });

      salesRepField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });

      phoneField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });

      emBodyFld.updateDisplaySize({
        height: 20,
        width: 85,
      });

      noteFld.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE,
      });

      tasktitleField.isMandatory = true;
      taskNotesField.isMandatory = true;
      emsubjectFld.isMandatory = true;
      emBodyFld.isMandatory = true;

      response.writePage(webForm);

      //* Set Values
      nameField.defaultValue = customerId;
      phoneField.defaultValue = phone;
      emsubjectFld.defaultValue = email;
      salesRepField.defaultValue = salesRep;
    } else {
      //POST REQUEST

      //* get values from post request
      var customerId = request.parameters.custpage_name;
      var salesRep = request.parameters.custpage_salesrep;
      var phone = request.parameters.custpage_phone;

      var tasktitle = request.parameters.custpage_task_title;
      var taskNotes = request.parameters.custpage_task_notes;

      //* create task and setting values from above
      var task = record.create({
        type: record.Type.TASK,
        isDynamic: true,
      });

      task.setValue({
        fieldId: "company",
        value: customerId,
      });
      task.setValue({
        fieldId: "title",
        value: tasktitle,
      });
      task.setValue({
        fieldId: "message",
        value: taskNotes,
      });

      task.setValue({
        fieldId: "custevent_case_dept_wkflw",
        value: "122",
      });

      task.save();

      redirect.toRecord({
        type: record.Type.CUSTOMER,
        id: customerId, //customer id
        isEditMode: true,
      });
    }
  };

  return { onRequest };
});

// // Code Example 1
// /**
//  * @NApiVersion 2.x
//  * @NScriptType Suitelet
//  */
// define(["N/ui/serverWidget"], function (serverWidget) {
//   function onRequest(context) {
//     if (context.request.method === "GET") {
//       var form = serverWidget.createForm({
//         title: "Simple Form",
//       });

//       var field = form.addField({
//         id: "custpage_text",
//         type: serverWidget.FieldType.TEXT,
//         label: "Text",
//       });
//       field.layoutType = serverWidget.FieldLayoutType.NORMAL;
//       field.updateBreakType({
//         breakType: serverWidget.FieldBreakType.STARTCOL,
//       });

//       form.addField({
//         id: "custpage_date",
//         type: serverWidget.FieldType.DATE,
//         label: "Date",
//       });
//       form.addField({
//         id: "custpage_currencyfield",
//         type: serverWidget.FieldType.CURRENCY,
//         label: "Currency",
//       });

//       var select = form.addField({
//         id: "custpage_selectfield",
//         type: serverWidget.FieldType.SELECT,
//         label: "Select",
//       });
//       select.addSelectOption({
//         value: "a",
//         text: "Albert",
//       });
//       select.addSelectOption({
//         value: "b",
//         text: "Baron",
//       });

//       var sublist = form.addSublist({
//         id: "sublist",
//         type: serverWidget.SublistType.INLINEEDITOR,
//         label: "Inline Editor Sublist",
//       });
//       sublist.addField({
//         id: "sublist1",
//         type: serverWidget.FieldType.DATE,
//         label: "Date",
//       });
//       sublist.addField({
//         id: "sublist2",
//         type: serverWidget.FieldType.TEXT,
//         label: "Text",
//       });

//       form.addSubmitButton({
//         label: "Submit Button",
//       });

//       context.response.writePage(form);
//     } else {
//       var delimiter = /\u0001/;
//       var textField = context.request.parameters.textfield;
//       var dateField = context.request.parameters.datefield;
//       var currencyField = context.request.parameters.currencyfield;
//       var selectField = context.request.parameters.selectfield;
//       var sublistData = context.request.parameters.sublistdata.split(delimiter);
//       var sublistField1 = sublistData[0];
//       var sublistField2 = sublistData[1];

//       context.response.write(
//         "You have entered: " +
//           textField +
//           " " +
//           dateField +
//           " " +
//           currencyField +
//           " " +
//           selectField +
//           " " +
//           sublistField1 +
//           " " +
//           sublistField2
//       );
//     }
//   }

//   return {
//     onRequest: onRequest,
//   };
// });
//
// // Code Example 2
// /**
//  * @NApiVersion 2.x
//  * @NScriptType Suitelet
//  */
// define(["N/ui/serverWidget"], function (serverWidget) {
//   function onRequest(context) {
//     var form = serverWidget.createForm({
//       title: "Thank you for your interest in Wolfe Electronics",
//       hideNavBar: true,
//     });

//     var htmlHeader = (form
//       .addField({
//         id: "custpage_header",
//         type: serverWidget.FieldType.INLINEHTML,
//         label: " ",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE,
//       })
//       .updateBreakType({
//         breakType: serverWidget.FieldBreakType.STARTROW,
//       }).defaultValue =
//       "<p style='font-size:20px'>We pride ourselves on providing the best" +
//       " services and customer satisfaction.  Please take a moment to fill out our survey.</p><br><br>");

//     var htmlInstruct = (form
//       .addField({
//         id: "custpage_p1",
//         type: serverWidget.FieldType.INLINEHTML,
//         label: " ",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE,
//       })
//       .updateBreakType({
//         breakType: serverWidget.FieldBreakType.STARTROW,
//       }).defaultValue =
//       "<p style='font-size:14px'>When answering questions on a scale of 1 to 10," +
//       " 1 = Greatly Unsatisfied and 10 = Greatly Satisfied.</p><br><br>");

//     var productRating = (form
//       .addField({
//         id: "custpage_lblproductrating",
//         type: serverWidget.FieldType.INLINEHTML,
//         label: " ",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.NORMAL,
//       })
//       .updateBreakType({
//         breakType: serverWidget.FieldBreakType.STARTROW,
//       }).defaultValue =
//       "<p style='font-size:14px'>How would you rate your satisfaction with our products?</p>");

//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "1",
//         source: "p1",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.STARTROW,
//       });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "2",
//         source: "p2",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.MIDROW,
//       });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "3",
//         source: "p3",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "4",
//         source: "p4",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "5",
//         source: "p5",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "6",
//         source: "p6",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "7",
//         source: "p7",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "8",
//         source: "p8",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "9",
//         source: "p9",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoproductrating",
//         type: serverWidget.FieldType.RADIO,
//         label: "10",
//         source: "p10",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.ENDROW });

//     var serviceRating = (form
//       .addField({
//         id: "custpage_lblservicerating",
//         type: serverWidget.FieldType.INLINEHTML,
//         label: " ",
//       })
//       .updateLayoutType({
//         layoutType: serverWidget.FieldLayoutType.NORMAL,
//       })
//       .updateBreakType({
//         breakType: serverWidget.FieldBreakType.STARTROW,
//       }).defaultValue =
//       "<p style='font-size:14px'>How would you rate your satisfaction with our services?</p>");

//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "1",
//         source: "p1",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.STARTROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "2",
//         source: "p2",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "3",
//         source: "p3",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "4",
//         source: "p4",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "5",
//         source: "p5",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "6",
//         source: "p6",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "7",
//         source: "p7",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "8",
//         source: "p8",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "9",
//         source: "p9",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.MIDROW });
//     form
//       .addField({
//         id: "custpage_rdoservicerating",
//         type: serverWidget.FieldType.RADIO,
//         label: "10",
//         source: "p10",
//       })
//       .updateLayoutType({ layoutType: serverWidget.FieldLayoutType.ENDROW });

//     form.addSubmitButton({
//       label: "Submit",
//     });
//     form.addResetButton({
//       label: "Reset",
//     });

//     context.response.writePage(form);
//   }

//   return {
//     onRequest: onRequest,
//   };
// });

// //SOURCE: https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4321345532.html
