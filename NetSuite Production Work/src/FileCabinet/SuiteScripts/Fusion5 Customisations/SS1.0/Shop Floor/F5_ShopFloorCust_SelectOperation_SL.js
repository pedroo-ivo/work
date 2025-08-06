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
		
		var workOrderID = request.getParameter("custparam_workorderid");
		var workOrderNumber = nlapiLookupField("workorder", workOrderID, "tranid");
		
		var form = nlapiCreateForm('<div style="text-align: center;  position: relative; left: 50%;"><span style="font-size:20px;">You are logged in as <span style="font-size:24px;">'+employeeName.firstname+" "+employeeName.lastname+'</span></span><br\><span style="font-size:20px;">Selected Work Order: '+workOrderNumber+'</span><br\><span style="font-size:20px;">Select an Operation from drop-down list and press Enter.</span></div>');
		form.setScript("customscript_f5_cl_sfc_operationpage");
		
		var field_time = form.addField("custpage_fld_time", "datetimetz", "Current Time:");
		var currentTime = nlapiLoadRecord("customrecord_f5_currenttime", 1).getFieldValue("custrecord_f5_currenttime_time");
		field_time.setDefaultValue(currentTime);
		field_time.setDisplayType("disabled");
		
		var field_workorder = form.addField("custpage_fld_workorder", "integer", "Work Order", workOrderID);
		field_workorder.setDefaultValue(workOrderID);
		field_workorder.setDisplayType("hidden");
		
		var field_employee = form.addField("custpage_fld_employee", "integer", "Employee", employeeID);
		field_employee.setDefaultValue(employeeID);
		field_employee.setDisplayType("hidden");
		
		var field_Operation = form.addField("custpage_fld_operationtask", "select", "Please Select An Operation:");
		field_Operation.setMandatory(true);
		field_Operation.setLayoutType('outsidebelow');
		
		var filters = new Array();
		var columns = new Array();
		
		filters[0] = new nlobjSearchFilter("workorder", null, "anyof",workOrderID);
		filters[1] = new nlobjSearchFilter('formulanumeric', null, 'greaterthan', 0);
		filters[1].setFormula("NVL({inputquantity},0)-NVL({completedquantity},0)");
		//filters[2] = new nlobjSearchFilter("manufacturingworkcenter", null, "noneof", [15771,15772,15799]);
		columns[0] = new nlobjSearchColumn("internalid");
		columns[1] = new nlobjSearchColumn("name");
		columns[2] = new nlobjSearchColumn("manufacturingworkcenter");
		var results = nlapiSearchRecord("manufacturingoperationtask", null, filters, columns);
		if(results){
			var count = results.length;
			for(var i=0;i<count;i++){
				var internalID = results[i].getValue(columns[0]);
				var tranNumber = results[i].getValue(columns[1]);
				var workCenter = results[i].getValue(columns[2]);
				var waitingTime = 'F';
				if(workCenter){
					//waitingTime = nlapiLookupField('entitygroup', workCenter, 'custentity_f5waitingtime');
					//nlapiLogExecution("DEBUG", "waiting time of work center? "+ workCenter, waitingTime);
				}
				if(waitingTime=='F'){
					field_Operation.addSelectOption(internalID, tranNumber);
				}
					
			}
		}
			
		form.addSubmitButton("Enter");
		form.addButton("custpage_btn_back", "Back", "Back()");
		response.writePage(form);
	}
	else{
		var intOpNumber = request.getParameter("custpage_fld_operationtask");
		var intWorkOrderNum = request.getParameter("custpage_fld_workorder");
		var intEmployeeID = request.getParameter("custpage_fld_employee");
		var startTime = request.getParameter("custpage_fld_time");
		nlapiLogExecution("DEBUG", "Work Order ID, Operation ID, Employee ID, start time", intWorkOrderNum+"**"+intOpNumber+"**"+intEmployeeID+"**"+startTime);
		
		//complete operation related to curing time if it exist
		var intFlag = CompleteCuringOperation(intWorkOrderNum,intOpNumber);
		//create time entry for selected operation
		var operationName = nlapiLookupField("manufacturingoperationtask", intOpNumber,"name");
		var rec_timeEntry = nlapiCreateRecord("customrecord_f5_sfc_timeentry");
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_employee", intEmployeeID);
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_workorder", intWorkOrderNum);
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_operationid", intOpNumber);
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_operationname", operationName);
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_starttime", startTime);
		rec_timeEntry.setFieldValue("custrecord_f5_sfc_te_status", 1);
		var timeEntryID = nlapiSubmitRecord(rec_timeEntry, true, true);
		
		nlapiSetRedirectURL("SUITELET", "customscript_f5_sl_sfc_startpage", "customdeploy_f5_sl_sfc_startpage");
	}
}

