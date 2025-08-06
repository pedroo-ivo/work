/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/email", "N/record", "N/runtime", "N/log", "N/search"], function (
  email,
  record,
  runtime,
  log,
  search
) {
  function afterSubmit(context) {
    if (context.type !== context.UserEventType.EDIT) return;

    try {
      const po = context.newRecord;
      const tranId = po.getValue("tranid");
      const oldApprovalStatus = context.oldRecord.getValue("approvalstatus");
      const newApprovalStatus = po.getValue("approvalstatus");

      log.debug({
        title: "PO Approval Status Change",
        details: `PO ID: ${tranId}, Old: ${oldApprovalStatus}, New: ${newApprovalStatus}`,
      });

      // Check if PO just got approved
      if (oldApprovalStatus !== "2" && newApprovalStatus === "2") {
        const vendorId = po.getValue("entity");
        const vendorName = po.getText("entity");
        const memo = po.getValue("memo") || "N/A";
        const total = po.getValue("total");
        const nextApprover = po.getText("nextapprover") || "Not Assigned";
        const createdById = po.getValue("createdby");

        const authorId = 11; // You (Pedro)
        const recipients = ["pedro@dce.co.nz"];

        // If creator is valid, send them a copy too
        if (createdById && createdById !== authorId) {
          recipients.push(createdById);
        }

        // Email content
        const subject = `PO Approved: ${tranId}`;
        const body = `
                    <p>The following Purchase Order has been approved:</p>
                    <ul>
                        <li><strong>PO Number:</strong> ${tranId}</li>
                        <li><strong>Vendor:</strong> ${vendorName}</li>
                        <li><strong>Total Amount:</strong> ${total}</li>
                        <li><strong>Memo:</strong> ${memo}</li>
                        <li><strong>Next Approver:</strong> ${nextApprover}</li>
                    </ul>
                    <p>Click <a href="https://4902186.app.netsuite.com/app/accounting/transactions/purchord.nl?id=${po.id}">here</a> to view the PO.</p>
                `;

        email.send({
          author: authorId,
          recipients: recipients,
          subject: subject,
          body: body,
          relatedRecords: {
            transactionId: po.id,
          },
        });

        log.audit({
          title: "PO Approval Email Sent",
          details: `Email sent to: ${recipients.join(", ")} for PO: ${tranId}`,
        });
      } else {
        log.debug({
          title: "No Email Sent",
          details: `Approval condition not met for PO: ${tranId}`,
        });
      }
    } catch (e) {
      log.error({
        title: "Error in afterSubmit",
        details: e.message,
      });
    }
  }

  return { afterSubmit };
});
// This script sends an email notification when a Purchase Order (PO) is approved.
// It checks the approval status change and sends details to the relevant parties.
// The email includes PO details and a link to view the PO in NetSuite.
// The script is designed to run after a PO is edited and approved, ensuring that notifications are sent only when necessary.
// It also handles errors gracefully, logging any issues encountered during execution.
// The email is sent to the author of the PO and a predefined recipient (Pedro).
// The script uses NetSuite's SuiteScript 2.1 API for email and record handling.
// The email body is formatted in HTML for better readability.
// The script is set to run as a User Event Script, specifically on the afterSubmit event.
// The script is designed to be efficient and only sends emails when the approval status changes to "Approved" (status code 2).
// The script includes detailed logging for debugging and tracking purposes.
// The script is intended for use in a NetSuite environment, specifically for Purchase Order management.
// The script is modular and can be easily extended or modified for additional functionality in the future.
