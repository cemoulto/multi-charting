/**
 * MultiCharting Extension for FusionCharts
 * This module contains the basic routines required by subsequent modules to
 * extend/scale or add functionality to the MultiCharting object.
 *
 */

 /* global window: true */

(function (env, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = env.document ?
            factory(env) : function(win) {
                if (!win.document) {
                    throw new Error('Window with document not present');
                }
                return factory(win, true);
            };
    } else {
        env.MultiCharting = factory(env, true);
    }
})(typeof window !== 'undefined' ? window : this, function (_window, windowExists) {
    // In case MultiCharting already exists.
    if (_window.MultiCharting) {
        return;
    }

    var MultiCharting = function () {
    };

    MultiCharting.prototype.win = _window;

    if (windowExists) {
        _window.MultiCharting = MultiCharting;
    }
    return MultiCharting;
});


(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

	var merge = function (obj1, obj2, skipUndef, tgtArr, srcArr) {
            var item,
                srcVal,
                tgtVal,
                str,
                cRef,
                objectToStrFn = Object.prototype.toString,
                arrayToStr = '[object Array]',
                objectToStr = '[object Object]',
                checkCyclicRef = function(obj, parentArr) {
                    var i = parentArr.length,
                        bIndex = -1;

                    while (i--) {
                        if (obj === parentArr[i]) {
                            bIndex = i;
                            return bIndex;
                        }
                    }

                    return bIndex;
                },
                OBJECTSTRING = 'object';

            //check whether obj2 is an array
            //if array then iterate through it's index
            //**** MOOTOOLS precution

            if (!srcArr) {
                tgtArr = [obj1];
                srcArr = [obj2];
            }
            else {
                tgtArr.push(obj1);
                srcArr.push(obj2);
            }

            if (obj2 instanceof Array) {
                for (item = 0; item < obj2.length; item += 1) {
                    try {
                        srcVal = obj1[item];
                        tgtVal = obj2[item];
                    }
                    catch (e) {
                        continue;
                    }

                    if (typeof tgtVal !== OBJECTSTRING) {
                        if (!(skipUndef && tgtVal === undefined)) {
                            obj1[item] = tgtVal;
                        }
                    }
                    else {
                        if (srcVal === null || typeof srcVal !== OBJECTSTRING) {
                            srcVal = obj1[item] = tgtVal instanceof Array ? [] : {};
                        }
                        cRef = checkCyclicRef(tgtVal, srcArr);
                        if (cRef !== -1) {
                            srcVal = obj1[item] = tgtArr[cRef];
                        }
                        else {
                            merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                        }
                    }
                }
            }
            else {
                for (item in obj2) {
                    try {
                        srcVal = obj1[item];
                        tgtVal = obj2[item];
                    }
                    catch (e) {
                        continue;
                    }

                    if (tgtVal !== null && typeof tgtVal === OBJECTSTRING) {
                        // Fix for issue BUG: FWXT-602
                        // IE < 9 Object.prototype.toString.call(null) gives
                        // '[object Object]' instead of '[object Null]'
                        // that's why null value becomes Object in IE < 9
                        str = objectToStrFn.call(tgtVal);
                        if (str === objectToStr) {
                            if (srcVal === null || typeof srcVal !== OBJECTSTRING) {
                                srcVal = obj1[item] = {};
                            }
                            cRef = checkCyclicRef(tgtVal, srcArr);
                            if (cRef !== -1) {
                                srcVal = obj1[item] = tgtArr[cRef];
                            }
                            else {
                                merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                            }
                        }
                        else if (str === arrayToStr) {
                            if (srcVal === null || !(srcVal instanceof Array)) {
                                srcVal = obj1[item] = [];
                            }
                            cRef = checkCyclicRef(tgtVal, srcArr);
                            if (cRef !== -1) {
                                srcVal = obj1[item] = tgtArr[cRef];
                            }
                            else {
                                merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                            }
                        }
                        else {
                            obj1[item] = tgtVal;
                        }
                    }
                    else {
                        obj1[item] = tgtVal;
                    }
                }
            }
            return obj1;
        },
        extend2 = function (obj1, obj2, skipUndef) {
            var OBJECTSTRING = 'object';
            //if none of the arguments are object then return back
            if (typeof obj1 !== OBJECTSTRING && typeof obj2 !== OBJECTSTRING) {
                return null;
            }

            if (typeof obj2 !== OBJECTSTRING || obj2 === null) {
                return obj1;
            }

            if (typeof obj1 !== OBJECTSTRING) {
                obj1 = obj2 instanceof Array ? [] : {};
            }
            merge(obj1, obj2, skipUndef);
            return obj1;
        },
        lib = {
            extend2: extend2,
            merge: merge
        };

	MultiCharting.prototype.lib = (MultiCharting.prototype.lib || lib);

});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    /* jshint ignore:start */
    // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.


    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray (strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
                ){
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
            }
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
            } else {
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[ 3 ];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }
        // Return the parsed data.
        return( arrData );
    }
    /* jshint ignore:end */

    MultiCharting.prototype.convertToArray = function (data, delimiter, structure, callback) {
        var splitedData = data.split(/\r\n|\r|\n/),
            //total number of rows
            len = splitedData.length,
            //first row is header and spliting it into arrays
            header = CSVToArray(splitedData[0], delimiter), // jshint ignore:line
            i = 1,
            j = 0,
            k = 0,
            klen = 0,
            cell = [],
            min = Math.min,
            finalOb = [],
            updateManager = function () {
                var lim = 0,
                    jlen = 0,
                    obj = {};
                    lim = i + 3000;
                
                if (lim > len) {
                    lim = len;
                }
                
                for (; i < lim; ++i) {

                    //create cell array that cointain csv data
                    cell = CSVToArray(splitedData[i], delimiter); // jshint ignore:line
                    //take min of header length and total columns
                    jlen = min(header.length, cell.length);

                    if(structure === 1){
                        finalOb.push(cell);
                    }
                    else if(structure === 2){
                        for (j = 0; j < jlen; ++j) {                    
                            //creating the final object
                            obj[header[j]] = cell[j];
                        }
                        finalOb.push(obj);
                        obj = {};
                    }
                    else{
                        for (j = 0; j < jlen; ++j) {                    
                            //creating the final object
                            finalOb[header[j]].push(cell[j]);
                        }   
                    }
                }

                if (i < len - 1) {
                    //call update manager
                    setTimeout(updateManager, 0);
                } else {
                    callback && callback(finalOb);
                }
            };

        structure = structure || 1;

        //if the value is empty
        if (splitedData[splitedData.length - 1] === '') {
            splitedData.splice((splitedData.length - 1), 1);
            len--;
        }
        if (structure === 1){
            finalOb = [];
            finalOb.push(header);
        } else if(structure === 2) {
            finalOb = [];
        }else if(structure === 3){
            finalOb = {};
            for (k = 0, klen = header.length; k < klen; ++k) {
                finalOb[header[k]] = [];
            }   
        }

        updateManager();
    };

});


