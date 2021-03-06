var getUrlParams = function(queryString) {
	var params = [];
	if (!queryString) queryString = window.location.search.substring(1);
	if (queryString.length > 0) {
	    var vars = queryString.split("&");
	    for (var i = 0; i < vars.length; i++) {
	        var pair = vars[i].split("=");
	        var key = pair[0];
	        var val = pair[1];
	        if (key.length > 0 && val && val.length > 0) {
	        	//we at least need a key right
	        	
	        	//do the decoding. Do plus sign separately (not done by the native decode function)
	        	val = val.replace(/\+/g, ' ');
	        	val = decodeURIComponent(val);
	        	params.push({name: pair[0], value: val});
	        }
	    }
	}
    return params;
};

module.exports = {
	getCreateLinkHandler: function(tab) {
		return function() {
			var params = [
				{name: 'outputFormat', value: tab.yasr.options.output},
				{name: 'query', value: tab.yasqe.getValue()},
				{name: 'contentTypeConstruct', value: tab.persistentOptions.yasqe.sparql.acceptHeaderGraph},
				{name: 'contentTypeSelect', value: tab.persistentOptions.yasqe.sparql.acceptHeaderSelect},
				{name: 'endpoint', value: tab.persistentOptions.yasqe.sparql.endpoint},
				{name: 'requestMethod', value: tab.persistentOptions.yasqe.sparql.requestMethod},
				{name: 'tabTitle', value: tab.persistentOptions.name}
			];
			
			tab.persistentOptions.yasqe.sparql.args.forEach(function(paramPair){
				params.push(paramPair);
			});
			tab.persistentOptions.yasqe.sparql.namedGraphs.forEach(function(ng) {
				params.push({name: 'namedGraph', value: ng});
			});
			tab.persistentOptions.yasqe.sparql.defaultGraphs.forEach(function(dg){
				params.push({name: 'defaultGraph', value: dg});
			});
			
			//extend existing link, so first fetch current arguments. But: make sure we don't include items already used in share link
			var keys = [];
			params.forEach(function(paramPair){keys.push(paramPair.name)});
			var currentParams = getUrlParams();
			currentParams.forEach(function(paramPair) {
				if (keys.indexOf(paramPair.name) == -1) {
					params.push(paramPair);
				}
			});
			
			return params;
		}
	},
	getOptionsFromUrl: function() {
		var options = {yasqe: {sparql: {}}, yasr:{}};
		var params = getUrlParams();
		var validYasguiOptions = false;
		
		
		params.forEach(function(paramPair){
			if (paramPair.name == 'query') {
				validYasguiOptions = true;
				options.yasqe.value = paramPair.value;
			} else if (paramPair.name == 'outputFormat') {
				var output = paramPair.value;
				if (output == 'simpleTable') output = 'table';//this query link is from v1. don't have this plugin anymore
				options.yasr.output = output;
			} else if (paramPair.name == 'contentTypeConstruct') {
				options.yasqe.sparql.acceptHeaderGraph = paramPair.value;
			} else if (paramPair.name == 'contentTypeSelect') {
				options.yasqe.sparql.acceptHeaderSelect = paramPair.value;
			} else if (paramPair.name == 'endpoint') {
				options.yasqe.sparql.endpoint = paramPair.value;
			} else if (paramPair.name == 'requestMethod') {
				options.yasqe.sparql.requestMethod = paramPair.value;
			} else if (paramPair.name == 'tabTitle') {
				options.name = paramPair.value;
			} else if (paramPair.name == 'namedGraph') {
				if (!options.yasqe.namedGraphs) options.yasqe.namedGraphs = [];
				options.yasqe.sparql.namedGraphs.push(paramPair);
			} else if (paramPair.name == 'defaultGraph') {
				if (!options.yasqe.defaultGraphs) options.yasqe.defaultGraphs = [];
				options.yasqe.sparql.defaultGraphs.push(paramPair);
			} else {
				if (!options.yasqe.args) options.yasqe.args = [];
				//regular arguments. So store them as regular arguments
				options.yasqe.sparql.args.push(paramPair);
			}
		});
		if (validYasguiOptions) {
			return options;
		} else {
			return null;
		}
	}
}