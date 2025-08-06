/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 May 2016     marcus.ma
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var intOpID = nlapiGetFieldValue("custpage_fld_operationtask");
	var intWorkOrderID = nlapiGetFieldValue("custpage_fld_workorder");
	var intEmployeeID = nlapiGetFieldValue("custpage_fld_employee");
	var currentTime = nlapiLoadRecord("customrecord_f5_currenttime", 1).getFieldValue("custrecord_f5_currenttime_time");
	//alert(intWorkOrderID+"**"+intOpID+"**"+intEmployeeID);
	
	var strWorkOrderNumber = nlapiLookupField("workorder", intWorkOrderID, "tranid");
	//alert(strWorkOrderNumber);
	var strOperationNumber = nlapiLookupField("manufacturingoperationtask", intOpID, "name");
	//alert(strOperationNumber);
	var strEmplyeeName = nlapiLookupField("employee", intEmployeeID, ["firstname","lastname"]);
	//alert(strEmplyeeName);
	
	var flag_confirm = confirm("Hi, "+strEmplyeeName.firstname+" "+strEmplyeeName.lastname+"\n\nAre you sure to start working on: \n\n"+"Work Order: "+strWorkOrderNumber+"\nOperation: "+strOperationNumber+"\n\nAt "+currentTime);
	if(flag_confirm){
		nlapiSetFieldValue("custpage_fld_time", currentTime, false, true);
	}
    return flag_confirm;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type){
  
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
    return true;
}

/**
 * redirect user to Work Order Page when user click Back button on Operation Page
 *   
 * @param   N/A
 * @returns N/A
 */
function Back() {
	var employeeID = nlapiGetFieldValue("custpage_fld_employee");
	nlapiLogExecution("DEBUG", "Employee ID", employeeID);
	var url = nlapiResolveURL("SUITELET","customscript_f5_sl_sfc_workorderpage","customdeploy_f5_sl_sfc_workorderpage");
	url = url+ '&custparam_employeeid='+employeeID;
	window.open(url, "_self");
}
