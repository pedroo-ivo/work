/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2016     marcus.ma
 *
 */
/**
 * @param {string} strStartTime: start time of time entry
 * @param {string} strEndTime: end time of time entry
 * @returns {int} deduction in seconds
 */
function CalculateDeduction(strStartTime, strEndTime) {
	var startTime = nlapiStringToDate(strStartTime,"datetimetz");
	var endTime = nlapiStringToDate(strEndTime,"datetimetz");

	if (!startTime || !endTime) {
		return -1;
	}
	
	var duration = endTime-startTime;
	duration= duration/1000;
	nlapiLogExecution("DEBUG", "duration", duration);
	
	var dayOfWeek_start = startTime.getDay();
	var hour_start = startTime.getHours();
	var date_start = startTime.getDate();
	var month_start = startTime.getMonth();
	var year_start = startTime.getFullYear();
	nlapiLogExecution("DEBUG", "start day of week, start hour", dayOfWeek_start+"***"+hour_start);
	
	var dayOfWeek_end = endTime.getDay();
	var hour_end = endTime.getHours();
	var date_end = endTime.getDate();
	var month_end = endTime.getMonth();
	var year_end = endTime.getFullYear();
	nlapiLogExecution("DEBUG", "end day of week, end hour", dayOfWeek_end+"***"+hour_end);
	
	var deduction =0;
	//in the same day
	if((date_start==date_end)&&(month_start==month_end)&&(year_start==year_end)){
		//from Monday to Thursday
		if(dayOfWeek_start>0 && dayOfWeek_start<5){
			//start before 10am
			if(hour_start<10){
				//end after 3pm
				if(hour_end>=15){
					deduction = 3000;//50 minutes
				}
				//end after 12pm
				else if(hour_end>=12){
					deduction = 2400;//40 minutes
				}
				//end after 10am
				else if(hour_end>=10){
					deduction = 600;//10 minutes
				}
			}
			//start between 10am and 12pm
			else if(hour_start>=10 && hour_start<12){
				//end after 3pm
				if(hour_end>=15){
					deduction = 2400;//40 minutes
				}
				//end after 12pm
				else if(hour_end>=12){
					deduction = 1800;//30 minutes
				}
			}
			//start between 12pm and 3pm
			else if(hour_start>=12 && hour_start<15){
				//end after 3pm
				if(hour_end>=15){
					deduction = 600;//10 minutes
				}
			}
			
		}
		//Friday
		else if(dayOfWeek_start==5){
			//start before 10am
			if(hour_start<10){
				//end after 12pm
				if(hour_end>=12){
					deduction = 2400;//40 minutes
				}
				//end after 10am
				else if(hour_end>=10){
					deduction = 600;//10 minutes
				}
			}
			//start between 10am and 12pm
			else if(hour_start>=10 && hour_start<12){
				//end after 12pm
				if(hour_end>=12){
					deduction = 1800;//30 minutes
				}
			}
		}
		//Saturday and Sunday
		else{
			deduction= duration;
		}
		
		nlapiLogExecution("DEBUG", "deduction", deduction);
		
		duration = duration-deduction;
		if(duration<0){
			duration=0;
		}
		
	}
	//finish in different day
	else{
		duration=-1;
	}
	
	
	return duration;
}