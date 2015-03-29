//Global variable object store
var app = {}; 
//Other variables in the global variable store
app.map = null, app.toolbar = null, app.tool = null; app.symbols = null, app.printer = null;

require([
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ImageParameters",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/FeatureSet",
  "esri/graphic",
  "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
  "esri/InfoTemplate"
], function (
  Map, ArcGISDynamicMapServiceLayer, ImageParameters,
  Query, QueryTask,
  FeatureSet, Graphic,
  SimpleFillSymbol, SimpleLineSymbol, Color,
  InfoTemplate
  ) {

    //-------------------Variables initialization----------------------------------------------

    //-------------------End of Variables initialization----------------------------------------------

    //Initialize map object
    app.map = new Map("mapDiv", {
        basemap: "streets", //streets basemap from Esri
        center: [16.6445, -20.4757], //Center
        zoom: 18, //Zoom
        sliderOrientation: "horizontal" //Orientation of zoom slider
    });

    //instantiate parcel fabric layer object
    var layer = new ArcGISDynamicMapServiceLayer(parameters.prototype._url, {
        id: "Otjiwarongo",
        opacity: 0.5
    });

    //Add dynamic layer to the map
    app.map.addLayers([layer]);
	
	/*
	 * Wire "layers-add-result" event to the map 
	 * Fires only after all layers have loaded onto the map
	 */
    app.map.on("layers-add-result", function () {

	/*
	 * Write some code here after all layers have loaded
	 */
    });


	/*
	 * Function to execute when DOM is fully loaded
	 * The function is named jQueryFunct()
	 * NB. Currently, their is no way to force JQUERY to execute functions after dojo libraries
	 */
	$(document).ready(function() {
	   jQueryFunct();//callJQuery function
	 });
	 
	/*
	 * jQueryFunct()
	 * Function: 
	 *			Loads the a Jquery dialog
	 *			Executes function to conduct a multiple Query Search
	 */	 
	 function jQueryFunct(){
		 //Show dialog box
		 $( "#dialog").dialog();
		 
		 //Wire click event to the button that user fires search
		 $("#btnClick").click(function (){ 
			/*
			 * Execute the function searchMultipleErf
			 * Arguments: 
			 * 			erven: Array containing the stand numbers of the Erven we need to search
			 *			parametersProt.localAuthorityPrefix: Attributes fields in the feature class are prefixed using the local authority prefix
			 *									e.g oj_stand_no for stand number field in Otjiwarongo, ts_stand_no for stand number field in Tsumeb, 
			 *			searchURL: url of the layer that the search will be applied on
			 *			ervenJSON: an associative array with the stand no, balances and other financial data to be displayed on the map
			 */
			searchMultipleErf(parametersProt._erven, parametersProt, parameters.prototype._searchURL(),parametersProt._ervenJSON);
		 });
	 }
	 
	 /*
	  * Function: createErvenArray
	  * Argument: jsonObject-an associative array with the stand no, balances and other financial data to be displayed on the map
	  * Function:
	  * 		Returns an array of stand numbers only
	  */
	function createErvenArray(jsonObject){
		var arr = []; //initialize an emptry array
		var obj = jsonObject; //assign global json object to local json object
			$.each(obj, function(i, val) { // loop through each of the json objects
			   arr.push( obj[i].standno); // push stand numbers only into an array to be used in the search query task
			});
		return arr; //return the array object
	}

	/*
	 * Function : getBal
	 * Argument : myStandNo - in parameter with the stand number of the erf we want to get is balance details
	 * Argument : jsonObject - in parameter that passes by reference the json object with the finance details
	 * Function : query json and return balance for supplied standno	
	 */
	 function getBal(myStandNo,jsonObject){	
			var bal= ""; //initialize variable to store balance for the supplied stand number
			var obj = jsonObject; // Assing by reference global json object to local json object
				$.each(obj, function(i, val) {// loop through each of the json objects
				   if (String(obj[i].standno)==myStandNo.toString()) {	 // Check if stand no in json object is equivalent to supplied in function				  
					  bal =  String(obj[i].balance_due);//get the value for balance
				   }					   
				});
				return bal; //return the balance for the stand number. NB. this is the field that links customer details in the financial module to the GIS
	}
	/*
	 *  Variables to store the financial data
	 * _customerName: customer Name
	 * _accountNumber : Account Number
	 * _bal : Balance
	 */
	var _customerName, _accountNumber, _bal
	/*
	 * Function:  getFinancialData
	 * Argument : Stand Number of the customer for which we need to display 
	 * Argument : jsonObject-an associative array with the stand no, balances and other financial data to be displayed on the map
	 * Function:
	 *			query json and return balance, name, and account number for customer supplied 
	 */
	function getFinancialData(myStandNo,jsonObject){
		//query json and return balance for supplied standno	 	
		var obj = jsonObject;
		$.each(obj, function(i, val) {
		   if (String(obj[i].standno)==myStandNo.toString()) {
			  //get the value for balance
			  _bal =  String(obj[i].balance_due);
			  //get the value for customer name
			  _customerName = String(obj[i].customer_name)
			  //get the value for Account Number
			  _accountNumber = String(obj[i].account_number)
		   }					   
		});
	}
	
	/*
	 * Function : buildFinancialDataString
	 * Argument : _customerName - Name of customer
	 * Argument : _accountNumber - Account Number of Customer
	 * Argument : _bal - Customer balance
	 * Function: 
	 *			Function builds financial data for inclusion in system
	 */
	function buildFinancialDataString(_customerName, _accountNumber, _bal){		 
		//String variable that builds the financial content
		var infoTemplateFinanceData = "</b>-----Finance Data------<br/>"
				+ "<b>Customer Name: </b>" + _customerName +"<br/>"
				+ "<b>Account Number: </b>" + _accountNumber +"<br/>"
				+ "<b>Balance: </b>" + _bal+"<br/>"	
				
		return infoTemplateFinanceData; //returns the financial content formatted in a nice string
	}

	/*
	 * Variables to store the financial data
	 * wireGraphicsLayer: Variable stores status if a custom click event has been wired to graphics layer
	 * infoTemplate : Variable is a pointer to the memory location containing content to appear in the popup window
	 * 
	 */
	var wireGraphicsLayer = 0;
	var infoTemplate;
	var prefix = parametersProt.localAuthorityPrefix;
	
	/*
	 * Function : searchMultipleErf
	 * Argument : erven - The array containing stand numbers to display on the map
	 * Argument : parametersProt.localAuthorityPrefix - The local authority prefix. say oj for Otjiwarongo
	 * Argument : searchURL - The REST web map service URL of the layer to run the query on
	 * Argument : ervenJSON - The JSON object containing the financial data
	 * Function: 
	 *			Executes query and displays the erven result on the map coloured showing with balance or no balance.
	 *			Red parcel/erf show customer owes council money on rates and taxes
	 *			Green parcel/erf shows customer has no balance or the balance is negative-i.e council owes money
	 */
    function searchMultipleErf(erven, parametersProt, searchURL,ervenJSON) {
        //build query task
        var queryTask = new QueryTask(searchURL);
        //build query filter
        var query = new Query();
        //Return geometries as part of the query results
        query.returnGeometry = true;
        //Specify outfields from the layer id
        query.outFields = [
                            parametersProt.localAuthorityPrefix + "_local_authority_id",
                            parametersProt.localAuthorityPrefix + "_stand_no",
                            parametersProt.localAuthorityPrefix + "_township_id",
                            parametersProt.localAuthorityPrefix + "_erf_no",
                            parametersProt.localAuthorityPrefix + "_status",
                            parametersProt.localAuthorityPrefix + "_survey_size",
                            parametersProt.localAuthorityPrefix + "_zoning_id",
                            parametersProt.localAuthorityPrefix + "_portion ",
                            parametersProt.localAuthorityPrefix + "_density ",
                            parametersProt.localAuthorityPrefix + "_ownership",
                            parametersProt.localAuthorityPrefix + "_computed_size",
                            parametersProt.localAuthorityPrefix + "_restriction"
        ];
        //Build the where clause
        var myWhere = "";
		 
		 try {
				//function receives json object (that has stand numbers,balances etc) as parameter and spits out array with only stand numbers 
				erven = createErvenArray(ervenJSON);
			}
			catch(err) {
				console.log(err.message); //error message is written to the console
			}
		 
        if (erven.length > 0) {
            myWhere = parametersProt.localAuthorityPrefix + "_stand_no in ('" + erven.join("','") + "')"; //Builds an in clause expression
        }

        query.where = myWhere;  //supply the Where clause expression to the query

        //Spatial Reference
        query.outSpatialReference = { "wkid": 102100 };//web Mercator auxiliary sphere EPSG or SRID as per Esri
		
        //Pop-up template for the graphics added onto the map upon successful query execution
        infoTemplate = new InfoTemplate();//instantiate  pop-up object
        
        infoTemplate.setTitle("Erf No:"+"${" + parametersProt.localAuthorityPrefix + "_erf_no}");//Set-up pop-up title with Stand Number
		
        //Prepare content to be displayed on the pop-up
		var infoTemplateStr = "<b>Township: </b>${" + parametersProt.localAuthorityPrefix + "_township_id}<br/>"
								+ "<b>Zoning: </b>${" + parametersProt.localAuthorityPrefix + "_zoning_id}<br/>"
								+ "<b>Erf No: </b>${" + parametersProt.localAuthorityPrefix + "_erf_no}<br/>"
								+ "<b>Status: </b>${" + parametersProt.localAuthorityPrefix + "_status}<br/>"
								+ "<b>Survey Size: </b>${" + parametersProt.localAuthorityPrefix + "_survey_size}" + " Sq. M<br/>"
								+ "<b>Density: </b>${" + parametersProt.localAuthorityPrefix + "_density}<br/>"
								+ "<b>Ownership: </b>${" + parametersProt.localAuthorityPrefix + "_ownership}<br/>"
								+ "<b>Restrictions: </b>${" + parametersProt.localAuthorityPrefix + "_restriction}<br/>"
        							                            
        app.map.infoWindow.resize(245, 225);        //Set-up info window width and height

        //Can listen for onComplete event to process results or can use the callback option in the queryTask.execute method.
		
		/* Wires the query task to the onComplete event 
		 * The event handler fires when the query operation is complete successful
		 * Function : The user specified callback function is invoked with the result if the query is successful
		 * Argument : featureSet - The result of the query
		 * Function
		 */
        dojo.connect(queryTask, "onComplete", function (featureSet) {         
            app.map.graphics.clear();//Clear any existing graphic Layers on the map
            /*
             * Create symbol object for owners without balances
             * Create fill symbol and outline for the symbol object and apply colour
             */
            var nonDefaultersSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 1.5]), 1) /*outline colour-black*/
                , new Color([8, 235, 0, 1.0])  /*solid fill as Green*/
                );

            /*
             * Create symbol object for owners with balances
             * Create fill symbol and outline symbol and apply colour
             */
            var defaultersSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 1.5]),1) /*outline colour-black*/
                , new Color([255, 0, 0, 1.0]) /*solid fill as Green*/
                );
			
            //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
			
			/* QueryTask returns a featureSet. 
			 * Argument: Pass the features from the feature set
			 * Function : The anonymous function has an input feature referred to as feature
			 * Function :
			 *			Loops through each feature in the feature set and draws a graphic on the map 
			 */
            dojo.forEach(featureSet.features, function (feature) {
                var graphic = feature; //assign by ref the feature to variable named graphic

				var myStandNo = graphic.attributes[parametersProt.localAuthorityPrefix+'_stand_no'];//From graphic object get value of stand number from the stand number field
				 /*
				  * Call "getBal" function to return balance of the customer
				  */
				 var myBalance = getBal(myStandNo,ervenJSON) //call function				
				 if ($.isNumeric( myBalance)  ){ //Check if balance is a numeric field
					 var bal = parseFloat(myBalance); //Convert balance to a number
					 if (bal > 0){ //Check if balance is greater than zero
						  graphic.setSymbol(defaultersSymbol); //Has balance
					 }else{
						 graphic.setSymbol(nonDefaultersSymbol); //Has no balance
					 }		 
				 } else{ //balance is non-numeric. Therefore we retain a pessimistic point of view
					 graphic.setSymbol(defaultersSymbol); //Assumes has a balance
				 }
           
                app.map.graphics.add(graphic);//add graphic to the map
				
				//Condition checks if the graphics layer has been wired to a click event that is very useful in determining
				//  the stand no and usng it to query a json object to retrieve vital financial information for display in the popup dialog box
				// zero (0) means wiring is off while one(1) means wiring is on
				if ( wireGraphicsLayer==0){
					//Count to check if the object has keys				
						var count = 0; //variable to store number of graphic features in the grahic layer
						$.each(app.map.graphics, function(i, val) {
							count = count +1; //increment counter for graphic features
							return false; //forcefully exit as we only wanted see if there are any graphic objects 
						});
						//Check if graphics layer has graphic objects\s
						if (count>0){
							//Wire the click event to the graphic layers and its event handler is an anonymous function
							app.map.graphics.on("click", function (evt) {
																								
								var standNo = evt.graphic.attributes.oj_stand_no;//Get standno from graphic
								
								/*
								 * Call "getFinancialData" by supplying standno and ervenJSON object
								 * ervenJSON: JSON object with financial information that is required on the pop-up
								 */
								getFinancialData(standNo,ervenJSON)
								
								//Prepare pop-up data by calling function to build financial data content
								
								/*
								 * Call "buildFinancialDataString" by supplying customer name, account number and balance
								 * returns a well formatted string with financial data for display
								 */
								var financialDataContent = buildFinancialDataString(_customerName, _accountNumber, _bal)

								//Set info template for graphic layer only
								var infoTemplateString = infoTemplateStr + financialDataContent;
								infoTemplate.setContent(infoTemplateString); // now set the content of the infotemplate
								
							});		
							wireGraphicsLayer = 1;	//Turn off wiring to avoid wiring for every feature in the feature set					
						}
				}
				graphic.setInfoTemplate(infoTemplate);//Set info template to the graphics of the  graphics layer
				//
            });
        });
        //execute asynchronous query task by passing query parameter to its execute method
        queryTask.execute(query);
    }

});