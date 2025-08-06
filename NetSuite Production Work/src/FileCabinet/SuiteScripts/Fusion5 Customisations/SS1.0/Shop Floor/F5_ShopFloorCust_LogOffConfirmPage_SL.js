/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 May 2016     marcus.ma
 *
 */

var _STATUS_INPROGRESS = 1;
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if(request.getMethod()== "GET"){
		
		var employeeID = request.getParameter("custparam_employeeid");
		nlapiLogExecution("DEBUG", "employee id", employeeID);
		var employeeName = nlapiLookupField("employee", employeeID, ["firstname","lastname"]);
		
		var form = nlapiCreateForm('<span style="font-size:20px;">You are logged in as <span style="font-size:24px;">'+employeeName.firstname+" "+employeeName.lastname+'</span></span><br\>Please confirm below Time Entry and press Enter.');
		form.setScript("customscript_f5_cl_sfc_logoffconfirm");
		
		var timeEntryID = request.getParameter("custparam_timeentryid");
		var quantity = request.getParameter("custparam_quantity");
		var notes= request.getParameter("custparam_notes");
		
		var rec_TimeEntry = nlapiLoadRecord("customrecord_f5_sfc_timeentry", timeEntryID);
		var workOrderNumber = rec_TimeEntry.getFieldText("custrecord_f5_sfc_te_workorder");
		var operationName = rec_TimeEntry.getFieldValue("custrecord_f5_sfc_te_operationname");
		var OperationID = rec_TimeEntry.getFieldValue("custrecord_f5_sfc_te_operationid");
		var startTime = rec_TimeEntry.getFieldValue("custrecord_f5_sfc_te_starttime");
		var endTime = nlapiLoadRecord("customrecord_f5_currenttime", 1).getFieldValue("custrecord_f5_currenttime_time");
		
		var field_employeeName = form.addField("custpage_fld_employeeid", "text", "Employee ID:");
		field_employeeName.setDefaultValue(employeeID);
		field_employeeName.setDisplayType("hidden");
		var field_workorder = form.addField("custpage_fld_workorder", "text", "Work Order:");
		field_workorder.setDefaultValue(workOrderNumber);
		field_workorder.setDisplayType("disabled");
		var field_operation = form.addField("custpage_fld_operation", "text", "Operation:");
		field_operation.setDefaultValue(operationName);
		field_operation.setDisplayType("disabled");
		var field_timeEntry = form.addField("custpage_fld_timeentryid", "text", "Time Entry ID");
		field_timeEntry.setDefaultValue(timeEntryID);
		field_timeEntry.setDisplayType("hidden");
		var field_operationID = form.addField("custpage_fld_operationid", "text", "Operation ID");
		field_operationID.setDefaultValue(OperationID);
		field_operationID.setDisplayType("hidden");
		var field_startTime = form.addField("custpage_fld_starttime", "datetimetz", "Start From:");
		field_startTime.setDefaultValue(startTime);
		field_startTime.setDisplayType("disabled");
		var field_endTime = form.addField("custpage_fld_endtime", "datetimetz", "End At:");
		field_endTime.setDefaultValue(endTime);
		field_endTime.setDisplayType("disabled");
		var field_quantity = form.addField("custpage_fld_quantity", "float", "Quantity:");
		field_quantity.setDefaultValue(quantity);
		//field_quantity.setDisplayType("disabled");
		var field_notes = form.addField("custpage_fld_notes", "text", "Notes:");
		field_notes.setDefaultValue(notes);
		//field_notes.setDisplayType("disabled");
			
		form.addSubmitButton("Enter");
		form.addButton("custpage_btn_cancel", "Cancel", "Cancel()");
		response.writePage(form);
	}
	else{
		var timeEntryID = request.getParameter("custpage_fld_timeentryid");
		var startTime = request.getParameter("custpage_fld_starttime");
		var endTime = request.getParameter("custpage_fld_endtime");
		var quantity = request.getParameter("custpage_fld_quantity");
		var notes = request.getParameter("custpage_fld_notes");
		var rec_timeEntry = nlapiLoadRecord("customrecord_f5_sfc_timeentry", timeEntryID);
		nlapiLogExecution("DEBUG", "start time, end time", startTime+"***"+endTime);
		
		var status = rec_timeEntry.getFieldValue("custrecord_f5_sfc_te_status");
		var strStatus = rec_timeEntry.getFieldText("custrecord_f5_sfc_te_status");
		if(status == _STATUS_INPROGRESS){
			var duration = CalculateDeduction(startTime,endTime);
			if(duration>=0){
				var duration_min = duration/60;
				duration_min = Math.round(duration_min * 100)/100;
				var duration_hr = duration/3600;
				duration_hr = Math.round(duration_hr * 100)/100;

				nlapiLogExecution("DEBUG", "min, hr", duration_min+"***"+duration_hr);
				
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_endtime", endTime);
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_quantity", quantity);
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_status", 2);
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_notes", notes);
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_durationinmints", duration_min);
				rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_durationinhours", duration_hr);
				var timeEntryID = nlapiSubmitRecord(rec_timeEntry, false, true);
				
				nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_startpage", "customdeploy_f5_sl_sfc_startpage");
				rec_timeEntry=null;
			}
			else{
				response.write("Error occurs when calculating duration. Please contact your NetSuite Admin with error number: "+duration);
				rec_timeEntry=null;
			}
		}
		else{
			response.write("Invalid Time Entry! \n\nThe status of Time Entry is "+strStatus);
			rec_timeEntry=null;
		}
		
	}
}