//mma 20160618
/**
 * complete curing operation prior to current operation
 * @param {int} workOrderID: internal id of work order
 * @param {int} operationID: internal id of operation
 * @returns {int} count of completed curing operation
 */
function CompleteCuringOperation(workOrderID, operationID) {
	var intCount=0;
	
	//mma 20160621
	//retrieve working centre for waiting(curing) time
	var arrCurringTime = new Array();
	var filters2 = new Array();
	var columns2 = new Array();
	filters2[0] = new nlobjSearchFilter('isinactive', null, 'isnot', 'T');
	//filters2[1] = new nlobjSearchFilter('custentity_f5waitingtime',null, 'is','T');
	columns2[0] = new nlobjSearchColumn('internalid');
	var results2 = nlapiSearchRecord('entitygroup', null, filters2, columns2);
	if(results2){
		var count_result2 = results2.length;
		for(var j=0;j<count_result2;j++){
			var id_tem = results2[j].getValue(columns2[0]);
			if(id_tem){
				arrCurringTime.push(id_tem);
			}
		}
	}
	//end mma 20160621
	
	var intOpSequence = nlapiLookupField("manufacturingoperationtask", operationID, "sequence");
	//nlapiLogExecution("DEBUG", "sequence of current operation", intOpSequence);
	//find recurring operation
	var filters = new Array();
	var columns = new Array();
	filters[0] = new nlobjSearchFilter("workorder", null, "anyof", workOrderID);
	filters[1] = new nlobjSearchFilter("manufacturingworkcenter", null, "anyof", arrCurringTime);
	//filters[1] = new nlobjSearchFilter("custentity_f5waitingtime", 'manufacturingworkcenter', "is", 'T');
	filters[2] = new nlobjSearchFilter("sequence", null, "lessthan", intOpSequence);
	filters[3] = new nlobjSearchFilter("completedquantity", null, "isempty");
	columns[0] = new nlobjSearchColumn("internalid");
	columns[1] = new nlobjSearchColumn("sequence");
	columns[2] = new nlobjSearchColumn("name");
	
	var results = nlapiSearchRecord("manufacturingoperationtask", null, filters, columns);
	if(results){
		var count = results.length;
		//nlapiLogExecution("DEBUG", "count of operation", count);
		for(var i=0;i<count;i++){
			var id_op = results[i].getValue(columns[0]);
			var sequence = results[i].getValue(columns[1]);
			//nlapiLogExecution("DEBUG", "sequence of found curring operation", sequence);
			var dCompletedQty = 0; 
			
			//get completed quantity in last operation
			var filters2 = new Array();
			var columns2 = new Array();
			filters2[0] = new nlobjSearchFilter("workorder", null, "anyof", workOrderID);
			filters2[1] = new nlobjSearchFilter("sequence", null, "lessthan", sequence);
			columns2[0] = new nlobjSearchColumn("internalid");
			columns2[1] = new nlobjSearchColumn("sequence").setSort(true);
			columns2[2] = new nlobjSearchColumn("completedquantity");
			var results2 = nlapiSearchRecord("manufacturingoperationtask", null, filters2, columns2);
			if(results2){
				dCompletedQty = results2[0].getValue(columns2[2]);
			}
			nlapiLogExecution("DEBUG", "work order id, operation id, completed quantity", workOrderID+"***"+id_op+"***"+dCompletedQty);
			
			//complete operation
			if(dCompletedQty>0){
				var rec_wocompletion = nlapiTransformRecord("workorder",workOrderID,"workordercompletion");
				rec_wocompletion.setFieldValue("startoperation", id_op);
				rec_wocompletion.setFieldValue("endoperation", id_op);
				rec_wocompletion.setFieldValue("completedquantity", dCompletedQty);
				rec_wocompletion.setFieldValue("quantity", 0);
				rec_wocompletion.setFieldValue("memo", "auto completed");
				var woCompletionID = nlapiSubmitRecord(rec_wocompletion, true, true);
				nlapiLogExecution("DEBUG", "new work completion automatically created", woCompletionID);
				intCount++;
			}
		}
	}
	return intCount;
}
//end mma 20160618