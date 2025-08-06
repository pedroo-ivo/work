/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
/*
define(["N/currentRecord", "N/record", "N/log"], (
  currentRecord,
  record,
  log
) => {
  const PROJECT_TYPE_WARRANTY = 3;
  const PROJECT_TYPE_COMMISSIONING = 5;
  let shouldApplyDiscount = false;

  function pageInit(context) {
    const current = currentRecord.get();
    const projectId = current.getValue("job"); // Use 'job' field from your Sales Order form

    if (!projectId) return;

    try {
      const project = record.load({
        type: record.Type.JOB,
        id: projectId,
        isDynamic: false,
      });

      const projectType = project.getValue("custentity_nx_project_type");

      shouldApplyDiscount =
        projectType == PROJECT_TYPE_WARRANTY ||
        projectType == PROJECT_TYPE_COMMISSIONING;

      log.debug(
        "Project Type Detected",
        `Type: ${projectType}, Apply Discount: ${shouldApplyDiscount}`
      );
      // TEMP: Uncomment for visual confirmation during testing
      // alert('Project type: ' + projectType + ', Apply discount: ' + shouldApplyDiscount);
    } catch (error) {
      log.error("Error loading project record", error);
    }
  }

  function validateLine(context) {
    if (context.sublistId !== "item") return true;
    if (!shouldApplyDiscount) return true;

    const current = currentRecord.get();

    try {
      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "price",
        value: -1, // Custom Price Level
      });

      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "rate",
        value: 0.0,
      });

      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "amount",
        value: 0.0,
      });

      log.debug("Custom pricing applied to item line (rate 0.00)");
    } catch (error) {
      log.error("Error applying custom price and rate", error);
    }

    return true;
  }

  return {
    pageInit,
    validateLine,
  };
});
// This script applies a 100% discount to items on a Sales Order based on the project type.
// It sets the price level to a custom value and the rate to zero when the project type is either Warranty or Commissioning.
// Ensure that the custom price level is set up in your NetSuite account and that the project type field is correctly configured on the Job record.
// This script should be deployed to the Sales Order form where you want this functionality to apply.
*/
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/currentRecord", "N/record", "N/log"], (
  currentRecord,
  record,
  log
) => {
  const PROJECT_TYPE_WARRANTY = 3;
  const PROJECT_TYPE_COMMISSIONING = 5;
  const DISCOUNT_PRICE_LEVEL_ID = 24;

  let shouldApplyDiscount = false;

  function pageInit(context) {
    const current = currentRecord.get();
    const projectId = current.getValue("job"); // Use 'job' field

    if (!projectId) return;

    try {
      const project = record.load({
        type: record.Type.JOB,
        id: projectId,
        isDynamic: false,
      });

      const projectType = project.getValue("custentity_nx_project_type");

      shouldApplyDiscount =
        projectType == PROJECT_TYPE_WARRANTY ||
        projectType == PROJECT_TYPE_COMMISSIONING;

      log.debug(
        "Project Type Detected",
        `Type: ${projectType}, Apply Discount: ${shouldApplyDiscount}`
      );
      // alert('Project type: ' + projectType + ', Apply discount: ' + shouldApplyDiscount); // Optional for testing
    } catch (error) {
      log.error("Error loading project record", error);
    }
  }

  function validateLine(context) {
    if (context.sublistId !== "item") return true;
    if (!shouldApplyDiscount) return true;

    const current = currentRecord.get();

    try {
      // Set to 100% discount price level
      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "price",
        value: DISCOUNT_PRICE_LEVEL_ID,
      });

      // Explicitly zero the rate
      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "rate",
        value: 0.0,
      });

      // Force amount to zero as well
      current.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "amount",
        value: 0.0,
      });

      log.debug(
        "Applied 100% discount: price level, rate, and amount set to zero."
      );
    } catch (error) {
      log.error("Error applying 100% discount logic", error);
    }

    return true;
  }

  return {
    pageInit,
    validateLine,
  };
});
