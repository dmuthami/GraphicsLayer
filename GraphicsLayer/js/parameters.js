/*
 *add some properties to the prototype object
 */
parameters.prototype.localAuthorityPrefix = "oj";

//URL for the webservice
parameters.prototype._url = "http://localhost:6080/arcgis/rest/services/Otjiwarongo/MapServer";

//array to hold stand numbers
parameters.prototype._erven; //Array for erven stand numbers

//json object
parameters.prototype._ervenJSON = [	{standno:'0030004748', balance_due:'220000', customer_name:'Ingrid Mukendwa', account_number: 'AVC325'},
						{standno:'0030004749', balance_due:'632609.68', customer_name:'Baptista Joao', account_number: 'AVC326'},
						{standno:'0030004750', balance_due:'316391.96', customer_name:'Feliciana Shishiveni', account_number: 'AVC327'},
						{standno:'0030004759', balance_due:'316304.84', customer_name:'Amos Wachanga', account_number: 'AVC329'},
						{standno:'0030004758', balance_due:'0', customer_name:'David Muthami', account_number: 'AVC332'},
						{standno:'0030004756', balance_due:'0', customer_name:'Festus Nekayi', account_number: 'AVC333'},
						{standno:'0030004757', balance_due:'0', customer_name:'Anthony H', account_number: 'AVC336'}
					]
//layer id
parameters.prototype._layerID = "18"; 
/*
 *add event listeners to the buttons
 */
parameters.prototype._searchURL = function(){
	//Search URL that is only querying the parcels feature class in the parcels fabric dataset
	return parameters.prototype._url + "/" + 
		parameters.prototype._layerID;
}

/*
 *Object constructor
 */
function parameters(){
}

parametersProt = new parameters();