/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */

define(["N/search", "N/record", "N/log", "N/format"], function (
  search,
  record,
  log,
  format
) {
  function execute(context) {
    try {
      // Step 1: Check if tasks 161 and 203 are completed
      var completedTaskCount = 0;

      var triggerTaskSearch = search.create({
        type: "customrecorddce_monthly_financial_task",
        filters: [
          ["internalid", "anyof", ["161", "203"]],
          "AND",
          ["custrecord_dce_mfr_subsidiary", "anyof", "2"],
        ],
        columns: ["custrecord_dce_mfr_completed"],
      });

      triggerTaskSearch.run().each(function (result) {
        if (result.getValue("custrecord_dce_mfr_completed") === true) {
          completedTaskCount++;
        }
        return true;
      });

      if (completedTaskCount !== 2) {
        log.audit(
          "Condition not met",
          "Both trigger tasks are not completed. Aborting."
        );
        return;
      }

      // Step 2: Get all tasks for subsidiary 2
      var taskSearch = search.create({
        type: "customrecorddce_monthly_financial_task",
        filters: [["custrecord_dce_mfr_subsidiary", "anyof", "2"]],
        columns: ["custrecord_dce_mfr_day_of_month"],
      });

      var today = new Date();
      var firstDayNextMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      );

      taskSearch.run().each(function (result) {
        var taskId = result.id;
        var dayOfMonth = parseInt(
          result.getValue("custrecord_dce_mfr_day_of_month"),
          10
        );
        if (isNaN(dayOfMonth)) return true;

        var newDueDate = getWorkingDate(firstDayNextMonth, dayOfMonth);
        if (!newDueDate) return true;

        // Format the date
        var formattedDate = format.format({
          value: newDueDate,
          type: format.Type.DATE,
        });

        record.submitFields({
          type: "customrecorddce_monthly_financial_task",
          id: taskId,
          values: {
            custrecord_dce_mfr_due_date: formattedDate,
            custrecord_dce_mfr_completed: false,
          },
        });

        return true;
      });

      log.audit("Success", "All due dates updated and completion flags reset.");
    } catch (e) {
      log.error("Execution Error", e.toString());
    }
  }

  /**
   * Returns the N-th working day of a month, skipping weekends.
   */
  function getWorkingDate(startDate, workingDayTarget) {
    var count = 0;
    var date = new Date(startDate);

    for (var i = 0; i < 60; i++) {
      var day = date.getDay();
      if (day !== 0 && day !== 6) count++; // Weekdays only
      if (count === workingDayTarget) return new Date(date);
      date.setDate(date.getDate() + 1);
    }

    return null;
  }

  return {
    execute: execute,
  };
});
