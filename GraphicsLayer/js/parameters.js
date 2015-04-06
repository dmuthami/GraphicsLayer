/*
 *add some properties to the prototype object
 */
parameters.prototype._localAuthorityPrefix = "oj";

/*
 *add some properties to the prototype object
 * These properties are the particular fields to display
 */
parameters.prototype._JSONstandNoKey = "standno";

//Fields that you wanna display in the pop-up together with their alias
parameters.prototype._fieldNamesToDisplayOnPopUp = 
	{standno:'standno', balance_due:'balance_due',
	 customer_name:'customer_name',account_number:'account_number'};


//Fields that you wanna display in the pop-up together with their alias
parameters.prototype._fieldAliasToDisplayOnPopUp = 
				{standno:'Stand Number',
				balance_due:'Balance Due',
				customer_name:'Customer Name',
				account_number:'Customer Name'};

//URL for the webservice
parameters.prototype._url = "http://localhost:6080/arcgis/rest/services/Otjiwarongo/MapServer";

//array to hold stand numbers
parameters.prototype._erven; //Array for erven stand numbers

//json object
parameters.prototype._ervenJSON = [	
						{standno:'0030004748', balance_due:'220000', customer_name:'Ingrid Mukendwa', account_number: 'AVC325'},
						{standno:'0030004749', balance_due:'632609.68', customer_name:'Baptista Joao', account_number: 'AVC326'},
						{standno:'0030004750', balance_due:'316391.96', customer_name:'Feliciana Shishiveni', account_number: 'AVC327'},
						{standno:'0030004759', balance_due:'316304.84', customer_name:'Amos Wachanga', account_number: 'AVC329'},
						{standno:'0030004758', balance_due:'0', customer_name:'David Muthami', account_number: 'AVC332'},
						{standno:'0030004756', balance_due:'0', customer_name:'Festus Nekayi', account_number: 'AVC333'},
						{standno:'0030004757', balance_due:'0', customer_name:'Anthony H', account_number: 'AVC336'}
					];
//json object
parameters.prototype._outFields = [
                            parameters.prototype._localAuthorityPrefix  + "_local_authority_id",
                            parameters.prototype._localAuthorityPrefix  + "_stand_no",
                            parameters.prototype._localAuthorityPrefix  + "_township_id",
                            parameters.prototype._localAuthorityPrefix  + "_erf_no",
                            parameters.prototype._localAuthorityPrefix  + "_status",
                            parameters.prototype._localAuthorityPrefix  + "_survey_size",
                            parameters.prototype._localAuthorityPrefix  + "_zoning_id",
                            parameters.prototype._localAuthorityPrefix  + "_portion ",
                            parameters.prototype._localAuthorityPrefix  + "_density ",
                            parameters.prototype._localAuthorityPrefix  + "_ownership",
                            parameters.prototype._localAuthorityPrefix  + "_computed_size",
                            parameters.prototype._localAuthorityPrefix  + "_restriction"
			];
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