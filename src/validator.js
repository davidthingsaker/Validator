/*
	Validator
	=========
	A Javascript version of the Validation Class in the Laravel framework

	Tom Alexander
*/

(function(){

/*
	make this compatible with AMD
*/

	if( typeof define === 'function' && define.amd ) {
		define('laravel-validator', ['jquery'], function (jQuery) {
			return main();
		});
	} else main();

/*
	creates a new instance of the Validator object and attaches it to
	a new jQuery plugin
*/

function main(){

	jQuery.validator = jQuery.fn.validator = function() {  
		that = new Validator;

		if(this instanceof jQuery){
			args = {values:$(this), rules:arguments[0] || {}, messages: arguments[1] || {} };
		} else {
			args = {values:arguments[0] || {}, rules:arguments[1] || {}, messages: arguments[2] || {} };
		}

		that.make(args);
		return that;
	};

/*
	default messages for all of the built in rules
*/

var defaultMessages = {
	"accepted"         : "The :attribute must be accepted.",
	"active_url"       : "The :attribute is not a valid URL.",
	"after"            : "The :attribute must be a date after :date.",
	"alpha"            : "The :attribute may only contain letters.",
	"alpha_dash"       : "The :attribute may only contain letters, numbers, and dashes.",
	"alpha_num"        : "The :attribute may only contain letters and numbers.",
	"before"           : "The :attribute must be a date before :date.",
	"between"          : "The :attribute must be between :min - :max.",
	"confirmed"        : "The :attribute confirmation does not match.",
	"date"             : "The :attribute is not a valid date.",
	"different"        : "The :attribute and :other must be different.",
	"email"            : "The :attribute format is invalid.",
	"in"               : "The selected :attribute is invalid.",
	"integer"          : "The :attribute must be an integer.",
	"ip"               : "The :attribute must be a valid IP address.",
	"max"              : "The :attribute may not be greater than :max.",
	"min"              : "The :attribute must be at least :min.",
	"not_in"           : "The selected :attribute is invalid.",
	"numeric"          : "The :attribute must be a number.",
	"regex"            : "The :attribute format is invalid.",
	"required"         : "The :attribute field is required.",
	"required_if"      : "The :attribute field is required when :other is :value.",
	"required_with"    : "The :attribute field is required when :values is present.",
	"required_without" : "The :attribute field is required when :values is not present.",
	"same"             : "The :attribute and :other must match.",
	"size"             : "The :attribute must be :size.",
	"url"              : "The :attribute format is invalid."
}

/*
	The main Validator class
*/

var Validator = function(){

	var resultObject = {};
	var messages = new MessageBag();
	var MessageParameters = {};
	var stateBoolean = true;
	var jQueryObject = false;
	var jQueryElements = 'input, textarea';

/*
	Rules/Test
*/

	tests = {

		accepted : function( attribute ){
			return parseInt(attribute) == 1 || attribute.toLowerCase() == 'on' || attribute.toLowerCase() == 'yes';
		},

		after : function( attribute, parameters ){
			return new Date( attribute ) > new Date( parameters[0] );
		},

		alpha : function ( attribute ){
			return /^[a-zA-Z]*$/.test( attribute );
		},

		alpha_dash : function ( attribute ){
			return /^[-\sa-zA-Z]+$/.test( attribute );
		},

		alpha_num : function ( attribute ){
			return /^[a-z0-9]+$/i.test( attribute );
		},

		before : function( attribute, parameters ){
			MessageParameters.before = [':date'];
			return new Date( attribute ) < new Date( parameters[0] );
		},

		between : function( attribute, parameters ){
			MessageParameters.between = [':max', ':min'];
			return  parseFloat(attribute) <= parseFloat(parameters[0]) && parseFloat(attribute) >= parseFloat(parameters[1]);
		},

		confirmed : function( attribute, parameters, field ){
			return resultObject[field + '_confirmation']['_attribute'] == attribute;
		},

		date : function( attribute ){
			return !/Invalid|NaN/.test(new Date( attribute ).toString());
		},
		different : function( attribute, parameters ){ 
			return resultObject[parameters[0]]['_attribute'] != attribute;
		},	

		email : function( attribute ){
			return /\S+@\S+\.\S+/.test( attribute );
		},

		in : function( attribute, parameters ){
			for(value in parameters) if(parameters[value] == attribute) return true;
		},

		integer : function( attribute ){
			return /^\d+$/.test( attribute );
		},

		ip : function( attribute, parameters ){
			return /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/.test( attribute );
		},

		luhn : function( attribute, parameters ){
		attribute = attribute.replace(/[^\d]/g, '');
		  var sum = 0, parity = attribute.length % 2;
		  for(i = 0; i < attribute.length; i++) {
		    var digit = parseInt(attribute.charAt(i))
		    if(i % 2 == parity) digit *= 2;
		    if(digit > 9) digit -= 9;
		    sum += digit;
		  }
		  return (sum % 10) == 0 && !isNaN(parseInt(attribute));
		},

		max : function( attribute, parameters ){ 
			MessageParameters.max = [':max'];
			return !isNaN( attribute ) ? attribute <= parseFloat(parameters[0]) : attribute.length <= parameters[0];
		},

		min : function( attribute, parameters ){
			MessageParameters.min = [':min'];
			return !isNaN( attribute ) ? attribute >= parseFloat(parameters[0]) : attribute.length >= parameters[0];
		},

		not_in : function( attribute, parameters ){
			return !tests.in(attribute, parameters);
		},

		numeric : function( attribute ){
			return !isNaN( attribute );
		},

		regex : function( attribute, parameters ){
			MessageParameters.regex = [':pattern'];
			return new RegExp(parameters[0]).test( attribute );
		},

		required : function( attribute ){
			return attribute && attribute != "";
		},

		required_if : function( attribute, parameters ){
			return resultObject[parameters[0]]['_attribute'] == parameters[1] ? attribute && attribute != "" : true;
		},

		required_with : function( attribute, parameters ){
			state = true;
			jQuery.each(parameters, function(index, field){
				if(state && !resultObject[field]['_attribute'] && resultObject[field]['_attribute'] == "") state = false;
			});
			return state ? attribute && attribute != "" : true;
		},

		required_without : function( attribute, parameters ){ 
			return !tests.required_with(attribute, parameters);
		},

		same : function( attribute, parameters ){ 
			return resultObject[parameters[0]]['_attribute'] == attribute;
		},	

		size : function( attribute, parameters ){
			return attribute.length == parameters[0];
		},	

		url : function( attribute ){
			return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( attribute );
		},	

	}

	/*
		Public function for adding new rules to the validator instance
	*/

	extend = function(testName, testMethod){
		tests[testName] = testMethod;
	}, this.extend = extend;

	/*
		public function that parses the parameters
	*/

	make = function( parameters ){
		resultObject = {};
		parameters = parameters.values instanceof jQuery ? parseJqueryObject(parameters) : parameters;

		jQuery.each(parameters.rules, function( value, rules ){
			jQuery.each(rules.split('|'), function(index, rule){

				var testName = rule.split(':')[0];
				var testAttribute = parameters.values[value];
				var testParameters = rule.split(':')[1] ? rule.split(':')[1].split(',') : [];

				resultObject[value] = resultObject[value] ? resultObject[value] : {};
				resultObject[value]['_attribute'] = testAttribute;
				if( testName.indexOf('required') == -1 ){
					resultObject[value][testName] = tests[testName]( testAttribute, testParameters, testName ) || (!testAttribute || testAttribute == "");
				} else {
					resultObject[value][testName] = tests[testName]( testAttribute, testParameters, testName );
				}

				if( jQueryObject && !resultObject[value] ) jQueryObject.find( jQueryElements + '[name="' + value + '"]' ).data('state', true);
				if( !resultObject[value][testName] ) messages.add( testName, testParameters, value, parameters, MessageParameters, jQueryObject);
			});	
		})

	}, this.make = make;

	/*
		public function returns true when at least one test has failed.
		Also runs an anonymous function on failure with a message bag instance
		as an arugment.
	*/	

	fails = function( callback ){
		jQuery.each(resultObject, function( value, testStates ){
			jQuery.each(testStates, function( index, state){
				if(!state && index != '_attribute') stateBoolean = false;
			})
		});

		if(callback && typeof callback === "function" && !stateBoolean) callback( messages );
		return !stateBoolean;

	}, this.fails = fails;

	/*
		public get function to return a message bag instance
	*/	

	getMessages = function(){
		return messages;
	}, this.messages = getMessages;

	/*
		public function returns true when all tests have passed.
		Also runs an anonymous function on success.
	*/	

	passes = function( callback ){
		fails();
		if(callback && typeof callback === "function" && stateBoolean) callback.apply(jQueryObject.unbind(), []);
		return !stateBoolean;
	}, this.passes = passes;

	/*
		private function that extracts data from jquery collections
	*/	

	parseJqueryObject = function( parameters ){
		newValues = {};
		jQueryObject = parameters.values;
		parameters.values.find( jQueryElements ).each(function(i,v){
			newValues[jQuery(this).attr('name')] = jQuery(this).val();
			jQuery(this).data('validator_id', jQuery(this).attr('name'));
		});
		parameters.values = newValues;
		return parameters;
	}

	/*
		Private function for finding the number of elements in a JSON object
	*/	

	function objectLength( object ){
	    count = 0;
	    for(property in object) count = object.hasOwnProperty(property) ? count + 1: count;
	    return count;
	}

}

/*
	Object that handles messages 
*/	

var MessageBag = function(){

	var stack = {};
	var isJquery = false;

	/*
		public function that adds a new message to the stack
	*/	

	add = function( testName, testParameters, fieldName, parameters, MessageParameters,jQueryObject ){

		isJquery = jQueryObject;
		parameters.messages = parameters.messages ? parameters.messages : {};
		messageIndex = parameters.messages[fieldName + '.' + testName] ? fieldName + '.' + testName : testName;
		message  = parameters.messages[messageIndex] ? parameters.messages[messageIndex] : defaultMessages[testName];
		parsedString = message.replace(new RegExp(':attribute', 'g'), fieldName);

		if(jQueryObject){
			$Objects = jQuery('input, textarea, select').filter(function() { 
				return jQuery(this).data('validator_id') == fieldName;
			});
		}

		if(MessageParameters[testName]){
			jQuery.each(MessageParameters[testName], function(index, parameterName){
				parsedString = parsedString.replace(new RegExp(parameterName, 'g'), testParameters[index] );
			});
		}

		if(stack[fieldName]){
			stack[fieldName][testName] = parsedString;
		} else {
			stack[fieldName] = {};
			stack[fieldName][testName] = parsedString;
		}
		$Objects.data('messages', stack[fieldName]);
	}, this.add = add;

	/*
		public function that returns all the messages as an array
	*/	

	all = function(){
		var res = [];
		jQuery.each(stack, function(i, v){ 
			 jQuery.each(v, function(k, j){res.push(j) });
		});
		return res;
	}, this.all = all;

	/*
		public function that returns all the elements with messages
	*/	

	allElements = function(){
		var res = [];
		jQuery.each(stack, function(i, v){ 
			res.push(jQuery('input, textarea, select').filter(function() {return jQuery(this).data('validator_id') == i}))
		});
		return jQuery(res).map (function () {return this.toArray(); } );
	}, this.allElements = allElements;

	/*
		public function that checks if there are any messages
	*/	

	any = function(){
		return all().length > 0;
	}, this.any = any;

	/*
		public function that counts how many messages there are
	*/	

	count = function(){
		return all().length;
	}, this.count = count;

	/*
		public function that returns the first message on a particular field
	*/	

	first = function( field ){
		for (var first in stack[field]) break;
		return stack[field][first];
	}, this.first = first;

	/*
		public function that returns all the messages on a particular field
	*/	

	get = function( field ){
		return stack[field];
	}, this.get = get;

	/*
		public function that checks if a particular field has any messages
	*/	

	has = function( field ){
	   count = 0;
	   for(property in stack[field]) count = stack[field].hasOwnProperty(property) ? count + 1: count;
	   return typeof stack[field] != 'undefined' && count > 0;
	}, this.has = has;

}}}());
