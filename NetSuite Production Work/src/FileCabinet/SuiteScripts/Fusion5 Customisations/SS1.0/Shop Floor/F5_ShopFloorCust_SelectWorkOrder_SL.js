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
		var employeeID = request.getParameter("custparam_employeeid");
		nlapiLogExecution("DEBUG", "employee id", employeeID);
		var employeeName = nlapiLookupField("employee", employeeID, ["firstname","lastname"]);
		
		var form = nlapiCreateForm('<div style="text-align: center;  position: relative; left: 50%;"><span style="font-size:20px;">You are logged in as <span style="font-size:24px;">'+employeeName.firstname+" "+employeeName.lastname+'</span></span><br\><span style="font-size:20px;">Select a Work Order from dorp-down list and press Enter.</span></div>');
		form.setScript("customscript_f5_cl_sfc_workorderpage");
        
		
		var field_employeeID = form.addField("custpage_fld_employeeid", "text", "Employee ID");
		field_employeeID.setDefaultValue(employeeID);
		field_employeeID.setDisplayType("hidden");
        
		var field_WO = form.addField("custpage_fld_workordernumber", "select", "Please Select Work Order:");
		field_WO.setMandatory(true);
		field_WO.addSelectOption("", "");
		
		var filters = new Array();
		var columns = new Array();
		
		filters[0] = new nlobjSearchFilter("status", null, "anyof", ["WorkOrd:A","WorkOrd:B","WorkOrd:D"]);
		filters[1] = new nlobjSearchFilter("mainline", null, "is", "T");
		columns[0] = new nlobjSearchColumn("internalid");
		columns[1] = new nlobjSearchColumn("tranid");
		var results = nlapiSearchRecord("workorder", null, filters, columns);
		if(results){
			var count = results.length;
			for(var i=0;i<count;i++){
				var internalID = results[i].getValue(columns[0]);
				var tranNumber = results[i].getValue(columns[1]);
				field_WO.addSelectOption(internalID, tranNumber);
			}
		}
			
		form.addSubmitButton("Enter");
		form.addButton("custpage_btn_cancel", "Cancel", "Cancel()");
		response.writePage(form);
	}
	else{
		var intWorkOrderNum = request.getParameter("custpage_fld_workordernumber");
		var intEmployeeID = request.getParameter("custpage_fld_employeeid");
		nlapiLogExecution("DEBUG", "work order number, employee id", intWorkOrderNum+"***"+intEmployeeID);
		
		var params = new Array();
		params["custparam_workorderid"] = intWorkOrderNum;
		params["custparam_employeeid"] = intEmployeeID;
		nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_operationpage", "customdeploy_f5_sl_sfc_operationpage", null, params);
	}
}