(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

	MultiCharting.prototype.createDataStore = function () {
		return new DataStore(arguments);
	};

	var	lib = MultiCharting.prototype.lib,
		dataStorage = lib.dataStorage = {},
		// For storing the child of a parent
		linkStore = {},
		//For storing the parent of a child
		parentStore = lib.parentStore = {},
		idCount = 0,
		// Constructor class for DataStore.
		DataStore = function () {
	    	var manager = this;
	    	manager.setData(arguments);
		},
		dataStoreProto = DataStore.prototype,

		//Function to update all the linked child data
		updataData = function (id) {
			var i,
				linkData = linkStore[id],
				parentData = dataStorage[id],
				filterStore = lib.filterStore,
				len,
				linkIds,
				filters,
				linkId,
				filter,
				filterFn,
				type,
				info,
				// Store all the dataObjs that are updated.
				tempDataUpdated = lib.tempDataUpdated = {};

			linkIds = linkData.link;
			filters = linkData.filter;
			len = linkIds.length;

			for (i = 0; i < len; i++) {
				linkId = linkIds[i];

				tempDataUpdated[linkId] = true;
				filter = filters[i];
				filterFn = filter.getFilter();
				type = filter.type;

				if (typeof filterFn === 'function') {
					if (filterStore[filter.id]) {
						dataStorage[linkId] = executeProcessor(type, filterFn, parentData);
					}
					else {
						dataStorage[linkId] = parentData;
						filter.splice(i, 1);
						i -= 1;
					}
				}
				
				if (linkStore[linkId]) {
					updataData(linkId);
				}
			}
		},

		// Function to execute the dataProcessor over the data
		executeProcessor = function (type, filterFn, JSONData) {
			switch (type) {
				case  'sort' : return Array.prototype.sort.call(JSONData, filterFn);
					break;
				case  'filter' : return Array.prototype.filter.call(JSONData, filterFn);
					break;
				case 'addInfo' :
				case 'reExpress' : return Array.prototype.map.call(JSONData, filterFn);
					break;
				default : return filterFn(JSONData);
			}
		},

		//Function to convert/get raw data into JSON data
		parseData = function (dataSpecs) {
			var	dataSource = dataSpecs.dataSource,
				dataType = dataSpecs.dataType,
				JSONData;

			switch(dataType) {
				case 'csv' : 
					break;
				case 'json' : 
				default : JSONData = dataSource;
			};

			return JSONData;
		};

	// Function to add data in the data store
	dataStoreProto.setData = function () {
		var data = this,
			oldId = data.id,
			argument = arguments[0],
			id = argument.id,
			oldJSONData = dataStorage[oldId] || [],
			JSONData = parseData(argument);

		id = oldId || id || 'dataStorage' + idCount ++;
		dataStorage[id] = oldJSONData.concat(JSONData || []);

		data.id = id;

		if (linkStore[id]) {
			updataData(id)
		}
		dispatchEvent(new CustomEvent('dataAdded', {'detail' : {
			'id': id,
			'data' : JSONData
		}}));
	};

	// Function to get the jsondata of the data object
	dataStoreProto.getJSON = function () {
		return dataStorage[this.id];
	};

	// Function to get child data object after applying filter on the parent data.
	// @params {filters} - This can be a filter function or an array of filter functions.
	dataStoreProto.getData = function (filters) {
		var data = this,
			id = data.id,
			filterLink = lib.filterLink;
		// If no parameter is present then return the unfiltered data.
		if (!filters) {
			return dataStorage[id];
		}
		// If parameter is an array of filter then return the filtered data after applying the filter over the data.
		else {
			let result = [],
				i,
				newData,
				linkData,
				newId,
				filter,
				filterFn,
				datalinks,
				filterID,
				type,
				isFilterArray = filters instanceof Array,
				len = isFilterArray ? filters.length : 1;

			for (i = 0; i < len; i++) {
				filter = filters[i] || filters;
				filterFn = filter.getFilter();
				type = filter.type;

				if (typeof filterFn === 'function') {
					newData = executeProcessor(type, filterFn, dataStorage[id]);

					newDataObj = new DataStore(newData);
					newId = newDataObj.id;
					parentStore[newId] = data;

					dataStorage[newId] = newData;
					result.push(newDataObj);

					//Pushing the id and filter of child class under the parent classes id.
					linkData = linkStore[id] || (linkStore[id] = {
						link : [],
						filter : []
					});
					linkData.link.push(newId);
					linkData.filter.push(filter);

					// Storing the data on which the filter is applied under the filter id.
					filterID = filter.getID();
					datalinks = filterLink[filterID] || (filterLink[filterID] = []);
					datalinks.push(newDataObj)

					// setting the current id as the newID so that the next filter is applied on the child data;
					id = newId;
					data = newDataObj;
				}
			}
			return (isFilterArray ? result : result[0]);
		}
	};

	// Function to delete the current data from the dataStorage and also all its childs recursively
	dataStoreProto.deleteData = function (optionalId) {
		var data = this,
			id = optionalId || data.id,
			linkData = linkStore[id],
			flag;

		if (linkData) {
			let i,
				link = linkData.link,
				len = link.length;
			for (i = 0; i < len; i ++) {
				data.deleteData(link[i]);
			}
			delete linkStore[id];
		}

		flag = delete dataStorage[id];
		dispatchEvent(new CustomEvent('dataDeleted', {'detail' : {
			'id': id,
		}}));
		return flag;
	};

	// Function to get the id of the current data
	dataStoreProto.getID = function () {
		return this.id;
	};

	// Function to modify data
	dataStoreProto.modifyData = function () {
		var data = this;

		dataStorage[id] = [];
		data.setData(arguments);
		dispatchEvent(new CustomEvent('dataModified', {'detail' : {
			'id': data.id
		}}));
	};

	// Function to add data to the dataStorage asynchronously via ajax
	dataStoreProto.setDataUrl = function () {
		var data = this,
			argument = arguments[0],
			dataSource = argument.dataSource,
			dataType = argument.dataType,
			callback = argument.callback,
			callbackArgs = argument.callbackArgs,
			JSONData;

		ajax = MultiCharting.prototype.ajax({
			url : dataSource,
			success : function(JSONString){
				JSONData = JSON.parse(JSONString);
				data.setData({
					dataSource : JSONData
				});

				if (typeof callback === 'function') {
					callback(callbackArgs);
				}
			},

			error : function(){
				if (typeof callback === 'function') {
					callback(callbackArgs);
				}
			}
		});
	};
});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

	MultiCharting.prototype.createDataProcessor = function () {
		return new DataProcessor(arguments);
	};

	var lib = MultiCharting.prototype.lib,
		filterStore = lib.filterStore = {},
		filterLink = lib.filterLink = {},
		filterIdCount = 0,
		dataStorage = lib.dataStorage,
		parentStore = lib.parentStore,
		
		// Constructor class for DataProcessor.
		DataProcessor = function () {
	    	var manager = this;
	    	manager.addRule(arguments);
		},
		
		dataProcessorProto = DataProcessor.prototype,

		// Function to update data on change of filter.
		updataFilterProcessor = function (id, copyParentToChild) {
			var i,
				data = filterLink[id],
				JSONData,
				datum,
				dataId,
				len = data.length;

			for (i = 0; i < len; i ++) {
				datum = data[i];
				dataId = datum.id;
				if (!lib.tempDataUpdated[dataId]) {
					if (parentStore[dataId] && dataStorage[dataId]) {
						JSONData = parentStore[dataId].getData();
						datum.modifyData(copyParentToChild ? JSONData : filterStore[id](JSONData));
					}
					else {
						delete parentStore[dataId];
					}
				}
			}
			lib.tempDataUpdated = {};
		};

	// Function to add filter in the filter store
	dataProcessorProto.addRule = function () {
		var filter = this,
			oldId = filter.id,
			argument = arguments[0],
			filterFn = argument.rule,
			id = argument.type,
			type = argument.type;

		id = oldId || id || 'filterStore' + filterIdCount ++;
		filterStore[id] = filterFn;

		filter.id = id;
		filter.type = type;

		// Update the data on which the filter is applied and also on the child data.
		if (filterLink[id]) {
			updataFilterProcessor(id);
		}

		dispatchEvent(new CustomEvent('filterAdded', {'detail' : {
			'id': id,
			'filter' : filterFn
		}}));
	};

	// Funtion to get the filter method.
	dataProcessorProto.getFilter = function () {
		return filterStore[this.id];
	};

	// Function to get the ID of the filter.
	dataProcessorProto.getID = function () {
		return this.id;
	};


	dataProcessorProto.deleteFilter = function () {
		var filter = this,
			id = filter.id;

		filterLink[id] && updataFilterProcessor(id, true);

		delete filterStore[id];
		delete filterLink[id];
	};

	dataProcessorProto.filter = function () {
		this.addRule(
			{	rule : arguments[0],
				type : 'filter'
			}
		);
	};

	dataProcessorProto.sort = function () {
		this.addRule(
			{	rule : arguments[0],
				type : 'sort'
			}
		);
	};

	dataProcessorProto.addInfo = function () {
		this.addRule(
			{	rule : arguments[0],
				type : 'addInfo'
			}
		);
	};

	dataProcessorProto.reExpress = function () {
		this.addRule(
			{	rule : arguments[0],
				type : 'reExpress'
			}
		);
	};
});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    MultiCharting.prototype.dataadapter = function () {
        return convertData(arguments[0]);
    };
    var extend2 = MultiCharting.prototype.lib.extend2;
    //function to convert data, it returns fc supported JSON
    function convertData() {
        var argument = arguments[0] || {},
            jsonData = argument.jsonData,
            configuration = argument.config,
            callbackFN = argument.callbackFN,
            jsonCreator = function(jsonData, configuration) {
                var conf = configuration,
                    seriesType = conf && conf.seriesType,
                    series = {
                        'ms' : function(jsonData, configuration) {
                            var json = {},
                                indexMatch,
                                lenDimension,
                                lenMeasure,
                                lenData,
                                i,
                                j;
                            json.categories = [
                                {
                                    "category": [                        
                                    ]
                                }
                            ];
                            json.dataset = [];
                            for (i = 0, lenDimension =  configuration.dimension.length; i < lenDimension; i++) {
                                indexMatch = jsonData[0].indexOf(configuration.dimension[i]);
                                if (indexMatch != -1) {
                                    for (j = 1, lenData = jsonData.length; j < lenData; j++) {
                                        json.categories[0].category.push({
                                            'label' : jsonData[j][indexMatch]
                                        });
                                    }
                                }
                            }
                            json.dataset = [];
                            for (i = 0, lenMeasure = configuration.measure.length; i < lenMeasure; i++) {
                                indexMatch = jsonData[0].indexOf(configuration.measure[i]);
                                if (indexMatch != -1) {
                                    json.dataset[i] = {
                                        'seriesname' : configuration.measure[i],
                                        'data': []
                                    };
                                    for(j = 1, lenData = jsonData.length; j < lenData; j++) {
                                        json.dataset[i].data.push({
                                            'value' : jsonData[j][indexMatch]
                                        });
                                    }
                                }
                            }
                            return json;
                        },
                        'ss' : function(jsonData, configuration) {
                            var json = {},
                                indexMatchLabel,
                                indexMatchValue,
                                lenDimension,
                                lenMeasure,
                                lenData,
                                i,
                                j,
                                label,
                                value;
                            json.data = [];
                            indexMatchLabel = jsonData[0].indexOf(configuration.dimension[0]);
                            indexMatchValue = jsonData[0].indexOf(configuration.measure[0]);
                            for (j = 1, lenData = jsonData.length; j < lenData; j++) {                  
                                label = jsonData[j][indexMatchLabel];                           
                                value = jsonData[j][indexMatchValue]; 
                                json.data.push({
                                    'label' : label || '',
                                    'value' : value || ''
                                });
                            }                   
                            return json;
                        },
                        'ts' : function(jsonData, configuration) {
                            var json = {},
                                indexMatch,
                                lenDimension,
                                lenMeasure,
                                lenData,
                                i,
                                j;
                            json.datasets = [];
                            json.datasets[0] = {};
                            json.datasets[0].category = {};
                            json.datasets[0].category.data = [];
                            for (i = 0, lenDimension =  configuration.dimension.length; i < lenDimension; i++) {
                                indexMatch = jsonData[0].indexOf(configuration.dimension[i]);
                                if (indexMatch != -1) {
                                    for (j = 1, lenData = jsonData.length; j < lenData; j++) {
                                        json.datasets[0].category.data.push(jsonData[j][indexMatch]);
                                    }
                                }
                            }
                            json.datasets[0].dataset = [];
                            json.datasets[0].dataset[0] = {};
                            json.datasets[0].dataset[0].series = [];
                            for (i = 0, lenMeasure = configuration.measure.length; i < lenMeasure; i++) {
                                indexMatch = jsonData[0].indexOf(configuration.measure[i]);
                                if (indexMatch != -1) {
                                    json.datasets[0].dataset[0].series[i] = {  
                                        'name' : configuration.measure[i],                              
                                        'data': []
                                    };
                                    for(j = 1, lenData = jsonData.length; j < lenData; j++) {
                                        json.datasets[0].dataset[0].series[i].data.push(jsonData[j][indexMatch]);
                                    }
                                }
                            }
                            return json;
                        }
                    };
                seriesType = seriesType && seriesType.toLowerCase();
                seriesType = (series[seriesType] && seriesType) || 'ms';
                return series[seriesType](jsonData, conf);
            },
            generalDataFormat = function(jsonData, configuration) {
                var isArray = Array.isArray(jsonData[0]),
                    generalDataArray = [],
                    i,
                    j,
                    len,
                    lenGeneralDataArray,
                    value;
                if (!isArray){
                    generalDataArray[0] = [];
                    generalDataArray[0].push(configuration.dimension);
                    generalDataArray[0] = generalDataArray[0][0].concat(configuration.measure);
                    for (i = 0, len = jsonData.length; i < len; i++) {
                        generalDataArray[i+1] = [];
                        for (j = 0, lenGeneralDataArray = generalDataArray[0].length; j < lenGeneralDataArray; j++) {
                            value = jsonData[i][generalDataArray[0][j]];                    
                            generalDataArray[i+1][j] = value || '';             
                        }
                    }
                } else {
                    return jsonData;
                }
                return generalDataArray;
            },
            dataArray,
            json,
            predefinedJson = configuration && configuration.config;

        if (jsonData && configuration) {
            dataArray = generalDataFormat(jsonData, configuration);
            json = jsonCreator(dataArray, configuration);
            json = (predefinedJson && extend2(json,predefinedJson)) || json;    
            return (callbackFN && callbackFN(json)) || json;    
        }
    }
});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    MultiCharting.prototype.createChart = function () {
        return new Chart(arguments[0]);
    };

    var Chart = function () {
            var chart = this;           
            chart.render(arguments[0]);
        },
        chartProto = Chart.prototype,
        extend2 = MultiCharting.prototype.lib.extend2,
        dataadapter = MultiCharting.prototype.dataadapter;

    chartProto.render = function () {
        var chart = this,
            argument =arguments[0] || {},
            configuration,
            callbackFN,
            jsonData,
            chartConfig = {},
            dataSource = {},
            configData = {};
        //parse argument into chartConfig 
        extend2(chartConfig,argument);
        
        //data configuration 
        configuration = chartConfig.configuration || {};
        configData.jsonData = chartConfig.jsonData;
        configData.callbackFN = configuration.callback;
        configData.config = configuration.data;

        //store fc supported json to render charts
        dataSource = dataadapter(configData);
        
        //delete data configuration parts for FC json converter
        delete chartConfig.jsonData;
        delete chartConfig.configuration;
        
        //set data source into chart configuration
        chartConfig.dataSource = dataSource;
        chart.chartObj = chartConfig;
        
        //render FC 
        var chart = new FusionCharts(chartConfig);
        chart.render();
    };
});
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    MultiCharting.prototype.createMatrix = function () {
        return new Matrix(arguments[0],arguments[1]);
    };
    
    var Matrix = function (selector, configuration) {
        var matrix = this;
        matrix.selector = selector;
        matrix.matrixContainer = document.getElementById(selector);
        matrix.configuration = configuration;
        matrix.defaultH = 100;
        matrix.defaultW = 100;
    };

    protoMatrix = Matrix.prototype;

    protoMatrix.draw = function(){
        var matrix = this,
            configuration = matrix && matrix.configuration || {},
            config = configuration.config,
            className = '',
            configManager = configuration && matrix && matrix.drawManager(configuration),
            len = configManager && configManager.length,
            placeHolder = [];
        // matrix.setAttrContainer();
        for(i = 0; i < len; i++) {
            placeHolder[i] = matrix.drawCell({
                    'height' : configManager[i].height,
                    'width' : configManager[i].width,
                    'top' : configManager[i].top,
                    'left' : configManager[i].left,
                    'id' : configManager[i].id
                });
        }
        matrix.placeHolder = [];
        matrix.placeHolder = placeHolder;
    };

    protoMatrix.drawCell = function(configuration, id, className) {
        var matrix = this,
            cell = document.createElement('div'),
            matrixContainer = matrix && matrix.matrixContainer;

        cell.id = configuration.id || '';
        cell.className = (configuration && configuration.purpose) || '' + ' cell ' + (className || '');
        cell.style.height = configuration &&  configuration.height + 'px';
        cell.style.width = configuration &&  configuration.width + 'px';
        cell.style.top = configuration && configuration.top + 'px';
        cell.style.left = configuration &&  configuration.left + 'px';
        cell.style.position = 'absolute';
        matrixContainer.appendChild(cell);

        return {
            config : {
                id : cell.id,
                height : cell.style.height,
                width : cell.style.width,
                top : cell.style.top,
                left : cell.style.left
            },
            graphics : cell
        };

    };

    protoMatrix.drawManager = function (configuration) {
        var matrix = this,
            i,
            j,
            lenRow = configuration.length,
            mapArr = matrix.matrixManager(configuration),
            processedConfig = matrix.setPlcHldr(mapArr, configuration),
            heightArr = matrix.getRowHeight(mapArr),
            widthArr = matrix.getColWidth(mapArr),
            drawManagerObjArr = [],
            lenRow,
            lenCell,
            matrixPosX = matrix.getPos(widthArr),
            matrixPosY = matrix.getPos(heightArr),
            rowspan,
            colspan,
            id,
            top,
            left,
            height,
            width;

        for (i = 0; i < lenRow; i++) {            
            for (j = 0, lenCell = configuration[i].length; j < lenCell; j++) {
                rowspan = parseInt(configuration[i][j] && configuration[i][j].rowspan || 1);
                colspan = parseInt(configuration[i][j] && configuration[i][j].colspan || 1);
                id = configuration[i][j] && configuration[i][j].id;
                row = parseInt(configuration[i][j].row);
                col = parseInt(configuration[i][j].col);
                left = matrixPosX[col];
                top = matrixPosY[row];
                width = matrixPosX[col + colspan] - left;
                height = matrixPosY[row + rowspan] - top;

                drawManagerObjArr.push({
                    top : top,
                    left : left,
                    height : height,
                    width : width,
                    id : id
                });
            }
        }
       
        return drawManagerObjArr;
    };

    protoMatrix.getPos =  function(src){
        var arr = [],
            i = 0,
            len = src && src.length;

        for(; i <= len; i++){
            arr.push(i ? (src[i-1]+arr[i-1]) : 0);
        }

        return arr;
    };

    protoMatrix.setPlcHldr = function(mapArr, configuration){
        var matrix = this,
            row,
            col,
            i,
            j,
            lenR,
            lenC;

        for(i = 0, lenR = mapArr.length; i < lenR; i++){ 
            for(j = 0, lenC = mapArr[i].length; j < lenC; j++){
                row = mapArr[i][j].id.split('-')[0];
                col = mapArr[i][j].id.split('-')[1];

                configuration[row][col].row = configuration[row][col].row === undefined ? i : configuration[row][col].row;
                configuration[row][col].col = configuration[row][col].col === undefined ? j : configuration[row][col].col;
            }
        }
        return configuration;
    };

    protoMatrix.getRowHeight = function(mapArr) {
        var i,
            j,
            lenRow = mapArr && mapArr.length,
            lenCol,
            height = [],
            currHeight,
            maxHeight;
            
        for (i = 0; i < lenRow; i++) {
            for(j = 0, maxHeight = 0, lenCol = mapArr[i].length; j < lenCol; j++) {
                currHeight = mapArr[i][j].height;
                maxHeight = maxHeight < currHeight ? currHeight : maxHeight;
            }
            height[i] = maxHeight;
        }

        return height;
    };

    protoMatrix.getColWidth = function(mapArr) {
        var i = 0,
            j = 0,
            lenRow = mapArr && mapArr.length,
            lenCol,
            width = [],
            currWidth,
            maxWidth;
        for (i = 0, lenCol = mapArr[j].length; i < lenCol; i++){
            for(j = 0, maxWidth = 0; j < lenRow; j++) {
                currWidth = mapArr[j][i].width;        
                maxWidth = maxWidth < currWidth ? currWidth : maxWidth;
            }
            width[i] = maxWidth;
        }

        return width;
    };

    protoMatrix.matrixManager = function (configuration) {
        var matrix = this,
            mapArr = [],
            i,
            j,
            k,
            l,
            lenRow = configuration.length,
            lenCell,
            rowSpan,
            colSpan,
            width,
            height,
            defaultH = matrix.defaultH,
            defaultW = matrix.defaultW,
            offset;
            
        for (i = 0; i < lenRow; i++) {            
            for (j = 0, lenCell = configuration[i].length; j < lenCell; j++) {
            
                rowSpan = (configuration[i][j] && configuration[i][j].rowspan) || 1;
                colSpan = (configuration[i][j] && configuration[i][j].colspan) || 1;   
                
                width = (configuration[i][j] && configuration[i][j].width);
                width = (width && (width / colSpan)) || defaultW;  
                
                height = (configuration[i][j] && configuration[i][j].height);
                height = (height && (height / rowSpan)) || defaultH;                      
                for (k = 0, offset = 0; k < rowSpan; k++) {
                    for (l = 0; l < colSpan; l++) {
                        
                        mapArr[i + k] = mapArr[i + k] ? mapArr[i + k] : [];                        
                        offset = j + l;
                        
                        while(mapArr[i + k][offset]) {
                            offset++;
                        }
                        
                        mapArr[i + k][offset] = { 
                            id : (i + '-' + j),
                            width : width,
                            height : height
                        };
                    }
                }
            }
        }

        return mapArr;
    };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1c2lvbmNoYXJ0cy5tdWx0aWNoYXJ0aW5nLmpzIiwibXVsdGljaGFydGluZy5saWIuanMiLCJtdWx0aWNoYXJ0aW5nLmNzdi5qcyIsIm11bHRpY2hhcnRpbmcuZGF0YXN0b3JlLmpzIiwibXVsdGljaGFydGluZy5kYXRhcHJvY2Vzc29yLmpzIiwibXVsdGljaGFydGluZy5kYXRhYWRhcHRlci5qcyIsIm11bHRpY2hhcnRpbmcuY3JlYXRlY2hhcnQuanMiLCJtdWx0aWNoYXJ0aW5nLm1hdHJpeC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmdXNpb25jaGFydHMubXVsdGljaGFydGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTXVsdGlDaGFydGluZyBFeHRlbnNpb24gZm9yIEZ1c2lvbkNoYXJ0c1xuICogVGhpcyBtb2R1bGUgY29udGFpbnMgdGhlIGJhc2ljIHJvdXRpbmVzIHJlcXVpcmVkIGJ5IHN1YnNlcXVlbnQgbW9kdWxlcyB0b1xuICogZXh0ZW5kL3NjYWxlIG9yIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBNdWx0aUNoYXJ0aW5nIG9iamVjdC5cbiAqXG4gKi9cblxuIC8qIGdsb2JhbCB3aW5kb3c6IHRydWUgKi9cblxuKGZ1bmN0aW9uIChlbnYsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBlbnYuZG9jdW1lbnQgP1xuICAgICAgICAgICAgZmFjdG9yeShlbnYpIDogZnVuY3Rpb24od2luKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF3aW4uZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaW5kb3cgd2l0aCBkb2N1bWVudCBub3QgcHJlc2VudCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFjdG9yeSh3aW4sIHRydWUpO1xuICAgICAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbnYuTXVsdGlDaGFydGluZyA9IGZhY3RvcnkoZW52LCB0cnVlKTtcbiAgICB9XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uIChfd2luZG93LCB3aW5kb3dFeGlzdHMpIHtcbiAgICAvLyBJbiBjYXNlIE11bHRpQ2hhcnRpbmcgYWxyZWFkeSBleGlzdHMuXG4gICAgaWYgKF93aW5kb3cuTXVsdGlDaGFydGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIE11bHRpQ2hhcnRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgfTtcblxuICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLndpbiA9IF93aW5kb3c7XG5cbiAgICBpZiAod2luZG93RXhpc3RzKSB7XG4gICAgICAgIF93aW5kb3cuTXVsdGlDaGFydGluZyA9IE11bHRpQ2hhcnRpbmc7XG4gICAgfVxuICAgIHJldHVybiBNdWx0aUNoYXJ0aW5nO1xufSk7XG4iLCJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cblx0dmFyIG1lcmdlID0gZnVuY3Rpb24gKG9iajEsIG9iajIsIHNraXBVbmRlZiwgdGd0QXJyLCBzcmNBcnIpIHtcbiAgICAgICAgICAgIHZhciBpdGVtLFxuICAgICAgICAgICAgICAgIHNyY1ZhbCxcbiAgICAgICAgICAgICAgICB0Z3RWYWwsXG4gICAgICAgICAgICAgICAgc3RyLFxuICAgICAgICAgICAgICAgIGNSZWYsXG4gICAgICAgICAgICAgICAgb2JqZWN0VG9TdHJGbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJyYXlUb1N0ciA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgICAgICAgICAgICAgb2JqZWN0VG9TdHIgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICAgICAgICAgICAgICBjaGVja0N5Y2xpY1JlZiA9IGZ1bmN0aW9uKG9iaiwgcGFyZW50QXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gcGFyZW50QXJyLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmogPT09IHBhcmVudEFycltpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiSW5kZXg7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBPQkpFQ1RTVFJJTkcgPSAnb2JqZWN0JztcblxuICAgICAgICAgICAgLy9jaGVjayB3aGV0aGVyIG9iajIgaXMgYW4gYXJyYXlcbiAgICAgICAgICAgIC8vaWYgYXJyYXkgdGhlbiBpdGVyYXRlIHRocm91Z2ggaXQncyBpbmRleFxuICAgICAgICAgICAgLy8qKioqIE1PT1RPT0xTIHByZWN1dGlvblxuXG4gICAgICAgICAgICBpZiAoIXNyY0Fycikge1xuICAgICAgICAgICAgICAgIHRndEFyciA9IFtvYmoxXTtcbiAgICAgICAgICAgICAgICBzcmNBcnIgPSBbb2JqMl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Z3RBcnIucHVzaChvYmoxKTtcbiAgICAgICAgICAgICAgICBzcmNBcnIucHVzaChvYmoyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9iajIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgIGZvciAoaXRlbSA9IDA7IGl0ZW0gPCBvYmoyLmxlbmd0aDsgaXRlbSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGd0VmFsID0gb2JqMltpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRndFZhbCAhPT0gT0JKRUNUU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShza2lwVW5kZWYgJiYgdGd0VmFsID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqMVtpdGVtXSA9IHRndFZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcmNWYWwgPT09IG51bGwgfHwgdHlwZW9mIHNyY1ZhbCAhPT0gT0JKRUNUU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjVmFsID0gb2JqMVtpdGVtXSA9IHRndFZhbCBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNSZWYgPSBjaGVja0N5Y2xpY1JlZih0Z3RWYWwsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY1JlZiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0gdGd0QXJyW2NSZWZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2Uoc3JjVmFsLCB0Z3RWYWwsIHNraXBVbmRlZiwgdGd0QXJyLCBzcmNBcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChpdGVtIGluIG9iajIpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1ZhbCA9IG9iajFbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0Z3RWYWwgPSBvYmoyW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0Z3RWYWwgIT09IG51bGwgJiYgdHlwZW9mIHRndFZhbCA9PT0gT0JKRUNUU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXggZm9yIGlzc3VlIEJVRzogRldYVC02MDJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElFIDwgOSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobnVsbCkgZ2l2ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdbb2JqZWN0IE9iamVjdF0nIGluc3RlYWQgb2YgJ1tvYmplY3QgTnVsbF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGF0J3Mgd2h5IG51bGwgdmFsdWUgYmVjb21lcyBPYmplY3QgaW4gSUUgPCA5XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSBvYmplY3RUb1N0ckZuLmNhbGwodGd0VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHIgPT09IG9iamVjdFRvU3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNyY1ZhbCA9PT0gbnVsbCB8fCB0eXBlb2Ygc3JjVmFsICE9PSBPQkpFQ1RTVFJJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjVmFsID0gb2JqMVtpdGVtXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjUmVmID0gY2hlY2tDeWNsaWNSZWYodGd0VmFsLCBzcmNBcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjUmVmICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0gdGd0QXJyW2NSZWZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2Uoc3JjVmFsLCB0Z3RWYWwsIHNraXBVbmRlZiwgdGd0QXJyLCBzcmNBcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0ciA9PT0gYXJyYXlUb1N0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcmNWYWwgPT09IG51bGwgfHwgIShzcmNWYWwgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjVmFsID0gb2JqMVtpdGVtXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjUmVmID0gY2hlY2tDeWNsaWNSZWYodGd0VmFsLCBzcmNBcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjUmVmICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0gdGd0QXJyW2NSZWZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2Uoc3JjVmFsLCB0Z3RWYWwsIHNraXBVbmRlZiwgdGd0QXJyLCBzcmNBcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iajFbaXRlbV0gPSB0Z3RWYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmoxW2l0ZW1dID0gdGd0VmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9iajE7XG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVuZDIgPSBmdW5jdGlvbiAob2JqMSwgb2JqMiwgc2tpcFVuZGVmKSB7XG4gICAgICAgICAgICB2YXIgT0JKRUNUU1RSSU5HID0gJ29iamVjdCc7XG4gICAgICAgICAgICAvL2lmIG5vbmUgb2YgdGhlIGFyZ3VtZW50cyBhcmUgb2JqZWN0IHRoZW4gcmV0dXJuIGJhY2tcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqMSAhPT0gT0JKRUNUU1RSSU5HICYmIHR5cGVvZiBvYmoyICE9PSBPQkpFQ1RTVFJJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmoyICE9PSBPQkpFQ1RTVFJJTkcgfHwgb2JqMiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmoxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iajEgIT09IE9CSkVDVFNUUklORykge1xuICAgICAgICAgICAgICAgIG9iajEgPSBvYmoyIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVyZ2Uob2JqMSwgb2JqMiwgc2tpcFVuZGVmKTtcbiAgICAgICAgICAgIHJldHVybiBvYmoxO1xuICAgICAgICB9LFxuICAgICAgICBsaWIgPSB7XG4gICAgICAgICAgICBleHRlbmQyOiBleHRlbmQyLFxuICAgICAgICAgICAgbWVyZ2U6IG1lcmdlXG4gICAgICAgIH07XG5cblx0TXVsdGlDaGFydGluZy5wcm90b3R5cGUubGliID0gKE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmxpYiB8fCBsaWIpO1xuXG59KTsiLCJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cbiAgICAvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4gICAgLy8gU291cmNlOiBodHRwOi8vd3d3LmJlbm5hZGVsLmNvbS9ibG9nLzE1MDQtQXNrLUJlbi1QYXJzaW5nLUNTVi1TdHJpbmdzLVdpdGgtSmF2YXNjcmlwdC1FeGVjLVJlZ3VsYXItRXhwcmVzc2lvbi1Db21tYW5kLmh0bVxuICAgIC8vIFRoaXMgd2lsbCBwYXJzZSBhIGRlbGltaXRlZCBzdHJpbmcgaW50byBhbiBhcnJheSBvZlxuICAgIC8vIGFycmF5cy4gVGhlIGRlZmF1bHQgZGVsaW1pdGVyIGlzIHRoZSBjb21tYSwgYnV0IHRoaXNcbiAgICAvLyBjYW4gYmUgb3ZlcnJpZGVuIGluIHRoZSBzZWNvbmQgYXJndW1lbnQuXG5cblxuICAgIC8vIFRoaXMgd2lsbCBwYXJzZSBhIGRlbGltaXRlZCBzdHJpbmcgaW50byBhbiBhcnJheSBvZlxuICAgIC8vIGFycmF5cy4gVGhlIGRlZmF1bHQgZGVsaW1pdGVyIGlzIHRoZSBjb21tYSwgYnV0IHRoaXNcbiAgICAvLyBjYW4gYmUgb3ZlcnJpZGVuIGluIHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgZnVuY3Rpb24gQ1NWVG9BcnJheSAoc3RyRGF0YSwgc3RyRGVsaW1pdGVyKSB7XG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZGVsaW1pdGVyIGlzIGRlZmluZWQuIElmIG5vdCxcbiAgICAgICAgLy8gdGhlbiBkZWZhdWx0IHRvIGNvbW1hLlxuICAgICAgICBzdHJEZWxpbWl0ZXIgPSAoc3RyRGVsaW1pdGVyIHx8IFwiLFwiKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHBhcnNlIHRoZSBDU1YgdmFsdWVzLlxuICAgICAgICB2YXIgb2JqUGF0dGVybiA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgLy8gRGVsaW1pdGVycy5cbiAgICAgICAgICAgICAgICBcIihcXFxcXCIgKyBzdHJEZWxpbWl0ZXIgKyBcInxcXFxccj9cXFxcbnxcXFxccnxeKVwiICtcbiAgICAgICAgICAgICAgICAvLyBRdW90ZWQgZmllbGRzLlxuICAgICAgICAgICAgICAgIFwiKD86XFxcIihbXlxcXCJdKig/OlxcXCJcXFwiW15cXFwiXSopKilcXFwifFwiICtcbiAgICAgICAgICAgICAgICAvLyBTdGFuZGFyZCBmaWVsZHMuXG4gICAgICAgICAgICAgICAgXCIoW15cXFwiXFxcXFwiICsgc3RyRGVsaW1pdGVyICsgXCJcXFxcclxcXFxuXSopKVwiXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgXCJnaVwiXG4gICAgICAgICAgICApO1xuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gaG9sZCBvdXIgZGF0YS4gR2l2ZSB0aGUgYXJyYXlcbiAgICAgICAgLy8gYSBkZWZhdWx0IGVtcHR5IGZpcnN0IHJvdy5cbiAgICAgICAgdmFyIGFyckRhdGEgPSBbW11dO1xuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gaG9sZCBvdXIgaW5kaXZpZHVhbCBwYXR0ZXJuXG4gICAgICAgIC8vIG1hdGNoaW5nIGdyb3Vwcy5cbiAgICAgICAgdmFyIGFyck1hdGNoZXMgPSBudWxsO1xuICAgICAgICAvLyBLZWVwIGxvb3Bpbmcgb3ZlciB0aGUgcmVndWxhciBleHByZXNzaW9uIG1hdGNoZXNcbiAgICAgICAgLy8gdW50aWwgd2UgY2FuIG5vIGxvbmdlciBmaW5kIGEgbWF0Y2guXG4gICAgICAgIHdoaWxlIChhcnJNYXRjaGVzID0gb2JqUGF0dGVybi5leGVjKCBzdHJEYXRhICkpe1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBkZWxpbWl0ZXIgdGhhdCB3YXMgZm91bmQuXG4gICAgICAgICAgICB2YXIgc3RyTWF0Y2hlZERlbGltaXRlciA9IGFyck1hdGNoZXNbIDEgXTtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZ2l2ZW4gZGVsaW1pdGVyIGhhcyBhIGxlbmd0aFxuICAgICAgICAgICAgLy8gKGlzIG5vdCB0aGUgc3RhcnQgb2Ygc3RyaW5nKSBhbmQgaWYgaXQgbWF0Y2hlc1xuICAgICAgICAgICAgLy8gZmllbGQgZGVsaW1pdGVyLiBJZiBpZCBkb2VzIG5vdCwgdGhlbiB3ZSBrbm93XG4gICAgICAgICAgICAvLyB0aGF0IHRoaXMgZGVsaW1pdGVyIGlzIGEgcm93IGRlbGltaXRlci5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBzdHJNYXRjaGVkRGVsaW1pdGVyLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIChzdHJNYXRjaGVkRGVsaW1pdGVyICE9IHN0ckRlbGltaXRlcilcbiAgICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdlIGhhdmUgcmVhY2hlZCBhIG5ldyByb3cgb2YgZGF0YSxcbiAgICAgICAgICAgICAgICAvLyBhZGQgYW4gZW1wdHkgcm93IHRvIG91ciBkYXRhIGFycmF5LlxuICAgICAgICAgICAgICAgIGFyckRhdGEucHVzaCggW10gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgb3VyIGRlbGltaXRlciBvdXQgb2YgdGhlIHdheSxcbiAgICAgICAgICAgIC8vIGxldCdzIGNoZWNrIHRvIHNlZSB3aGljaCBraW5kIG9mIHZhbHVlIHdlXG4gICAgICAgICAgICAvLyBjYXB0dXJlZCAocXVvdGVkIG9yIHVucXVvdGVkKS5cbiAgICAgICAgICAgIGlmIChhcnJNYXRjaGVzWyAyIF0pe1xuICAgICAgICAgICAgICAgIC8vIFdlIGZvdW5kIGEgcXVvdGVkIHZhbHVlLiBXaGVuIHdlIGNhcHR1cmVcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHZhbHVlLCB1bmVzY2FwZSBhbnkgZG91YmxlIHF1b3Rlcy5cbiAgICAgICAgICAgICAgICB2YXIgc3RyTWF0Y2hlZFZhbHVlID0gYXJyTWF0Y2hlc1sgMiBdLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoIFwiXFxcIlxcXCJcIiwgXCJnXCIgKSxcbiAgICAgICAgICAgICAgICAgICAgXCJcXFwiXCJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgZm91bmQgYSBub24tcXVvdGVkIHZhbHVlLlxuICAgICAgICAgICAgICAgIHZhciBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWyAzIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIG91ciB2YWx1ZSBzdHJpbmcsIGxldCdzIGFkZFxuICAgICAgICAgICAgLy8gaXQgdG8gdGhlIGRhdGEgYXJyYXkuXG4gICAgICAgICAgICBhcnJEYXRhWyBhcnJEYXRhLmxlbmd0aCAtIDEgXS5wdXNoKCBzdHJNYXRjaGVkVmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXR1cm4gdGhlIHBhcnNlZCBkYXRhLlxuICAgICAgICByZXR1cm4oIGFyckRhdGEgKTtcbiAgICB9XG4gICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cblxuICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmNvbnZlcnRUb0FycmF5ID0gZnVuY3Rpb24gKGRhdGEsIGRlbGltaXRlciwgc3RydWN0dXJlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc3BsaXRlZERhdGEgPSBkYXRhLnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pLFxuICAgICAgICAgICAgLy90b3RhbCBudW1iZXIgb2Ygcm93c1xuICAgICAgICAgICAgbGVuID0gc3BsaXRlZERhdGEubGVuZ3RoLFxuICAgICAgICAgICAgLy9maXJzdCByb3cgaXMgaGVhZGVyIGFuZCBzcGxpdGluZyBpdCBpbnRvIGFycmF5c1xuICAgICAgICAgICAgaGVhZGVyID0gQ1NWVG9BcnJheShzcGxpdGVkRGF0YVswXSwgZGVsaW1pdGVyKSwgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICBpID0gMSxcbiAgICAgICAgICAgIGogPSAwLFxuICAgICAgICAgICAgayA9IDAsXG4gICAgICAgICAgICBrbGVuID0gMCxcbiAgICAgICAgICAgIGNlbGwgPSBbXSxcbiAgICAgICAgICAgIG1pbiA9IE1hdGgubWluLFxuICAgICAgICAgICAgZmluYWxPYiA9IFtdLFxuICAgICAgICAgICAgdXBkYXRlTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGltID0gMCxcbiAgICAgICAgICAgICAgICAgICAgamxlbiA9IDAsXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBsaW0gPSBpICsgMzAwMDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAobGltID4gbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbSA9IGxlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yICg7IGkgPCBsaW07ICsraSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGNlbGwgYXJyYXkgdGhhdCBjb2ludGFpbiBjc3YgZGF0YVxuICAgICAgICAgICAgICAgICAgICBjZWxsID0gQ1NWVG9BcnJheShzcGxpdGVkRGF0YVtpXSwgZGVsaW1pdGVyKTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAgICAgICAgIC8vdGFrZSBtaW4gb2YgaGVhZGVyIGxlbmd0aCBhbmQgdG90YWwgY29sdW1uc1xuICAgICAgICAgICAgICAgICAgICBqbGVuID0gbWluKGhlYWRlci5sZW5ndGgsIGNlbGwubGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihzdHJ1Y3R1cmUgPT09IDEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxPYi5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYoc3RydWN0dXJlID09PSAyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBqbGVuOyArK2opIHsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRpbmcgdGhlIGZpbmFsIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialtoZWFkZXJbal1dID0gY2VsbFtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsT2IucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBqbGVuOyArK2opIHsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRpbmcgdGhlIGZpbmFsIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsT2JbaGVhZGVyW2pdXS5wdXNoKGNlbGxbal0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2FsbCB1cGRhdGUgbWFuYWdlclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHVwZGF0ZU1hbmFnZXIsIDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGZpbmFsT2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgc3RydWN0dXJlID0gc3RydWN0dXJlIHx8IDE7XG5cbiAgICAgICAgLy9pZiB0aGUgdmFsdWUgaXMgZW1wdHlcbiAgICAgICAgaWYgKHNwbGl0ZWREYXRhW3NwbGl0ZWREYXRhLmxlbmd0aCAtIDFdID09PSAnJykge1xuICAgICAgICAgICAgc3BsaXRlZERhdGEuc3BsaWNlKChzcGxpdGVkRGF0YS5sZW5ndGggLSAxKSwgMSk7XG4gICAgICAgICAgICBsZW4tLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RydWN0dXJlID09PSAxKXtcbiAgICAgICAgICAgIGZpbmFsT2IgPSBbXTtcbiAgICAgICAgICAgIGZpbmFsT2IucHVzaChoZWFkZXIpO1xuICAgICAgICB9IGVsc2UgaWYoc3RydWN0dXJlID09PSAyKSB7XG4gICAgICAgICAgICBmaW5hbE9iID0gW107XG4gICAgICAgIH1lbHNlIGlmKHN0cnVjdHVyZSA9PT0gMyl7XG4gICAgICAgICAgICBmaW5hbE9iID0ge307XG4gICAgICAgICAgICBmb3IgKGsgPSAwLCBrbGVuID0gaGVhZGVyLmxlbmd0aDsgayA8IGtsZW47ICsraykge1xuICAgICAgICAgICAgICAgIGZpbmFsT2JbaGVhZGVyW2tdXSA9IFtdO1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlTWFuYWdlcigpO1xuICAgIH07XG5cbn0pO1xuIiwiXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cblx0TXVsdGlDaGFydGluZy5wcm90b3R5cGUuY3JlYXRlRGF0YVN0b3JlID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgRGF0YVN0b3JlKGFyZ3VtZW50cyk7XG5cdH07XG5cblx0dmFyXHRsaWIgPSBNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5saWIsXG5cdFx0ZGF0YVN0b3JhZ2UgPSBsaWIuZGF0YVN0b3JhZ2UgPSB7fSxcblx0XHQvLyBGb3Igc3RvcmluZyB0aGUgY2hpbGQgb2YgYSBwYXJlbnRcblx0XHRsaW5rU3RvcmUgPSB7fSxcblx0XHQvL0ZvciBzdG9yaW5nIHRoZSBwYXJlbnQgb2YgYSBjaGlsZFxuXHRcdHBhcmVudFN0b3JlID0gbGliLnBhcmVudFN0b3JlID0ge30sXG5cdFx0aWRDb3VudCA9IDAsXG5cdFx0Ly8gQ29uc3RydWN0b3IgY2xhc3MgZm9yIERhdGFTdG9yZS5cblx0XHREYXRhU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICBcdHZhciBtYW5hZ2VyID0gdGhpcztcblx0ICAgIFx0bWFuYWdlci5zZXREYXRhKGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkYXRhU3RvcmVQcm90byA9IERhdGFTdG9yZS5wcm90b3R5cGUsXG5cblx0XHQvL0Z1bmN0aW9uIHRvIHVwZGF0ZSBhbGwgdGhlIGxpbmtlZCBjaGlsZCBkYXRhXG5cdFx0dXBkYXRhRGF0YSA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0dmFyIGksXG5cdFx0XHRcdGxpbmtEYXRhID0gbGlua1N0b3JlW2lkXSxcblx0XHRcdFx0cGFyZW50RGF0YSA9IGRhdGFTdG9yYWdlW2lkXSxcblx0XHRcdFx0ZmlsdGVyU3RvcmUgPSBsaWIuZmlsdGVyU3RvcmUsXG5cdFx0XHRcdGxlbixcblx0XHRcdFx0bGlua0lkcyxcblx0XHRcdFx0ZmlsdGVycyxcblx0XHRcdFx0bGlua0lkLFxuXHRcdFx0XHRmaWx0ZXIsXG5cdFx0XHRcdGZpbHRlckZuLFxuXHRcdFx0XHR0eXBlLFxuXHRcdFx0XHRpbmZvLFxuXHRcdFx0XHQvLyBTdG9yZSBhbGwgdGhlIGRhdGFPYmpzIHRoYXQgYXJlIHVwZGF0ZWQuXG5cdFx0XHRcdHRlbXBEYXRhVXBkYXRlZCA9IGxpYi50ZW1wRGF0YVVwZGF0ZWQgPSB7fTtcblxuXHRcdFx0bGlua0lkcyA9IGxpbmtEYXRhLmxpbms7XG5cdFx0XHRmaWx0ZXJzID0gbGlua0RhdGEuZmlsdGVyO1xuXHRcdFx0bGVuID0gbGlua0lkcy5sZW5ndGg7XG5cblx0XHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRsaW5rSWQgPSBsaW5rSWRzW2ldO1xuXG5cdFx0XHRcdHRlbXBEYXRhVXBkYXRlZFtsaW5rSWRdID0gdHJ1ZTtcblx0XHRcdFx0ZmlsdGVyID0gZmlsdGVyc1tpXTtcblx0XHRcdFx0ZmlsdGVyRm4gPSBmaWx0ZXIuZ2V0RmlsdGVyKCk7XG5cdFx0XHRcdHR5cGUgPSBmaWx0ZXIudHlwZTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGZpbHRlckZuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0aWYgKGZpbHRlclN0b3JlW2ZpbHRlci5pZF0pIHtcblx0XHRcdFx0XHRcdGRhdGFTdG9yYWdlW2xpbmtJZF0gPSBleGVjdXRlUHJvY2Vzc29yKHR5cGUsIGZpbHRlckZuLCBwYXJlbnREYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRkYXRhU3RvcmFnZVtsaW5rSWRdID0gcGFyZW50RGF0YTtcblx0XHRcdFx0XHRcdGZpbHRlci5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRpIC09IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobGlua1N0b3JlW2xpbmtJZF0pIHtcblx0XHRcdFx0XHR1cGRhdGFEYXRhKGxpbmtJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8gRnVuY3Rpb24gdG8gZXhlY3V0ZSB0aGUgZGF0YVByb2Nlc3NvciBvdmVyIHRoZSBkYXRhXG5cdFx0ZXhlY3V0ZVByb2Nlc3NvciA9IGZ1bmN0aW9uICh0eXBlLCBmaWx0ZXJGbiwgSlNPTkRhdGEpIHtcblx0XHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0XHRjYXNlICAnc29ydCcgOiByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvcnQuY2FsbChKU09ORGF0YSwgZmlsdGVyRm4pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICAnZmlsdGVyJyA6IHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwoSlNPTkRhdGEsIGZpbHRlckZuKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnYWRkSW5mbycgOlxuXHRcdFx0XHRjYXNlICdyZUV4cHJlc3MnIDogcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChKU09ORGF0YSwgZmlsdGVyRm4pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0IDogcmV0dXJuIGZpbHRlckZuKEpTT05EYXRhKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9GdW5jdGlvbiB0byBjb252ZXJ0L2dldCByYXcgZGF0YSBpbnRvIEpTT04gZGF0YVxuXHRcdHBhcnNlRGF0YSA9IGZ1bmN0aW9uIChkYXRhU3BlY3MpIHtcblx0XHRcdHZhclx0ZGF0YVNvdXJjZSA9IGRhdGFTcGVjcy5kYXRhU291cmNlLFxuXHRcdFx0XHRkYXRhVHlwZSA9IGRhdGFTcGVjcy5kYXRhVHlwZSxcblx0XHRcdFx0SlNPTkRhdGE7XG5cblx0XHRcdHN3aXRjaChkYXRhVHlwZSkge1xuXHRcdFx0XHRjYXNlICdjc3YnIDogXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2pzb24nIDogXG5cdFx0XHRcdGRlZmF1bHQgOiBKU09ORGF0YSA9IGRhdGFTb3VyY2U7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gSlNPTkRhdGE7XG5cdFx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBhZGQgZGF0YSBpbiB0aGUgZGF0YSBzdG9yZVxuXHRkYXRhU3RvcmVQcm90by5zZXREYXRhID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBkYXRhID0gdGhpcyxcblx0XHRcdG9sZElkID0gZGF0YS5pZCxcblx0XHRcdGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdLFxuXHRcdFx0aWQgPSBhcmd1bWVudC5pZCxcblx0XHRcdG9sZEpTT05EYXRhID0gZGF0YVN0b3JhZ2Vbb2xkSWRdIHx8IFtdLFxuXHRcdFx0SlNPTkRhdGEgPSBwYXJzZURhdGEoYXJndW1lbnQpO1xuXG5cdFx0aWQgPSBvbGRJZCB8fCBpZCB8fCAnZGF0YVN0b3JhZ2UnICsgaWRDb3VudCArKztcblx0XHRkYXRhU3RvcmFnZVtpZF0gPSBvbGRKU09ORGF0YS5jb25jYXQoSlNPTkRhdGEgfHwgW10pO1xuXG5cdFx0ZGF0YS5pZCA9IGlkO1xuXG5cdFx0aWYgKGxpbmtTdG9yZVtpZF0pIHtcblx0XHRcdHVwZGF0YURhdGEoaWQpXG5cdFx0fVxuXHRcdGRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRhQWRkZWQnLCB7J2RldGFpbCcgOiB7XG5cdFx0XHQnaWQnOiBpZCxcblx0XHRcdCdkYXRhJyA6IEpTT05EYXRhXG5cdFx0fX0pKTtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBnZXQgdGhlIGpzb25kYXRhIG9mIHRoZSBkYXRhIG9iamVjdFxuXHRkYXRhU3RvcmVQcm90by5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBkYXRhU3RvcmFnZVt0aGlzLmlkXTtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBnZXQgY2hpbGQgZGF0YSBvYmplY3QgYWZ0ZXIgYXBwbHlpbmcgZmlsdGVyIG9uIHRoZSBwYXJlbnQgZGF0YS5cblx0Ly8gQHBhcmFtcyB7ZmlsdGVyc30gLSBUaGlzIGNhbiBiZSBhIGZpbHRlciBmdW5jdGlvbiBvciBhbiBhcnJheSBvZiBmaWx0ZXIgZnVuY3Rpb25zLlxuXHRkYXRhU3RvcmVQcm90by5nZXREYXRhID0gZnVuY3Rpb24gKGZpbHRlcnMpIHtcblx0XHR2YXIgZGF0YSA9IHRoaXMsXG5cdFx0XHRpZCA9IGRhdGEuaWQsXG5cdFx0XHRmaWx0ZXJMaW5rID0gbGliLmZpbHRlckxpbms7XG5cdFx0Ly8gSWYgbm8gcGFyYW1ldGVyIGlzIHByZXNlbnQgdGhlbiByZXR1cm4gdGhlIHVuZmlsdGVyZWQgZGF0YS5cblx0XHRpZiAoIWZpbHRlcnMpIHtcblx0XHRcdHJldHVybiBkYXRhU3RvcmFnZVtpZF07XG5cdFx0fVxuXHRcdC8vIElmIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiBmaWx0ZXIgdGhlbiByZXR1cm4gdGhlIGZpbHRlcmVkIGRhdGEgYWZ0ZXIgYXBwbHlpbmcgdGhlIGZpbHRlciBvdmVyIHRoZSBkYXRhLlxuXHRcdGVsc2Uge1xuXHRcdFx0bGV0IHJlc3VsdCA9IFtdLFxuXHRcdFx0XHRpLFxuXHRcdFx0XHRuZXdEYXRhLFxuXHRcdFx0XHRsaW5rRGF0YSxcblx0XHRcdFx0bmV3SWQsXG5cdFx0XHRcdGZpbHRlcixcblx0XHRcdFx0ZmlsdGVyRm4sXG5cdFx0XHRcdGRhdGFsaW5rcyxcblx0XHRcdFx0ZmlsdGVySUQsXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdGlzRmlsdGVyQXJyYXkgPSBmaWx0ZXJzIGluc3RhbmNlb2YgQXJyYXksXG5cdFx0XHRcdGxlbiA9IGlzRmlsdGVyQXJyYXkgPyBmaWx0ZXJzLmxlbmd0aCA6IDE7XG5cblx0XHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRmaWx0ZXIgPSBmaWx0ZXJzW2ldIHx8IGZpbHRlcnM7XG5cdFx0XHRcdGZpbHRlckZuID0gZmlsdGVyLmdldEZpbHRlcigpO1xuXHRcdFx0XHR0eXBlID0gZmlsdGVyLnR5cGU7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBmaWx0ZXJGbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdG5ld0RhdGEgPSBleGVjdXRlUHJvY2Vzc29yKHR5cGUsIGZpbHRlckZuLCBkYXRhU3RvcmFnZVtpZF0pO1xuXG5cdFx0XHRcdFx0bmV3RGF0YU9iaiA9IG5ldyBEYXRhU3RvcmUobmV3RGF0YSk7XG5cdFx0XHRcdFx0bmV3SWQgPSBuZXdEYXRhT2JqLmlkO1xuXHRcdFx0XHRcdHBhcmVudFN0b3JlW25ld0lkXSA9IGRhdGE7XG5cblx0XHRcdFx0XHRkYXRhU3RvcmFnZVtuZXdJZF0gPSBuZXdEYXRhO1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ld0RhdGFPYmopO1xuXG5cdFx0XHRcdFx0Ly9QdXNoaW5nIHRoZSBpZCBhbmQgZmlsdGVyIG9mIGNoaWxkIGNsYXNzIHVuZGVyIHRoZSBwYXJlbnQgY2xhc3NlcyBpZC5cblx0XHRcdFx0XHRsaW5rRGF0YSA9IGxpbmtTdG9yZVtpZF0gfHwgKGxpbmtTdG9yZVtpZF0gPSB7XG5cdFx0XHRcdFx0XHRsaW5rIDogW10sXG5cdFx0XHRcdFx0XHRmaWx0ZXIgOiBbXVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGxpbmtEYXRhLmxpbmsucHVzaChuZXdJZCk7XG5cdFx0XHRcdFx0bGlua0RhdGEuZmlsdGVyLnB1c2goZmlsdGVyKTtcblxuXHRcdFx0XHRcdC8vIFN0b3JpbmcgdGhlIGRhdGEgb24gd2hpY2ggdGhlIGZpbHRlciBpcyBhcHBsaWVkIHVuZGVyIHRoZSBmaWx0ZXIgaWQuXG5cdFx0XHRcdFx0ZmlsdGVySUQgPSBmaWx0ZXIuZ2V0SUQoKTtcblx0XHRcdFx0XHRkYXRhbGlua3MgPSBmaWx0ZXJMaW5rW2ZpbHRlcklEXSB8fCAoZmlsdGVyTGlua1tmaWx0ZXJJRF0gPSBbXSk7XG5cdFx0XHRcdFx0ZGF0YWxpbmtzLnB1c2gobmV3RGF0YU9iailcblxuXHRcdFx0XHRcdC8vIHNldHRpbmcgdGhlIGN1cnJlbnQgaWQgYXMgdGhlIG5ld0lEIHNvIHRoYXQgdGhlIG5leHQgZmlsdGVyIGlzIGFwcGxpZWQgb24gdGhlIGNoaWxkIGRhdGE7XG5cdFx0XHRcdFx0aWQgPSBuZXdJZDtcblx0XHRcdFx0XHRkYXRhID0gbmV3RGF0YU9iajtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIChpc0ZpbHRlckFycmF5ID8gcmVzdWx0IDogcmVzdWx0WzBdKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gZGVsZXRlIHRoZSBjdXJyZW50IGRhdGEgZnJvbSB0aGUgZGF0YVN0b3JhZ2UgYW5kIGFsc28gYWxsIGl0cyBjaGlsZHMgcmVjdXJzaXZlbHlcblx0ZGF0YVN0b3JlUHJvdG8uZGVsZXRlRGF0YSA9IGZ1bmN0aW9uIChvcHRpb25hbElkKSB7XG5cdFx0dmFyIGRhdGEgPSB0aGlzLFxuXHRcdFx0aWQgPSBvcHRpb25hbElkIHx8IGRhdGEuaWQsXG5cdFx0XHRsaW5rRGF0YSA9IGxpbmtTdG9yZVtpZF0sXG5cdFx0XHRmbGFnO1xuXG5cdFx0aWYgKGxpbmtEYXRhKSB7XG5cdFx0XHRsZXQgaSxcblx0XHRcdFx0bGluayA9IGxpbmtEYXRhLmxpbmssXG5cdFx0XHRcdGxlbiA9IGxpbmsubGVuZ3RoO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgaSArKykge1xuXHRcdFx0XHRkYXRhLmRlbGV0ZURhdGEobGlua1tpXSk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgbGlua1N0b3JlW2lkXTtcblx0XHR9XG5cblx0XHRmbGFnID0gZGVsZXRlIGRhdGFTdG9yYWdlW2lkXTtcblx0XHRkaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0YURlbGV0ZWQnLCB7J2RldGFpbCcgOiB7XG5cdFx0XHQnaWQnOiBpZCxcblx0XHR9fSkpO1xuXHRcdHJldHVybiBmbGFnO1xuXHR9O1xuXG5cdC8vIEZ1bmN0aW9uIHRvIGdldCB0aGUgaWQgb2YgdGhlIGN1cnJlbnQgZGF0YVxuXHRkYXRhU3RvcmVQcm90by5nZXRJRCA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBtb2RpZnkgZGF0YVxuXHRkYXRhU3RvcmVQcm90by5tb2RpZnlEYXRhID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBkYXRhID0gdGhpcztcblxuXHRcdGRhdGFTdG9yYWdlW2lkXSA9IFtdO1xuXHRcdGRhdGEuc2V0RGF0YShhcmd1bWVudHMpO1xuXHRcdGRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRhTW9kaWZpZWQnLCB7J2RldGFpbCcgOiB7XG5cdFx0XHQnaWQnOiBkYXRhLmlkXG5cdFx0fX0pKTtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBhZGQgZGF0YSB0byB0aGUgZGF0YVN0b3JhZ2UgYXN5bmNocm9ub3VzbHkgdmlhIGFqYXhcblx0ZGF0YVN0b3JlUHJvdG8uc2V0RGF0YVVybCA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgZGF0YSA9IHRoaXMsXG5cdFx0XHRhcmd1bWVudCA9IGFyZ3VtZW50c1swXSxcblx0XHRcdGRhdGFTb3VyY2UgPSBhcmd1bWVudC5kYXRhU291cmNlLFxuXHRcdFx0ZGF0YVR5cGUgPSBhcmd1bWVudC5kYXRhVHlwZSxcblx0XHRcdGNhbGxiYWNrID0gYXJndW1lbnQuY2FsbGJhY2ssXG5cdFx0XHRjYWxsYmFja0FyZ3MgPSBhcmd1bWVudC5jYWxsYmFja0FyZ3MsXG5cdFx0XHRKU09ORGF0YTtcblxuXHRcdGFqYXggPSBNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5hamF4KHtcblx0XHRcdHVybCA6IGRhdGFTb3VyY2UsXG5cdFx0XHRzdWNjZXNzIDogZnVuY3Rpb24oSlNPTlN0cmluZyl7XG5cdFx0XHRcdEpTT05EYXRhID0gSlNPTi5wYXJzZShKU09OU3RyaW5nKTtcblx0XHRcdFx0ZGF0YS5zZXREYXRhKHtcblx0XHRcdFx0XHRkYXRhU291cmNlIDogSlNPTkRhdGFcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGNhbGxiYWNrQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdGVycm9yIDogZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGNhbGxiYWNrQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fTtcbn0pOyIsIlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShNdWx0aUNoYXJ0aW5nKTtcbiAgICB9XG59KShmdW5jdGlvbiAoTXVsdGlDaGFydGluZykge1xuXG5cdE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmNyZWF0ZURhdGFQcm9jZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRhUHJvY2Vzc29yKGFyZ3VtZW50cyk7XG5cdH07XG5cblx0dmFyIGxpYiA9IE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmxpYixcblx0XHRmaWx0ZXJTdG9yZSA9IGxpYi5maWx0ZXJTdG9yZSA9IHt9LFxuXHRcdGZpbHRlckxpbmsgPSBsaWIuZmlsdGVyTGluayA9IHt9LFxuXHRcdGZpbHRlcklkQ291bnQgPSAwLFxuXHRcdGRhdGFTdG9yYWdlID0gbGliLmRhdGFTdG9yYWdlLFxuXHRcdHBhcmVudFN0b3JlID0gbGliLnBhcmVudFN0b3JlLFxuXHRcdFxuXHRcdC8vIENvbnN0cnVjdG9yIGNsYXNzIGZvciBEYXRhUHJvY2Vzc29yLlxuXHRcdERhdGFQcm9jZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICBcdHZhciBtYW5hZ2VyID0gdGhpcztcblx0ICAgIFx0bWFuYWdlci5hZGRSdWxlKGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRcblx0XHRkYXRhUHJvY2Vzc29yUHJvdG8gPSBEYXRhUHJvY2Vzc29yLnByb3RvdHlwZSxcblxuXHRcdC8vIEZ1bmN0aW9uIHRvIHVwZGF0ZSBkYXRhIG9uIGNoYW5nZSBvZiBmaWx0ZXIuXG5cdFx0dXBkYXRhRmlsdGVyUHJvY2Vzc29yID0gZnVuY3Rpb24gKGlkLCBjb3B5UGFyZW50VG9DaGlsZCkge1xuXHRcdFx0dmFyIGksXG5cdFx0XHRcdGRhdGEgPSBmaWx0ZXJMaW5rW2lkXSxcblx0XHRcdFx0SlNPTkRhdGEsXG5cdFx0XHRcdGRhdHVtLFxuXHRcdFx0XHRkYXRhSWQsXG5cdFx0XHRcdGxlbiA9IGRhdGEubGVuZ3RoO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICsrKSB7XG5cdFx0XHRcdGRhdHVtID0gZGF0YVtpXTtcblx0XHRcdFx0ZGF0YUlkID0gZGF0dW0uaWQ7XG5cdFx0XHRcdGlmICghbGliLnRlbXBEYXRhVXBkYXRlZFtkYXRhSWRdKSB7XG5cdFx0XHRcdFx0aWYgKHBhcmVudFN0b3JlW2RhdGFJZF0gJiYgZGF0YVN0b3JhZ2VbZGF0YUlkXSkge1xuXHRcdFx0XHRcdFx0SlNPTkRhdGEgPSBwYXJlbnRTdG9yZVtkYXRhSWRdLmdldERhdGEoKTtcblx0XHRcdFx0XHRcdGRhdHVtLm1vZGlmeURhdGEoY29weVBhcmVudFRvQ2hpbGQgPyBKU09ORGF0YSA6IGZpbHRlclN0b3JlW2lkXShKU09ORGF0YSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBwYXJlbnRTdG9yZVtkYXRhSWRdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bGliLnRlbXBEYXRhVXBkYXRlZCA9IHt9O1xuXHRcdH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gYWRkIGZpbHRlciBpbiB0aGUgZmlsdGVyIHN0b3JlXG5cdGRhdGFQcm9jZXNzb3JQcm90by5hZGRSdWxlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBmaWx0ZXIgPSB0aGlzLFxuXHRcdFx0b2xkSWQgPSBmaWx0ZXIuaWQsXG5cdFx0XHRhcmd1bWVudCA9IGFyZ3VtZW50c1swXSxcblx0XHRcdGZpbHRlckZuID0gYXJndW1lbnQucnVsZSxcblx0XHRcdGlkID0gYXJndW1lbnQudHlwZSxcblx0XHRcdHR5cGUgPSBhcmd1bWVudC50eXBlO1xuXG5cdFx0aWQgPSBvbGRJZCB8fCBpZCB8fCAnZmlsdGVyU3RvcmUnICsgZmlsdGVySWRDb3VudCArKztcblx0XHRmaWx0ZXJTdG9yZVtpZF0gPSBmaWx0ZXJGbjtcblxuXHRcdGZpbHRlci5pZCA9IGlkO1xuXHRcdGZpbHRlci50eXBlID0gdHlwZTtcblxuXHRcdC8vIFVwZGF0ZSB0aGUgZGF0YSBvbiB3aGljaCB0aGUgZmlsdGVyIGlzIGFwcGxpZWQgYW5kIGFsc28gb24gdGhlIGNoaWxkIGRhdGEuXG5cdFx0aWYgKGZpbHRlckxpbmtbaWRdKSB7XG5cdFx0XHR1cGRhdGFGaWx0ZXJQcm9jZXNzb3IoaWQpO1xuXHRcdH1cblxuXHRcdGRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdmaWx0ZXJBZGRlZCcsIHsnZGV0YWlsJyA6IHtcblx0XHRcdCdpZCc6IGlkLFxuXHRcdFx0J2ZpbHRlcicgOiBmaWx0ZXJGblxuXHRcdH19KSk7XG5cdH07XG5cblx0Ly8gRnVudGlvbiB0byBnZXQgdGhlIGZpbHRlciBtZXRob2QuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5nZXRGaWx0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGZpbHRlclN0b3JlW3RoaXMuaWRdO1xuXHR9O1xuXG5cdC8vIEZ1bmN0aW9uIHRvIGdldCB0aGUgSUQgb2YgdGhlIGZpbHRlci5cblx0ZGF0YVByb2Nlc3NvclByb3RvLmdldElEID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLmlkO1xuXHR9O1xuXG5cblx0ZGF0YVByb2Nlc3NvclByb3RvLmRlbGV0ZUZpbHRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgZmlsdGVyID0gdGhpcyxcblx0XHRcdGlkID0gZmlsdGVyLmlkO1xuXG5cdFx0ZmlsdGVyTGlua1tpZF0gJiYgdXBkYXRhRmlsdGVyUHJvY2Vzc29yKGlkLCB0cnVlKTtcblxuXHRcdGRlbGV0ZSBmaWx0ZXJTdG9yZVtpZF07XG5cdFx0ZGVsZXRlIGZpbHRlckxpbmtbaWRdO1xuXHR9O1xuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5maWx0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5hZGRSdWxlKFxuXHRcdFx0e1x0cnVsZSA6IGFyZ3VtZW50c1swXSxcblx0XHRcdFx0dHlwZSA6ICdmaWx0ZXInXG5cdFx0XHR9XG5cdFx0KTtcblx0fTtcblxuXHRkYXRhUHJvY2Vzc29yUHJvdG8uc29ydCA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFkZFJ1bGUoXG5cdFx0XHR7XHRydWxlIDogYXJndW1lbnRzWzBdLFxuXHRcdFx0XHR0eXBlIDogJ3NvcnQnXG5cdFx0XHR9XG5cdFx0KTtcblx0fTtcblxuXHRkYXRhUHJvY2Vzc29yUHJvdG8uYWRkSW5mbyA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFkZFJ1bGUoXG5cdFx0XHR7XHRydWxlIDogYXJndW1lbnRzWzBdLFxuXHRcdFx0XHR0eXBlIDogJ2FkZEluZm8nXG5cdFx0XHR9XG5cdFx0KTtcblx0fTtcblxuXHRkYXRhUHJvY2Vzc29yUHJvdG8ucmVFeHByZXNzID0gZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYWRkUnVsZShcblx0XHRcdHtcdHJ1bGUgOiBhcmd1bWVudHNbMF0sXG5cdFx0XHRcdHR5cGUgOiAncmVFeHByZXNzJ1xuXHRcdFx0fVxuXHRcdCk7XG5cdH07XG59KTsiLCJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoTXVsdGlDaGFydGluZyk7XG4gICAgfVxufSkoZnVuY3Rpb24gKE11bHRpQ2hhcnRpbmcpIHtcblxuICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmRhdGFhZGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29udmVydERhdGEoYXJndW1lbnRzWzBdKTtcbiAgICB9O1xuICAgIHZhciBleHRlbmQyID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUubGliLmV4dGVuZDI7XG4gICAgLy9mdW5jdGlvbiB0byBjb252ZXJ0IGRhdGEsIGl0IHJldHVybnMgZmMgc3VwcG9ydGVkIEpTT05cbiAgICBmdW5jdGlvbiBjb252ZXJ0RGF0YSgpIHtcbiAgICAgICAgdmFyIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdIHx8IHt9LFxuICAgICAgICAgICAganNvbkRhdGEgPSBhcmd1bWVudC5qc29uRGF0YSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSBhcmd1bWVudC5jb25maWcsXG4gICAgICAgICAgICBjYWxsYmFja0ZOID0gYXJndW1lbnQuY2FsbGJhY2tGTixcbiAgICAgICAgICAgIGpzb25DcmVhdG9yID0gZnVuY3Rpb24oanNvbkRhdGEsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZiA9IGNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc1R5cGUgPSBjb25mICYmIGNvbmYuc2VyaWVzVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ21zJyA6IGZ1bmN0aW9uKGpzb25EYXRhLCBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGpzb24gPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuRGltZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5NZWFzdXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5EYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uY2F0ZWdvcmllcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXRlZ29yeVwiOiBbICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbkRpbWVuc2lvbiA9ICBjb25maWd1cmF0aW9uLmRpbWVuc2lvbi5sZW5ndGg7IGkgPCBsZW5EaW1lbnNpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoID0ganNvbkRhdGFbMF0uaW5kZXhPZihjb25maWd1cmF0aW9uLmRpbWVuc2lvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleE1hdGNoICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbi5jYXRlZ29yaWVzWzBdLmNhdGVnb3J5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbGFiZWwnIDoganNvbkRhdGFbal1baW5kZXhNYXRjaF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBsZW5NZWFzdXJlID0gY29uZmlndXJhdGlvbi5tZWFzdXJlLmxlbmd0aDsgaSA8IGxlbk1lYXN1cmU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoID0ganNvbkRhdGFbMF0uaW5kZXhPZihjb25maWd1cmF0aW9uLm1lYXN1cmVbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXhNYXRjaCAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhc2V0W2ldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZXJpZXNuYW1lJyA6IGNvbmZpZ3VyYXRpb24ubWVhc3VyZVtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YSc6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhc2V0W2ldLmRhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScgOiBqc29uRGF0YVtqXVtpbmRleE1hdGNoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc29uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcycgOiBmdW5jdGlvbihqc29uRGF0YSwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqc29uID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4TWF0Y2hMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5EaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbk1lYXN1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbkRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGEgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoTGFiZWwgPSBqc29uRGF0YVswXS5pbmRleE9mKGNvbmZpZ3VyYXRpb24uZGltZW5zaW9uWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoVmFsdWUgPSBqc29uRGF0YVswXS5pbmRleE9mKGNvbmZpZ3VyYXRpb24ubWVhc3VyZVswXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMSwgbGVuRGF0YSA9IGpzb25EYXRhLmxlbmd0aDsgaiA8IGxlbkRhdGE7IGorKykgeyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGpzb25EYXRhW2pdW2luZGV4TWF0Y2hMYWJlbF07ICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0ganNvbkRhdGFbal1baW5kZXhNYXRjaFZhbHVlXTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsYWJlbCcgOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScgOiB2YWx1ZSB8fCAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc29uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0cycgOiBmdW5jdGlvbihqc29uRGF0YSwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqc29uID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4TWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbkRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuTWVhc3VyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhc2V0c1swXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldHNbMF0uY2F0ZWdvcnkgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRzWzBdLmNhdGVnb3J5LmRhdGEgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBsZW5EaW1lbnNpb24gPSAgY29uZmlndXJhdGlvbi5kaW1lbnNpb24ubGVuZ3RoOyBpIDwgbGVuRGltZW5zaW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCA9IGpzb25EYXRhWzBdLmluZGV4T2YoY29uZmlndXJhdGlvbi5kaW1lbnNpb25baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXhNYXRjaCAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMSwgbGVuRGF0YSA9IGpzb25EYXRhLmxlbmd0aDsgaiA8IGxlbkRhdGE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldHNbMF0uY2F0ZWdvcnkuZGF0YS5wdXNoKGpzb25EYXRhW2pdW2luZGV4TWF0Y2hdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRzWzBdLmRhdGFzZXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRzWzBdLmRhdGFzZXRbMF0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRzWzBdLmRhdGFzZXRbMF0uc2VyaWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuTWVhc3VyZSA9IGNvbmZpZ3VyYXRpb24ubWVhc3VyZS5sZW5ndGg7IGkgPCBsZW5NZWFzdXJlOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCA9IGpzb25EYXRhWzBdLmluZGV4T2YoY29uZmlndXJhdGlvbi5tZWFzdXJlW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4TWF0Y2ggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldHNbMF0uZGF0YXNldFswXS5zZXJpZXNbaV0gPSB7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZScgOiBjb25maWd1cmF0aW9uLm1lYXN1cmVbaV0sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihqID0gMSwgbGVuRGF0YSA9IGpzb25EYXRhLmxlbmd0aDsgaiA8IGxlbkRhdGE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldHNbMF0uZGF0YXNldFswXS5zZXJpZXNbaV0uZGF0YS5wdXNoKGpzb25EYXRhW2pdW2luZGV4TWF0Y2hdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXJpZXNUeXBlID0gc2VyaWVzVHlwZSAmJiBzZXJpZXNUeXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgc2VyaWVzVHlwZSA9IChzZXJpZXNbc2VyaWVzVHlwZV0gJiYgc2VyaWVzVHlwZSkgfHwgJ21zJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VyaWVzW3Nlcmllc1R5cGVdKGpzb25EYXRhLCBjb25mKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZW5lcmFsRGF0YUZvcm1hdCA9IGZ1bmN0aW9uKGpzb25EYXRhLCBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGpzb25EYXRhWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhbERhdGFBcnJheSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICBqLFxuICAgICAgICAgICAgICAgICAgICBsZW4sXG4gICAgICAgICAgICAgICAgICAgIGxlbkdlbmVyYWxEYXRhQXJyYXksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICghaXNBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYWxEYXRhQXJyYXlbMF0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhbERhdGFBcnJheVswXS5wdXNoKGNvbmZpZ3VyYXRpb24uZGltZW5zaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhbERhdGFBcnJheVswXSA9IGdlbmVyYWxEYXRhQXJyYXlbMF1bMF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubWVhc3VyZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGpzb25EYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmFsRGF0YUFycmF5W2krMV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDAsIGxlbkdlbmVyYWxEYXRhQXJyYXkgPSBnZW5lcmFsRGF0YUFycmF5WzBdLmxlbmd0aDsgaiA8IGxlbkdlbmVyYWxEYXRhQXJyYXk7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0ganNvbkRhdGFbaV1bZ2VuZXJhbERhdGFBcnJheVswXVtqXV07ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmFsRGF0YUFycmF5W2krMV1bal0gPSB2YWx1ZSB8fCAnJzsgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNvbkRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBnZW5lcmFsRGF0YUFycmF5O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFBcnJheSxcbiAgICAgICAgICAgIGpzb24sXG4gICAgICAgICAgICBwcmVkZWZpbmVkSnNvbiA9IGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5jb25maWc7XG5cbiAgICAgICAgaWYgKGpzb25EYXRhICYmIGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgIGRhdGFBcnJheSA9IGdlbmVyYWxEYXRhRm9ybWF0KGpzb25EYXRhLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIGpzb24gPSBqc29uQ3JlYXRvcihkYXRhQXJyYXksIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAganNvbiA9IChwcmVkZWZpbmVkSnNvbiAmJiBleHRlbmQyKGpzb24scHJlZGVmaW5lZEpzb24pKSB8fCBqc29uOyAgICBcbiAgICAgICAgICAgIHJldHVybiAoY2FsbGJhY2tGTiAmJiBjYWxsYmFja0ZOKGpzb24pKSB8fCBqc29uOyAgICBcbiAgICAgICAgfVxuICAgIH1cbn0pOyIsIlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShNdWx0aUNoYXJ0aW5nKTtcbiAgICB9XG59KShmdW5jdGlvbiAoTXVsdGlDaGFydGluZykge1xuXG4gICAgTXVsdGlDaGFydGluZy5wcm90b3R5cGUuY3JlYXRlQ2hhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2hhcnQoYXJndW1lbnRzWzBdKTtcbiAgICB9O1xuXG4gICAgdmFyIENoYXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0ID0gdGhpczsgICAgICAgICAgIFxuICAgICAgICAgICAgY2hhcnQucmVuZGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoYXJ0UHJvdG8gPSBDaGFydC5wcm90b3R5cGUsXG4gICAgICAgIGV4dGVuZDIgPSBNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5saWIuZXh0ZW5kMixcbiAgICAgICAgZGF0YWFkYXB0ZXIgPSBNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5kYXRhYWRhcHRlcjtcblxuICAgIGNoYXJ0UHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hhcnQgPSB0aGlzLFxuICAgICAgICAgICAgYXJndW1lbnQgPWFyZ3VtZW50c1swXSB8fCB7fSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICBjYWxsYmFja0ZOLFxuICAgICAgICAgICAganNvbkRhdGEsXG4gICAgICAgICAgICBjaGFydENvbmZpZyA9IHt9LFxuICAgICAgICAgICAgZGF0YVNvdXJjZSA9IHt9LFxuICAgICAgICAgICAgY29uZmlnRGF0YSA9IHt9O1xuICAgICAgICAvL3BhcnNlIGFyZ3VtZW50IGludG8gY2hhcnRDb25maWcgXG4gICAgICAgIGV4dGVuZDIoY2hhcnRDb25maWcsYXJndW1lbnQpO1xuICAgICAgICBcbiAgICAgICAgLy9kYXRhIGNvbmZpZ3VyYXRpb24gXG4gICAgICAgIGNvbmZpZ3VyYXRpb24gPSBjaGFydENvbmZpZy5jb25maWd1cmF0aW9uIHx8IHt9O1xuICAgICAgICBjb25maWdEYXRhLmpzb25EYXRhID0gY2hhcnRDb25maWcuanNvbkRhdGE7XG4gICAgICAgIGNvbmZpZ0RhdGEuY2FsbGJhY2tGTiA9IGNvbmZpZ3VyYXRpb24uY2FsbGJhY2s7XG4gICAgICAgIGNvbmZpZ0RhdGEuY29uZmlnID0gY29uZmlndXJhdGlvbi5kYXRhO1xuXG4gICAgICAgIC8vc3RvcmUgZmMgc3VwcG9ydGVkIGpzb24gdG8gcmVuZGVyIGNoYXJ0c1xuICAgICAgICBkYXRhU291cmNlID0gZGF0YWFkYXB0ZXIoY29uZmlnRGF0YSk7XG4gICAgICAgIFxuICAgICAgICAvL2RlbGV0ZSBkYXRhIGNvbmZpZ3VyYXRpb24gcGFydHMgZm9yIEZDIGpzb24gY29udmVydGVyXG4gICAgICAgIGRlbGV0ZSBjaGFydENvbmZpZy5qc29uRGF0YTtcbiAgICAgICAgZGVsZXRlIGNoYXJ0Q29uZmlnLmNvbmZpZ3VyYXRpb247XG4gICAgICAgIFxuICAgICAgICAvL3NldCBkYXRhIHNvdXJjZSBpbnRvIGNoYXJ0IGNvbmZpZ3VyYXRpb25cbiAgICAgICAgY2hhcnRDb25maWcuZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgICAgIGNoYXJ0LmNoYXJ0T2JqID0gY2hhcnRDb25maWc7XG4gICAgICAgIFxuICAgICAgICAvL3JlbmRlciBGQyBcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IEZ1c2lvbkNoYXJ0cyhjaGFydENvbmZpZyk7XG4gICAgICAgIGNoYXJ0LnJlbmRlcigpO1xuICAgIH07XG59KTsiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cbiAgICBNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5jcmVhdGVNYXRyaXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4KGFyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0pO1xuICAgIH07XG4gICAgXG4gICAgdmFyIE1hdHJpeCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29uZmlndXJhdGlvbikge1xuICAgICAgICB2YXIgbWF0cml4ID0gdGhpcztcbiAgICAgICAgbWF0cml4LnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIG1hdHJpeC5tYXRyaXhDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgICAgIG1hdHJpeC5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcbiAgICAgICAgbWF0cml4LmRlZmF1bHRIID0gMTAwO1xuICAgICAgICBtYXRyaXguZGVmYXVsdFcgPSAxMDA7XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4ID0gTWF0cml4LnByb3RvdHlwZTtcblxuICAgIHByb3RvTWF0cml4LmRyYXcgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWF0cml4ID0gdGhpcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSBtYXRyaXggJiYgbWF0cml4LmNvbmZpZ3VyYXRpb24gfHwge30sXG4gICAgICAgICAgICBjb25maWcgPSBjb25maWd1cmF0aW9uLmNvbmZpZyxcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9ICcnLFxuICAgICAgICAgICAgY29uZmlnTWFuYWdlciA9IGNvbmZpZ3VyYXRpb24gJiYgbWF0cml4ICYmIG1hdHJpeC5kcmF3TWFuYWdlcihjb25maWd1cmF0aW9uKSxcbiAgICAgICAgICAgIGxlbiA9IGNvbmZpZ01hbmFnZXIgJiYgY29uZmlnTWFuYWdlci5sZW5ndGgsXG4gICAgICAgICAgICBwbGFjZUhvbGRlciA9IFtdO1xuICAgICAgICAvLyBtYXRyaXguc2V0QXR0ckNvbnRhaW5lcigpO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgcGxhY2VIb2xkZXJbaV0gPSBtYXRyaXguZHJhd0NlbGwoe1xuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JyA6IGNvbmZpZ01hbmFnZXJbaV0uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAnd2lkdGgnIDogY29uZmlnTWFuYWdlcltpXS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgJ3RvcCcgOiBjb25maWdNYW5hZ2VyW2ldLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnIDogY29uZmlnTWFuYWdlcltpXS5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAnaWQnIDogY29uZmlnTWFuYWdlcltpXS5pZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeC5wbGFjZUhvbGRlciA9IFtdO1xuICAgICAgICBtYXRyaXgucGxhY2VIb2xkZXIgPSBwbGFjZUhvbGRlcjtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguZHJhd0NlbGwgPSBmdW5jdGlvbihjb25maWd1cmF0aW9uLCBpZCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBtYXRyaXggPSB0aGlzLFxuICAgICAgICAgICAgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgICAgbWF0cml4Q29udGFpbmVyID0gbWF0cml4ICYmIG1hdHJpeC5tYXRyaXhDb250YWluZXI7XG5cbiAgICAgICAgY2VsbC5pZCA9IGNvbmZpZ3VyYXRpb24uaWQgfHwgJyc7XG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID0gKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5wdXJwb3NlKSB8fCAnJyArICcgY2VsbCAnICsgKGNsYXNzTmFtZSB8fCAnJyk7XG4gICAgICAgIGNlbGwuc3R5bGUuaGVpZ2h0ID0gY29uZmlndXJhdGlvbiAmJiAgY29uZmlndXJhdGlvbi5oZWlnaHQgKyAncHgnO1xuICAgICAgICBjZWxsLnN0eWxlLndpZHRoID0gY29uZmlndXJhdGlvbiAmJiAgY29uZmlndXJhdGlvbi53aWR0aCArICdweCc7XG4gICAgICAgIGNlbGwuc3R5bGUudG9wID0gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLnRvcCArICdweCc7XG4gICAgICAgIGNlbGwuc3R5bGUubGVmdCA9IGNvbmZpZ3VyYXRpb24gJiYgIGNvbmZpZ3VyYXRpb24ubGVmdCArICdweCc7XG4gICAgICAgIGNlbGwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBtYXRyaXhDb250YWluZXIuYXBwZW5kQ2hpbGQoY2VsbCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IHtcbiAgICAgICAgICAgICAgICBpZCA6IGNlbGwuaWQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogY2VsbC5zdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGggOiBjZWxsLnN0eWxlLndpZHRoLFxuICAgICAgICAgICAgICAgIHRvcCA6IGNlbGwuc3R5bGUudG9wLFxuICAgICAgICAgICAgICAgIGxlZnQgOiBjZWxsLnN0eWxlLmxlZnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBncmFwaGljcyA6IGNlbGxcbiAgICAgICAgfTtcblxuICAgIH07XG5cbiAgICBwcm90b01hdHJpeC5kcmF3TWFuYWdlciA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHZhciBtYXRyaXggPSB0aGlzLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBsZW5Sb3cgPSBjb25maWd1cmF0aW9uLmxlbmd0aCxcbiAgICAgICAgICAgIG1hcEFyciA9IG1hdHJpeC5tYXRyaXhNYW5hZ2VyKGNvbmZpZ3VyYXRpb24pLFxuICAgICAgICAgICAgcHJvY2Vzc2VkQ29uZmlnID0gbWF0cml4LnNldFBsY0hsZHIobWFwQXJyLCBjb25maWd1cmF0aW9uKSxcbiAgICAgICAgICAgIGhlaWdodEFyciA9IG1hdHJpeC5nZXRSb3dIZWlnaHQobWFwQXJyKSxcbiAgICAgICAgICAgIHdpZHRoQXJyID0gbWF0cml4LmdldENvbFdpZHRoKG1hcEFyciksXG4gICAgICAgICAgICBkcmF3TWFuYWdlck9iakFyciA9IFtdLFxuICAgICAgICAgICAgbGVuUm93LFxuICAgICAgICAgICAgbGVuQ2VsbCxcbiAgICAgICAgICAgIG1hdHJpeFBvc1ggPSBtYXRyaXguZ2V0UG9zKHdpZHRoQXJyKSxcbiAgICAgICAgICAgIG1hdHJpeFBvc1kgPSBtYXRyaXguZ2V0UG9zKGhlaWdodEFyciksXG4gICAgICAgICAgICByb3dzcGFuLFxuICAgICAgICAgICAgY29sc3BhbixcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgdG9wLFxuICAgICAgICAgICAgbGVmdCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5Sb3c7IGkrKykgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChqID0gMCwgbGVuQ2VsbCA9IGNvbmZpZ3VyYXRpb25baV0ubGVuZ3RoOyBqIDwgbGVuQ2VsbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgcm93c3BhbiA9IHBhcnNlSW50KGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5yb3dzcGFuIHx8IDEpO1xuICAgICAgICAgICAgICAgIGNvbHNwYW4gPSBwYXJzZUludChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0uY29sc3BhbiB8fCAxKTtcbiAgICAgICAgICAgICAgICBpZCA9IGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5pZDtcbiAgICAgICAgICAgICAgICByb3cgPSBwYXJzZUludChjb25maWd1cmF0aW9uW2ldW2pdLnJvdyk7XG4gICAgICAgICAgICAgICAgY29sID0gcGFyc2VJbnQoY29uZmlndXJhdGlvbltpXVtqXS5jb2wpO1xuICAgICAgICAgICAgICAgIGxlZnQgPSBtYXRyaXhQb3NYW2NvbF07XG4gICAgICAgICAgICAgICAgdG9wID0gbWF0cml4UG9zWVtyb3ddO1xuICAgICAgICAgICAgICAgIHdpZHRoID0gbWF0cml4UG9zWFtjb2wgKyBjb2xzcGFuXSAtIGxlZnQ7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gbWF0cml4UG9zWVtyb3cgKyByb3dzcGFuXSAtIHRvcDtcblxuICAgICAgICAgICAgICAgIGRyYXdNYW5hZ2VyT2JqQXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0b3AgOiB0b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgOiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgOiBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoIDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGlkIDogaWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgIFxuICAgICAgICByZXR1cm4gZHJhd01hbmFnZXJPYmpBcnI7XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4LmdldFBvcyA9ICBmdW5jdGlvbihzcmMpe1xuICAgICAgICB2YXIgYXJyID0gW10sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHNyYyAmJiBzcmMubGVuZ3RoO1xuXG4gICAgICAgIGZvcig7IGkgPD0gbGVuOyBpKyspe1xuICAgICAgICAgICAgYXJyLnB1c2goaSA/IChzcmNbaS0xXSthcnJbaS0xXSkgOiAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4LnNldFBsY0hsZHIgPSBmdW5jdGlvbihtYXBBcnIsIGNvbmZpZ3VyYXRpb24pe1xuICAgICAgICB2YXIgbWF0cml4ID0gdGhpcyxcbiAgICAgICAgICAgIHJvdyxcbiAgICAgICAgICAgIGNvbCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgbGVuUixcbiAgICAgICAgICAgIGxlbkM7XG5cbiAgICAgICAgZm9yKGkgPSAwLCBsZW5SID0gbWFwQXJyLmxlbmd0aDsgaSA8IGxlblI7IGkrKyl7IFxuICAgICAgICAgICAgZm9yKGogPSAwLCBsZW5DID0gbWFwQXJyW2ldLmxlbmd0aDsgaiA8IGxlbkM7IGorKyl7XG4gICAgICAgICAgICAgICAgcm93ID0gbWFwQXJyW2ldW2pdLmlkLnNwbGl0KCctJylbMF07XG4gICAgICAgICAgICAgICAgY29sID0gbWFwQXJyW2ldW2pdLmlkLnNwbGl0KCctJylbMV07XG5cbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5yb3cgPSBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5yb3cgPT09IHVuZGVmaW5lZCA/IGkgOiBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5yb3c7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbltyb3ddW2NvbF0uY29sID0gY29uZmlndXJhdGlvbltyb3ddW2NvbF0uY29sID09PSB1bmRlZmluZWQgPyBqIDogY29uZmlndXJhdGlvbltyb3ddW2NvbF0uY29sO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uO1xuICAgIH07XG5cbiAgICBwcm90b01hdHJpeC5nZXRSb3dIZWlnaHQgPSBmdW5jdGlvbihtYXBBcnIpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgbGVuUm93ID0gbWFwQXJyICYmIG1hcEFyci5sZW5ndGgsXG4gICAgICAgICAgICBsZW5Db2wsXG4gICAgICAgICAgICBoZWlnaHQgPSBbXSxcbiAgICAgICAgICAgIGN1cnJIZWlnaHQsXG4gICAgICAgICAgICBtYXhIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlblJvdzsgaSsrKSB7XG4gICAgICAgICAgICBmb3IoaiA9IDAsIG1heEhlaWdodCA9IDAsIGxlbkNvbCA9IG1hcEFycltpXS5sZW5ndGg7IGogPCBsZW5Db2w7IGorKykge1xuICAgICAgICAgICAgICAgIGN1cnJIZWlnaHQgPSBtYXBBcnJbaV1bal0uaGVpZ2h0O1xuICAgICAgICAgICAgICAgIG1heEhlaWdodCA9IG1heEhlaWdodCA8IGN1cnJIZWlnaHQgPyBjdXJySGVpZ2h0IDogbWF4SGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGVpZ2h0W2ldID0gbWF4SGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguZ2V0Q29sV2lkdGggPSBmdW5jdGlvbihtYXBBcnIpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICBsZW5Sb3cgPSBtYXBBcnIgJiYgbWFwQXJyLmxlbmd0aCxcbiAgICAgICAgICAgIGxlbkNvbCxcbiAgICAgICAgICAgIHdpZHRoID0gW10sXG4gICAgICAgICAgICBjdXJyV2lkdGgsXG4gICAgICAgICAgICBtYXhXaWR0aDtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuQ29sID0gbWFwQXJyW2pdLmxlbmd0aDsgaSA8IGxlbkNvbDsgaSsrKXtcbiAgICAgICAgICAgIGZvcihqID0gMCwgbWF4V2lkdGggPSAwOyBqIDwgbGVuUm93OyBqKyspIHtcbiAgICAgICAgICAgICAgICBjdXJyV2lkdGggPSBtYXBBcnJbal1baV0ud2lkdGg7ICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXhXaWR0aCA9IG1heFdpZHRoIDwgY3VycldpZHRoID8gY3VycldpZHRoIDogbWF4V2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aWR0aFtpXSA9IG1heFdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH07XG5cbiAgICBwcm90b01hdHJpeC5tYXRyaXhNYW5hZ2VyID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBtYXBBcnIgPSBbXSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgayxcbiAgICAgICAgICAgIGwsXG4gICAgICAgICAgICBsZW5Sb3cgPSBjb25maWd1cmF0aW9uLmxlbmd0aCxcbiAgICAgICAgICAgIGxlbkNlbGwsXG4gICAgICAgICAgICByb3dTcGFuLFxuICAgICAgICAgICAgY29sU3BhbixcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgZGVmYXVsdEggPSBtYXRyaXguZGVmYXVsdEgsXG4gICAgICAgICAgICBkZWZhdWx0VyA9IG1hdHJpeC5kZWZhdWx0VyxcbiAgICAgICAgICAgIG9mZnNldDtcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuUm93OyBpKyspIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGxlbkNlbGwgPSBjb25maWd1cmF0aW9uW2ldLmxlbmd0aDsgaiA8IGxlbkNlbGw7IGorKykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcm93U3BhbiA9IChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0ucm93c3BhbikgfHwgMTtcbiAgICAgICAgICAgICAgICBjb2xTcGFuID0gKGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5jb2xzcGFuKSB8fCAxOyAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdpZHRoID0gKGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS53aWR0aCk7XG4gICAgICAgICAgICAgICAgd2lkdGggPSAod2lkdGggJiYgKHdpZHRoIC8gY29sU3BhbikpIHx8IGRlZmF1bHRXOyAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gKGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IChoZWlnaHQgJiYgKGhlaWdodCAvIHJvd1NwYW4pKSB8fCBkZWZhdWx0SDsgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIChrID0gMCwgb2Zmc2V0ID0gMDsgayA8IHJvd1NwYW47IGsrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGwgPSAwOyBsIDwgY29sU3BhbjsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcEFycltpICsga10gPSBtYXBBcnJbaSArIGtdID8gbWFwQXJyW2kgKyBrXSA6IFtdOyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gaiArIGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKG1hcEFycltpICsga11bb2Zmc2V0XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBBcnJbaSArIGtdW29mZnNldF0gPSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogKGkgKyAnLScgKyBqKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXBBcnI7XG4gICAgfTtcbn0pOyJdfQ==