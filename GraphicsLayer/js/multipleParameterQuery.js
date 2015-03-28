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

    //Array for erven
    var erven = ["700", "701", "702", "703", "704", "705", "706", "707"];
	var ervenJSON = [	{standno:'0030004748', balance_due:'220000', customer_name:'', account_number: 'AVC325'},
						{standno:'0030004749', balance_due:'632609.68', customer_name:'', account_number: 'AVC326'},
						{standno:'0030004750', balance_due:'316391.96', customer_name:'Feliciana Shishiveni', account_number: 'AVC327'},
						{standno:'0030004759', balance_due:'316304.84', customer_name:'Amos Wachanga', account_number: 'AVC329'},
						{standno:'0030004758', balance_due:'0', customer_name:'', account_number: 'AVC332'},
						{standno:'0030004756', balance_due:'0', customer_name:'Fest Nek', account_number: 'AVC333'},
						{standno:'0030004757', balance_due:'0', customer_name:'Anthony H', account_number: 'AVC336'}
					]
    //Set the Local authority prefix
    var local_Authority_Prefix = "oj"

    //url
    var url = "http://localhost:6080/arcgis/rest/services/Otjiwarongo/MapServer";
	var layerID = "18";

    //Search URL that is only querying the parcels feature class in the parcels fabric dataset
    var searchURL = url + "/" + layerID

    //-------------------End of Variables initialization----------------------------------------------

    //Initialize map object
    app.map = new Map("mapDiv", {
        basemap: "streets", //streets basemap from Esri
        center: [16.6445, -20.4757], //Center
        zoom: 18, //Zoom
        sliderOrientation: "horizontal" //Orientation of zoom slider
    });

    //instantiate parcel fabric layer object
    var layer = new ArcGISDynamicMapServiceLayer(url, {
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
	   jQueryFunct();
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
			 *			local_Authority_Prefix: Attributes fields in the feature class are prefixed using the local authority prefix
			 *									e.g oj_stand_no for stand number field in Otjiwarongo, ts_stand_no for stand number field in Tsumeb, 
			 *			searchURL: url of the layer that the search will be applied on
			 *			searchURL: an associative array with the stand no, balances and other financial data to be displayed on the map
			 */
			searchMultipleErf(erven, local_Authority_Prefix, searchURL,ervenJSON);
		 });
	 }
	 
	function createErvenArray(jsonObject){
		var arr = [];
		var obj = jsonObject;
			$.each(obj, function(i, val) {
			   console.log("StandNo:" + obj[i].standno);
			   arr.push( obj[i].standno);
			});
		return arr;
	}

	//Wire click event to graphics layer to modify infotemplate content Sir/Madam
	dojo.connect(app.map.graphics, "onClick", function(evt) {
		  var graphicAttributes = evt.graphic.attributes;
		  var title = graphicAttributes.NAME;
		  var populationDensity = graphicAttributes.POP2007 / graphicAttributes.SQMI;
		  var content = "The population density in 2007 is <i>" + populationDensity.toFixed(2); + "</i>.";
		  map.infoWindow.setTitle(title);
		  map.infoWindow.setContent(content);
		  map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
		});
		
	 function getBal(myStandNo,ervenJSON){
		//query json and return balance for supplied standno	 	
			var bal= "";
			var obj = ervenJSON;
				$.each(obj, function(i, val) {
				   if (String(obj[i].standno)==myStandNo.toString()) {
					  //get the value for balance
					  bal =  String(obj[i].balance_due);
					  //get the value for customer name
					  myCustomerName = String(obj[i].customer_name)
					  //get the value for Account Number
					  myAccountNumber = String(obj[i].account_number)
					  //logger to test everything
					  console.log("StandNo:" + obj[i].standno + " Balance: "+bal+ " Account Number: "+myCustomerName + " Names: "+myCustomerName); //send to console man
				   }					   
				});
				return bal;
	}
	
	var _customerName, _accountNumber, _bal
	function getFinancialData(myStandNo,ervenJSON){
	//query json and return balance for supplied standno	 	
	var obj = ervenJSON;
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
	
	//Function builds financial data for inclusion in system
	function buildFinancialDataString(_customerName, _accountNumber, _bal){
		/**/	 
		//Update info template with details
		var infoTemplateFinanceData = "</b>-----Finance Data------<br/>"
				+ "<b>Customer Name: </b>" + _customerName +"<br/>"
				+ "<b>Account Number: </b>" + _accountNumber +"<br/>"
				+ "<b>Balance: </b>" + _bal+"<br/>"	
				
		return infoTemplateFinanceData;
	}

	//Variable stores status if a custom click event has been wired to graphics layer
	var wireGraphicsLayer = 0;
	var infoTemplate;
    function searchMultipleErf(erven, local_Authority_Prefix, searchURL,ervenJSON) {
        //build query task
        var queryTask = new QueryTask(searchURL);
        //build query filter
        var query = new Query();
        //Return geometries as part of the query results
        query.returnGeometry = true;
        //Specify outfields
        query.outFields = [
                            local_Authority_Prefix + "_local_authority_id",
                            local_Authority_Prefix + "_stand_no",
                            local_Authority_Prefix + "_township_id",
                            local_Authority_Prefix + "_erf_no",
                            local_Authority_Prefix + "_status",
                            local_Authority_Prefix + "_survey_size",
                            local_Authority_Prefix + "_zoning_id",
                            local_Authority_Prefix + "_portion ",
                            local_Authority_Prefix + "_density ",
                            local_Authority_Prefix + "_ownership",
                            local_Authority_Prefix + "_computed_size",
                            local_Authority_Prefix + "_restriction"
        ];
        //Build the where clause
        var myWhere = "";

        /*
         * Build the Where clause
         * Having one in clause over multiple or clauses
         * Check the erven has search erfs
         */
		 
		 // Erven array
		 //
		 var myArr
		 try {
				myArr = createErvenArray(ervenJSON);
			}
			catch(err) {
				console.log(err.message); 
			}
		 erven = myArr;
        if (erven.length > 0) {
            myWhere = local_Authority_Prefix + "_stand_no in ('" + erven.join("','") + "')";
            //console.log(myWhere);
        }

        //Where clause
        query.where = myWhere;

        //Spatial Reference
        query.outSpatialReference = { "wkid": 102100 };//web mercator auxiliary sphere
        //Pop-up template for the graphics added onto the map upon successful query execution
        infoTemplate = new InfoTemplate();//instantiate  pop-up object
        //Set-up pop-up tital
		
        infoTemplate.setTitle("${" + local_Authority_Prefix + "_erf_no}");
		
        //set-up content to be displayed on the pop-up
		var infoTemplateStr = "<b>Township: </b>${" + local_Authority_Prefix + "_township_id}<br/>"
								+ "<b>Zoning: </b>${" + local_Authority_Prefix + "_zoning_id}<br/>"
								+ "<b>Erf No: </b>${" + local_Authority_Prefix + "_erf_no}<br/>"
								+ "<b>Status: </b>${" + local_Authority_Prefix + "_status}<br/>"
								+ "<b>Survey Size: </b>${" + local_Authority_Prefix + "_survey_size}" + " Sq. M<br/>"
								+ "<b>Density: </b>${" + local_Authority_Prefix + "_density}<br/>"
								+ "<b>Ownership: </b>${" + local_Authority_Prefix + "_ownership}<br/>"
								+ "<b>Restrictions: </b>${" + local_Authority_Prefix + "_restriction}<br/>"
        
		//infoTemplate.setContent();
								                            
        //Set-up info window width and height
        app.map.infoWindow.resize(245, 105);

        //Can listen for onComplete event to process results or can use the callback option in the queryTask.execute method.
        dojo.connect(queryTask, "onComplete", function (featureSet) {
            //Clear any existing graphic Layers on the map
            app.map.graphics.clear();
			
            /*
             * Create symbol object for owners with balances
             * Create fill symbol and outline symbol and apply colour
             */
            var nonDefaultersSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 1.5]), 1)
                , new Color([55, 168, 190, 1.0])
                );

            /*
             * Create symbol object for owners with balances
             * Create fill symbol and outline symbol and apply colour
             */
            var defaultersSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 1.5]), 1)
                , new Color([255, 0, 0, 1.0])
                );
			
            //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
            dojo.forEach(featureSet.features, function (feature) {
                var graphic = feature;
				//---------Run Code ----to get the balance from the JSON 
				
				/*
				 * Get standno from the feature
				 * 
				 * Run code to get the balance from the JSON object
				 *
				 */
				 var myStandNo = graphic.attributes['oj_stand_no'];
				 var myCustomerName = "";
				 var myAccountNumber = 	"";	
				 //Get balance from array

				 //console.log(graphic.attributes['oj_stand_no'])
				 var myBalance = getBal(myStandNo,ervenJSON)				
				 if ($.isNumeric( myBalance)  ){
					 var bal = parseFloat(myBalance);
					 if (bal > 0){
						  graphic.setSymbol(defaultersSymbol); //Has balance
					 }else{
						 graphic.setSymbol(nonDefaultersSymbol); //Has no balance
					 }		 
				 } else{ //balance is non-numeric. Therefore we retain a pessimistic point of view
					 graphic.setSymbol(defaultersSymbol);
				 }

                //add graphic to the map
                app.map.graphics.add(graphic);
				
				//Check if graphics layer array is not null
				if ( wireGraphicsLayer==0){
					//Count to check if the object has keys				
						var count = 0
						$.each(app.map.graphics, function(i, val) {
							count = count +1;
						});
						//Check if graphics layer has graphic objects\s
						if (count>0){
							//Wire that event here
							app.map.graphics.on("click", function (evt) {
								console.log("Awesome Stuff");
																
								//Get standno
								var standNo = evt.graphic.attributes.oj_stand_no;
								console.log(evt.graphic.attributes.oj_stand_no);
								
								//Call function to create string with financial data for capturing into the map
								getFinancialData(standNo,ervenJSON)
								
								//Prepare popup data by calling function to build financial data content
								var financialDataContent = buildFinancialDataString(_customerName, _accountNumber, _bal)

								//Set info template for graphic layer only
								var infoTemplateString = infoTemplateStr + financialDataContent;
								infoTemplate.setContent(infoTemplateString);
								
								//app.map.infoWindow.show(evt.screenPoint,app.map.getInfoWindowAnchor(evt.screenPoint));
							});		
							wireGraphicsLayer = 1;						
						}
				}
				graphic.setInfoTemplate(infoTemplate);
				//
            });
        });
        //execute asynchronous query task by passing query parameter to its execute method
        queryTask.execute(query);
    }

});