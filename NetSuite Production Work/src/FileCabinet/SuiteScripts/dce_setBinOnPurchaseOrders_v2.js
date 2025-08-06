/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
*/
define(['N/ui/serverWidget','N/record','N/search','N/runtime'], function(serverWidget, record, search,runtime) {

//store the result of finding all the bins
var allBinItems = new Array();

function beforeLoad(context) {

//determine the user event type
var UserEventType = context.UserEventType;
var type = context.type;
  
    // only execute during printing...
    if (type != UserEventType.PRINT) return  
    var form = context.form;
	var currentRecord = context.newRecord;
  
    var po_location = 0;
  
	//purchase order location
	po_location = currentRecord.getValue({fieldId:'location'});

//log.debug("po_location before check: " + po_location);
  
    //because the print event runs when loading the template, we need this line to allow the edit mode to display
    if ((!po_location)||(po_location == undefined)||(po_location == ""))
    {
         po_location = 11;
    }

//log.debug("po_location after check: " + po_location);
  
	//get the sublist from the form
	var itemSublist = currentRecord.getSublist({
		sublistId: 'item'
	});	

    //count the number of lines in the transaction
	var numLines = currentRecord.getLineCount({
		sublistId: 'item'
	});

    //add a dummy field to the form to hold the custom json data of binnumbers
	var field = form.addField({
		id : 'custpage_custom_data',
      label: 'Custom Data',
      type : serverWidget.FieldType.LONGTEXT
	});
	
	//create a cost element to determine how much credit is left
	var scriptObj = runtime.getCurrentScript();
		
	//find all the bins that are active and match the location of the purchase order
    //this should immediately reduce the looping and searching as we are only returning the bins in the location of interest
	var allBinSearch = search.create({
		type: "bin",
		filters:[
			search.createFilter({name: "inactive", operator: search.Operator.IS, values: "False"}),
			search.createFilter({name: "location", operator: search.Operator.IS, values: po_location})
		],
		columns: [{name: 'location'}, {name:'binnumber'}]		
	});

	//return all the results from the search
	var allBinResults = allBinSearch.run().getRange({
		start: 0, 
		end: 1000
	});

  //335 bins in parts
//log.debug("ALL BINS IN LOCATION: " + allBinResults.length);
  
	//run until we reach 100 items on the list...	
    //loop around the number of lines in the transaction
	for(var i = 0; i < numLines; i++)
	{

        //run this code if still credits available
		if(i < 100)
		{
      
		//retrieve the item from the sublist
		var itemId = currentRecord.getSublistValue({
			sublistId: 'item',
			fieldId:'item',
			line: i
		});

//log.debug("ITEM ID: " + itemId);
          
			//this searches and returns a record per bin number for the item		
			var itemSearch = search.create({
				type: "item",	
				
				//add a filter for the item and the preferred bin
				filters:[
                        search.createFilter({name: "preferredbin", operator: search.Operator.IS, values: "True"}),
						search.createFilter({name: "internalid", operator: search.Operator.ANYOF, values: itemId})

                        //this is new
						//search.createFilter({name: "inventorylocation", operator: search.Operator.ANYOF, values: po_location})			
                        //search.createFilter({name: "preferredlocation", operator: search.Operator.ANYOF, values: po_location})			
					],
						
				//get the name, binnumber and preferredbin values from the item
				columns: [{name: 'name'},{name: 'binnumber', 'label':'binnumber'},{name: 'preferredbin', 'label':'preferredbin'}]
			});

			//run the search and only return one result
			var itemResults = itemSearch.run().getRange({
				start: 0, 
				end: 36
			});

//log.debug("NO OF RESULTS: "+ itemResults.length);
          
			//loop the search results 
			//this is 10 units		
			for (var w = 0; w < itemResults.length; w++)
			{
				//retrieve the item name
				var itemName = itemResults[w].getValue(itemResults[w].columns[0]);
				
				//retrieve the bin number to search for
				var binNumberToSearch = itemResults[w].getValue(itemResults[w].columns[1]);
				
				//retrieve the preferred bin number
				var preferredBin = itemResults[w].getValue(itemResults[w].columns[2]);
				
				for (var j = 0; j < allBinResults.length; j++)
				{
					//get the bin location
					var binLocation = allBinResults[j].getValue(allBinResults[j].columns[0]);
					
					//get the bin number
					var binNumber = allBinResults[j].getValue(allBinResults[j].columns[1]);
					
					//log.debug("BIN LOCATION: " + binLocation + ", BINNUMBERTOSEARCH: " + binNumberToSearch + " BINNUMBER: " + binNumber);
					
					//perform the test
					if ((po_location == binLocation)&&(binNumber == binNumberToSearch)&&(preferredBin))
					{						
						//add the item to the array
						allBinItems.push({
							'itemid': itemId,
							'binnumber': binNumberToSearch,
							'itemname': itemName,
							'binlocation':binLocation
						});						
						break;
					}
				}
			}
		}
		else
		{

//log.debug("i: " + i);
          
			allBinItems.push({
				'itemid': itemId,
				'binnumber': "UNKNOWN",
				'itemname': "-",
				'binlocation': "-"
			});
		}		
	}


  
    //set the value of the dummy field
	field.defaultValue = JSON.stringify(allBinItems);
	
  }


  return {
    beforeLoad: beforeLoad
  };

})