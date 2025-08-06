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
	if(request.getMethod()== "GET"){
		var form = nlapiCreateForm("Shop Floor Customisation");
		form.setScript("customscript_f5_cl_sfc_startpage");
		var field_employeeNum = form.addField("custpage_employeenumber", "select", "Please Select Employee ID:","employee");
		field_employeeNum.setMandatory(true);
		form.addSubmitButton("Enter");
		response.writePage(form);
	}
	else{
		var intEmployeeNumber = request.getParameter("custpage_employeenumber");
		nlapiLogExecution("DEBUG", "employee number", intEmployeeNumber);

		//search for open Time Entry against employee
		var filters = new Array();
		var columns = new Array();
		filters[0] = new nlobjSearchFilter("custrecord_f5_sfc_te_employee", null, "is", intEmployeeNumber);
		filters[1] = new nlobjSearchFilter("custrecord_f5_sfc_te_status", null, "is", 1);
		columns[0] = new nlobjSearchColumn("internalid");
		var results = nlapiSearchRecord("customrecord_f5_sfc_timeentry", null, filters, columns);
		//found open time entry, go to Log Off Page
		if(results){
			var timeEntryID = results[0].getValue(columns[0]);
			var params = new Array();
			params["custparam_timeentryid"] = timeEntryID;
			params["custparam_employeeid"] = intEmployeeNumber;
			nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_logoffpage", "customdeploy_f5_sl_sfc_logoffpage", null, params);
		}
		//no open time entry, go to Select Work Order Page
		else{
			var params = new Array();
			params["custparam_employeeid"] = intEmployeeNumber;
			nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_workorderpage", "customdeploy_f5_sl_sfc_workorderpage",null,params);
		}
	}
}
