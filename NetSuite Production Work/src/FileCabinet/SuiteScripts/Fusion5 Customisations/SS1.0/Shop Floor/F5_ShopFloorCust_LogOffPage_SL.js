/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 May 2016     marcus.ma
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
		if(request.getMethod()== "GET"){
			var employeeID = request.getParameter("custparam_employeeid");
			nlapiLogExecution("DEBUG", "employee id", employeeID);
			var employeeName = nlapiLookupField("employee", employeeID, ["firstname","lastname"]);
			
			var filters = new Array();
			var columns = new Array();
			filters[0] = new nlobjSearchFilter("custrecord_f5_sfc_te_employee", null, "is", employeeID);
			filters[1] = new nlobjSearchFilter("custrecord_f5_sfc_te_status", null, "is", 1);
			columns[0] = new nlobjSearchColumn("internalid");
			var results = nlapiSearchRecord("customrecord_f5_sfc_timeentry", null, filters, columns);
			if(results){
				var timeEntryID = results[0].getValue(columns[0]);
				var rec_timeEntry = nlapiLoadRecord("customrecord_f5_sfc_timeentry", timeEntryID);
				var workOrderNumber = rec_timeEntry.getFieldText("custrecord_f5_sfc_te_workorder");
				var operationName = rec_timeEntry.getFieldValue("custrecord_f5_sfc_te_operationname");
				var startTime = rec_timeEntry.getFieldValue("custrecord_f5_sfc_te_starttime");
				
				var form = nlapiCreateForm('<div style="text-align: center;  position: relative; left: 100%;"><span style="font-size:20px;">You are logged in as <span style="font-size:24px;">'+employeeName.firstname+" "+employeeName.lastname+'</span></span><br\><br\><span style="font-size:20px;">You have one open Time Entry:</span><br\><span style="font-size:20px;">Work Order: '+workOrderNumber+'</span><br\><span style="font-size:20px;">Operation: '+operationName+'</span><br\><span style="font-size:20px;">Start from: '+startTime+'</span><br\><br\><span style="font-size:20px;">Enter the quantity and press Enter.</span></div>');
				form.setScript("customscript_f5_cl_sfc_logoff");
				var field_quantity = form.addField("custpage_fld_quantity", "float", "Please Enter Quantity:");
				field_quantity.setMandatory(true);
				
				var field_timeEntry = form.addField("custpage_fld_timeentry", "text", "Time Entry ID");
				field_timeEntry.setDefaultValue(timeEntryID);
				field_timeEntry.setDisplayType("hidden");
				
				var field_employee = form.addField("custpage_fld_employee", "text", "Employee");
				field_employee.setDefaultValue(employeeID);
				field_employee.setDisplayType("hidden");
				
				var field_notes = form.addField("custpage_fld_notes", "text", "Notes:");
				field_notes.setDisplaySize(57, 50);
				field_notes.setLayoutType('outsidebelow');
				
				form.addSubmitButton("Enter");
				form.addButton("custpage_btn_cancel", "Cancel", "Cancel()");
				response.writePage(form);
			}
			else{
				nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_startpage", "customdeploy_f5_sl_sfc_startpage");
			}			
		}
		else{
			var quantity = request.getParameter("custpage_fld_quantity");
			var timeEntryID = request.getParameter("custpage_fld_timeentry");
			var employeeID = request.getParameter("custpage_fld_employee");
			var notes = request.getParameter("custpage_fld_notes");
				
			var params = new Array();
			params["custparam_timeentryid"] = timeEntryID;
			params["custparam_quantity"] = quantity;
			params["custparam_employeeid"] = employeeID;
			params["custparam_notes"] = notes;
			
			nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_logoffconfirmpage", "customdeploy_f5_sl_sfc_logoffconfirmpage",null,params);
			
		}
	}
	catch(e)
	{
		nlapiLogExecution("DEBUG", "error", e);
	}
}
