//Global variable object store
var app = {}; 
//Othe varibales in the global variable store
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
  Map, ArcGISDynamicMapServiceLayer, ImageParameters
  , Query, QueryTask,
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
        center: [16.65, -20.475], //Center
        zoom: 17, //Zoom
        sliderOrientation: "horizontal" //Orientation of zoom slider
    });

    //create  parcel fabric object
    var layer = new ArcGISDynamicMapServiceLayer(url, {
        id: "Otjiwarongo",
        opacity: 0.5
    });

    //Add dynamic layer
    app.map.addLayers([layer]);
	
    app.map.on("layers-add-result", function () {

        /*
         * Function that displays on the map Erven passed as an argument
         *  Argument is an array object named erven
         */
        //searchMultipleErf(erven, local_Authority_Prefix, searchURL,ervenJSON);
    });
	//-------------JQUERY Code--------------

	$(document).ready(function() {
	   jQueryFunct();
	 });
	 
	 function jQueryFunct(){
		 //window.alert( "It is Un Real");
		 console.log( "The performance of JQuery is UnReal");
		 $( "#dialog").dialog();
		 
		 //Wire click event to the button
		 $("#btnClick").click(function (){ 
			//alert("The button was clicked.");
			searchMultipleErf(erven, local_Authority_Prefix, searchURL,ervenJSON);
		 });
	 }
	 
	//-------------End of JQuery Code---------
	function createErvenArray(jsonObject){
		var arr = [];
		var obj = jsonObject;
			$.each(obj, function(i, val) {
			   console.log("StandNo:" + obj[i].standno);
			   arr.push( obj[i].standno);
			});
		return arr;
	}
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

        //loop through the array of provided erven . below commented code has been thrown out of the window and replaced with Build the Where clause
            /*
                    for (index = 0; index < erven.length; index++) {
                        //for the last array ellement   
                         *
                        if (index == erven.length - 1) {

                            myWhere += local_Authority_Prefix + "_erf_no = '" + erven[index] + "'"; //minus or

                        } else { //Other array elements

                            myWhere += local_Authority_Prefix + "_erf_no = '" + erven[index] + "' or "; // with or
                        }
            

                    }
             */

        /*
         * Build the Where clause
         * Having one in clause over multiple or clauses
         * Check the erven has search erfs
         */
		 
		 // Erven array
		 //
		 var myArr =[]
		 try {
				myArr = createErvenArray(ervenJSON);
			}
			catch(err) {
				console.log(err.message); 
			}
		 //erven= myArr;
        if (erven.length > 0) {
            var myWhere = local_Authority_Prefix + "_erf_no in ('" + erven.join("','") + "')";
            //console.log(myWhere);
        }

        //Where clause
        query.where = myWhere;

        //Spatial Reference
        query.outSpatialReference = { "wkid": 102100 };//web mercator auxiliary sphere
        //Pop-up template for the graphics added onto the map upon successful query execution
        var infoTemplate = new InfoTemplate();//instantiate  pop-up object
        //Set-up pop-up tital
        infoTemplate.setTitle("${" + local_Authority_Prefix + "_stand_no}");
        //set-up content to be displayed on te pop-up
        infoTemplate.setContent("<b>Township: </b>${" + local_Authority_Prefix + "_township_id}<br/>"
                             + "<b>Erf No </b>${" + local_Authority_Prefix + "_erf_no}<br/>"
                             + "<b>Zoning: </b>${" + local_Authority_Prefix + "_zoning_id}");
        //Set-up info window width and height
        app.map.infoWindow.resize(245, 105);

        //Can listen for onComplete event to process results or can use the callback option in the queryTask.execute method.
        dojo.connect(queryTask, "onComplete", function (featureSet) {
            //Clear any existing graphic ayers on the map
            app.map.graphics.clear();
            /*
             * Create symbol object
             * Create fill symbol and outline symbol and apply colour
             */
            var symbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([115, 0, 0, 1.5]), 1)
                , new Color([255, 255, 190, 1.0])
                );

            //console.log(featureSet.features.length);

            //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
            dojo.forEach(featureSet.features, function (feature) {
                var graphic = feature;
                graphic.setSymbol(symbol);
                //Set infotemplate for graphic layer only
                graphic.setInfoTemplate(infoTemplate);
                //add graphic to the map
                app.map.graphics.add(graphic);
            });
        });
        //execute asynchronous query task by passing query parameter to ts execute method
        queryTask.execute(query);
    }

});