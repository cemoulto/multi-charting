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

	var Ajax = function () {
			var ajax = this,
				argument = arguments[0];

		    ajax.onSuccess = argument.success;
		    ajax.onError = argument.error;
		    ajax.open = false;
		    return ajax.get(argument.url);
		},

        ajaxProto = Ajax.prototype,

        FUNCTION = 'function',
        MSXMLHTTP = 'Microsoft.XMLHTTP',
        MSXMLHTTP2 = 'Msxml2.XMLHTTP',
        GET = 'GET',
        XHREQERROR = 'XmlHttprequest Error',
        multiChartingProto = MultiCharting.prototype,
        win = multiChartingProto.win, // keep a local reference of window scope

        // Probe IE version
        version = parseFloat(win.navigator.appVersion.split('MSIE')[1]),
        ielt8 = (version >= 5.5 && version <= 7) ? true : false,
        firefox = /mozilla/i.test(win.navigator.userAgent),
        //
        // Calculate flags.
        // Check whether the page is on file protocol.
        fileProtocol = win.location.protocol === 'file:',
        AXObject = win.ActiveXObject,

        // Check if native xhr is present
        XHRNative = (!AXObject || !fileProtocol) && win.XMLHttpRequest,

        // Prepare function to retrieve compatible xmlhttprequest.
        newXmlHttpRequest = function () {
            var xmlhttp;

            // if xmlhttprequest is present as native, use it.
            if (XHRNative) {
                newXmlHttpRequest = function () {
                    return new XHRNative();
                };
                return newXmlHttpRequest();
            }

            // Use activeX for IE
            try {
                xmlhttp = new AXObject(MSXMLHTTP2);
                newXmlHttpRequest = function () {
                    return new AXObject(MSXMLHTTP2);
                };
            }
            catch (e) {
                try {
                    xmlhttp = new AXObject(MSXMLHTTP);
                    newXmlHttpRequest = function () {
                        return new AXObject(MSXMLHTTP);
                    };
                }
                catch (e) {
                    xmlhttp = false;
                }
            }
            return xmlhttp;
        },

        headers = {
            /**
             * Prevents cacheing of AJAX requests.
             * @type {string}
             */
            'If-Modified-Since': 'Sat, 29 Oct 1994 19:43:31 GMT',
            /**
             * Lets the server know that this is an AJAX request.
             * @type {string}
             */
            'X-Requested-With': 'XMLHttpRequest',
            /**
             * Lets server know which web application is sending requests.
             * @type {string}
             */
            'X-Requested-By': 'FusionCharts',
            /**
             * Mentions content-types that are acceptable for the response. Some servers require this for Ajax
             * communication.
             * @type {string}
             */
            'Accept': 'text/plain, */*',
            /**
             * The MIME type of the body of the request along with its charset.
             * @type {string}
             */
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };

    MultiCharting.prototype.ajax = function () {
        return new Ajax(arguments[0]);
    };

    ajaxProto.get = function (url) {
        var wrapper = this,
            xmlhttp = wrapper.xmlhttp,
            errorCallback = wrapper.onError,
            successCallback = wrapper.onSuccess,
            xRequestedBy = 'X-Requested-By',
            hasOwn = Object.prototype.hasOwnProperty,
            i,
            eventList = ['onloadstart', 'ondurationchange', 'onloadedmetadata', 'onloadeddata', 'onprogress',
                'oncanplay', 'oncanplaythrough', 'onabort', 'onerror', 'ontimeout', 'onloadend'];

        // X-Requested-By is removed from header during cross domain ajax call
        if (url.search(/^(http:\/\/|https:\/\/)/) !== -1 &&
                win.location.hostname !== /(http:\/\/|https:\/\/)([^\/\:]*)/.exec(url)[2]) {
            // If the url does not contain http or https, then its a same domain call. No need to use regex to get
            // domain. If it contains then checks domain.
            delete headers[xRequestedBy];
        }
        else {
            !hasOwn.call(headers, xRequestedBy) && (headers[xRequestedBy] = 'FusionCharts');
        }

        if (!xmlhttp || ielt8 || firefox) {
            xmlhttp = newXmlHttpRequest();
            wrapper.xmlhttp = xmlhttp;
        }

        xmlhttp.onreadystatechange = function () {
            
            if (xmlhttp.readyState === 4) {
                if ((!xmlhttp.status && fileProtocol) || (xmlhttp.status >= 200 &&
                        xmlhttp.status < 300) || xmlhttp.status === 304 ||
                        xmlhttp.status === 1223 || xmlhttp.status === 0) {
                    successCallback &&
                        successCallback(xmlhttp.responseText, wrapper, url);
                }
                else if (errorCallback) {
                    errorCallback(new Error(XHREQERROR), wrapper, url);
                }
                wrapper.open = false;
            }
        };

        eventList.forEach(function (eventName) {
            xmlhttp[eventName] = function (event) {
                multiChartingProto.raiseEvent(eventName, {
                    Event : event
                }, wrapper);
            };
        });

        try {
            xmlhttp.open(GET, url, true);

            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType('text/plain');
            }

            for (i in headers) {
                xmlhttp.setRequestHeader(i, headers[i]);
            }

            xmlhttp.send();
            wrapper.open = true;
        }
        catch (error) {
            if (errorCallback) {
                errorCallback(error, wrapper, url);
            }
        }

        return xmlhttp;
    };

    ajaxProto.abort = function () {
        var instance = this,
            xmlhttp = instance.xmlhttp;

        instance.open = false;
        return xmlhttp && typeof xmlhttp.abort === FUNCTION && xmlhttp.readyState &&
                xmlhttp.readyState !== 0 && xmlhttp.abort();
    };

    ajaxProto.dispose = function () {
        var instance = this;
        instance.open && instance.abort();

        delete instance.onError;
        delete instance.onSuccess;
        delete instance.xmlhttp;
        delete instance.open;

        return (instance = null);
    };
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
    var MultiChartingProto = MultiCharting.prototype;

    MultiChartingProto.convertToArray = function (data, delimiter, outputFormat, callback) {
        var csvToArr = this;
        if (typeof data === 'object') {
            delimiter = data.delimiter;
            outputFormat = data.outputFormat;
            callback = data.callback;
            data = data.string;
        }

        if (typeof data !== 'string') {
            throw new Error('CSV string not provided');
        }
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
            finalOb,
            updateManager = function () {
                var lim = 0,
                    jlen = 0,
                    obj = {};
                    lim = i + 3000;
                if(i === 1){
                    MultiChartingProto.raiseEvent('onParsingStart', {
                        Event: {
                            loaded: 0,
                            type:'loadstart',
                            total: len
                        }
                    }, csvToArr);
                }
                MultiChartingProto.raiseEvent('onParsingProgress', {
                    Event: {
                            loaded: i,
                            type:'progress',
                            total: len
                        }
                }, csvToArr);
                
                if (lim > len) {
                    lim = len;
                }
                
                for (; i < lim; ++i) {

                    //create cell array that cointain csv data
                    cell = CSVToArray(splitedData[i], delimiter); // jshint ignore:line
                    cell = cell && cell[0];
                    //take min of header length and total columns
                    jlen = min(header.length, cell.length);

                    if (outputFormat === 1) {
                        finalOb.push(cell);
                    }
                    else if (outputFormat === 2) {
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
                    MultiChartingProto.raiseEvent('onParsingEnd', {
                        Event: {
                            loaded: i,
                            type:'loadend',
                            total: len
                        }
                    }, csvToArr);
                    callback && callback(finalOb);
                }
            };

        outputFormat = outputFormat || 1;
        header = header && header[0];

        //if the value is empty
        if (splitedData[splitedData.length - 1] === '') {
            splitedData.splice((splitedData.length - 1), 1);
            len--;
        }
        if (outputFormat === 1) {
            finalOb = [];
            finalOb.push(header);
        } else if (outputFormat === 2) {
            finalOb = [];
        } else if (outputFormat === 3) {
            finalOb = {};
            for (k = 0, klen = header.length; k < klen; ++k) {
                finalOb[header[k]] = [];
            }   
        }

        updateManager();

    };

});

/*jshint esversion: 6 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

	var	multiChartingProto = MultiCharting.prototype,
		//lib = multiChartingProto.lib,
        eventList = {
            'modelUpdated': 'modelupdated',
            'modelDeleted': 'modeldeleted',
            'metaInfoUpdate': 'metainfoupdated',
            'processorUpdated': 'processorupdated',
            'processorDeleted': 'processordeleted'
        },
        uidCounter = 0,
        gerateUID = function () {
            return 'model_id_' + (uidCounter++);
        },
        getProcessorStoreObj = function (processor, ds) {
            var storeObj = {
	                processor: processor,
	                listners: {}
	            },
	            listners;

            listners = storeObj.listners;
            listners[eventList.processorUpdated] = function () {
                ds._generateInputData();
            };
            listners[eventList.processorDeleted] =  function () {
                ds.removeDataProcessor(processor);
            };
            return storeObj;
        },
        addListners = function (element, listnersObj) {
            var eventName;
            if (listnersObj && element.addEventListener) {
                for (eventName in listnersObj) {
                    element.addEventListener(eventName, listnersObj[eventName]);
                }
            }
        },
        removeListners = function (element, listnersObj) {
            var eventName;
            if (listnersObj && element.removeEventListener) {
                for (eventName in listnersObj) {
                    element.removeEventListener(eventName, listnersObj[eventName]);
                }
            }
        },
		// Constructor class for DataModel.
		DataModel = function () {
	    	var ds = this;
	    	ds.links = {
              inputStore: undefined,
              inputJSON: undefined,
              inputData: [],
              processors: [],
              metaObj: {}
            };
            // add the unicId
            ds.id = gerateUID();
	    	arguments[0] && ds.setData(arguments[0]);
		},
		DataModelProto = DataModel.prototype;

        //
        multiChartingProto.createDataStore = function () {
            return new DataModel(arguments[0]);
        };

    DataModelProto.getId = function () {
        return this.id;
    };
    DataModelProto._generateInputData = function() {
        var ds = this;
        // remove all old data
        ds.links.inputData.length = 0;

        // get the data from the input Store
        if (ds.links.inputStore && ds.links.inputStore.getJSON) {
        	ds.links.inputData = ds.links.inputData.concat(ds.links.inputStore.getJSON());
            // ds.links.inputData.push.apply(ds.links.inputData, ds.links.inputStore.getJSON());
        }

        // add the input JSON (seperately added)
        if (ds.links.inputJSON && ds.links.inputJSON.length) {
        	ds.links.inputData = ds.links.inputData.concat(ds.links.inputJSON);
        	// ds.links.inputData.push.apply(ds.links.inputData, ds.links.inputJSON);
        }


        // for simplecity call the output JSON creation method as well
        ds._generateOutputData();

    };


    DataModelProto._generateOutputData = function () {
        var ds = this,
        links = ds.links,
        outputData = links.inputData.concat([]),
        i,
        l = links.processors.length,
        storeObj;

        if (l && outputData.length) {
            for (i = 0; i < l; i += 1) {
                storeObj = links.processors[i];
                if (storeObj && storeObj.processor && storeObj.processor.getProcessedData) {
                    // @todo: we have to create this new method in the processor to return a processed JSON data
                    outputData = storeObj.processor.getProcessedData(outputData);
                }
            }
        }
        ds.links.outputData = outputData;

        // raise the event for OutputData modified event
        ds.raiseEvent(eventList.modelUpdated, {
            'data': ds.links.outputData
        }, ds);
    };


    // Function to get the jsondata of the data object
	DataModelProto.getJSON = function () {
		var ds = this;
		return (ds.links.outputData || ds.links.inputData);
	};

    // Function to get child data Store object after applying filter on the parent data.
	// @params {filters} - This can be a filter function or an array of filter functions.
	DataModelProto.getChildModel = function (filters) {
		var ds = this,
			newDs,
            metaInfo = ds.links.metaObj,
            key,
            newDSLink,
            MetaConstructor,
			metaConstractor,
            inputStoreListners;
        newDs = new DataModel();
        newDSLink = newDs.links;
        newDSLink.inputStore = ds;

        // create listners
        inputStoreListners = newDSLink.inputStoreListners = {};
        inputStoreListners[eventList.modelUpdated] = function () {
            newDs._generateInputData();
        };
        inputStoreListners[eventList.modelDeleted] = function () {
            newDs.dispose();
        };
        inputStoreListners[eventList.metaInfoUpdate] = function () {
            newDs.raiseEvent(eventList.metaInfoUpdate, {});
        };

        // inherit metaInfos
        for (key in metaInfo) {
            MetaConstructor = function () {};
            metaConstractor.prototype = metaInfo[key];
            metaConstractor.prototype.constructor = MetaConstructor;
            newDSLink.metaObj[key] = new MetaConstructor();
        }

        // attached event listener on parent data
        addListners(ds, inputStoreListners);
        newDs._generateInputData();

        newDs.addDataProcessor(filters);
        return newDs;
	};

    // Function to add processor in the data store
    DataModelProto.addDataProcessor = function (processors) {
        var ds = this,
        i,
        l,
        processor,
        storeObj;
        // if single filter is passed make it an Array
        if (!(processors instanceof Array)) {
            processors = [processors];
        }
        l = processors.length;
        for (i = 0; i < l; i += 1) {
            processor = processors[i];
            if (processor && processor.addEventListener) {
                storeObj = getProcessorStoreObj(processor, ds);
                // add the listners
                addListners(processor, storeObj.listners);
                ds.links.processors.push(storeObj);
            }
        }
        // update the outputData
        ds._generateOutputData();
    };
    //Function to remove processor in the data store
    DataModelProto.removeDataProcessor = function (processors) {
        var ds = this,
        processorsStore = ds.links.processors,
        storeObj,
        i,
        l,
        j,
        k,
        processor,
        foundMatch;
        // if single filter is passed make it an Array
        if (!(processors instanceof Array)) {
            processors = [processors];
        }
        k = processors.length;
        for (j = 0; j < k; j += 1) {
            processor = processors[j];
            l = processorsStore.length;
            foundMatch = false;
            for (i = 0; i < l && !foundMatch; i += 1) {
                storeObj = processorsStore[i];
                if  (storeObj && storeObj.processor === processor) {
                    foundMatch = true;
                    // remove the listeners
                    removeListners(processor, storeObj.listners);
                    // remove the precessor store Obj
                    processorsStore.splice(i, 1);
                }
            }
        }
        // update the outputData
        ds._generateOutputData();
    };

    // Function to add event listener at dataStore level.
	DataModelProto.addEventListener = function (type, listener) {
		return multiChartingProto.addEventListener(type, listener, this);
	};

	// Function to remove event listener at dataStore level.
    DataModelProto.removeEventListener = function (type, listener) {
		return multiChartingProto.removeEventListener(type, listener, this);
	};

    DataModelProto.raiseEvent = function (type, dataObj) {
		return multiChartingProto.raiseEvent(type, dataObj, this);
	};

    // Function to add data in the data store
	DataModelProto.setData = function (dataSpecs, callback) {
		var ds = this,
			dataType = dataSpecs.dataType,
			dataSource = dataSpecs.dataSource,
			callbackHelperFn = function (JSONData) {
				ds.links.inputJSON = JSONData.concat(ds.links.inputJSON || []);
				ds._generateInputData();
				if (typeof callback === 'function') {
					callback(JSONData);
				}
			};

		if (dataType === 'csv') {
			multiChartingProto.convertToArray({
				string : dataSpecs.dataSource,
				delimiter : dataSpecs.delimiter,
				outputFormat : dataSpecs.outputFormat,
				callback : function (data) {
					callbackHelperFn(data);
				}
			});
		}
		else {
			callbackHelperFn(dataSource);
		}
	};

    // Function to remove all data (not the data linked from the parent) in the data store
    DataModelProto.clearData = function (){
        var ds = this;
        // clear inputData store
        ds.links.inputJSON && (ds.links.inputJSON = undefined);
        // re-generate the store's data
        ds._generateInputData();
    };

    // Function to dispose a store
    DataModelProto.dispose = function (){
        var ds = this,
        links = ds.links,
        inputStore = links.inputStore,
        processorsStore = links.processors,
        storeObj,
        i;

        // remove inoutStore listeners
        if (inputStore && inputStore.removeEventListener) {
            removeListners(inputStore, links.inputStoreListners);
        }

        // remove all filters and thir listeners
        for (i = processorsStore.length - 1; i >= 0; i -= 1) {
            storeObj = processorsStore[i];
            // remove the listeners
            removeListners(storeObj.processor, storeObj.listners);
        }
        processorsStore.length = 0;

        // raise the event for OutputData modified event
        ds.raiseEvent(eventList.modelDeleted, {});


        // @todo: delete all links

        // @todo: clear all events as they will not be used any more

    };
    // Funtion to get all the keys of the JSON data
    // @todo: need to improve it for performance as well as for better results
	DataModelProto.getKeys = function () {
		var ds = this,
			data = ds.getJSON(),
			firstData = data[0] || {};

		return Object.keys(firstData);
	};

	// Funtion to get all the unique values corresponding to a key
    // @todo: need to improve it for performance as well as for better results
	DataModelProto.getUniqueValues = function (key) {
		var ds = this,
			data = ds.getJSON(),
			internalData = data[0],
			isArray = internalData instanceof Array,
			//uniqueValues = ds.uniqueValues[key],
			tempUniqueValues = {},
			len = data.length,
			i;

		// if (uniqueValues) {
		// 	return uniqueValues;
		// }

		if (isArray) {
			i = 1;
			key = ds.getKeys().findIndex(function (element) {
				return element.toUpperCase() === key.toUpperCase();
			});
		}
		else {
			i = 0;
		}

		for (i = isArray ? 1 : 0; i < len; i++) {
			internalData = isArray ? data[i][key] : data[i][key];
			!tempUniqueValues[internalData] && (tempUniqueValues[internalData] = true);
		}

		return Object.keys(tempUniqueValues);
	};

    // Function to add / update metadata
	DataModelProto.updateMetaData = function (fieldName, metaInfo) {
        var ds = this,
        metaObj = ds.links.metaObj,
        fieldMetaInfo, key;
		if (fieldMetaInfo = metaObj[fieldName]) {
            for (key in metaInfo) {
                fieldMetaInfo[key] = metaInfo[key];
            }
        }
        ds.raiseEvent(eventList.metaInfoUpdate, {});
	};
    // Function to add metadata
    // Not required
	// DataModelProto.deleteMetaData = function (fieldName, metaInfoKey) {
    //     var ds = this,
    //     metaObj = ds.links.metaObj;
    //     if (metaObj[fieldName]) {
    //         metaObj[fieldName][metaInfoKey] = undefined;
    //     }
	// };

	// Function to get the added metaData
	DataModelProto.getMetaData = function (fieldName) {
		var ds = this,
        metaObj = ds.links.metaObj;
        return fieldName ? (metaObj[fieldName] || {}) : metaObj;
	};

	// Function to add data to the dataStorage asynchronously via ajax
    DataModelProto.setDataUrl = function () {
        var dataStore = this,
            argument = arguments[0],
            dataSource = argument.dataSource,
            dataType = argument.dataType,
            delimiter = argument.delimiter,
            outputFormat = argument.outputFormat,
            callback = arguments[1],
            callbackArgs = argument.callbackArgs,
            data;

        multiChartingProto.ajax({
            url : dataSource,
            success : function(string) {
                data = dataType === 'json' ? JSON.parse(string) : string;
                dataStore.setData({
                    dataSource : data,
                    dataType : dataType,
                    delimiter : delimiter,
                    outputFormat : outputFormat,
                }, callback);
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
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

	var multiChartingProto = MultiCharting.prototype,
		lib = multiChartingProto.lib,
		filterStore = lib.filterStore = {},
		filterLink = lib.filterLink = {},
		filterIdCount = 0,
		dataStorage = lib.dataStorage,
		parentStore = lib.parentStore,
		eventList = {
            'modelUpdated': 'modelupdated',
            'modelDeleted': 'modeldeleted',
            'metaInfoUpdate': 'metainfoupdated',
            'processorUpdated': 'processorupdated',
            'processorDeleted': 'processordeleted'
        },
		// Constructor class for DataProcessor.
		DataProcessor = function () {
	    	var manager = this;
	    	manager.addRule(arguments[0]);
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

	multiChartingProto.createDataProcessor = function () {
		return new DataProcessor(arguments[0]);
	};

	// Function to add filter in the filter store
	dataProcessorProto.addRule = function () {
		var filter = this,
			oldId = filter.id,
			argument = arguments[0],
			filterFn = (argument && argument.rule) || argument,
			id = argument && argument.type,
			type = argument && argument.type;

		id = oldId || id || 'filterStore' + filterIdCount ++;
		filterStore[id] = filterFn;

		filter.id = id;
		filter.type = type;

		// Update the data on which the filter is applied and also on the child data.
		if (filterLink[id]) {
			updataFilterProcessor(id);
		}

		multiChartingProto.raiseEvent(eventList.processorUpdated, {
			'id': id,
			'data' : filterFn
		}, filter);
	};

	// Funtion to get the filter method.
	dataProcessorProto.getProcessor = function () {
		return filterStore[this.id];
	};

	// Function to get the ID of the filter.
	dataProcessorProto.getID = function () {
		return this.id;
	};


	dataProcessorProto.dispose = function () {
		var filter = this,
			id = filter.id;

		filterLink[id] && updataFilterProcessor(id, true);

		delete filterStore[id];
		delete filterLink[id];

		multiChartingProto.raiseEvent(eventList.processorDeleted, {
			'id': id,
		}, filter);
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

	dataProcessorProto.map = function () {
		this.addRule(
			{	rule : arguments[0],
				type : 'map'
			}
		);
	};

	dataProcessorProto.getProcessedData = function (JSONData) {
		var dataProcessor = this,
			type = dataProcessor.type,
			filterFn = dataProcessor.getProcessor();
        switch (type) {
            case  'sort' : return Array.prototype.sort.call(JSONData, filterFn);
            case  'filter' : return Array.prototype.filter.call(JSONData, filterFn);
            case 'map' : return Array.prototype.map.call(JSONData, filterFn);
            default : return filterFn(JSONData);
        }
        
	};

	// Function to add event listener at dataProcessor level.
	dataProcessorProto.addEventListener = function (type, listener) {
		return multiChartingProto.addEventListener(type, listener, this);
	};

	// Function to remove event listener at dataProcessor level.
    dataProcessorProto.removeEventListener = function (type, listener) {
		return multiChartingProto.removeEventListener(type, listener, this);
	};

    dataProcessorProto.raiseEvent = function (type, dataObj) {
		return multiChartingProto.raiseEvent(type, dataObj, this);
	};

});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    var extend2 = MultiCharting.prototype.lib.extend2,
        NULL = null,
        COLOR = 'color',
        PALETTECOLORS = 'paletteColors';
    //function to convert data, it returns fc supported JSON
    var DataAdapter = function (dataSource, conf, callback) {
        var dataadapter = this;

        dataadapter.dataStore = dataSource;       
        dataadapter.dataJSON = dataadapter.dataStore && dataadapter.dataStore.getJSON();
        dataadapter.configuration = conf;
        dataadapter.callback = callback;
        dataadapter.FCjson = dataadapter.__convertData__();
    },
    protoDataadapter = DataAdapter.prototype;

    protoDataadapter.__convertData__ = function() {
        var dataadapter = this,            
            aggregatedData,
            generalData,
            json = {},
            predefinedJson = {},
            jsonData = dataadapter.dataJSON,
            configuration = dataadapter.configuration,
            callback = dataadapter.callback,
            isMetaData = dataadapter.dataStore && (dataadapter.dataStore.getMetaData() ? true : false);
            predefinedJson = configuration && configuration.config;

        if (jsonData && configuration) {
            generalData = dataadapter.__generalDataFormat__(jsonData, configuration);
            configuration.categories = configuration.categories || 
                                        dataadapter.dataStore.getUniqueValues(configuration.dimension[0]);
            configuration.categories && (aggregatedData = dataadapter.__getSortedData__(generalData, 
                                configuration.categories, configuration.dimension, configuration.aggregateMode));
            aggregatedData = aggregatedData || generalData;
            dataadapter.aggregatedData = aggregatedData;
            json = dataadapter.__jsonCreator__(aggregatedData, configuration);            
        }
        json = (predefinedJson && extend2(json,predefinedJson)) || json;
        json = (callback && callback(json)) || json;
        return isMetaData ? dataadapter.__setDefaultAttr__(json) : json;
    };

    protoDataadapter.__getSortedData__ = function (data, categoryArr, dimension, aggregateMode) {
        var dataadapter = this,
            indeoxOfKey,
            newData = [],
            subSetData = [],
            key = [],
            categories = [],
            lenKey,
            lenData,
            lenCat,
            j,
            k,
            i,
            arr = [],
            dataStore = dataadapter.dataStore;
  
        (Array.isArray(dimension) && (key = dimension)) || (key = [dimension]);

        (categoryArr && !categoryArr.length) || (categoryArr = dataStore.getUniqueValues(key[0]));
        (Array.isArray(categoryArr[0]) && (categories = categoryArr)) || (categories = [categoryArr]);

        newData.push(data[0]);
        for(k = 0, lenKey = key.length; k < lenKey; k++) {
            indeoxOfKey = data[0].indexOf(key[k]);                    
            for(i = 0,lenCat = categories[k].length; i < lenCat  && indeoxOfKey !== -1; i++) {
                subSetData = [];
                for(j = 1, lenData = data.length; j < lenData; j++) {                        
                    (data[j][indeoxOfKey] == categories[k][i]) && (subSetData.push(data[j]));
                }     
                arr[indeoxOfKey] = categories[k][i];
                (subSetData.length === 0) && (subSetData.push(arr));
                newData.push(dataadapter.__getAggregateData__(subSetData, categories[k][i], aggregateMode));
            }
        }        
        return newData;
    };

    protoDataadapter.update = function (dataSource, conf, callback){
        var dataadapter = this;

        dataadapter.dataStore = dataSource || dataadapter.dataStore;       
        dataadapter.dataJSON = dataadapter.dataStore && dataadapter.dataStore.getJSON();
        dataadapter.configuration = conf || dataadapter.configuration;
        dataadapter.callback = callback || dataadapter.callback;
        dataadapter.FCjson = dataadapter.__convertData__();
    };

    protoDataadapter.__setDefaultAttr__ = function (json) {
        var dataadapter = this,
            keyExcludedJsonStr = '',
            paletteColors = '',
            dataStore = dataadapter.dataStore,
            conf = dataadapter && dataadapter.configuration,
            measure = conf && conf.measure || [],
            metaData = dataStore && dataStore.getMetaData(),
            metaDataMeasure,
            seriesType = conf && conf.seriesType,
            series = {
                'ss' : function() {
                    metaDataMeasure = metaData[measure[0]] && metaData[measure[0]];
                    if (!metaDataMeasure) {
                        return;
                    }
                    metaDataMeasure[COLOR] && (paletteColors = paletteColors + 
                                                        ((metaDataMeasure[COLOR] instanceof Function) ?
                                                                            metaDataMeasure[COLOR]() :
                                                                            metaDataMeasure[COLOR]));
                    json.chart[PALETTECOLORS] = paletteColors;
                },
                'ms' : function () {
                    var i,
                    len = json.dataset.length;
                    for (i = 0; i < len; i++){
                        metaDataMeasure = metaData[measure[i]] && metaData[measure[i]];

                        metaDataMeasure && metaDataMeasure[COLOR] && (json.dataset[i][COLOR] = 
                                                        ((metaDataMeasure[COLOR] instanceof Function) ?
                                                                                metaDataMeasure[COLOR]() :
                                                                                metaDataMeasure[COLOR]));
                    }
                },
                'ts' : function () {
                    var i,
                        len = json.chart.datasets[0].dataset[0].series.length,
                        color;

                    for(i = 0; i < len; i++) {
                        metaDataMeasure = metaData[measure[i]] && metaData[measure[i]];
                        color = metaDataMeasure &&metaDataMeasure[COLOR] && 
                            ((metaDataMeasure[COLOR] instanceof Function) ? metaDataMeasure[COLOR]() : 
                                metaDataMeasure[COLOR]);
                        color && (json.chart.datasets[0].dataset[0].series[i].plot[COLOR] = color);
                    }
                }
            };

        seriesType = seriesType && seriesType.toLowerCase();
        seriesType = (series[seriesType] && seriesType) || 'ms';

        json.chart || (json.chart = {});
        
        keyExcludedJsonStr = (metaData && JSON.stringify(json, function(k,v){
            if(k == 'color') {
                return NULL;
            }
            return v;
        })) || undefined;

        json = (keyExcludedJsonStr && JSON.parse(keyExcludedJsonStr)) || json;

        series[seriesType]();

        return json;
    };

    protoDataadapter.__getAggregateData__ = function (data, key, aggregateMode) {
        var aggregateMethod = {
            'sum' : function(){
                var i,
                    j,
                    lenR,
                    lenC,
                    aggregatedData = data[0];
                for(i = 1, lenR = data.length; i < lenR; i++) {
                    for(j = 0, lenC = data[i].length; j < lenC; j++) {
                        (data[i][j] != key) && (aggregatedData[j] = Number(aggregatedData[j]) + Number(data[i][j]));
                    }
                }
                return aggregatedData;
            },
            'average' : function() {
                var iAggregateMthd = this,
                    lenR = data.length,
                    aggregatedSumArr = iAggregateMthd.sum(),
                    i,
                    len,
                    aggregatedData = [];
                for(i = 0, len = aggregatedSumArr.length; i < len; i++){
                    ((aggregatedSumArr[i] != key) && 
                        (aggregatedData[i] = (Number(aggregatedSumArr[i])) / lenR)) || 
                                                (aggregatedData[i] = aggregatedSumArr[i]);
                }
                return aggregatedData;
            }
        };

        aggregateMode = aggregateMode && aggregateMode.toLowerCase();
        aggregateMode = (aggregateMethod[aggregateMode] && aggregateMode) || 'sum';

        return aggregateMethod[aggregateMode]();
    };

    protoDataadapter.__generalDataFormat__ = function(jsonData, configuration) {
        var isArray = Array.isArray(jsonData[0]),
            generalDataArray = [],
            i,
            j,
            len,
            lenGeneralDataArray,
            value,
            dimension = configuration.dimension || [],
            measure = configuration.measure || [];
        if (!isArray){
            generalDataArray[0] = [];
            generalDataArray[0].push(dimension);
            generalDataArray[0] = generalDataArray[0][0].concat(measure);
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
    };

    protoDataadapter.__jsonCreator__ = function(jsonData, configuration) {
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
                            'category': [                        
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
                        lenData,
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
                    json.chart = {};
                    json.chart.datasets = [];
                    json.chart.datasets[0] = {};
                    json.chart.datasets[0].category = {};
                    json.chart.datasets[0].category.data = [];
                    for (i = 0, lenDimension =  configuration.dimension.length; i < lenDimension; i++) {
                        indexMatch = jsonData[0].indexOf(configuration.dimension[i]);
                        if (indexMatch != -1) {
                            for (j = 1, lenData = jsonData.length; j < lenData; j++) {
                                json.chart.datasets[0].category.data.push(jsonData[j][indexMatch]);
                            }
                        }
                    }
                    json.chart.datasets[0].dataset = [];
                    json.chart.datasets[0].dataset[0] = {};
                    json.chart.datasets[0].dataset[0].series = [];
                    for (i = 0, lenMeasure = configuration.measure.length; i < lenMeasure; i++) {
                        indexMatch = jsonData[0].indexOf(configuration.measure[i]);
                        if (indexMatch != -1) {
                            json.chart.datasets[0].dataset[0].series[i] = {  
                                'name' : configuration.measure[i],                              
                                'data': []
                            };
                            for(j = 1, lenData = jsonData.length; j < lenData; j++) {
                                json.chart.datasets[0].dataset[0].series[i].data.push(jsonData[j][indexMatch]);
                            }
                        }
                    }
                    return json;
                }
            };
        seriesType = seriesType && seriesType.toLowerCase();
        seriesType = (series[seriesType] && seriesType) || 'ms';
        return conf.measure && conf.dimension && series[seriesType](jsonData, conf);
    };

    protoDataadapter.getJSON = function() {
        return this.FCjson;
    };

    protoDataadapter.__getDataJson__ = function() {
        return this.dataJSON;
    };

    protoDataadapter.__getAggregatedData__ = function() {
        return this.aggregatedData;
    };

    protoDataadapter.__getDimension__ = function() {
        return this.configuration.dimension;
    };

    protoDataadapter.__getDimension__ = function() {
        return this.configuration.measure;
    };

    protoDataadapter.getLimit = function() {
        var dataadapter = this,
            max = -Infinity,
            min = +Infinity,
            i,
            j,
            lenR,
            lenC,
            value,
            data = dataadapter.aggregatedData;
        for(i = 0, lenR = data && data.length; i < lenR; i++){
            for(j = 0, lenC = data[i].length; j < lenC; j++){
                value = +data[i][j];
                value && (max = max < value ? value : max);
                value && (min = min > value ? value : min);
            }
        }
        return {
            'min' : min,
            'max' : max
        };
    };

    protoDataadapter.getDataStore = function() {
        return this.dataStore;
    };

    protoDataadapter.highlight = function() {
        var dataadapter = this,
            categoryLabel = arguments[0] && arguments[0].toString(),
            categoryArr = dataadapter.configuration.categories,
            index = categoryLabel && categoryArr.indexOf(categoryLabel);
        dataadapter.chart.drawTrendRegion(index);
    };

    MultiCharting.prototype.dataAdapter = function (dataSource, conf, callback) {
        return new DataAdapter(dataSource, conf, callback);
    };
});
 /* global FusionCharts: true */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    var document = MultiCharting.prototype.win.document,
    	MAX_PERCENT = '100%',
        dataAdapter = MultiCharting.prototype.dataAdapter,
        ID = 'chart-container-',
        chartId = 0,
        PX = 'px',
        SPAN = 'span',
        Chart = function(conf) {
            var chart = this,
                dataAdapterConf = {},
                createChartConf = {},
                dataStore;

            
            
            chart.conf = {};

            Object.assign(chart.conf, conf);

            chart.autoUpdate = chart.conf.autoUpdate || 1;

            dataAdapterConf = {
                'dimension' : chart.conf.dimension,
                'measure' : chart.conf.measure,
                'seriesType' : chart.conf.seriesType,
                'categories' : chart.conf.categories,
                'aggregateMode' : chart.conf.aggregation,
                'config' : chart.conf.config
            };

            chart.dataAdapter = dataAdapter(conf.dataSource, dataAdapterConf, conf.callback);

            dataStore = chart.dataAdapter.getDataStore();

            dataStore && dataStore.addEventListener('modelUpdated',function() {
                chart.update();
            });

            createChartConf = {
                'type' : chart.conf.type,
                'width' : chart.conf.width || MAX_PERCENT,
                'height' : chart.conf.height || MAX_PERCENT,
                'dataSource' : chart.dataAdapter.getJSON()
            };

            chart.chartInstance = chart.__createChart__(createChartConf);
        },
        ProtoChart = Chart.prototype;

    ProtoChart.__createChart__ = function (json) {
        var chart = this,
            chartObj;

        //render FC 
        chartObj = new FusionCharts(json);

        chartObj.addEventListener('trendRegionRollOver', function (e, d) {
            var dataObj = chart.__getRowData__(d.categoryLabel);
            MultiCharting.prototype.raiseEvent('hoverin', {
                data : dataObj,
                categoryLabel : d.categoryLabel
            }, chart);
        });

       chartObj.addEventListener('trendRegionRollOut', function (e, d) {
           MultiCharting.prototype.raiseEvent('hoverout', {
               categoryLabel : d.categoryLabel
           }, chart);
       });


        return chartObj;
    };

    ProtoChart.update = function(conf){
        var chart = this,
            dataAdapterConf = {},
            createChartConf =  {};

        conf = conf || {};

        Object.assign(chart.conf, conf);

        dataAdapterConf = {
            'dimension' : chart.conf.dimension,
            'measure' : chart.conf.measure,
            'seriesType' : chart.conf.seriesType,
            'categories' : chart.conf.categories,
            'aggregateMode' : chart.conf.aggregation,
            'config' : chart.conf.config
        };

        chart.dataAdapter.update(conf.dataSource, dataAdapterConf, conf.callback);

        createChartConf = {
            'type' : chart.conf.type,
            'width' : chart.conf.width || MAX_PERCENT,
            'height' : chart.conf.height || MAX_PERCENT,
            'dataSource' : chart.dataAdapter.getJSON()
        };

        chart.__chartUpdate__(createChartConf);
    };

    ProtoChart.getChartInstance = function() {
        return this.chartInstance;
    };

    ProtoChart.render = function(id) {
        var chart = this,
        	container = document.getElementById(id);

		id && chart.chartInstance.render(chart.__chartContainer__(container));
    };

	ProtoChart.__chartContainer__ = function(container) {
		var chart = this,
			id = chart.__idCreator__();

		chart.container = {};
		chart.container.config = {};
		chart.container.config.id = id;
		chart.container.graphics = document.createElement(SPAN);
		chart.container.graphics.id = id;
		chart.container.graphics.style.display = 'block';
		container.appendChild(chart.container.graphics);
		return id;
	};

	ProtoChart.getChartContainer = function() {
		return this.container;
	};

	ProtoChart.updateChartContainer = function(config) {
		var chart = this;

		config || (config = {});
		Object.assign(chart.container.config, config);

		chart.container.graphics.height = chart.container.height + PX;
		chart.container.graphics.width = chart.container.width + PX;
	};

	ProtoChart.__idCreator__ = function(){
        chartId++;       
        return ID + chartId;
    };

    ProtoChart.__chartUpdate__ = function(json){
        var chart = this,
        chartJson = json || {};

        if(chart.chartInstance.chartType() != chartJson.type) {
            chart.chartInstance.chartType(chartJson.type);
        }

        chart.chartInstance.setJSONData(chartJson.dataSource);
        
        return chart;
    };

    ProtoChart.__getRowData__ = function(key) {
        var chart = this,
            i = 0,
            j = 0,
            k,
            kk,
            l,
            lenR,
            len,
            lenC,
            data = chart.dataAdapter._getDataJson(),
            aggregatedData = chart.dataAdapter._getAggregatedData(),
            dimension = chart.dataAdapter._getAggregatedData(),
            measure = chart.dataAdapter._getMeasure(),
            isArray = Array.isArray(data[0]),
            index = -1,
            matchObj = {},
            indexOfDimension = aggregatedData[0].indexOf(dimension[0]);
    
        for(lenR = data.length; i < lenR; i++) {
            isArray && (index = data[i].indexOf(key));
            if(index !== -1 && isArray) {
                for(l = 0, lenC = data[i].length; l < lenC; l++){
                    matchObj[data[0][l]] = data[i][l];
                }
                for(j = 0, len = measure.length; j < len; j++) {
                    index = aggregatedData[0].indexOf(measure[j]);
                    for (k = 0, kk = aggregatedData.length; k < kk; k++) {
                        if(aggregatedData[k][indexOfDimension] == key) {
                            matchObj[measure[j]] = aggregatedData[k][index];
                        }
                    }
                }
                return matchObj;
            }

            if(!isArray && data[i][dimension[0]] == key) {
                matchObj = data[i];

                for(j = 0, len = measure.length; j < len; j++) {
                    index = aggregatedData[0].indexOf(measure[j]);
                    for (k = 0, kk = aggregatedData.length; k < kk; k++) {
                        if(aggregatedData[k][indexOfDimension] == key) {
                            matchObj[measure[j]] = aggregatedData[k][index];
                        }
                    }
                }
                return matchObj;
            }
        }
    };

    MultiCharting.prototype.chart = function (config) {
        return new Chart(config);
    };
});

(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {

    var document = MultiCharting.prototype.win.document,
        PX = 'px',
        DIV = 'div',
        EMPTY_STRING = '',
        ABSOLUTE = 'absolute',
        RELATIVE = 'relative',
        ID = 'id-fc-mc-',
        BORDER_BOX = 'border-box';

    var Cell = function (config, container) {
            var cell = this;
            cell.container = container;
            cell.config = config;
            cell.__draw__();
            cell.config.chart && cell.__renderChart__();
        },
        protoCell = Cell.prototype;

    protoCell.__draw__ = function (){
        var cell = this;
        cell.graphics = document.createElement(DIV);
        cell.graphics.id = cell.config.id || EMPTY_STRING;        
        cell.graphics.style.height = cell.config.height + PX;
        cell.graphics.style.width = cell.config.width + PX;
        cell.graphics.style.top = cell.config.top + PX;
        cell.graphics.style.left = cell.config.left + PX;
        cell.graphics.style.position = ABSOLUTE;
        cell.graphics.style.boxSizing = BORDER_BOX;
        cell.graphics.className = cell.config.className;
        cell.config.chart || (cell.graphics.innerHTML = cell.config.html || EMPTY_STRING);
        cell.container.appendChild(cell.graphics);
    };

    protoCell.__renderChart__ = function () {
        var cell = this,
            chartContainer,
            conf = {
                'height' : cell.config.height,
                'width' : cell.config.width
            }/*,
            disposalBox = cell.disposalBox*/;

        chartContainer = cell.config.chart.getChartContainer();
        chartContainer && cell.config.chart.updateChartContainer(conf);
        chartContainer && (cell.graphics.appendChild(chartContainer.graphics));
        chartContainer || cell.config.chart.render(cell.config.id);
    };

/*    protoCell.update = function (newConfig) {
        var cell = this,
            id = cell.config.id;

        if(newConfig){
            cell.config = newConfig;
            cell.config.id = id;
            cell.graphics.id = cell.config.id || EMPTY_STRING;        
            cell.graphics.className = cell.config.className;
            cell.graphics.style.height = cell.config.height + PX;
            cell.graphics.style.width = cell.config.width + PX;
            cell.graphics.style.top = cell.config.top + PX;
            cell.graphics.style.left = cell.config.left + PX;
            cell.graphics.style.position = ABSOLUTE;
            !cell.config.chart && (cell.graphics.innerHTML = cell.config.html || EMPTY_STRING);
            cell.container.appendChild(cell.graphics);
            if(cell.config.chart) {
                cell.chart = cell.renderChart();             
            } else {
                delete cell.chart;
            } 
        }  
        return cell;      
    };*/

    var Matrix = function (selector, configuration) {
            var matrix = this;
            matrix.selector = selector;
            //matrix container
            matrix.matrixContainer = document.getElementById(selector);
            matrix.configuration = configuration;
            matrix.defaultH = 100;
            matrix.defaultW = 100;
            matrix.disposalBox = [];
            //dispose matrix context
            matrix.dispose();
            //set style, attr on matrix container 
            matrix.__setAttrContainer__();
            //store virtual matrix for user given configuration
            matrix.configManager = configuration && matrix && matrix.__drawManager__(configuration);
        },
        protoMatrix = Matrix.prototype,
        chartId = 0;

    //function to set style, attr on matrix container
    protoMatrix.__setAttrContainer__ = function() {
        var matrix = this,
            container = matrix && matrix.matrixContainer;        
        container.style.position = RELATIVE;
    };

    //function to set height, width on matrix container
    protoMatrix.__setContainerResolution__ = function (heightArr, widthArr) {
        var matrix = this,
            container = matrix && matrix.matrixContainer,
            height = 0,
            width = 0,
            i,
            len;
        for(i = 0, len = heightArr.length; i < len; i++) {
            height += heightArr[i];
        }

        for(i = 0, len = widthArr.length; i < len; i++) {
            width += widthArr[i];
        }

        container.style.height = height + PX;
        container.style.width = width + PX;
    };

    //function to draw matrix
    protoMatrix.draw = function(callBack){
        var matrix = this,
            configManager = matrix.configManager,
            len = configManager && configManager.length,
            placeHolder = [],
            parentContainer = matrix && matrix.matrixContainer,
            lenC,
            i,
            j;

        matrix.dispose();
        for(i = 0; i < len; i++) {
            placeHolder[i] = [];
            for(j = 0, lenC = configManager[i].length; j < lenC; j++){
                //store cell object in logical matrix structure
                placeHolder[i][j] = new Cell(configManager[i][j],parentContainer);
            }
        }

        matrix.placeHolder = [];
        matrix.placeHolder = placeHolder;
        callBack && callBack();
    };

    //function to manage matrix draw
    protoMatrix.__drawManager__ = function (configuration) {
        var matrix = this,
            i,
            j,
            lenRow = configuration.length,
            //store mapping matrix based on the user configuration
            shadowMatrix = matrix.__matrixManager__(configuration),            
            heightArr = matrix.__getRowHeight__(shadowMatrix),
            widthArr = matrix.__getColWidth__(shadowMatrix),
            drawManagerObjArr = [],
            lenCell,
            matrixPosX = matrix.__getPos__(widthArr),
            matrixPosY = matrix.__getPos__(heightArr),
            rowspan,
            colspan,
            id,
            className,
            top,
            left,
            height,
            width,
            chart,
            html,
            row,
            col;
        //calculate and set placeholder in shadow matrix
        configuration = matrix.__setPlcHldr__(shadowMatrix, configuration);
        //function to set height, width on matrix container
        matrix.__setContainerResolution__(heightArr, widthArr);
        //calculate cell position and heiht and 
        for (i = 0; i < lenRow; i++) {  
            drawManagerObjArr[i] = [];          
            for (j = 0, lenCell = configuration[i].length; j < lenCell; j++) {
                rowspan = parseInt(configuration[i][j] && configuration[i][j].rowspan || 1);
                colspan = parseInt(configuration[i][j] && configuration[i][j].colspan || 1);                
                chart = configuration[i][j] && configuration[i][j].chart;
                html = configuration[i][j] && configuration[i][j].html;
                row = parseInt(configuration[i][j].row);
                col = parseInt(configuration[i][j].col);
                left = matrixPosX[col];
                top = matrixPosY[row];
                width = matrixPosX[col + colspan] - left;
                height = matrixPosY[row + rowspan] - top;
                id = (configuration[i][j] && configuration[i][j].id) || matrix.__idCreator__(row,col);
                className = configuration[i][j] && configuration[i][j].className || '';
                drawManagerObjArr[i].push({
                    top       : top,
                    left      : left,
                    height    : height,
                    width     : width,
                    className : className,
                    id        : id,
                    rowspan   : rowspan,
                    colspan   : colspan,
                    html      : html,
                    chart     : chart
                });
            }
        }

        return drawManagerObjArr;
    };

    protoMatrix.__idCreator__ = function(){
        chartId++;       
        return ID + chartId;
    };

    protoMatrix.__getPos__ =  function(src){
        var arr = [],
            i = 0,
            len = src && src.length;

        for(; i <= len; i++){
            arr.push(i ? (src[i-1]+arr[i-1]) : 0);
        }

        return arr;
    };

    protoMatrix.__setPlcHldr__ = function(shadowMatrix, configuration){
        var row,
            col,
            i,
            j,
            lenR,
            lenC;

        for(i = 0, lenR = shadowMatrix.length; i < lenR; i++){ 
            for(j = 0, lenC = shadowMatrix[i].length; j < lenC; j++){
                row = shadowMatrix[i][j].id.split('-')[0];
                col = shadowMatrix[i][j].id.split('-')[1];

                configuration[row][col].row = configuration[row][col].row === undefined ? i 
                                                                    : configuration[row][col].row;
                configuration[row][col].col = configuration[row][col].col === undefined ? j 
                                                                    : configuration[row][col].col;
            }
        }
        return configuration;
    };

    protoMatrix.__getRowHeight__ = function(shadowMatrix) {
        var matrix = this,
            i,
            j,
            lenRow = shadowMatrix && shadowMatrix.length,
            lenCol,
            height = [],
            currHeight,
            defaultH = matrix.defaultH,
            maxHeight;
            
        for (i = 0; i < lenRow; i++) {
            for(j = 0, maxHeight = 0, lenCol = shadowMatrix[i].length; j < lenCol; j++) {
                if(shadowMatrix[i][j]) {
                    currHeight = shadowMatrix[i][j].height;
                    maxHeight = maxHeight < currHeight ? currHeight : maxHeight;
                }
            }
            height[i] = maxHeight || defaultH;
        }

        return height;
    };

    protoMatrix.__getColWidth__ = function(shadowMatrix) {
        var matrix = this,
            i = 0,
            j = 0,
            lenRow = shadowMatrix && shadowMatrix.length,
            lenCol,
            width = [],
            currWidth,
            defaultW = matrix.defaultW,
            maxWidth;
        for (i = 0, lenCol = shadowMatrix[j].length; i < lenCol; i++){
            for(j = 0, maxWidth = 0; j < lenRow; j++) {
                if (shadowMatrix[j][i]) {
                    currWidth = shadowMatrix[j][i].width;        
                    maxWidth = maxWidth < currWidth ? currWidth : maxWidth;
                }
            }
            width[i] = maxWidth || defaultW;
        }

        return width;
    };

    protoMatrix.__matrixManager__ = function (configuration) {
        var shadowMatrix = [],
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
            offset;
            
        for (i = 0; i < lenRow; i++) {            
            for (j = 0, lenCell = configuration[i].length; j < lenCell; j++) {
            
                rowSpan = (configuration[i][j] && configuration[i][j].rowspan) || 1;
                colSpan = (configuration[i][j] && configuration[i][j].colspan) || 1;   
                
                width = (configuration[i][j] && configuration[i][j].width);
                width = (width && (width / colSpan)) || undefined;
                width = width && +width.toFixed(2);

                height = (configuration[i][j] && configuration[i][j].height);
                height = (height && (height / rowSpan)) || undefined;                      
                height = height && +height.toFixed(2);

                for (k = 0, offset = 0; k < rowSpan; k++) {
                    for (l = 0; l < colSpan; l++) {

                        shadowMatrix[i + k] = shadowMatrix[i + k] ? shadowMatrix[i + k] : [];
                        offset = j + l;

                        while(shadowMatrix[i + k][offset]) {
                            offset++;
                        }

                        shadowMatrix[i + k][offset] = {
                            id : (i + '-' + j),
                            width : width,
                            height : height
                        };
                    }
                }
            }
        }

        return shadowMatrix;
    };

    protoMatrix.__getBlock__  = function() {
        var id = arguments[0],
            matrix = this,
            placeHolder = matrix && matrix.placeHolder,
            i,
            j,
            lenR = placeHolder.length,
            lenC;
        for(i = 0; i < lenR; i++) {
            for(j = 0, lenC = placeHolder[i].length; j < lenC; j++) {
                if (placeHolder[i][j].config.id == id) {
                    return placeHolder[i][j];
                }
            }
        }
    };

    protoMatrix.update = function (configuration) {
        var matrix = this,
            container = matrix && matrix.matrixContainer,
            placeHolder = matrix && matrix.placeHolder,
            disposalBox = [],
            i,
            j;

        while(container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
        for (i = placeHolder.length - 1; i >= 0; i--) {
            for (j = placeHolder[i].length - 1; j >= 0; j--) {
                placeHolder[i][j].config && placeHolder[i][j].config.chart && 
                                (disposalBox.push(placeHolder[i][j].config.chart));
            }
        }
        protoCell.disposalBox = disposalBox;
        matrix.configuration = configuration || matrix.configuration;
        matrix.configManager = matrix.__drawManager__(matrix.configuration);
        matrix.draw();
    };

    protoMatrix.dispose = function () {
        var matrix = this,
            node  = matrix && matrix.matrixContainer,
            placeHolder = matrix && matrix.placeHolder,
            i,
            j,
            lenC,
            lenR;
        for(i = 0, lenR = placeHolder && placeHolder.length; i < lenR; i++) {
            for (j = 0, lenC = placeHolder[i] && placeHolder[i].length; j < lenC; j++) {
                placeHolder[i][j].chart && placeHolder[i][j].chart.chartObj && 
                    placeHolder[i][j].chart.chartObj.dispose();
            }
        }
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
        node.style.height = '0px';
        node.style.width = '0px';
    };

    MultiCharting.prototype.createMatrix = function () {
        return new Matrix(arguments[0],arguments[1]);
    };
});
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        module.exports = factory;
    } else {
        factory(MultiCharting);
    }
})(function (MultiCharting) {
    
    /* global FusionCharts: true */
    var global = MultiCharting.prototype,
        win = global.win,

        objectProtoToString = Object.prototype.toString,
        arrayToStringIdentifier = objectProtoToString.call([]),
        isArray = function (obj) {
            return objectProtoToString.call(obj) === arrayToStringIdentifier;
        },

        // A function to create an abstraction layer so that the try-catch /
        // error suppression of flash can be avoided while raising events.
        managedFnCall = function (item, scope, event, args) {
            // We change the scope of the function with respect to the
            // object that raised the event.
            try {
                item[0].call(scope, event, args || {});
                // console.log(args);
            }
            catch (e) {
                // Call error in a separate thread to avoid stopping
                // of chart load.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        },

        // Function that executes all functions that are to be invoked upon trigger
        // of an event.
        slotLoader = function (slot, event, args) {
            // If slot does not have a queue, we assume that the listener
            // was never added and halt method.
            if (!(slot instanceof Array)) {
                // Statutory W3C NOT preventDefault flag
                return;
            }

            // Initialize variables.
            var i = 0, scope;

            // Iterate through the slot and look for match with respect to
            // type and binding.
            for (; i < slot.length; i += 1) {

                // If there is a match found w.r.t. type and bind, we fire it.
                if (slot[i][1] === event.sender || slot[i][1] === undefined) {

                    // Determine the sender of the event for global events.
                    // The choice of scope differes depending on whether a
                    // global or a local event is being raised.
                    scope = slot[i][1] === event.sender ?
                        event.sender : global;

                    managedFnCall(slot[i], scope, event, args);

                    // Check if the user wanted to detach the event
                    if (event.detached === true) {
                        slot.splice(i, 1);
                        i -= 1;
                        event.detached = false;
                    }
                }

                // Check whether propagation flag is set to false and discontnue
                // iteration if needed.
                if (event.cancelled === true) {
                    break;
                }
            }
        },

        eventMap = {
            hoverin : 'trendRegionRollOver',
            hoverout : 'trendRegionRollOut',
            clik : 'dataplotclick'
        },
        raiseEvent,

        EventTarget = {

            unpropagator: function () {
                return (this.cancelled = true) === false;
            },
            detacher: function () {
                return (this.detached = true) === false;
            },
            undefaulter: function () {
                return (this.prevented = true) === false;
            },

            // Entire collection of listeners.
            listeners: {},

            // The last raised event id. Allows to calculate the next event id.
            lastEventId: 0,

            addListener: function (type, listener, bind) {
            
                var recurseReturn,
                    FCEventType,
                    i;
                // In case type is sent as array, we recurse this function.
                if (isArray(type)) {
                    recurseReturn = [];
                    // We look into each item of the 'type' parameter and send it,
                    // along with other parameters to a recursed addListener
                    // method.
                    for (i = 0; i < type.length; i += 1) {
                        recurseReturn.push(EventTarget.addListener(type[i], listener, bind));
                    }
                    return recurseReturn;
                }

                // Validate the type parameter. Listener cannot be added without
                // valid type.
                if (typeof type !== 'string') {
                    /**
                     * The event name has not been provided while adding an event listener. Ensure that you pass a
                     * `string` to the first parameter of {@link FusionCharts.addEventListener}.
                     *
                     * @typedef {ParameterException} Error-03091549
                     * @memberOf FusionCharts.debugger
                     * @group debugger-error
                     */
                    global.raiseError(bind || global, '03091549', 'param', '::EventTarget.addListener',
                        new Error('Unspecified Event Type'));
                    return;
                }

                // Listener must be a function. It will not eval a string.
                if (typeof listener !== 'function') {
                    /**
                     * The event listener passed to {@link FusionCharts.addEventListener} needs to be a function.
                     *
                     * @typedef {ParameterException} Error-03091550
                     * @memberOf FusionCharts.debugger
                     * @group debugger-error
                     */
                    global.raiseError(bind || global, '03091550', 'param', '::EventTarget.addListener',
                        new Error('Invalid Event Listener'));
                    return;
                }

                // Desensitize the type case for user accessability.
                type = type.toLowerCase();

                // If the insertion position does not have a queue, then create one.
                if (!(EventTarget.listeners[type] instanceof Array)) {
                    EventTarget.listeners[type] = [];
                }

                // Add the listener to the queue.
                EventTarget.listeners[type].push([listener, bind]);

                // Events of fusionChart raised via MultiCharting.
                if (FCEventType = eventMap[type]) {
                    FusionCharts.addEventListener(FCEventType, function (e, d) {
                        raiseEvent(type, {
                            FCEventObj : e,
                            FCDataObj : d
                        }, MultiCharting);
                    });
                }

                return listener;
            },

            removeListener: function (type, listener, bind) {

                var slot,
                    i;

                // Listener must be a function. Else we have nothing to remove!
                if (typeof listener !== 'function') {
                    /**
                     * The event listener passed to {@link FusionCharts.removeEventListener} needs to be a function.
                     * Otherwise, the event listener function has no way to know which function is to be removed.
                     *
                     * @typedef {ParameterException} Error-03091560
                     * @memberOf FusionCharts.debugger
                     * @group debugger-error
                     */
                    global.raiseError(bind || global, '03091560', 'param', '::EventTarget.removeListener',
                        new Error('Invalid Event Listener'));
                    return;
                }

                // In case type is sent as array, we recurse this function.
                if (type instanceof Array) {
                    // We look into each item of the 'type' parameter and send it,
                    // along with other parameters to a recursed addListener
                    // method.
                    for (i = 0; i < type.length; i += 1) {
                        EventTarget.removeListener(type[i], listener, bind);
                    }
                    return;
                }

                // Validate the type parameter. Listener cannot be removed without
                // valid type.
                if (typeof type !== 'string') {
                    /**
                     * The event name passed to {@link FusionCharts.removeEventListener} needs to be a string.
                     *
                     * @typedef {ParameterException} Error-03091559
                     * @memberOf FusionCharts.debugger
                     * @group debugger-error
                     */
                    global.raiseError(bind || global, '03091559', 'param', '::EventTarget.removeListener',
                        new Error('Unspecified Event Type'));
                    return;
                }

                // Desensitize the type case for user accessability.
                type = type.toLowerCase();

                // Create a reference to the slot for easy lookup in this method.
                slot = EventTarget.listeners[type];

                // If slot does not have a queue, we assume that the listener
                // was never added and halt method.
                if (!(slot instanceof Array)) {
                    return;
                }

                // Iterate through the slot and remove every instance of the
                // event handler.
                for (i = 0; i < slot.length; i += 1) {
                    // Remove all instances of the listener found in the queue.
                    if (slot[i][0] === listener && slot[i][1] === bind) {
                        slot.splice(i, 1);
                        i -= 1;
                    }
                }
            },

            // opts can have { async:true, omni:true }
            triggerEvent: function (type, sender, args, eventScope, defaultFn, cancelFn) {

                // In case, event type is missing, dispatch cannot proceed.
                if (typeof type !== 'string') {
                    /**
                     * The event name passed to {@link FusionCharts.removeEventListener} needs to be a string.
                     * @private
                     *
                     * @typedef {ParameterException} Error-03091602
                     * @memberOf FusionCharts.debugger
                     * @group debugger-error
                     */
                    global.raiseError(sender, '03091602', 'param', '::EventTarget.dispatchEvent',
                        new Error('Invalid Event Type'));
                    return undefined;
                }

                // Desensitize the type case for user accessability.
                type = type.toLowerCase();

                // Model the event as per W3C standards. Add the function to cancel
                // event propagation by user handlers. Also append an incremental
                // event id.
                var eventObject = {
                    eventType: type,
                    eventId: (EventTarget.lastEventId += 1),
                    sender: sender || new Error('Orphan Event'),
                    cancelled: false,
                    stopPropagation: this.unpropagator,
                    prevented: false,
                    preventDefault: this.undefaulter,
                    detached: false,
                    detachHandler: this.detacher
                };

                /**
                 * Event listeners are used to tap into different stages of creating, updating, rendering or removing
                 * charts. A FusionCharts instance fires specific events based on what stage it is in. For example, the
                 * `renderComplete` event is fired each time a chart has finished rendering. You can listen to any such
                 * event using {@link FusionCharts.addEventListener} or {@link FusionCharts#addEventListener} and bind
                 * your own functions to that event.
                 *
                 * These functions are known as "listeners" and are passed on to the second argument (`listener`) of the
                 * {@link FusionCharts.addEventListener} and {@link FusionCharts#addEventListener} functions.
                 *
                 * @callback FusionCharts~eventListener
                 * @see FusionCharts.addEventListener
                 * @see FusionCharts.removeEventListener
                 *
                 * @param {object} eventObject - The first parameter passed to the listener function is an event object
                 * that contains all information pertaining to a particular event.
                 *
                 * @param {string} eventObject.type - The name of the event.
                 *
                 * @param {number} eventObject.eventId - A unique ID associated with the event. Internally it is an
                 * incrementing counter and as such can be indirectly used to verify the order in which  the event was
                 * fired.
                 *
                 * @param {FusionCharts} eventObject.sender - The instance of FusionCharts object that fired this event.
                 * Occassionally, for events that are not fired by individual charts, but are fired by the framework,
                 * will have the framework as this property.
                 *
                 * @param {boolean} eventObject.cancelled - Shows whether an  event's propagation was cancelled or not.
                 * It is set to `true` when `.stopPropagation()` is called.
                 *
                 * @param {function} eventObject.stopPropagation - Call this function from within a listener to prevent
                 * subsequent listeners from being executed.
                 *
                 * @param {boolean} eventObject.prevented - Shows whether the default action of this event has been
                 * prevented. It is set to `true` when `.preventDefault()` is called.
                 *
                 * @param {function} eventObject.preventDefault - Call this function to prevent the default action of an
                 * event. For example, for the event {@link FusionCharts#event:beforeResize}, if you do
                 * `.preventDefault()`, the resize will never take place and instead
                 * {@link FusionCharts#event:resizeCancelled} will be fired.
                 *
                 * @param {boolean} eventObject.detached - Denotes whether a listener has been detached and no longer
                 * gets executed for any subsequent event of this particular `type`.
                 *
                 * @param {function} eventObject.detachHandler - Allows the listener to remove itself rather than being
                 * called externally by {@link FusionCharts.removeEventListener}. This is very useful for one-time event
                 * listening or for special situations when the event is no longer required to be listened when the
                 * event has been fired with a specific condition.
                 *
                 * @param {object} eventArgs - Every event has an argument object as second parameter that contains
                 * information relevant to that particular event.
                 */
                slotLoader(EventTarget.listeners[type], eventObject, args);

                // Facilitate the call of a global event listener.
                slotLoader(EventTarget.listeners['*'], eventObject, args);

                // Execute default action
                switch (eventObject.prevented) {
                    case true:
                        if (typeof cancelFn === 'function') {
                            try {
                                cancelFn.call(eventScope || sender || win, eventObject,
                                    args || {});
                            }
                            catch (err) {
                                // Call error in a separate thread to avoid stopping
                                // of chart load.
                                setTimeout(function () {
                                    throw err;
                                }, 0);
                            }
                        }
                        break;
                    default:
                        if (typeof defaultFn === 'function') {
                            try {
                                defaultFn.call(eventScope || sender || win, eventObject,
                                    args || {});
                            }
                            catch (err) {
                                // Call error in a separate thread to avoid stopping
                                // of chart load.
                                setTimeout(function () {
                                    throw err;
                                }, 0);
                            }
                        }
                }

                // Statutory W3C NOT preventDefault flag
                return true;
            }
        },

        /**
         * List of events that has an equivalent legacy event. Used by the
         * raiseEvent method to check whether a particular event raised
         * has any corresponding legacy event.
         *
         * @type object
         */
        legacyEventList = global.legacyEventList = {},

        /**
         * Maintains a list of recently raised conditional events
         * @type object
         */
        conditionChecks = {};

    // Facilitate for raising events internally.
    raiseEvent = global.raiseEvent = function (type, args, obj, eventScope,
            defaultFn, cancelledFn) {
        return EventTarget.triggerEvent(type, obj, args, eventScope,
            defaultFn, cancelledFn);
    };

    global.disposeEvents = function (target) {
        var type, i;
        // Iterate through all events in the collection of listeners
        for (type in EventTarget.listeners) {
            for (i = 0; i < EventTarget.listeners[type].length; i += 1) {
                // When a match is found, delete the listener from the
                // collection.
                if (EventTarget.listeners[type][i][1] === target) {
                    EventTarget.listeners[type].splice(i, 1);
                }
            }
        }
    };
    /**
     * This method allows to uniformly raise events of FusionCharts
     * Framework.
     *
     * @param {string} name specifies the name of the event to be raised.
     * @param {object} args allows to provide an arguments object to be
     * passed on to the event listeners.
     * @param } obj is the FusionCharts instance object on
     * behalf of which the event would be raised.
     * @param {array} legacyArgs is an array of arguments to be passed on
     * to the equivalent legacy event.
     * @param {Event} source
     * @param {function} defaultFn
     * @param {function} cancelFn
     *
     * @type undefined
     */
    global.raiseEventWithLegacy = function (name, args, obj, legacyArgs,
            eventScope, defaultFn, cancelledFn) {
        var legacy = legacyEventList[name];
        raiseEvent(name, args, obj, eventScope, defaultFn, cancelledFn);
        if (legacy && typeof win[legacy] === 'function') {
            setTimeout(function () {
                win[legacy].apply(eventScope || win, legacyArgs);
            }, 0);
        }
    };

    /**
     * This allows one to raise related events that are grouped together and
     * raised by multiple sources. Usually this is used where a congregation
     * of successive events need to cancel out each other and behave like a
     * unified entity.
     *
     * @param {string} check is used to identify event groups. Provide same value
     * for all events that you want to group together from multiple sources.
     * @param {string} name specifies the name of the event to be raised.
     * @param {object} args allows to provide an arguments object to be
     * passed on to the event listeners.
     * @param } obj is the FusionCharts instance object on
     * behalf of which the event would be raised.
     * @param {object} eventScope
     * @param {function} defaultFn
     * @param {function} cancelledFn
     *
     * @returns {undefined}
     */
    global.raiseEventGroup = function (check, name, args, obj, eventScope,
            defaultFn, cancelledFn) {
        var id = obj.id,
            hash = check + id;

        if (conditionChecks[hash]) {
            clearTimeout(conditionChecks[hash]);
            delete conditionChecks[hash];
        }
        else {
            if (id && hash) {
                conditionChecks[hash] = setTimeout(function () {
                    raiseEvent(name, args, obj, eventScope, defaultFn, cancelledFn);
                    delete conditionChecks[hash];
                }, 0);
            }
            else {
                raiseEvent(name, args, obj, eventScope, defaultFn, cancelledFn);
            }
        }
    };

    // Extend the eventlisteners to internal global.
    global.addEventListener = function (type, listener, bind) {
        return EventTarget.addListener(type, listener, bind);
    };
    global.removeEventListener = function (type, listener, bind) {
        return EventTarget.removeListener(type, listener, bind);
    };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1c2lvbmNoYXJ0cy5tdWx0aWNoYXJ0aW5nLmpzIiwibXVsdGljaGFydGluZy5saWIuanMiLCJtdWx0aWNoYXJ0aW5nLmFqYXguanMiLCJtdWx0aWNoYXJ0aW5nLmNzdi5qcyIsIm11bHRpY2hhcnRpbmcuZGF0YXN0b3JlLmpzIiwibXVsdGljaGFydGluZy5kYXRhcHJvY2Vzc29yLmpzIiwibXVsdGljaGFydGluZy5kYXRhYWRhcHRlci5qcyIsIm11bHRpY2hhcnRpbmcuY2hhcnQuanMiLCJtdWx0aWNoYXJ0aW5nLm1hdHJpeC5qcyIsIm11bHRpY2hhcnRpbmcuZXZlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZ1c2lvbmNoYXJ0cy5tdWx0aWNoYXJ0aW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNdWx0aUNoYXJ0aW5nIEV4dGVuc2lvbiBmb3IgRnVzaW9uQ2hhcnRzXG4gKiBUaGlzIG1vZHVsZSBjb250YWlucyB0aGUgYmFzaWMgcm91dGluZXMgcmVxdWlyZWQgYnkgc3Vic2VxdWVudCBtb2R1bGVzIHRvXG4gKiBleHRlbmQvc2NhbGUgb3IgYWRkIGZ1bmN0aW9uYWxpdHkgdG8gdGhlIE11bHRpQ2hhcnRpbmcgb2JqZWN0LlxuICpcbiAqL1xuXG4gLyogZ2xvYmFsIHdpbmRvdzogdHJ1ZSAqL1xuXG4oZnVuY3Rpb24gKGVudiwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGVudi5kb2N1bWVudCA/XG4gICAgICAgICAgICBmYWN0b3J5KGVudikgOiBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXdpbi5kb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpbmRvdyB3aXRoIGRvY3VtZW50IG5vdCBwcmVzZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWN0b3J5KHdpbiwgdHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVudi5NdWx0aUNoYXJ0aW5nID0gZmFjdG9yeShlbnYsIHRydWUpO1xuICAgIH1cbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24gKF93aW5kb3csIHdpbmRvd0V4aXN0cykge1xuICAgIC8vIEluIGNhc2UgTXVsdGlDaGFydGluZyBhbHJlYWR5IGV4aXN0cy5cbiAgICBpZiAoX3dpbmRvdy5NdWx0aUNoYXJ0aW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgTXVsdGlDaGFydGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB9O1xuXG4gICAgTXVsdGlDaGFydGluZy5wcm90b3R5cGUud2luID0gX3dpbmRvdztcblxuICAgIGlmICh3aW5kb3dFeGlzdHMpIHtcbiAgICAgICAgX3dpbmRvdy5NdWx0aUNoYXJ0aW5nID0gTXVsdGlDaGFydGluZztcbiAgICB9XG4gICAgcmV0dXJuIE11bHRpQ2hhcnRpbmc7XG59KTtcbiIsIlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoTXVsdGlDaGFydGluZyk7XG4gICAgfVxufSkoZnVuY3Rpb24gKE11bHRpQ2hhcnRpbmcpIHtcblxuXHR2YXIgbWVyZ2UgPSBmdW5jdGlvbiAob2JqMSwgb2JqMiwgc2tpcFVuZGVmLCB0Z3RBcnIsIHNyY0Fycikge1xuICAgICAgICAgICAgdmFyIGl0ZW0sXG4gICAgICAgICAgICAgICAgc3JjVmFsLFxuICAgICAgICAgICAgICAgIHRndFZhbCxcbiAgICAgICAgICAgICAgICBzdHIsXG4gICAgICAgICAgICAgICAgY1JlZixcbiAgICAgICAgICAgICAgICBvYmplY3RUb1N0ckZuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICAgICAgICAgICAgICBhcnJheVRvU3RyID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICAgICAgICAgICAgICBvYmplY3RUb1N0ciA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgICAgICAgICAgICAgIGNoZWNrQ3ljbGljUmVmID0gZnVuY3Rpb24ob2JqLCBwYXJlbnRBcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBwYXJlbnRBcnIubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYkluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiA9PT0gcGFyZW50QXJyW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYkluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYkluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJJbmRleDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIE9CSkVDVFNUUklORyA9ICdvYmplY3QnO1xuXG4gICAgICAgICAgICAvL2NoZWNrIHdoZXRoZXIgb2JqMiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgLy9pZiBhcnJheSB0aGVuIGl0ZXJhdGUgdGhyb3VnaCBpdCdzIGluZGV4XG4gICAgICAgICAgICAvLyoqKiogTU9PVE9PTFMgcHJlY3V0aW9uXG5cbiAgICAgICAgICAgIGlmICghc3JjQXJyKSB7XG4gICAgICAgICAgICAgICAgdGd0QXJyID0gW29iajFdO1xuICAgICAgICAgICAgICAgIHNyY0FyciA9IFtvYmoyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRndEFyci5wdXNoKG9iajEpO1xuICAgICAgICAgICAgICAgIHNyY0Fyci5wdXNoKG9iajIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob2JqMiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgZm9yIChpdGVtID0gMDsgaXRlbSA8IG9iajIubGVuZ3RoOyBpdGVtICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1ZhbCA9IG9iajFbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0Z3RWYWwgPSBvYmoyW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGd0VmFsICE9PSBPQkpFQ1RTVFJJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKHNraXBVbmRlZiAmJiB0Z3RWYWwgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoxW2l0ZW1dID0gdGd0VmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNyY1ZhbCA9PT0gbnVsbCB8fCB0eXBlb2Ygc3JjVmFsICE9PSBPQkpFQ1RTVFJJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0gdGd0VmFsIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY1JlZiA9IGNoZWNrQ3ljbGljUmVmKHRndFZhbCwgc3JjQXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjUmVmICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1ZhbCA9IG9iajFbaXRlbV0gPSB0Z3RBcnJbY1JlZl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJnZShzcmNWYWwsIHRndFZhbCwgc2tpcFVuZGVmLCB0Z3RBcnIsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGl0ZW0gaW4gb2JqMikge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjVmFsID0gb2JqMVtpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRndFZhbCA9IG9iajJbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRndFZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdGd0VmFsID09PSBPQkpFQ1RTVFJJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpeCBmb3IgaXNzdWUgQlVHOiBGV1hULTYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUUgPCA5IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChudWxsKSBnaXZlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ1tvYmplY3QgT2JqZWN0XScgaW5zdGVhZCBvZiAnW29iamVjdCBOdWxsXSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYXQncyB3aHkgbnVsbCB2YWx1ZSBiZWNvbWVzIE9iamVjdCBpbiBJRSA8IDlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9IG9iamVjdFRvU3RyRm4uY2FsbCh0Z3RWYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ciA9PT0gb2JqZWN0VG9TdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3JjVmFsID09PSBudWxsIHx8IHR5cGVvZiBzcmNWYWwgIT09IE9CSkVDVFNUUklORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNSZWYgPSBjaGVja0N5Y2xpY1JlZih0Z3RWYWwsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNSZWYgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1ZhbCA9IG9iajFbaXRlbV0gPSB0Z3RBcnJbY1JlZl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJnZShzcmNWYWwsIHRndFZhbCwgc2tpcFVuZGVmLCB0Z3RBcnIsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RyID09PSBhcnJheVRvU3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNyY1ZhbCA9PT0gbnVsbCB8fCAhKHNyY1ZhbCBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNWYWwgPSBvYmoxW2l0ZW1dID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNSZWYgPSBjaGVja0N5Y2xpY1JlZih0Z3RWYWwsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNSZWYgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1ZhbCA9IG9iajFbaXRlbV0gPSB0Z3RBcnJbY1JlZl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJnZShzcmNWYWwsIHRndFZhbCwgc2tpcFVuZGVmLCB0Z3RBcnIsIHNyY0Fycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqMVtpdGVtXSA9IHRndFZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iajFbaXRlbV0gPSB0Z3RWYWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb2JqMTtcbiAgICAgICAgfSxcbiAgICAgICAgZXh0ZW5kMiA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyLCBza2lwVW5kZWYpIHtcbiAgICAgICAgICAgIHZhciBPQkpFQ1RTVFJJTkcgPSAnb2JqZWN0JztcbiAgICAgICAgICAgIC8vaWYgbm9uZSBvZiB0aGUgYXJndW1lbnRzIGFyZSBvYmplY3QgdGhlbiByZXR1cm4gYmFja1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmoxICE9PSBPQkpFQ1RTVFJJTkcgJiYgdHlwZW9mIG9iajIgIT09IE9CSkVDVFNUUklORykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iajIgIT09IE9CSkVDVFNUUklORyB8fCBvYmoyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqMSAhPT0gT0JKRUNUU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgb2JqMSA9IG9iajIgaW5zdGFuY2VvZiBBcnJheSA/IFtdIDoge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXJnZShvYmoxLCBvYmoyLCBza2lwVW5kZWYpO1xuICAgICAgICAgICAgcmV0dXJuIG9iajE7XG4gICAgICAgIH0sXG4gICAgICAgIGxpYiA9IHtcbiAgICAgICAgICAgIGV4dGVuZDI6IGV4dGVuZDIsXG4gICAgICAgICAgICBtZXJnZTogbWVyZ2VcbiAgICAgICAgfTtcblxuXHRNdWx0aUNoYXJ0aW5nLnByb3RvdHlwZS5saWIgPSAoTXVsdGlDaGFydGluZy5wcm90b3R5cGUubGliIHx8IGxpYik7XG5cbn0pOyIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cblx0dmFyIEFqYXggPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgYWpheCA9IHRoaXMsXG5cdFx0XHRcdGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdO1xuXG5cdFx0ICAgIGFqYXgub25TdWNjZXNzID0gYXJndW1lbnQuc3VjY2Vzcztcblx0XHQgICAgYWpheC5vbkVycm9yID0gYXJndW1lbnQuZXJyb3I7XG5cdFx0ICAgIGFqYXgub3BlbiA9IGZhbHNlO1xuXHRcdCAgICByZXR1cm4gYWpheC5nZXQoYXJndW1lbnQudXJsKTtcblx0XHR9LFxuXG4gICAgICAgIGFqYXhQcm90byA9IEFqYXgucHJvdG90eXBlLFxuXG4gICAgICAgIEZVTkNUSU9OID0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgTVNYTUxIVFRQID0gJ01pY3Jvc29mdC5YTUxIVFRQJyxcbiAgICAgICAgTVNYTUxIVFRQMiA9ICdNc3htbDIuWE1MSFRUUCcsXG4gICAgICAgIEdFVCA9ICdHRVQnLFxuICAgICAgICBYSFJFUUVSUk9SID0gJ1htbEh0dHByZXF1ZXN0IEVycm9yJyxcbiAgICAgICAgbXVsdGlDaGFydGluZ1Byb3RvID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUsXG4gICAgICAgIHdpbiA9IG11bHRpQ2hhcnRpbmdQcm90by53aW4sIC8vIGtlZXAgYSBsb2NhbCByZWZlcmVuY2Ugb2Ygd2luZG93IHNjb3BlXG5cbiAgICAgICAgLy8gUHJvYmUgSUUgdmVyc2lvblxuICAgICAgICB2ZXJzaW9uID0gcGFyc2VGbG9hdCh3aW4ubmF2aWdhdG9yLmFwcFZlcnNpb24uc3BsaXQoJ01TSUUnKVsxXSksXG4gICAgICAgIGllbHQ4ID0gKHZlcnNpb24gPj0gNS41ICYmIHZlcnNpb24gPD0gNykgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGZpcmVmb3ggPSAvbW96aWxsYS9pLnRlc3Qod2luLm5hdmlnYXRvci51c2VyQWdlbnQpLFxuICAgICAgICAvL1xuICAgICAgICAvLyBDYWxjdWxhdGUgZmxhZ3MuXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHBhZ2UgaXMgb24gZmlsZSBwcm90b2NvbC5cbiAgICAgICAgZmlsZVByb3RvY29sID0gd2luLmxvY2F0aW9uLnByb3RvY29sID09PSAnZmlsZTonLFxuICAgICAgICBBWE9iamVjdCA9IHdpbi5BY3RpdmVYT2JqZWN0LFxuXG4gICAgICAgIC8vIENoZWNrIGlmIG5hdGl2ZSB4aHIgaXMgcHJlc2VudFxuICAgICAgICBYSFJOYXRpdmUgPSAoIUFYT2JqZWN0IHx8ICFmaWxlUHJvdG9jb2wpICYmIHdpbi5YTUxIdHRwUmVxdWVzdCxcblxuICAgICAgICAvLyBQcmVwYXJlIGZ1bmN0aW9uIHRvIHJldHJpZXZlIGNvbXBhdGlibGUgeG1saHR0cHJlcXVlc3QuXG4gICAgICAgIG5ld1htbEh0dHBSZXF1ZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHhtbGh0dHA7XG5cbiAgICAgICAgICAgIC8vIGlmIHhtbGh0dHByZXF1ZXN0IGlzIHByZXNlbnQgYXMgbmF0aXZlLCB1c2UgaXQuXG4gICAgICAgICAgICBpZiAoWEhSTmF0aXZlKSB7XG4gICAgICAgICAgICAgICAgbmV3WG1sSHR0cFJlcXVlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWEhSTmF0aXZlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3WG1sSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXNlIGFjdGl2ZVggZm9yIElFXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHhtbGh0dHAgPSBuZXcgQVhPYmplY3QoTVNYTUxIVFRQMik7XG4gICAgICAgICAgICAgICAgbmV3WG1sSHR0cFJlcXVlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQVhPYmplY3QoTVNYTUxIVFRQMik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeG1saHR0cCA9IG5ldyBBWE9iamVjdChNU1hNTEhUVFApO1xuICAgICAgICAgICAgICAgICAgICBuZXdYbWxIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQVhPYmplY3QoTVNYTUxIVFRQKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgeG1saHR0cCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB4bWxodHRwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFByZXZlbnRzIGNhY2hlaW5nIG9mIEFKQVggcmVxdWVzdHMuXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAnSWYtTW9kaWZpZWQtU2luY2UnOiAnU2F0LCAyOSBPY3QgMTk5NCAxOTo0MzozMSBHTVQnLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMZXRzIHRoZSBzZXJ2ZXIga25vdyB0aGF0IHRoaXMgaXMgYW4gQUpBWCByZXF1ZXN0LlxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMZXRzIHNlcnZlciBrbm93IHdoaWNoIHdlYiBhcHBsaWNhdGlvbiBpcyBzZW5kaW5nIHJlcXVlc3RzLlxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0Z1c2lvbkNoYXJ0cycsXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1lbnRpb25zIGNvbnRlbnQtdHlwZXMgdGhhdCBhcmUgYWNjZXB0YWJsZSBmb3IgdGhlIHJlc3BvbnNlLiBTb21lIHNlcnZlcnMgcmVxdWlyZSB0aGlzIGZvciBBamF4XG4gICAgICAgICAgICAgKiBjb21tdW5pY2F0aW9uLlxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgJ0FjY2VwdCc6ICd0ZXh0L3BsYWluLCAqLyonLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgTUlNRSB0eXBlIG9mIHRoZSBib2R5IG9mIHRoZSByZXF1ZXN0IGFsb25nIHdpdGggaXRzIGNoYXJzZXQuXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCdcbiAgICAgICAgfTtcblxuICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmFqYXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQWpheChhcmd1bWVudHNbMF0pO1xuICAgIH07XG5cbiAgICBhamF4UHJvdG8uZ2V0ID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICB2YXIgd3JhcHBlciA9IHRoaXMsXG4gICAgICAgICAgICB4bWxodHRwID0gd3JhcHBlci54bWxodHRwLFxuICAgICAgICAgICAgZXJyb3JDYWxsYmFjayA9IHdyYXBwZXIub25FcnJvcixcbiAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayA9IHdyYXBwZXIub25TdWNjZXNzLFxuICAgICAgICAgICAgeFJlcXVlc3RlZEJ5ID0gJ1gtUmVxdWVzdGVkLUJ5JyxcbiAgICAgICAgICAgIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgZXZlbnRMaXN0ID0gWydvbmxvYWRzdGFydCcsICdvbmR1cmF0aW9uY2hhbmdlJywgJ29ubG9hZGVkbWV0YWRhdGEnLCAnb25sb2FkZWRkYXRhJywgJ29ucHJvZ3Jlc3MnLFxuICAgICAgICAgICAgICAgICdvbmNhbnBsYXknLCAnb25jYW5wbGF5dGhyb3VnaCcsICdvbmFib3J0JywgJ29uZXJyb3InLCAnb250aW1lb3V0JywgJ29ubG9hZGVuZCddO1xuXG4gICAgICAgIC8vIFgtUmVxdWVzdGVkLUJ5IGlzIHJlbW92ZWQgZnJvbSBoZWFkZXIgZHVyaW5nIGNyb3NzIGRvbWFpbiBhamF4IGNhbGxcbiAgICAgICAgaWYgKHVybC5zZWFyY2goL14oaHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvKS8pICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgIHdpbi5sb2NhdGlvbi5ob3N0bmFtZSAhPT0gLyhodHRwOlxcL1xcL3xodHRwczpcXC9cXC8pKFteXFwvXFw6XSopLy5leGVjKHVybClbMl0pIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSB1cmwgZG9lcyBub3QgY29udGFpbiBodHRwIG9yIGh0dHBzLCB0aGVuIGl0cyBhIHNhbWUgZG9tYWluIGNhbGwuIE5vIG5lZWQgdG8gdXNlIHJlZ2V4IHRvIGdldFxuICAgICAgICAgICAgLy8gZG9tYWluLiBJZiBpdCBjb250YWlucyB0aGVuIGNoZWNrcyBkb21haW4uXG4gICAgICAgICAgICBkZWxldGUgaGVhZGVyc1t4UmVxdWVzdGVkQnldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgIWhhc093bi5jYWxsKGhlYWRlcnMsIHhSZXF1ZXN0ZWRCeSkgJiYgKGhlYWRlcnNbeFJlcXVlc3RlZEJ5XSA9ICdGdXNpb25DaGFydHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgheG1saHR0cCB8fCBpZWx0OCB8fCBmaXJlZm94KSB7XG4gICAgICAgICAgICB4bWxodHRwID0gbmV3WG1sSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHdyYXBwZXIueG1saHR0cCA9IHhtbGh0dHA7XG4gICAgICAgIH1cblxuICAgICAgICB4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHhtbGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGlmICgoIXhtbGh0dHAuc3RhdHVzICYmIGZpbGVQcm90b2NvbCkgfHwgKHhtbGh0dHAuc3RhdHVzID49IDIwMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgeG1saHR0cC5zdGF0dXMgPCAzMDApIHx8IHhtbGh0dHAuc3RhdHVzID09PSAzMDQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHhtbGh0dHAuc3RhdHVzID09PSAxMjIzIHx8IHhtbGh0dHAuc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHhtbGh0dHAucmVzcG9uc2VUZXh0LCB3cmFwcGVyLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbGJhY2sobmV3IEVycm9yKFhIUkVRRVJST1IpLCB3cmFwcGVyLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3cmFwcGVyLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBldmVudExpc3QuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgICAgICB4bWxodHRwW2V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBtdWx0aUNoYXJ0aW5nUHJvdG8ucmFpc2VFdmVudChldmVudE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgRXZlbnQgOiBldmVudFxuICAgICAgICAgICAgICAgIH0sIHdyYXBwZXIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHhtbGh0dHAub3BlbihHRVQsIHVybCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICh4bWxodHRwLm92ZXJyaWRlTWltZVR5cGUpIHtcbiAgICAgICAgICAgICAgICB4bWxodHRwLm92ZXJyaWRlTWltZVR5cGUoJ3RleHQvcGxhaW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpIGluIGhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICB4bWxodHRwLnNldFJlcXVlc3RIZWFkZXIoaSwgaGVhZGVyc1tpXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHhtbGh0dHAuc2VuZCgpO1xuICAgICAgICAgICAgd3JhcHBlci5vcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayhlcnJvciwgd3JhcHBlciwgdXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB4bWxodHRwO1xuICAgIH07XG5cbiAgICBhamF4UHJvdG8uYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgICB4bWxodHRwID0gaW5zdGFuY2UueG1saHR0cDtcblxuICAgICAgICBpbnN0YW5jZS5vcGVuID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB4bWxodHRwICYmIHR5cGVvZiB4bWxodHRwLmFib3J0ID09PSBGVU5DVElPTiAmJiB4bWxodHRwLnJlYWR5U3RhdGUgJiZcbiAgICAgICAgICAgICAgICB4bWxodHRwLnJlYWR5U3RhdGUgIT09IDAgJiYgeG1saHR0cC5hYm9ydCgpO1xuICAgIH07XG5cbiAgICBhamF4UHJvdG8uZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgaW5zdGFuY2Uub3BlbiAmJiBpbnN0YW5jZS5hYm9ydCgpO1xuXG4gICAgICAgIGRlbGV0ZSBpbnN0YW5jZS5vbkVycm9yO1xuICAgICAgICBkZWxldGUgaW5zdGFuY2Uub25TdWNjZXNzO1xuICAgICAgICBkZWxldGUgaW5zdGFuY2UueG1saHR0cDtcbiAgICAgICAgZGVsZXRlIGluc3RhbmNlLm9wZW47XG5cbiAgICAgICAgcmV0dXJuIChpbnN0YW5jZSA9IG51bGwpO1xuICAgIH07XG59KTsiLCJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cbiAgICAvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4gICAgLy8gU291cmNlOiBodHRwOi8vd3d3LmJlbm5hZGVsLmNvbS9ibG9nLzE1MDQtQXNrLUJlbi1QYXJzaW5nLUNTVi1TdHJpbmdzLVdpdGgtSmF2YXNjcmlwdC1FeGVjLVJlZ3VsYXItRXhwcmVzc2lvbi1Db21tYW5kLmh0bVxuICAgIC8vIFRoaXMgd2lsbCBwYXJzZSBhIGRlbGltaXRlZCBzdHJpbmcgaW50byBhbiBhcnJheSBvZlxuICAgIC8vIGFycmF5cy4gVGhlIGRlZmF1bHQgZGVsaW1pdGVyIGlzIHRoZSBjb21tYSwgYnV0IHRoaXNcbiAgICAvLyBjYW4gYmUgb3ZlcnJpZGVuIGluIHRoZSBzZWNvbmQgYXJndW1lbnQuXG5cblxuICAgIC8vIFRoaXMgd2lsbCBwYXJzZSBhIGRlbGltaXRlZCBzdHJpbmcgaW50byBhbiBhcnJheSBvZlxuICAgIC8vIGFycmF5cy4gVGhlIGRlZmF1bHQgZGVsaW1pdGVyIGlzIHRoZSBjb21tYSwgYnV0IHRoaXNcbiAgICAvLyBjYW4gYmUgb3ZlcnJpZGVuIGluIHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgZnVuY3Rpb24gQ1NWVG9BcnJheSAoc3RyRGF0YSwgc3RyRGVsaW1pdGVyKSB7XG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZGVsaW1pdGVyIGlzIGRlZmluZWQuIElmIG5vdCxcbiAgICAgICAgLy8gdGhlbiBkZWZhdWx0IHRvIGNvbW1hLlxuICAgICAgICBzdHJEZWxpbWl0ZXIgPSAoc3RyRGVsaW1pdGVyIHx8IFwiLFwiKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHBhcnNlIHRoZSBDU1YgdmFsdWVzLlxuICAgICAgICB2YXIgb2JqUGF0dGVybiA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgLy8gRGVsaW1pdGVycy5cbiAgICAgICAgICAgICAgICBcIihcXFxcXCIgKyBzdHJEZWxpbWl0ZXIgKyBcInxcXFxccj9cXFxcbnxcXFxccnxeKVwiICtcbiAgICAgICAgICAgICAgICAvLyBRdW90ZWQgZmllbGRzLlxuICAgICAgICAgICAgICAgIFwiKD86XFxcIihbXlxcXCJdKig/OlxcXCJcXFwiW15cXFwiXSopKilcXFwifFwiICtcbiAgICAgICAgICAgICAgICAvLyBTdGFuZGFyZCBmaWVsZHMuXG4gICAgICAgICAgICAgICAgXCIoW15cXFwiXFxcXFwiICsgc3RyRGVsaW1pdGVyICsgXCJcXFxcclxcXFxuXSopKVwiXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgXCJnaVwiXG4gICAgICAgICAgICApO1xuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gaG9sZCBvdXIgZGF0YS4gR2l2ZSB0aGUgYXJyYXlcbiAgICAgICAgLy8gYSBkZWZhdWx0IGVtcHR5IGZpcnN0IHJvdy5cbiAgICAgICAgdmFyIGFyckRhdGEgPSBbW11dO1xuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gaG9sZCBvdXIgaW5kaXZpZHVhbCBwYXR0ZXJuXG4gICAgICAgIC8vIG1hdGNoaW5nIGdyb3Vwcy5cbiAgICAgICAgdmFyIGFyck1hdGNoZXMgPSBudWxsO1xuICAgICAgICAvLyBLZWVwIGxvb3Bpbmcgb3ZlciB0aGUgcmVndWxhciBleHByZXNzaW9uIG1hdGNoZXNcbiAgICAgICAgLy8gdW50aWwgd2UgY2FuIG5vIGxvbmdlciBmaW5kIGEgbWF0Y2guXG4gICAgICAgIHdoaWxlIChhcnJNYXRjaGVzID0gb2JqUGF0dGVybi5leGVjKCBzdHJEYXRhICkpe1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBkZWxpbWl0ZXIgdGhhdCB3YXMgZm91bmQuXG4gICAgICAgICAgICB2YXIgc3RyTWF0Y2hlZERlbGltaXRlciA9IGFyck1hdGNoZXNbIDEgXTtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZ2l2ZW4gZGVsaW1pdGVyIGhhcyBhIGxlbmd0aFxuICAgICAgICAgICAgLy8gKGlzIG5vdCB0aGUgc3RhcnQgb2Ygc3RyaW5nKSBhbmQgaWYgaXQgbWF0Y2hlc1xuICAgICAgICAgICAgLy8gZmllbGQgZGVsaW1pdGVyLiBJZiBpZCBkb2VzIG5vdCwgdGhlbiB3ZSBrbm93XG4gICAgICAgICAgICAvLyB0aGF0IHRoaXMgZGVsaW1pdGVyIGlzIGEgcm93IGRlbGltaXRlci5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBzdHJNYXRjaGVkRGVsaW1pdGVyLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIChzdHJNYXRjaGVkRGVsaW1pdGVyICE9IHN0ckRlbGltaXRlcilcbiAgICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdlIGhhdmUgcmVhY2hlZCBhIG5ldyByb3cgb2YgZGF0YSxcbiAgICAgICAgICAgICAgICAvLyBhZGQgYW4gZW1wdHkgcm93IHRvIG91ciBkYXRhIGFycmF5LlxuICAgICAgICAgICAgICAgIGFyckRhdGEucHVzaCggW10gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgb3VyIGRlbGltaXRlciBvdXQgb2YgdGhlIHdheSxcbiAgICAgICAgICAgIC8vIGxldCdzIGNoZWNrIHRvIHNlZSB3aGljaCBraW5kIG9mIHZhbHVlIHdlXG4gICAgICAgICAgICAvLyBjYXB0dXJlZCAocXVvdGVkIG9yIHVucXVvdGVkKS5cbiAgICAgICAgICAgIGlmIChhcnJNYXRjaGVzWyAyIF0pe1xuICAgICAgICAgICAgICAgIC8vIFdlIGZvdW5kIGEgcXVvdGVkIHZhbHVlLiBXaGVuIHdlIGNhcHR1cmVcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHZhbHVlLCB1bmVzY2FwZSBhbnkgZG91YmxlIHF1b3Rlcy5cbiAgICAgICAgICAgICAgICB2YXIgc3RyTWF0Y2hlZFZhbHVlID0gYXJyTWF0Y2hlc1sgMiBdLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoIFwiXFxcIlxcXCJcIiwgXCJnXCIgKSxcbiAgICAgICAgICAgICAgICAgICAgXCJcXFwiXCJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgZm91bmQgYSBub24tcXVvdGVkIHZhbHVlLlxuICAgICAgICAgICAgICAgIHZhciBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWyAzIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIG91ciB2YWx1ZSBzdHJpbmcsIGxldCdzIGFkZFxuICAgICAgICAgICAgLy8gaXQgdG8gdGhlIGRhdGEgYXJyYXkuXG4gICAgICAgICAgICBhcnJEYXRhWyBhcnJEYXRhLmxlbmd0aCAtIDEgXS5wdXNoKCBzdHJNYXRjaGVkVmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXR1cm4gdGhlIHBhcnNlZCBkYXRhLlxuICAgICAgICByZXR1cm4oIGFyckRhdGEgKTtcbiAgICB9XG4gICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cbiAgICB2YXIgTXVsdGlDaGFydGluZ1Byb3RvID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGU7XG5cbiAgICBNdWx0aUNoYXJ0aW5nUHJvdG8uY29udmVydFRvQXJyYXkgPSBmdW5jdGlvbiAoZGF0YSwgZGVsaW1pdGVyLCBvdXRwdXRGb3JtYXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjc3ZUb0FyciA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGRlbGltaXRlciA9IGRhdGEuZGVsaW1pdGVyO1xuICAgICAgICAgICAgb3V0cHV0Rm9ybWF0ID0gZGF0YS5vdXRwdXRGb3JtYXQ7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGRhdGEuY2FsbGJhY2s7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5zdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NTViBzdHJpbmcgbm90IHByb3ZpZGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNwbGl0ZWREYXRhID0gZGF0YS5zcGxpdCgvXFxyXFxufFxccnxcXG4vKSxcbiAgICAgICAgICAgIC8vdG90YWwgbnVtYmVyIG9mIHJvd3NcbiAgICAgICAgICAgIGxlbiA9IHNwbGl0ZWREYXRhLmxlbmd0aCxcbiAgICAgICAgICAgIC8vZmlyc3Qgcm93IGlzIGhlYWRlciBhbmQgc3BsaXRpbmcgaXQgaW50byBhcnJheXNcbiAgICAgICAgICAgIGhlYWRlciA9IENTVlRvQXJyYXkoc3BsaXRlZERhdGFbMF0sIGRlbGltaXRlciksIC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgaSA9IDEsXG4gICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgIGsgPSAwLFxuICAgICAgICAgICAga2xlbiA9IDAsXG4gICAgICAgICAgICBjZWxsID0gW10sXG4gICAgICAgICAgICBtaW4gPSBNYXRoLm1pbixcbiAgICAgICAgICAgIGZpbmFsT2IsXG4gICAgICAgICAgICB1cGRhdGVNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW0gPSAwLFxuICAgICAgICAgICAgICAgICAgICBqbGVuID0gMCxcbiAgICAgICAgICAgICAgICAgICAgb2JqID0ge307XG4gICAgICAgICAgICAgICAgICAgIGxpbSA9IGkgKyAzMDAwO1xuICAgICAgICAgICAgICAgIGlmKGkgPT09IDEpe1xuICAgICAgICAgICAgICAgICAgICBNdWx0aUNoYXJ0aW5nUHJvdG8ucmFpc2VFdmVudCgnb25QYXJzaW5nU3RhcnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFdmVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOidsb2Fkc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsOiBsZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgY3N2VG9BcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBNdWx0aUNoYXJ0aW5nUHJvdG8ucmFpc2VFdmVudCgnb25QYXJzaW5nUHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgICAgICAgIEV2ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkOiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6J3Byb2dyZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogbGVuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgY3N2VG9BcnIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChsaW0gPiBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGltID0gbGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGxpbTsgKytpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgY2VsbCBhcnJheSB0aGF0IGNvaW50YWluIGNzdiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNlbGwgPSBDU1ZUb0FycmF5KHNwbGl0ZWREYXRhW2ldLCBkZWxpbWl0ZXIpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICAgICAgY2VsbCA9IGNlbGwgJiYgY2VsbFswXTtcbiAgICAgICAgICAgICAgICAgICAgLy90YWtlIG1pbiBvZiBoZWFkZXIgbGVuZ3RoIGFuZCB0b3RhbCBjb2x1bW5zXG4gICAgICAgICAgICAgICAgICAgIGpsZW4gPSBtaW4oaGVhZGVyLmxlbmd0aCwgY2VsbC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXRGb3JtYXQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsT2IucHVzaChjZWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvdXRwdXRGb3JtYXQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBqbGVuOyArK2opIHsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRpbmcgdGhlIGZpbmFsIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialtoZWFkZXJbal1dID0gY2VsbFtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsT2IucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0ge307XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBqbGVuOyArK2opIHsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRpbmcgdGhlIGZpbmFsIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsT2JbaGVhZGVyW2pdXS5wdXNoKGNlbGxbal0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2FsbCB1cGRhdGUgbWFuYWdlclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHVwZGF0ZU1hbmFnZXIsIDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIE11bHRpQ2hhcnRpbmdQcm90by5yYWlzZUV2ZW50KCdvblBhcnNpbmdFbmQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFdmVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZDogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOidsb2FkZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogbGVuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIGNzdlRvQXJyKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soZmluYWxPYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBvdXRwdXRGb3JtYXQgPSBvdXRwdXRGb3JtYXQgfHwgMTtcbiAgICAgICAgaGVhZGVyID0gaGVhZGVyICYmIGhlYWRlclswXTtcblxuICAgICAgICAvL2lmIHRoZSB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoc3BsaXRlZERhdGFbc3BsaXRlZERhdGEubGVuZ3RoIC0gMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBzcGxpdGVkRGF0YS5zcGxpY2UoKHNwbGl0ZWREYXRhLmxlbmd0aCAtIDEpLCAxKTtcbiAgICAgICAgICAgIGxlbi0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdXRwdXRGb3JtYXQgPT09IDEpIHtcbiAgICAgICAgICAgIGZpbmFsT2IgPSBbXTtcbiAgICAgICAgICAgIGZpbmFsT2IucHVzaChoZWFkZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dEZvcm1hdCA9PT0gMikge1xuICAgICAgICAgICAgZmluYWxPYiA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dEZvcm1hdCA9PT0gMykge1xuICAgICAgICAgICAgZmluYWxPYiA9IHt9O1xuICAgICAgICAgICAgZm9yIChrID0gMCwga2xlbiA9IGhlYWRlci5sZW5ndGg7IGsgPCBrbGVuOyArK2spIHtcbiAgICAgICAgICAgICAgICBmaW5hbE9iW2hlYWRlcltrXV0gPSBbXTtcbiAgICAgICAgICAgIH0gICBcbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZU1hbmFnZXIoKTtcblxuICAgIH07XG5cbn0pO1xuIiwiLypqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShNdWx0aUNoYXJ0aW5nKTtcbiAgICB9XG59KShmdW5jdGlvbiAoTXVsdGlDaGFydGluZykge1xuXG5cdHZhclx0bXVsdGlDaGFydGluZ1Byb3RvID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUsXG5cdFx0Ly9saWIgPSBtdWx0aUNoYXJ0aW5nUHJvdG8ubGliLFxuICAgICAgICBldmVudExpc3QgPSB7XG4gICAgICAgICAgICAnbW9kZWxVcGRhdGVkJzogJ21vZGVsdXBkYXRlZCcsXG4gICAgICAgICAgICAnbW9kZWxEZWxldGVkJzogJ21vZGVsZGVsZXRlZCcsXG4gICAgICAgICAgICAnbWV0YUluZm9VcGRhdGUnOiAnbWV0YWluZm91cGRhdGVkJyxcbiAgICAgICAgICAgICdwcm9jZXNzb3JVcGRhdGVkJzogJ3Byb2Nlc3NvcnVwZGF0ZWQnLFxuICAgICAgICAgICAgJ3Byb2Nlc3NvckRlbGV0ZWQnOiAncHJvY2Vzc29yZGVsZXRlZCdcbiAgICAgICAgfSxcbiAgICAgICAgdWlkQ291bnRlciA9IDAsXG4gICAgICAgIGdlcmF0ZVVJRCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnbW9kZWxfaWRfJyArICh1aWRDb3VudGVyKyspO1xuICAgICAgICB9LFxuICAgICAgICBnZXRQcm9jZXNzb3JTdG9yZU9iaiA9IGZ1bmN0aW9uIChwcm9jZXNzb3IsIGRzKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmVPYmogPSB7XG5cdCAgICAgICAgICAgICAgICBwcm9jZXNzb3I6IHByb2Nlc3Nvcixcblx0ICAgICAgICAgICAgICAgIGxpc3RuZXJzOiB7fVxuXHQgICAgICAgICAgICB9LFxuXHQgICAgICAgICAgICBsaXN0bmVycztcblxuICAgICAgICAgICAgbGlzdG5lcnMgPSBzdG9yZU9iai5saXN0bmVycztcbiAgICAgICAgICAgIGxpc3RuZXJzW2V2ZW50TGlzdC5wcm9jZXNzb3JVcGRhdGVkXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcy5fZ2VuZXJhdGVJbnB1dERhdGEoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsaXN0bmVyc1tldmVudExpc3QucHJvY2Vzc29yRGVsZXRlZF0gPSAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRzLnJlbW92ZURhdGFQcm9jZXNzb3IocHJvY2Vzc29yKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gc3RvcmVPYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZExpc3RuZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQsIGxpc3RuZXJzT2JqKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnROYW1lO1xuICAgICAgICAgICAgaWYgKGxpc3RuZXJzT2JqICYmIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIGZvciAoZXZlbnROYW1lIGluIGxpc3RuZXJzT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RuZXJzT2JqW2V2ZW50TmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlTGlzdG5lcnMgPSBmdW5jdGlvbiAoZWxlbWVudCwgbGlzdG5lcnNPYmopIHtcbiAgICAgICAgICAgIHZhciBldmVudE5hbWU7XG4gICAgICAgICAgICBpZiAobGlzdG5lcnNPYmogJiYgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChldmVudE5hbWUgaW4gbGlzdG5lcnNPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdG5lcnNPYmpbZXZlbnROYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXHRcdC8vIENvbnN0cnVjdG9yIGNsYXNzIGZvciBEYXRhTW9kZWwuXG5cdFx0RGF0YU1vZGVsID0gZnVuY3Rpb24gKCkge1xuXHQgICAgXHR2YXIgZHMgPSB0aGlzO1xuXHQgICAgXHRkcy5saW5rcyA9IHtcbiAgICAgICAgICAgICAgaW5wdXRTdG9yZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBpbnB1dEpTT046IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgaW5wdXREYXRhOiBbXSxcbiAgICAgICAgICAgICAgcHJvY2Vzc29yczogW10sXG4gICAgICAgICAgICAgIG1ldGFPYmo6IHt9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gYWRkIHRoZSB1bmljSWRcbiAgICAgICAgICAgIGRzLmlkID0gZ2VyYXRlVUlEKCk7XG5cdCAgICBcdGFyZ3VtZW50c1swXSAmJiBkcy5zZXREYXRhKGFyZ3VtZW50c1swXSk7XG5cdFx0fSxcblx0XHREYXRhTW9kZWxQcm90byA9IERhdGFNb2RlbC5wcm90b3R5cGU7XG5cbiAgICAgICAgLy9cbiAgICAgICAgbXVsdGlDaGFydGluZ1Byb3RvLmNyZWF0ZURhdGFTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0YU1vZGVsKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH07XG5cbiAgICBEYXRhTW9kZWxQcm90by5nZXRJZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfTtcbiAgICBEYXRhTW9kZWxQcm90by5fZ2VuZXJhdGVJbnB1dERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRzID0gdGhpcztcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBvbGQgZGF0YVxuICAgICAgICBkcy5saW5rcy5pbnB1dERhdGEubGVuZ3RoID0gMDtcblxuICAgICAgICAvLyBnZXQgdGhlIGRhdGEgZnJvbSB0aGUgaW5wdXQgU3RvcmVcbiAgICAgICAgaWYgKGRzLmxpbmtzLmlucHV0U3RvcmUgJiYgZHMubGlua3MuaW5wdXRTdG9yZS5nZXRKU09OKSB7XG4gICAgICAgIFx0ZHMubGlua3MuaW5wdXREYXRhID0gZHMubGlua3MuaW5wdXREYXRhLmNvbmNhdChkcy5saW5rcy5pbnB1dFN0b3JlLmdldEpTT04oKSk7XG4gICAgICAgICAgICAvLyBkcy5saW5rcy5pbnB1dERhdGEucHVzaC5hcHBseShkcy5saW5rcy5pbnB1dERhdGEsIGRzLmxpbmtzLmlucHV0U3RvcmUuZ2V0SlNPTigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCB0aGUgaW5wdXQgSlNPTiAoc2VwZXJhdGVseSBhZGRlZClcbiAgICAgICAgaWYgKGRzLmxpbmtzLmlucHV0SlNPTiAmJiBkcy5saW5rcy5pbnB1dEpTT04ubGVuZ3RoKSB7XG4gICAgICAgIFx0ZHMubGlua3MuaW5wdXREYXRhID0gZHMubGlua3MuaW5wdXREYXRhLmNvbmNhdChkcy5saW5rcy5pbnB1dEpTT04pO1xuICAgICAgICBcdC8vIGRzLmxpbmtzLmlucHV0RGF0YS5wdXNoLmFwcGx5KGRzLmxpbmtzLmlucHV0RGF0YSwgZHMubGlua3MuaW5wdXRKU09OKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gZm9yIHNpbXBsZWNpdHkgY2FsbCB0aGUgb3V0cHV0IEpTT04gY3JlYXRpb24gbWV0aG9kIGFzIHdlbGxcbiAgICAgICAgZHMuX2dlbmVyYXRlT3V0cHV0RGF0YSgpO1xuXG4gICAgfTtcblxuXG4gICAgRGF0YU1vZGVsUHJvdG8uX2dlbmVyYXRlT3V0cHV0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRzID0gdGhpcyxcbiAgICAgICAgbGlua3MgPSBkcy5saW5rcyxcbiAgICAgICAgb3V0cHV0RGF0YSA9IGxpbmtzLmlucHV0RGF0YS5jb25jYXQoW10pLFxuICAgICAgICBpLFxuICAgICAgICBsID0gbGlua3MucHJvY2Vzc29ycy5sZW5ndGgsXG4gICAgICAgIHN0b3JlT2JqO1xuXG4gICAgICAgIGlmIChsICYmIG91dHB1dERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgc3RvcmVPYmogPSBsaW5rcy5wcm9jZXNzb3JzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChzdG9yZU9iaiAmJiBzdG9yZU9iai5wcm9jZXNzb3IgJiYgc3RvcmVPYmoucHJvY2Vzc29yLmdldFByb2Nlc3NlZERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRvZG86IHdlIGhhdmUgdG8gY3JlYXRlIHRoaXMgbmV3IG1ldGhvZCBpbiB0aGUgcHJvY2Vzc29yIHRvIHJldHVybiBhIHByb2Nlc3NlZCBKU09OIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IHN0b3JlT2JqLnByb2Nlc3Nvci5nZXRQcm9jZXNzZWREYXRhKG91dHB1dERhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkcy5saW5rcy5vdXRwdXREYXRhID0gb3V0cHV0RGF0YTtcblxuICAgICAgICAvLyByYWlzZSB0aGUgZXZlbnQgZm9yIE91dHB1dERhdGEgbW9kaWZpZWQgZXZlbnRcbiAgICAgICAgZHMucmFpc2VFdmVudChldmVudExpc3QubW9kZWxVcGRhdGVkLCB7XG4gICAgICAgICAgICAnZGF0YSc6IGRzLmxpbmtzLm91dHB1dERhdGFcbiAgICAgICAgfSwgZHMpO1xuICAgIH07XG5cblxuICAgIC8vIEZ1bmN0aW9uIHRvIGdldCB0aGUganNvbmRhdGEgb2YgdGhlIGRhdGEgb2JqZWN0XG5cdERhdGFNb2RlbFByb3RvLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGRzID0gdGhpcztcblx0XHRyZXR1cm4gKGRzLmxpbmtzLm91dHB1dERhdGEgfHwgZHMubGlua3MuaW5wdXREYXRhKTtcblx0fTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGdldCBjaGlsZCBkYXRhIFN0b3JlIG9iamVjdCBhZnRlciBhcHBseWluZyBmaWx0ZXIgb24gdGhlIHBhcmVudCBkYXRhLlxuXHQvLyBAcGFyYW1zIHtmaWx0ZXJzfSAtIFRoaXMgY2FuIGJlIGEgZmlsdGVyIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIGZpbHRlciBmdW5jdGlvbnMuXG5cdERhdGFNb2RlbFByb3RvLmdldENoaWxkTW9kZWwgPSBmdW5jdGlvbiAoZmlsdGVycykge1xuXHRcdHZhciBkcyA9IHRoaXMsXG5cdFx0XHRuZXdEcyxcbiAgICAgICAgICAgIG1ldGFJbmZvID0gZHMubGlua3MubWV0YU9iaixcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIG5ld0RTTGluayxcbiAgICAgICAgICAgIE1ldGFDb25zdHJ1Y3Rvcixcblx0XHRcdG1ldGFDb25zdHJhY3RvcixcbiAgICAgICAgICAgIGlucHV0U3RvcmVMaXN0bmVycztcbiAgICAgICAgbmV3RHMgPSBuZXcgRGF0YU1vZGVsKCk7XG4gICAgICAgIG5ld0RTTGluayA9IG5ld0RzLmxpbmtzO1xuICAgICAgICBuZXdEU0xpbmsuaW5wdXRTdG9yZSA9IGRzO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBsaXN0bmVyc1xuICAgICAgICBpbnB1dFN0b3JlTGlzdG5lcnMgPSBuZXdEU0xpbmsuaW5wdXRTdG9yZUxpc3RuZXJzID0ge307XG4gICAgICAgIGlucHV0U3RvcmVMaXN0bmVyc1tldmVudExpc3QubW9kZWxVcGRhdGVkXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5ld0RzLl9nZW5lcmF0ZUlucHV0RGF0YSgpO1xuICAgICAgICB9O1xuICAgICAgICBpbnB1dFN0b3JlTGlzdG5lcnNbZXZlbnRMaXN0Lm1vZGVsRGVsZXRlZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBuZXdEcy5kaXNwb3NlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGlucHV0U3RvcmVMaXN0bmVyc1tldmVudExpc3QubWV0YUluZm9VcGRhdGVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbmV3RHMucmFpc2VFdmVudChldmVudExpc3QubWV0YUluZm9VcGRhdGUsIHt9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpbmhlcml0IG1ldGFJbmZvc1xuICAgICAgICBmb3IgKGtleSBpbiBtZXRhSW5mbykge1xuICAgICAgICAgICAgTWV0YUNvbnN0cnVjdG9yID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICBtZXRhQ29uc3RyYWN0b3IucHJvdG90eXBlID0gbWV0YUluZm9ba2V5XTtcbiAgICAgICAgICAgIG1ldGFDb25zdHJhY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZXRhQ29uc3RydWN0b3I7XG4gICAgICAgICAgICBuZXdEU0xpbmsubWV0YU9ialtrZXldID0gbmV3IE1ldGFDb25zdHJ1Y3RvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXR0YWNoZWQgZXZlbnQgbGlzdGVuZXIgb24gcGFyZW50IGRhdGFcbiAgICAgICAgYWRkTGlzdG5lcnMoZHMsIGlucHV0U3RvcmVMaXN0bmVycyk7XG4gICAgICAgIG5ld0RzLl9nZW5lcmF0ZUlucHV0RGF0YSgpO1xuXG4gICAgICAgIG5ld0RzLmFkZERhdGFQcm9jZXNzb3IoZmlsdGVycyk7XG4gICAgICAgIHJldHVybiBuZXdEcztcblx0fTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGFkZCBwcm9jZXNzb3IgaW4gdGhlIGRhdGEgc3RvcmVcbiAgICBEYXRhTW9kZWxQcm90by5hZGREYXRhUHJvY2Vzc29yID0gZnVuY3Rpb24gKHByb2Nlc3NvcnMpIHtcbiAgICAgICAgdmFyIGRzID0gdGhpcyxcbiAgICAgICAgaSxcbiAgICAgICAgbCxcbiAgICAgICAgcHJvY2Vzc29yLFxuICAgICAgICBzdG9yZU9iajtcbiAgICAgICAgLy8gaWYgc2luZ2xlIGZpbHRlciBpcyBwYXNzZWQgbWFrZSBpdCBhbiBBcnJheVxuICAgICAgICBpZiAoIShwcm9jZXNzb3JzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgICAgICBwcm9jZXNzb3JzID0gW3Byb2Nlc3NvcnNdO1xuICAgICAgICB9XG4gICAgICAgIGwgPSBwcm9jZXNzb3JzLmxlbmd0aDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgcHJvY2Vzc29yID0gcHJvY2Vzc29yc1tpXTtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzb3IgJiYgcHJvY2Vzc29yLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBzdG9yZU9iaiA9IGdldFByb2Nlc3NvclN0b3JlT2JqKHByb2Nlc3NvciwgZHMpO1xuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgbGlzdG5lcnNcbiAgICAgICAgICAgICAgICBhZGRMaXN0bmVycyhwcm9jZXNzb3IsIHN0b3JlT2JqLmxpc3RuZXJzKTtcbiAgICAgICAgICAgICAgICBkcy5saW5rcy5wcm9jZXNzb3JzLnB1c2goc3RvcmVPYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgb3V0cHV0RGF0YVxuICAgICAgICBkcy5fZ2VuZXJhdGVPdXRwdXREYXRhKCk7XG4gICAgfTtcbiAgICAvL0Z1bmN0aW9uIHRvIHJlbW92ZSBwcm9jZXNzb3IgaW4gdGhlIGRhdGEgc3RvcmVcbiAgICBEYXRhTW9kZWxQcm90by5yZW1vdmVEYXRhUHJvY2Vzc29yID0gZnVuY3Rpb24gKHByb2Nlc3NvcnMpIHtcbiAgICAgICAgdmFyIGRzID0gdGhpcyxcbiAgICAgICAgcHJvY2Vzc29yc1N0b3JlID0gZHMubGlua3MucHJvY2Vzc29ycyxcbiAgICAgICAgc3RvcmVPYmosXG4gICAgICAgIGksXG4gICAgICAgIGwsXG4gICAgICAgIGosXG4gICAgICAgIGssXG4gICAgICAgIHByb2Nlc3NvcixcbiAgICAgICAgZm91bmRNYXRjaDtcbiAgICAgICAgLy8gaWYgc2luZ2xlIGZpbHRlciBpcyBwYXNzZWQgbWFrZSBpdCBhbiBBcnJheVxuICAgICAgICBpZiAoIShwcm9jZXNzb3JzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgICAgICBwcm9jZXNzb3JzID0gW3Byb2Nlc3NvcnNdO1xuICAgICAgICB9XG4gICAgICAgIGsgPSBwcm9jZXNzb3JzLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGs7IGogKz0gMSkge1xuICAgICAgICAgICAgcHJvY2Vzc29yID0gcHJvY2Vzc29yc1tqXTtcbiAgICAgICAgICAgIGwgPSBwcm9jZXNzb3JzU3RvcmUubGVuZ3RoO1xuICAgICAgICAgICAgZm91bmRNYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGwgJiYgIWZvdW5kTWF0Y2g7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHN0b3JlT2JqID0gcHJvY2Vzc29yc1N0b3JlW2ldO1xuICAgICAgICAgICAgICAgIGlmICAoc3RvcmVPYmogJiYgc3RvcmVPYmoucHJvY2Vzc29yID09PSBwcm9jZXNzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRNYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RuZXJzKHByb2Nlc3Nvciwgc3RvcmVPYmoubGlzdG5lcnMpO1xuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHByZWNlc3NvciBzdG9yZSBPYmpcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc29yc1N0b3JlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBvdXRwdXREYXRhXG4gICAgICAgIGRzLl9nZW5lcmF0ZU91dHB1dERhdGEoKTtcbiAgICB9O1xuXG4gICAgLy8gRnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVyIGF0IGRhdGFTdG9yZSBsZXZlbC5cblx0RGF0YU1vZGVsUHJvdG8uYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHRcdHJldHVybiBtdWx0aUNoYXJ0aW5nUHJvdG8uYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcyk7XG5cdH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGF0IGRhdGFTdG9yZSBsZXZlbC5cbiAgICBEYXRhTW9kZWxQcm90by5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdFx0cmV0dXJuIG11bHRpQ2hhcnRpbmdQcm90by5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzKTtcblx0fTtcblxuICAgIERhdGFNb2RlbFByb3RvLnJhaXNlRXZlbnQgPSBmdW5jdGlvbiAodHlwZSwgZGF0YU9iaikge1xuXHRcdHJldHVybiBtdWx0aUNoYXJ0aW5nUHJvdG8ucmFpc2VFdmVudCh0eXBlLCBkYXRhT2JqLCB0aGlzKTtcblx0fTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGFkZCBkYXRhIGluIHRoZSBkYXRhIHN0b3JlXG5cdERhdGFNb2RlbFByb3RvLnNldERhdGEgPSBmdW5jdGlvbiAoZGF0YVNwZWNzLCBjYWxsYmFjaykge1xuXHRcdHZhciBkcyA9IHRoaXMsXG5cdFx0XHRkYXRhVHlwZSA9IGRhdGFTcGVjcy5kYXRhVHlwZSxcblx0XHRcdGRhdGFTb3VyY2UgPSBkYXRhU3BlY3MuZGF0YVNvdXJjZSxcblx0XHRcdGNhbGxiYWNrSGVscGVyRm4gPSBmdW5jdGlvbiAoSlNPTkRhdGEpIHtcblx0XHRcdFx0ZHMubGlua3MuaW5wdXRKU09OID0gSlNPTkRhdGEuY29uY2F0KGRzLmxpbmtzLmlucHV0SlNPTiB8fCBbXSk7XG5cdFx0XHRcdGRzLl9nZW5lcmF0ZUlucHV0RGF0YSgpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soSlNPTkRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0aWYgKGRhdGFUeXBlID09PSAnY3N2Jykge1xuXHRcdFx0bXVsdGlDaGFydGluZ1Byb3RvLmNvbnZlcnRUb0FycmF5KHtcblx0XHRcdFx0c3RyaW5nIDogZGF0YVNwZWNzLmRhdGFTb3VyY2UsXG5cdFx0XHRcdGRlbGltaXRlciA6IGRhdGFTcGVjcy5kZWxpbWl0ZXIsXG5cdFx0XHRcdG91dHB1dEZvcm1hdCA6IGRhdGFTcGVjcy5vdXRwdXRGb3JtYXQsXG5cdFx0XHRcdGNhbGxiYWNrIDogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0XHRjYWxsYmFja0hlbHBlckZuKGRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjYWxsYmFja0hlbHBlckZuKGRhdGFTb3VyY2UpO1xuXHRcdH1cblx0fTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIHJlbW92ZSBhbGwgZGF0YSAobm90IHRoZSBkYXRhIGxpbmtlZCBmcm9tIHRoZSBwYXJlbnQpIGluIHRoZSBkYXRhIHN0b3JlXG4gICAgRGF0YU1vZGVsUHJvdG8uY2xlYXJEYXRhID0gZnVuY3Rpb24gKCl7XG4gICAgICAgIHZhciBkcyA9IHRoaXM7XG4gICAgICAgIC8vIGNsZWFyIGlucHV0RGF0YSBzdG9yZVxuICAgICAgICBkcy5saW5rcy5pbnB1dEpTT04gJiYgKGRzLmxpbmtzLmlucHV0SlNPTiA9IHVuZGVmaW5lZCk7XG4gICAgICAgIC8vIHJlLWdlbmVyYXRlIHRoZSBzdG9yZSdzIGRhdGFcbiAgICAgICAgZHMuX2dlbmVyYXRlSW5wdXREYXRhKCk7XG4gICAgfTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGRpc3Bvc2UgYSBzdG9yZVxuICAgIERhdGFNb2RlbFByb3RvLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKXtcbiAgICAgICAgdmFyIGRzID0gdGhpcyxcbiAgICAgICAgbGlua3MgPSBkcy5saW5rcyxcbiAgICAgICAgaW5wdXRTdG9yZSA9IGxpbmtzLmlucHV0U3RvcmUsXG4gICAgICAgIHByb2Nlc3NvcnNTdG9yZSA9IGxpbmtzLnByb2Nlc3NvcnMsXG4gICAgICAgIHN0b3JlT2JqLFxuICAgICAgICBpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBpbm91dFN0b3JlIGxpc3RlbmVyc1xuICAgICAgICBpZiAoaW5wdXRTdG9yZSAmJiBpbnB1dFN0b3JlLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJlbW92ZUxpc3RuZXJzKGlucHV0U3RvcmUsIGxpbmtzLmlucHV0U3RvcmVMaXN0bmVycyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgYWxsIGZpbHRlcnMgYW5kIHRoaXIgbGlzdGVuZXJzXG4gICAgICAgIGZvciAoaSA9IHByb2Nlc3NvcnNTdG9yZS5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgc3RvcmVPYmogPSBwcm9jZXNzb3JzU3RvcmVbaV07XG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGxpc3RlbmVyc1xuICAgICAgICAgICAgcmVtb3ZlTGlzdG5lcnMoc3RvcmVPYmoucHJvY2Vzc29yLCBzdG9yZU9iai5saXN0bmVycyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc29yc1N0b3JlLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgLy8gcmFpc2UgdGhlIGV2ZW50IGZvciBPdXRwdXREYXRhIG1vZGlmaWVkIGV2ZW50XG4gICAgICAgIGRzLnJhaXNlRXZlbnQoZXZlbnRMaXN0Lm1vZGVsRGVsZXRlZCwge30pO1xuXG5cbiAgICAgICAgLy8gQHRvZG86IGRlbGV0ZSBhbGwgbGlua3NcblxuICAgICAgICAvLyBAdG9kbzogY2xlYXIgYWxsIGV2ZW50cyBhcyB0aGV5IHdpbGwgbm90IGJlIHVzZWQgYW55IG1vcmVcblxuICAgIH07XG4gICAgLy8gRnVudGlvbiB0byBnZXQgYWxsIHRoZSBrZXlzIG9mIHRoZSBKU09OIGRhdGFcbiAgICAvLyBAdG9kbzogbmVlZCB0byBpbXByb3ZlIGl0IGZvciBwZXJmb3JtYW5jZSBhcyB3ZWxsIGFzIGZvciBiZXR0ZXIgcmVzdWx0c1xuXHREYXRhTW9kZWxQcm90by5nZXRLZXlzID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBkcyA9IHRoaXMsXG5cdFx0XHRkYXRhID0gZHMuZ2V0SlNPTigpLFxuXHRcdFx0Zmlyc3REYXRhID0gZGF0YVswXSB8fCB7fTtcblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyhmaXJzdERhdGEpO1xuXHR9O1xuXG5cdC8vIEZ1bnRpb24gdG8gZ2V0IGFsbCB0aGUgdW5pcXVlIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIGEga2V5XG4gICAgLy8gQHRvZG86IG5lZWQgdG8gaW1wcm92ZSBpdCBmb3IgcGVyZm9ybWFuY2UgYXMgd2VsbCBhcyBmb3IgYmV0dGVyIHJlc3VsdHNcblx0RGF0YU1vZGVsUHJvdG8uZ2V0VW5pcXVlVmFsdWVzID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdHZhciBkcyA9IHRoaXMsXG5cdFx0XHRkYXRhID0gZHMuZ2V0SlNPTigpLFxuXHRcdFx0aW50ZXJuYWxEYXRhID0gZGF0YVswXSxcblx0XHRcdGlzQXJyYXkgPSBpbnRlcm5hbERhdGEgaW5zdGFuY2VvZiBBcnJheSxcblx0XHRcdC8vdW5pcXVlVmFsdWVzID0gZHMudW5pcXVlVmFsdWVzW2tleV0sXG5cdFx0XHR0ZW1wVW5pcXVlVmFsdWVzID0ge30sXG5cdFx0XHRsZW4gPSBkYXRhLmxlbmd0aCxcblx0XHRcdGk7XG5cblx0XHQvLyBpZiAodW5pcXVlVmFsdWVzKSB7XG5cdFx0Ly8gXHRyZXR1cm4gdW5pcXVlVmFsdWVzO1xuXHRcdC8vIH1cblxuXHRcdGlmIChpc0FycmF5KSB7XG5cdFx0XHRpID0gMTtcblx0XHRcdGtleSA9IGRzLmdldEtleXMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGVsZW1lbnQudG9VcHBlckNhc2UoKSA9PT0ga2V5LnRvVXBwZXJDYXNlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGkgPSBpc0FycmF5ID8gMSA6IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aW50ZXJuYWxEYXRhID0gaXNBcnJheSA/IGRhdGFbaV1ba2V5XSA6IGRhdGFbaV1ba2V5XTtcblx0XHRcdCF0ZW1wVW5pcXVlVmFsdWVzW2ludGVybmFsRGF0YV0gJiYgKHRlbXBVbmlxdWVWYWx1ZXNbaW50ZXJuYWxEYXRhXSA9IHRydWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0ZW1wVW5pcXVlVmFsdWVzKTtcblx0fTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGFkZCAvIHVwZGF0ZSBtZXRhZGF0YVxuXHREYXRhTW9kZWxQcm90by51cGRhdGVNZXRhRGF0YSA9IGZ1bmN0aW9uIChmaWVsZE5hbWUsIG1ldGFJbmZvKSB7XG4gICAgICAgIHZhciBkcyA9IHRoaXMsXG4gICAgICAgIG1ldGFPYmogPSBkcy5saW5rcy5tZXRhT2JqLFxuICAgICAgICBmaWVsZE1ldGFJbmZvLCBrZXk7XG5cdFx0aWYgKGZpZWxkTWV0YUluZm8gPSBtZXRhT2JqW2ZpZWxkTmFtZV0pIHtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIG1ldGFJbmZvKSB7XG4gICAgICAgICAgICAgICAgZmllbGRNZXRhSW5mb1trZXldID0gbWV0YUluZm9ba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkcy5yYWlzZUV2ZW50KGV2ZW50TGlzdC5tZXRhSW5mb1VwZGF0ZSwge30pO1xuXHR9O1xuICAgIC8vIEZ1bmN0aW9uIHRvIGFkZCBtZXRhZGF0YVxuICAgIC8vIE5vdCByZXF1aXJlZFxuXHQvLyBEYXRhTW9kZWxQcm90by5kZWxldGVNZXRhRGF0YSA9IGZ1bmN0aW9uIChmaWVsZE5hbWUsIG1ldGFJbmZvS2V5KSB7XG4gICAgLy8gICAgIHZhciBkcyA9IHRoaXMsXG4gICAgLy8gICAgIG1ldGFPYmogPSBkcy5saW5rcy5tZXRhT2JqO1xuICAgIC8vICAgICBpZiAobWV0YU9ialtmaWVsZE5hbWVdKSB7XG4gICAgLy8gICAgICAgICBtZXRhT2JqW2ZpZWxkTmFtZV1bbWV0YUluZm9LZXldID0gdW5kZWZpbmVkO1xuICAgIC8vICAgICB9XG5cdC8vIH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gZ2V0IHRoZSBhZGRlZCBtZXRhRGF0YVxuXHREYXRhTW9kZWxQcm90by5nZXRNZXRhRGF0YSA9IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcblx0XHR2YXIgZHMgPSB0aGlzLFxuICAgICAgICBtZXRhT2JqID0gZHMubGlua3MubWV0YU9iajtcbiAgICAgICAgcmV0dXJuIGZpZWxkTmFtZSA/IChtZXRhT2JqW2ZpZWxkTmFtZV0gfHwge30pIDogbWV0YU9iajtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBhZGQgZGF0YSB0byB0aGUgZGF0YVN0b3JhZ2UgYXN5bmNocm9ub3VzbHkgdmlhIGFqYXhcbiAgICBEYXRhTW9kZWxQcm90by5zZXREYXRhVXJsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGF0YVN0b3JlID0gdGhpcyxcbiAgICAgICAgICAgIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgZGF0YVNvdXJjZSA9IGFyZ3VtZW50LmRhdGFTb3VyY2UsXG4gICAgICAgICAgICBkYXRhVHlwZSA9IGFyZ3VtZW50LmRhdGFUeXBlLFxuICAgICAgICAgICAgZGVsaW1pdGVyID0gYXJndW1lbnQuZGVsaW1pdGVyLFxuICAgICAgICAgICAgb3V0cHV0Rm9ybWF0ID0gYXJndW1lbnQub3V0cHV0Rm9ybWF0LFxuICAgICAgICAgICAgY2FsbGJhY2sgPSBhcmd1bWVudHNbMV0sXG4gICAgICAgICAgICBjYWxsYmFja0FyZ3MgPSBhcmd1bWVudC5jYWxsYmFja0FyZ3MsXG4gICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgIG11bHRpQ2hhcnRpbmdQcm90by5hamF4KHtcbiAgICAgICAgICAgIHVybCA6IGRhdGFTb3VyY2UsXG4gICAgICAgICAgICBzdWNjZXNzIDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFUeXBlID09PSAnanNvbicgPyBKU09OLnBhcnNlKHN0cmluZykgOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgZGF0YVN0b3JlLnNldERhdGEoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhU291cmNlIDogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGUgOiBkYXRhVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyIDogZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRGb3JtYXQgOiBvdXRwdXRGb3JtYXQsXG4gICAgICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZXJyb3IgOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsIlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoTXVsdGlDaGFydGluZyk7XG4gICAgfVxufSkoZnVuY3Rpb24gKE11bHRpQ2hhcnRpbmcpIHtcblxuXHR2YXIgbXVsdGlDaGFydGluZ1Byb3RvID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUsXG5cdFx0bGliID0gbXVsdGlDaGFydGluZ1Byb3RvLmxpYixcblx0XHRmaWx0ZXJTdG9yZSA9IGxpYi5maWx0ZXJTdG9yZSA9IHt9LFxuXHRcdGZpbHRlckxpbmsgPSBsaWIuZmlsdGVyTGluayA9IHt9LFxuXHRcdGZpbHRlcklkQ291bnQgPSAwLFxuXHRcdGRhdGFTdG9yYWdlID0gbGliLmRhdGFTdG9yYWdlLFxuXHRcdHBhcmVudFN0b3JlID0gbGliLnBhcmVudFN0b3JlLFxuXHRcdGV2ZW50TGlzdCA9IHtcbiAgICAgICAgICAgICdtb2RlbFVwZGF0ZWQnOiAnbW9kZWx1cGRhdGVkJyxcbiAgICAgICAgICAgICdtb2RlbERlbGV0ZWQnOiAnbW9kZWxkZWxldGVkJyxcbiAgICAgICAgICAgICdtZXRhSW5mb1VwZGF0ZSc6ICdtZXRhaW5mb3VwZGF0ZWQnLFxuICAgICAgICAgICAgJ3Byb2Nlc3NvclVwZGF0ZWQnOiAncHJvY2Vzc29ydXBkYXRlZCcsXG4gICAgICAgICAgICAncHJvY2Vzc29yRGVsZXRlZCc6ICdwcm9jZXNzb3JkZWxldGVkJ1xuICAgICAgICB9LFxuXHRcdC8vIENvbnN0cnVjdG9yIGNsYXNzIGZvciBEYXRhUHJvY2Vzc29yLlxuXHRcdERhdGFQcm9jZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICBcdHZhciBtYW5hZ2VyID0gdGhpcztcblx0ICAgIFx0bWFuYWdlci5hZGRSdWxlKGFyZ3VtZW50c1swXSk7XG5cdFx0fSxcblx0XHRcblx0XHRkYXRhUHJvY2Vzc29yUHJvdG8gPSBEYXRhUHJvY2Vzc29yLnByb3RvdHlwZSxcblxuXHRcdC8vIEZ1bmN0aW9uIHRvIHVwZGF0ZSBkYXRhIG9uIGNoYW5nZSBvZiBmaWx0ZXIuXG5cdFx0dXBkYXRhRmlsdGVyUHJvY2Vzc29yID0gZnVuY3Rpb24gKGlkLCBjb3B5UGFyZW50VG9DaGlsZCkge1xuXHRcdFx0dmFyIGksXG5cdFx0XHRcdGRhdGEgPSBmaWx0ZXJMaW5rW2lkXSxcblx0XHRcdFx0SlNPTkRhdGEsXG5cdFx0XHRcdGRhdHVtLFxuXHRcdFx0XHRkYXRhSWQsXG5cdFx0XHRcdGxlbiA9IGRhdGEubGVuZ3RoO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICsrKSB7XG5cdFx0XHRcdGRhdHVtID0gZGF0YVtpXTtcblx0XHRcdFx0ZGF0YUlkID0gZGF0dW0uaWQ7XG5cdFx0XHRcdGlmICghbGliLnRlbXBEYXRhVXBkYXRlZFtkYXRhSWRdKSB7XG5cdFx0XHRcdFx0aWYgKHBhcmVudFN0b3JlW2RhdGFJZF0gJiYgZGF0YVN0b3JhZ2VbZGF0YUlkXSkge1xuXHRcdFx0XHRcdFx0SlNPTkRhdGEgPSBwYXJlbnRTdG9yZVtkYXRhSWRdLmdldERhdGEoKTtcblx0XHRcdFx0XHRcdGRhdHVtLm1vZGlmeURhdGEoY29weVBhcmVudFRvQ2hpbGQgPyBKU09ORGF0YSA6IGZpbHRlclN0b3JlW2lkXShKU09ORGF0YSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBwYXJlbnRTdG9yZVtkYXRhSWRdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bGliLnRlbXBEYXRhVXBkYXRlZCA9IHt9O1xuXHRcdH07XG5cblx0bXVsdGlDaGFydGluZ1Byb3RvLmNyZWF0ZURhdGFQcm9jZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRhUHJvY2Vzc29yKGFyZ3VtZW50c1swXSk7XG5cdH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gYWRkIGZpbHRlciBpbiB0aGUgZmlsdGVyIHN0b3JlXG5cdGRhdGFQcm9jZXNzb3JQcm90by5hZGRSdWxlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBmaWx0ZXIgPSB0aGlzLFxuXHRcdFx0b2xkSWQgPSBmaWx0ZXIuaWQsXG5cdFx0XHRhcmd1bWVudCA9IGFyZ3VtZW50c1swXSxcblx0XHRcdGZpbHRlckZuID0gKGFyZ3VtZW50ICYmIGFyZ3VtZW50LnJ1bGUpIHx8IGFyZ3VtZW50LFxuXHRcdFx0aWQgPSBhcmd1bWVudCAmJiBhcmd1bWVudC50eXBlLFxuXHRcdFx0dHlwZSA9IGFyZ3VtZW50ICYmIGFyZ3VtZW50LnR5cGU7XG5cblx0XHRpZCA9IG9sZElkIHx8IGlkIHx8ICdmaWx0ZXJTdG9yZScgKyBmaWx0ZXJJZENvdW50ICsrO1xuXHRcdGZpbHRlclN0b3JlW2lkXSA9IGZpbHRlckZuO1xuXG5cdFx0ZmlsdGVyLmlkID0gaWQ7XG5cdFx0ZmlsdGVyLnR5cGUgPSB0eXBlO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBkYXRhIG9uIHdoaWNoIHRoZSBmaWx0ZXIgaXMgYXBwbGllZCBhbmQgYWxzbyBvbiB0aGUgY2hpbGQgZGF0YS5cblx0XHRpZiAoZmlsdGVyTGlua1tpZF0pIHtcblx0XHRcdHVwZGF0YUZpbHRlclByb2Nlc3NvcihpZCk7XG5cdFx0fVxuXG5cdFx0bXVsdGlDaGFydGluZ1Byb3RvLnJhaXNlRXZlbnQoZXZlbnRMaXN0LnByb2Nlc3NvclVwZGF0ZWQsIHtcblx0XHRcdCdpZCc6IGlkLFxuXHRcdFx0J2RhdGEnIDogZmlsdGVyRm5cblx0XHR9LCBmaWx0ZXIpO1xuXHR9O1xuXG5cdC8vIEZ1bnRpb24gdG8gZ2V0IHRoZSBmaWx0ZXIgbWV0aG9kLlxuXHRkYXRhUHJvY2Vzc29yUHJvdG8uZ2V0UHJvY2Vzc29yID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBmaWx0ZXJTdG9yZVt0aGlzLmlkXTtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byBnZXQgdGhlIElEIG9mIHRoZSBmaWx0ZXIuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5nZXRJRCA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fTtcblxuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBmaWx0ZXIgPSB0aGlzLFxuXHRcdFx0aWQgPSBmaWx0ZXIuaWQ7XG5cblx0XHRmaWx0ZXJMaW5rW2lkXSAmJiB1cGRhdGFGaWx0ZXJQcm9jZXNzb3IoaWQsIHRydWUpO1xuXG5cdFx0ZGVsZXRlIGZpbHRlclN0b3JlW2lkXTtcblx0XHRkZWxldGUgZmlsdGVyTGlua1tpZF07XG5cblx0XHRtdWx0aUNoYXJ0aW5nUHJvdG8ucmFpc2VFdmVudChldmVudExpc3QucHJvY2Vzc29yRGVsZXRlZCwge1xuXHRcdFx0J2lkJzogaWQsXG5cdFx0fSwgZmlsdGVyKTtcblx0fTtcblxuXHRkYXRhUHJvY2Vzc29yUHJvdG8uZmlsdGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYWRkUnVsZShcblx0XHRcdHtcdHJ1bGUgOiBhcmd1bWVudHNbMF0sXG5cdFx0XHRcdHR5cGUgOiAnZmlsdGVyJ1xuXHRcdFx0fVxuXHRcdCk7XG5cdH07XG5cblx0ZGF0YVByb2Nlc3NvclByb3RvLnNvcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5hZGRSdWxlKFxuXHRcdFx0e1x0cnVsZSA6IGFyZ3VtZW50c1swXSxcblx0XHRcdFx0dHlwZSA6ICdzb3J0J1xuXHRcdFx0fVxuXHRcdCk7XG5cdH07XG5cblx0ZGF0YVByb2Nlc3NvclByb3RvLm1hcCA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFkZFJ1bGUoXG5cdFx0XHR7XHRydWxlIDogYXJndW1lbnRzWzBdLFxuXHRcdFx0XHR0eXBlIDogJ21hcCdcblx0XHRcdH1cblx0XHQpO1xuXHR9O1xuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5nZXRQcm9jZXNzZWREYXRhID0gZnVuY3Rpb24gKEpTT05EYXRhKSB7XG5cdFx0dmFyIGRhdGFQcm9jZXNzb3IgPSB0aGlzLFxuXHRcdFx0dHlwZSA9IGRhdGFQcm9jZXNzb3IudHlwZSxcblx0XHRcdGZpbHRlckZuID0gZGF0YVByb2Nlc3Nvci5nZXRQcm9jZXNzb3IoKTtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICAnc29ydCcgOiByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvcnQuY2FsbChKU09ORGF0YSwgZmlsdGVyRm4pO1xuICAgICAgICAgICAgY2FzZSAgJ2ZpbHRlcicgOiByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKEpTT05EYXRhLCBmaWx0ZXJGbik7XG4gICAgICAgICAgICBjYXNlICdtYXAnIDogcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChKU09ORGF0YSwgZmlsdGVyRm4pO1xuICAgICAgICAgICAgZGVmYXVsdCA6IHJldHVybiBmaWx0ZXJGbihKU09ORGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cdH07XG5cblx0Ly8gRnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVyIGF0IGRhdGFQcm9jZXNzb3IgbGV2ZWwuXG5cdGRhdGFQcm9jZXNzb3JQcm90by5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdFx0cmV0dXJuIG11bHRpQ2hhcnRpbmdQcm90by5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzKTtcblx0fTtcblxuXHQvLyBGdW5jdGlvbiB0byByZW1vdmUgZXZlbnQgbGlzdGVuZXIgYXQgZGF0YVByb2Nlc3NvciBsZXZlbC5cbiAgICBkYXRhUHJvY2Vzc29yUHJvdG8ucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHRcdHJldHVybiBtdWx0aUNoYXJ0aW5nUHJvdG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcyk7XG5cdH07XG5cbiAgICBkYXRhUHJvY2Vzc29yUHJvdG8ucmFpc2VFdmVudCA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhT2JqKSB7XG5cdFx0cmV0dXJuIG11bHRpQ2hhcnRpbmdQcm90by5yYWlzZUV2ZW50KHR5cGUsIGRhdGFPYmosIHRoaXMpO1xuXHR9O1xuXG59KTsiLCJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KE11bHRpQ2hhcnRpbmcpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChNdWx0aUNoYXJ0aW5nKSB7XG5cbiAgICB2YXIgZXh0ZW5kMiA9IE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmxpYi5leHRlbmQyLFxuICAgICAgICBOVUxMID0gbnVsbCxcbiAgICAgICAgQ09MT1IgPSAnY29sb3InLFxuICAgICAgICBQQUxFVFRFQ09MT1JTID0gJ3BhbGV0dGVDb2xvcnMnO1xuICAgIC8vZnVuY3Rpb24gdG8gY29udmVydCBkYXRhLCBpdCByZXR1cm5zIGZjIHN1cHBvcnRlZCBKU09OXG4gICAgdmFyIERhdGFBZGFwdGVyID0gZnVuY3Rpb24gKGRhdGFTb3VyY2UsIGNvbmYsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkYXRhYWRhcHRlciA9IHRoaXM7XG5cbiAgICAgICAgZGF0YWFkYXB0ZXIuZGF0YVN0b3JlID0gZGF0YVNvdXJjZTsgICAgICAgXG4gICAgICAgIGRhdGFhZGFwdGVyLmRhdGFKU09OID0gZGF0YWFkYXB0ZXIuZGF0YVN0b3JlICYmIGRhdGFhZGFwdGVyLmRhdGFTdG9yZS5nZXRKU09OKCk7XG4gICAgICAgIGRhdGFhZGFwdGVyLmNvbmZpZ3VyYXRpb24gPSBjb25mO1xuICAgICAgICBkYXRhYWRhcHRlci5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBkYXRhYWRhcHRlci5GQ2pzb24gPSBkYXRhYWRhcHRlci5fX2NvbnZlcnREYXRhX18oKTtcbiAgICB9LFxuICAgIHByb3RvRGF0YWFkYXB0ZXIgPSBEYXRhQWRhcHRlci5wcm90b3R5cGU7XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLl9fY29udmVydERhdGFfXyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YWFkYXB0ZXIgPSB0aGlzLCAgICAgICAgICAgIFxuICAgICAgICAgICAgYWdncmVnYXRlZERhdGEsXG4gICAgICAgICAgICBnZW5lcmFsRGF0YSxcbiAgICAgICAgICAgIGpzb24gPSB7fSxcbiAgICAgICAgICAgIHByZWRlZmluZWRKc29uID0ge30sXG4gICAgICAgICAgICBqc29uRGF0YSA9IGRhdGFhZGFwdGVyLmRhdGFKU09OLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IGRhdGFhZGFwdGVyLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICBjYWxsYmFjayA9IGRhdGFhZGFwdGVyLmNhbGxiYWNrLFxuICAgICAgICAgICAgaXNNZXRhRGF0YSA9IGRhdGFhZGFwdGVyLmRhdGFTdG9yZSAmJiAoZGF0YWFkYXB0ZXIuZGF0YVN0b3JlLmdldE1ldGFEYXRhKCkgPyB0cnVlIDogZmFsc2UpO1xuICAgICAgICAgICAgcHJlZGVmaW5lZEpzb24gPSBjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uY29uZmlnO1xuXG4gICAgICAgIGlmIChqc29uRGF0YSAmJiBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICBnZW5lcmFsRGF0YSA9IGRhdGFhZGFwdGVyLl9fZ2VuZXJhbERhdGFGb3JtYXRfXyhqc29uRGF0YSwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmNhdGVnb3JpZXMgPSBjb25maWd1cmF0aW9uLmNhdGVnb3JpZXMgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YWFkYXB0ZXIuZGF0YVN0b3JlLmdldFVuaXF1ZVZhbHVlcyhjb25maWd1cmF0aW9uLmRpbWVuc2lvblswXSk7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmNhdGVnb3JpZXMgJiYgKGFnZ3JlZ2F0ZWREYXRhID0gZGF0YWFkYXB0ZXIuX19nZXRTb3J0ZWREYXRhX18oZ2VuZXJhbERhdGEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmNhdGVnb3JpZXMsIGNvbmZpZ3VyYXRpb24uZGltZW5zaW9uLCBjb25maWd1cmF0aW9uLmFnZ3JlZ2F0ZU1vZGUpKTtcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZWREYXRhID0gYWdncmVnYXRlZERhdGEgfHwgZ2VuZXJhbERhdGE7XG4gICAgICAgICAgICBkYXRhYWRhcHRlci5hZ2dyZWdhdGVkRGF0YSA9IGFnZ3JlZ2F0ZWREYXRhO1xuICAgICAgICAgICAganNvbiA9IGRhdGFhZGFwdGVyLl9fanNvbkNyZWF0b3JfXyhhZ2dyZWdhdGVkRGF0YSwgY29uZmlndXJhdGlvbik7ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAganNvbiA9IChwcmVkZWZpbmVkSnNvbiAmJiBleHRlbmQyKGpzb24scHJlZGVmaW5lZEpzb24pKSB8fCBqc29uO1xuICAgICAgICBqc29uID0gKGNhbGxiYWNrICYmIGNhbGxiYWNrKGpzb24pKSB8fCBqc29uO1xuICAgICAgICByZXR1cm4gaXNNZXRhRGF0YSA/IGRhdGFhZGFwdGVyLl9fc2V0RGVmYXVsdEF0dHJfXyhqc29uKSA6IGpzb247XG4gICAgfTtcblxuICAgIHByb3RvRGF0YWFkYXB0ZXIuX19nZXRTb3J0ZWREYXRhX18gPSBmdW5jdGlvbiAoZGF0YSwgY2F0ZWdvcnlBcnIsIGRpbWVuc2lvbiwgYWdncmVnYXRlTW9kZSkge1xuICAgICAgICB2YXIgZGF0YWFkYXB0ZXIgPSB0aGlzLFxuICAgICAgICAgICAgaW5kZW94T2ZLZXksXG4gICAgICAgICAgICBuZXdEYXRhID0gW10sXG4gICAgICAgICAgICBzdWJTZXREYXRhID0gW10sXG4gICAgICAgICAgICBrZXkgPSBbXSxcbiAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBbXSxcbiAgICAgICAgICAgIGxlbktleSxcbiAgICAgICAgICAgIGxlbkRhdGEsXG4gICAgICAgICAgICBsZW5DYXQsXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgayxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBhcnIgPSBbXSxcbiAgICAgICAgICAgIGRhdGFTdG9yZSA9IGRhdGFhZGFwdGVyLmRhdGFTdG9yZTtcbiAgXG4gICAgICAgIChBcnJheS5pc0FycmF5KGRpbWVuc2lvbikgJiYgKGtleSA9IGRpbWVuc2lvbikpIHx8IChrZXkgPSBbZGltZW5zaW9uXSk7XG5cbiAgICAgICAgKGNhdGVnb3J5QXJyICYmICFjYXRlZ29yeUFyci5sZW5ndGgpIHx8IChjYXRlZ29yeUFyciA9IGRhdGFTdG9yZS5nZXRVbmlxdWVWYWx1ZXMoa2V5WzBdKSk7XG4gICAgICAgIChBcnJheS5pc0FycmF5KGNhdGVnb3J5QXJyWzBdKSAmJiAoY2F0ZWdvcmllcyA9IGNhdGVnb3J5QXJyKSkgfHwgKGNhdGVnb3JpZXMgPSBbY2F0ZWdvcnlBcnJdKTtcblxuICAgICAgICBuZXdEYXRhLnB1c2goZGF0YVswXSk7XG4gICAgICAgIGZvcihrID0gMCwgbGVuS2V5ID0ga2V5Lmxlbmd0aDsgayA8IGxlbktleTsgaysrKSB7XG4gICAgICAgICAgICBpbmRlb3hPZktleSA9IGRhdGFbMF0uaW5kZXhPZihrZXlba10pOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoaSA9IDAsbGVuQ2F0ID0gY2F0ZWdvcmllc1trXS5sZW5ndGg7IGkgPCBsZW5DYXQgICYmIGluZGVveE9mS2V5ICE9PSAtMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3ViU2V0RGF0YSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihqID0gMSwgbGVuRGF0YSA9IGRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIChkYXRhW2pdW2luZGVveE9mS2V5XSA9PSBjYXRlZ29yaWVzW2tdW2ldKSAmJiAoc3ViU2V0RGF0YS5wdXNoKGRhdGFbal0pKTtcbiAgICAgICAgICAgICAgICB9ICAgICBcbiAgICAgICAgICAgICAgICBhcnJbaW5kZW94T2ZLZXldID0gY2F0ZWdvcmllc1trXVtpXTtcbiAgICAgICAgICAgICAgICAoc3ViU2V0RGF0YS5sZW5ndGggPT09IDApICYmIChzdWJTZXREYXRhLnB1c2goYXJyKSk7XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5wdXNoKGRhdGFhZGFwdGVyLl9fZ2V0QWdncmVnYXRlRGF0YV9fKHN1YlNldERhdGEsIGNhdGVnb3JpZXNba11baV0sIGFnZ3JlZ2F0ZU1vZGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXdEYXRhO1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLnVwZGF0ZSA9IGZ1bmN0aW9uIChkYXRhU291cmNlLCBjb25mLCBjYWxsYmFjayl7XG4gICAgICAgIHZhciBkYXRhYWRhcHRlciA9IHRoaXM7XG5cbiAgICAgICAgZGF0YWFkYXB0ZXIuZGF0YVN0b3JlID0gZGF0YVNvdXJjZSB8fCBkYXRhYWRhcHRlci5kYXRhU3RvcmU7ICAgICAgIFxuICAgICAgICBkYXRhYWRhcHRlci5kYXRhSlNPTiA9IGRhdGFhZGFwdGVyLmRhdGFTdG9yZSAmJiBkYXRhYWRhcHRlci5kYXRhU3RvcmUuZ2V0SlNPTigpO1xuICAgICAgICBkYXRhYWRhcHRlci5jb25maWd1cmF0aW9uID0gY29uZiB8fCBkYXRhYWRhcHRlci5jb25maWd1cmF0aW9uO1xuICAgICAgICBkYXRhYWRhcHRlci5jYWxsYmFjayA9IGNhbGxiYWNrIHx8IGRhdGFhZGFwdGVyLmNhbGxiYWNrO1xuICAgICAgICBkYXRhYWRhcHRlci5GQ2pzb24gPSBkYXRhYWRhcHRlci5fX2NvbnZlcnREYXRhX18oKTtcbiAgICB9O1xuXG4gICAgcHJvdG9EYXRhYWRhcHRlci5fX3NldERlZmF1bHRBdHRyX18gPSBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICB2YXIgZGF0YWFkYXB0ZXIgPSB0aGlzLFxuICAgICAgICAgICAga2V5RXhjbHVkZWRKc29uU3RyID0gJycsXG4gICAgICAgICAgICBwYWxldHRlQ29sb3JzID0gJycsXG4gICAgICAgICAgICBkYXRhU3RvcmUgPSBkYXRhYWRhcHRlci5kYXRhU3RvcmUsXG4gICAgICAgICAgICBjb25mID0gZGF0YWFkYXB0ZXIgJiYgZGF0YWFkYXB0ZXIuY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgIG1lYXN1cmUgPSBjb25mICYmIGNvbmYubWVhc3VyZSB8fCBbXSxcbiAgICAgICAgICAgIG1ldGFEYXRhID0gZGF0YVN0b3JlICYmIGRhdGFTdG9yZS5nZXRNZXRhRGF0YSgpLFxuICAgICAgICAgICAgbWV0YURhdGFNZWFzdXJlLFxuICAgICAgICAgICAgc2VyaWVzVHlwZSA9IGNvbmYgJiYgY29uZi5zZXJpZXNUeXBlLFxuICAgICAgICAgICAgc2VyaWVzID0ge1xuICAgICAgICAgICAgICAgICdzcycgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YURhdGFNZWFzdXJlID0gbWV0YURhdGFbbWVhc3VyZVswXV0gJiYgbWV0YURhdGFbbWVhc3VyZVswXV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWV0YURhdGFNZWFzdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV0YURhdGFNZWFzdXJlW0NPTE9SXSAmJiAocGFsZXR0ZUNvbG9ycyA9IHBhbGV0dGVDb2xvcnMgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChtZXRhRGF0YU1lYXN1cmVbQ09MT1JdIGluc3RhbmNlb2YgRnVuY3Rpb24pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YU1lYXN1cmVbQ09MT1JdKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFEYXRhTWVhc3VyZVtDT0xPUl0pKTtcbiAgICAgICAgICAgICAgICAgICAganNvbi5jaGFydFtQQUxFVFRFQ09MT1JTXSA9IHBhbGV0dGVDb2xvcnM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnbXMnIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgbGVuID0ganNvbi5kYXRhc2V0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFEYXRhTWVhc3VyZSA9IG1ldGFEYXRhW21lYXN1cmVbaV1dICYmIG1ldGFEYXRhW21lYXN1cmVbaV1dO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YU1lYXN1cmUgJiYgbWV0YURhdGFNZWFzdXJlW0NPTE9SXSAmJiAoanNvbi5kYXRhc2V0W2ldW0NPTE9SXSA9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKG1ldGFEYXRhTWVhc3VyZVtDT0xPUl0gaW5zdGFuY2VvZiBGdW5jdGlvbikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YU1lYXN1cmVbQ09MT1JdKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YU1lYXN1cmVbQ09MT1JdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICd0cycgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0ganNvbi5jaGFydC5kYXRhc2V0c1swXS5kYXRhc2V0WzBdLnNlcmllcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjtcblxuICAgICAgICAgICAgICAgICAgICBmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YURhdGFNZWFzdXJlID0gbWV0YURhdGFbbWVhc3VyZVtpXV0gJiYgbWV0YURhdGFbbWVhc3VyZVtpXV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9IG1ldGFEYXRhTWVhc3VyZSAmJm1ldGFEYXRhTWVhc3VyZVtDT0xPUl0gJiYgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKChtZXRhRGF0YU1lYXN1cmVbQ09MT1JdIGluc3RhbmNlb2YgRnVuY3Rpb24pID8gbWV0YURhdGFNZWFzdXJlW0NPTE9SXSgpIDogXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFEYXRhTWVhc3VyZVtDT0xPUl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgJiYgKGpzb24uY2hhcnQuZGF0YXNldHNbMF0uZGF0YXNldFswXS5zZXJpZXNbaV0ucGxvdFtDT0xPUl0gPSBjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHNlcmllc1R5cGUgPSBzZXJpZXNUeXBlICYmIHNlcmllc1R5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgc2VyaWVzVHlwZSA9IChzZXJpZXNbc2VyaWVzVHlwZV0gJiYgc2VyaWVzVHlwZSkgfHwgJ21zJztcblxuICAgICAgICBqc29uLmNoYXJ0IHx8IChqc29uLmNoYXJ0ID0ge30pO1xuICAgICAgICBcbiAgICAgICAga2V5RXhjbHVkZWRKc29uU3RyID0gKG1ldGFEYXRhICYmIEpTT04uc3RyaW5naWZ5KGpzb24sIGZ1bmN0aW9uKGssdil7XG4gICAgICAgICAgICBpZihrID09ICdjb2xvcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTlVMTDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9KSkgfHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGpzb24gPSAoa2V5RXhjbHVkZWRKc29uU3RyICYmIEpTT04ucGFyc2Uoa2V5RXhjbHVkZWRKc29uU3RyKSkgfHwganNvbjtcblxuICAgICAgICBzZXJpZXNbc2VyaWVzVHlwZV0oKTtcblxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9O1xuXG4gICAgcHJvdG9EYXRhYWRhcHRlci5fX2dldEFnZ3JlZ2F0ZURhdGFfXyA9IGZ1bmN0aW9uIChkYXRhLCBrZXksIGFnZ3JlZ2F0ZU1vZGUpIHtcbiAgICAgICAgdmFyIGFnZ3JlZ2F0ZU1ldGhvZCA9IHtcbiAgICAgICAgICAgICdzdW0nIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgaixcbiAgICAgICAgICAgICAgICAgICAgbGVuUixcbiAgICAgICAgICAgICAgICAgICAgbGVuQyxcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlZERhdGEgPSBkYXRhWzBdO1xuICAgICAgICAgICAgICAgIGZvcihpID0gMSwgbGVuUiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuUjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcihqID0gMCwgbGVuQyA9IGRhdGFbaV0ubGVuZ3RoOyBqIDwgbGVuQzsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAoZGF0YVtpXVtqXSAhPSBrZXkpICYmIChhZ2dyZWdhdGVkRGF0YVtqXSA9IE51bWJlcihhZ2dyZWdhdGVkRGF0YVtqXSkgKyBOdW1iZXIoZGF0YVtpXVtqXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhZ2dyZWdhdGVkRGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnYXZlcmFnZScgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgaUFnZ3JlZ2F0ZU10aGQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBsZW5SID0gZGF0YS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZWRTdW1BcnIgPSBpQWdncmVnYXRlTXRoZC5zdW0oKSxcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgbGVuLFxuICAgICAgICAgICAgICAgICAgICBhZ2dyZWdhdGVkRGF0YSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihpID0gMCwgbGVuID0gYWdncmVnYXRlZFN1bUFyci5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICgoYWdncmVnYXRlZFN1bUFycltpXSAhPSBrZXkpICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgKGFnZ3JlZ2F0ZWREYXRhW2ldID0gKE51bWJlcihhZ2dyZWdhdGVkU3VtQXJyW2ldKSkgLyBsZW5SKSkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYWdncmVnYXRlZERhdGFbaV0gPSBhZ2dyZWdhdGVkU3VtQXJyW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0ZWREYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGFnZ3JlZ2F0ZU1vZGUgPSBhZ2dyZWdhdGVNb2RlICYmIGFnZ3JlZ2F0ZU1vZGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgYWdncmVnYXRlTW9kZSA9IChhZ2dyZWdhdGVNZXRob2RbYWdncmVnYXRlTW9kZV0gJiYgYWdncmVnYXRlTW9kZSkgfHwgJ3N1bSc7XG5cbiAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0ZU1ldGhvZFthZ2dyZWdhdGVNb2RlXSgpO1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLl9fZ2VuZXJhbERhdGFGb3JtYXRfXyA9IGZ1bmN0aW9uKGpzb25EYXRhLCBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShqc29uRGF0YVswXSksXG4gICAgICAgICAgICBnZW5lcmFsRGF0YUFycmF5ID0gW10sXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGxlbixcbiAgICAgICAgICAgIGxlbkdlbmVyYWxEYXRhQXJyYXksXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGNvbmZpZ3VyYXRpb24uZGltZW5zaW9uIHx8IFtdLFxuICAgICAgICAgICAgbWVhc3VyZSA9IGNvbmZpZ3VyYXRpb24ubWVhc3VyZSB8fCBbXTtcbiAgICAgICAgaWYgKCFpc0FycmF5KXtcbiAgICAgICAgICAgIGdlbmVyYWxEYXRhQXJyYXlbMF0gPSBbXTtcbiAgICAgICAgICAgIGdlbmVyYWxEYXRhQXJyYXlbMF0ucHVzaChkaW1lbnNpb24pO1xuICAgICAgICAgICAgZ2VuZXJhbERhdGFBcnJheVswXSA9IGdlbmVyYWxEYXRhQXJyYXlbMF1bMF0uY29uY2F0KG1lYXN1cmUpO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0ganNvbkRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBnZW5lcmFsRGF0YUFycmF5W2krMV0gPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBsZW5HZW5lcmFsRGF0YUFycmF5ID0gZ2VuZXJhbERhdGFBcnJheVswXS5sZW5ndGg7IGogPCBsZW5HZW5lcmFsRGF0YUFycmF5OyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBqc29uRGF0YVtpXVtnZW5lcmFsRGF0YUFycmF5WzBdW2pdXTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBnZW5lcmFsRGF0YUFycmF5W2krMV1bal0gPSB2YWx1ZSB8fCAnJzsgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGpzb25EYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZW5lcmFsRGF0YUFycmF5O1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLl9fanNvbkNyZWF0b3JfXyA9IGZ1bmN0aW9uKGpzb25EYXRhLCBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHZhciBjb25mID0gY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgIHNlcmllc1R5cGUgPSBjb25mICYmIGNvbmYuc2VyaWVzVHlwZSxcbiAgICAgICAgICAgIHNlcmllcyA9IHtcbiAgICAgICAgICAgICAgICAnbXMnIDogZnVuY3Rpb24oanNvbkRhdGEsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGpzb24gPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4TWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5EaW1lbnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5NZWFzdXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgICAgICBqO1xuICAgICAgICAgICAgICAgICAgICBqc29uLmNhdGVnb3JpZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NhdGVnb3J5JzogWyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhc2V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbkRpbWVuc2lvbiA9ICBjb25maWd1cmF0aW9uLmRpbWVuc2lvbi5sZW5ndGg7IGkgPCBsZW5EaW1lbnNpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCA9IGpzb25EYXRhWzBdLmluZGV4T2YoY29uZmlndXJhdGlvbi5kaW1lbnNpb25baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4TWF0Y2ggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uY2F0ZWdvcmllc1swXS5jYXRlZ29yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsYWJlbCcgOiBqc29uRGF0YVtqXVtpbmRleE1hdGNoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhc2V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbk1lYXN1cmUgPSBjb25maWd1cmF0aW9uLm1lYXN1cmUubGVuZ3RoOyBpIDwgbGVuTWVhc3VyZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoID0ganNvbkRhdGFbMF0uaW5kZXhPZihjb25maWd1cmF0aW9uLm1lYXN1cmVbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4TWF0Y2ggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmRhdGFzZXRbaV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZXJpZXNuYW1lJyA6IGNvbmZpZ3VyYXRpb24ubWVhc3VyZVtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZGF0YXNldFtpXS5kYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJyA6IGpzb25EYXRhW2pdW2luZGV4TWF0Y2hdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzcycgOiBmdW5jdGlvbihqc29uRGF0YSwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIganNvbiA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaExhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaFZhbHVlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbkRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBqLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhID0gW107XG4gICAgICAgICAgICAgICAgICAgIGluZGV4TWF0Y2hMYWJlbCA9IGpzb25EYXRhWzBdLmluZGV4T2YoY29uZmlndXJhdGlvbi5kaW1lbnNpb25bMF0pO1xuICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoVmFsdWUgPSBqc29uRGF0YVswXS5pbmRleE9mKGNvbmZpZ3VyYXRpb24ubWVhc3VyZVswXSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDEsIGxlbkRhdGEgPSBqc29uRGF0YS5sZW5ndGg7IGogPCBsZW5EYXRhOyBqKyspIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGpzb25EYXRhW2pdW2luZGV4TWF0Y2hMYWJlbF07ICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGpzb25EYXRhW2pdW2luZGV4TWF0Y2hWYWx1ZV07IFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5kYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsYWJlbCcgOiBsYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnIDogdmFsdWUgfHwgJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICd0cycgOiBmdW5jdGlvbihqc29uRGF0YSwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIganNvbiA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbkRpbWVuc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbk1lYXN1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5EYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGo7XG4gICAgICAgICAgICAgICAgICAgIGpzb24uY2hhcnQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAganNvbi5jaGFydC5kYXRhc2V0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBqc29uLmNoYXJ0LmRhdGFzZXRzWzBdID0ge307XG4gICAgICAgICAgICAgICAgICAgIGpzb24uY2hhcnQuZGF0YXNldHNbMF0uY2F0ZWdvcnkgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAganNvbi5jaGFydC5kYXRhc2V0c1swXS5jYXRlZ29yeS5kYXRhID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbkRpbWVuc2lvbiA9ICBjb25maWd1cmF0aW9uLmRpbWVuc2lvbi5sZW5ndGg7IGkgPCBsZW5EaW1lbnNpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhNYXRjaCA9IGpzb25EYXRhWzBdLmluZGV4T2YoY29uZmlndXJhdGlvbi5kaW1lbnNpb25baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4TWF0Y2ggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uY2hhcnQuZGF0YXNldHNbMF0uY2F0ZWdvcnkuZGF0YS5wdXNoKGpzb25EYXRhW2pdW2luZGV4TWF0Y2hdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAganNvbi5jaGFydC5kYXRhc2V0c1swXS5kYXRhc2V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGpzb24uY2hhcnQuZGF0YXNldHNbMF0uZGF0YXNldFswXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBqc29uLmNoYXJ0LmRhdGFzZXRzWzBdLmRhdGFzZXRbMF0uc2VyaWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbk1lYXN1cmUgPSBjb25maWd1cmF0aW9uLm1lYXN1cmUubGVuZ3RoOyBpIDwgbGVuTWVhc3VyZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleE1hdGNoID0ganNvbkRhdGFbMF0uaW5kZXhPZihjb25maWd1cmF0aW9uLm1lYXN1cmVbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4TWF0Y2ggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uLmNoYXJ0LmRhdGFzZXRzWzBdLmRhdGFzZXRbMF0uc2VyaWVzW2ldID0geyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJyA6IGNvbmZpZ3VyYXRpb24ubWVhc3VyZVtpXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGogPSAxLCBsZW5EYXRhID0ganNvbkRhdGEubGVuZ3RoOyBqIDwgbGVuRGF0YTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uY2hhcnQuZGF0YXNldHNbMF0uZGF0YXNldFswXS5zZXJpZXNbaV0uZGF0YS5wdXNoKGpzb25EYXRhW2pdW2luZGV4TWF0Y2hdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgc2VyaWVzVHlwZSA9IHNlcmllc1R5cGUgJiYgc2VyaWVzVHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBzZXJpZXNUeXBlID0gKHNlcmllc1tzZXJpZXNUeXBlXSAmJiBzZXJpZXNUeXBlKSB8fCAnbXMnO1xuICAgICAgICByZXR1cm4gY29uZi5tZWFzdXJlICYmIGNvbmYuZGltZW5zaW9uICYmIHNlcmllc1tzZXJpZXNUeXBlXShqc29uRGF0YSwgY29uZik7XG4gICAgfTtcblxuICAgIHByb3RvRGF0YWFkYXB0ZXIuZ2V0SlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5GQ2pzb247XG4gICAgfTtcblxuICAgIHByb3RvRGF0YWFkYXB0ZXIuX19nZXREYXRhSnNvbl9fID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFKU09OO1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLl9fZ2V0QWdncmVnYXRlZERhdGFfXyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGVkRGF0YTtcbiAgICB9O1xuXG4gICAgcHJvdG9EYXRhYWRhcHRlci5fX2dldERpbWVuc2lvbl9fID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb24uZGltZW5zaW9uO1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLl9fZ2V0RGltZW5zaW9uX18gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbi5tZWFzdXJlO1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLmdldExpbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhYWRhcHRlciA9IHRoaXMsXG4gICAgICAgICAgICBtYXggPSAtSW5maW5pdHksXG4gICAgICAgICAgICBtaW4gPSArSW5maW5pdHksXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGxlblIsXG4gICAgICAgICAgICBsZW5DLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBkYXRhID0gZGF0YWFkYXB0ZXIuYWdncmVnYXRlZERhdGE7XG4gICAgICAgIGZvcihpID0gMCwgbGVuUiA9IGRhdGEgJiYgZGF0YS5sZW5ndGg7IGkgPCBsZW5SOyBpKyspe1xuICAgICAgICAgICAgZm9yKGogPSAwLCBsZW5DID0gZGF0YVtpXS5sZW5ndGg7IGogPCBsZW5DOyBqKyspe1xuICAgICAgICAgICAgICAgIHZhbHVlID0gK2RhdGFbaV1bal07XG4gICAgICAgICAgICAgICAgdmFsdWUgJiYgKG1heCA9IG1heCA8IHZhbHVlID8gdmFsdWUgOiBtYXgpO1xuICAgICAgICAgICAgICAgIHZhbHVlICYmIChtaW4gPSBtaW4gPiB2YWx1ZSA/IHZhbHVlIDogbWluKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ21pbicgOiBtaW4sXG4gICAgICAgICAgICAnbWF4JyA6IG1heFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBwcm90b0RhdGFhZGFwdGVyLmdldERhdGFTdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhU3RvcmU7XG4gICAgfTtcblxuICAgIHByb3RvRGF0YWFkYXB0ZXIuaGlnaGxpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhYWRhcHRlciA9IHRoaXMsXG4gICAgICAgICAgICBjYXRlZ29yeUxhYmVsID0gYXJndW1lbnRzWzBdICYmIGFyZ3VtZW50c1swXS50b1N0cmluZygpLFxuICAgICAgICAgICAgY2F0ZWdvcnlBcnIgPSBkYXRhYWRhcHRlci5jb25maWd1cmF0aW9uLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICBpbmRleCA9IGNhdGVnb3J5TGFiZWwgJiYgY2F0ZWdvcnlBcnIuaW5kZXhPZihjYXRlZ29yeUxhYmVsKTtcbiAgICAgICAgZGF0YWFkYXB0ZXIuY2hhcnQuZHJhd1RyZW5kUmVnaW9uKGluZGV4KTtcbiAgICB9O1xuXG4gICAgTXVsdGlDaGFydGluZy5wcm90b3R5cGUuZGF0YUFkYXB0ZXIgPSBmdW5jdGlvbiAoZGF0YVNvdXJjZSwgY29uZiwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRhQWRhcHRlcihkYXRhU291cmNlLCBjb25mLCBjYWxsYmFjayk7XG4gICAgfTtcbn0pOyIsIiAvKiBnbG9iYWwgRnVzaW9uQ2hhcnRzOiB0cnVlICovXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShNdWx0aUNoYXJ0aW5nKTtcbiAgICB9XG59KShmdW5jdGlvbiAoTXVsdGlDaGFydGluZykge1xuXG4gICAgdmFyIGRvY3VtZW50ID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUud2luLmRvY3VtZW50LFxuICAgIFx0TUFYX1BFUkNFTlQgPSAnMTAwJScsXG4gICAgICAgIGRhdGFBZGFwdGVyID0gTXVsdGlDaGFydGluZy5wcm90b3R5cGUuZGF0YUFkYXB0ZXIsXG4gICAgICAgIElEID0gJ2NoYXJ0LWNvbnRhaW5lci0nLFxuICAgICAgICBjaGFydElkID0gMCxcbiAgICAgICAgUFggPSAncHgnLFxuICAgICAgICBTUEFOID0gJ3NwYW4nLFxuICAgICAgICBDaGFydCA9IGZ1bmN0aW9uKGNvbmYpIHtcbiAgICAgICAgICAgIHZhciBjaGFydCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGF0YUFkYXB0ZXJDb25mID0ge30sXG4gICAgICAgICAgICAgICAgY3JlYXRlQ2hhcnRDb25mID0ge30sXG4gICAgICAgICAgICAgICAgZGF0YVN0b3JlO1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hhcnQuY29uZiA9IHt9O1xuXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGNoYXJ0LmNvbmYsIGNvbmYpO1xuXG4gICAgICAgICAgICBjaGFydC5hdXRvVXBkYXRlID0gY2hhcnQuY29uZi5hdXRvVXBkYXRlIHx8IDE7XG5cbiAgICAgICAgICAgIGRhdGFBZGFwdGVyQ29uZiA9IHtcbiAgICAgICAgICAgICAgICAnZGltZW5zaW9uJyA6IGNoYXJ0LmNvbmYuZGltZW5zaW9uLFxuICAgICAgICAgICAgICAgICdtZWFzdXJlJyA6IGNoYXJ0LmNvbmYubWVhc3VyZSxcbiAgICAgICAgICAgICAgICAnc2VyaWVzVHlwZScgOiBjaGFydC5jb25mLnNlcmllc1R5cGUsXG4gICAgICAgICAgICAgICAgJ2NhdGVnb3JpZXMnIDogY2hhcnQuY29uZi5jYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICdhZ2dyZWdhdGVNb2RlJyA6IGNoYXJ0LmNvbmYuYWdncmVnYXRpb24sXG4gICAgICAgICAgICAgICAgJ2NvbmZpZycgOiBjaGFydC5jb25mLmNvbmZpZ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2hhcnQuZGF0YUFkYXB0ZXIgPSBkYXRhQWRhcHRlcihjb25mLmRhdGFTb3VyY2UsIGRhdGFBZGFwdGVyQ29uZiwgY29uZi5jYWxsYmFjayk7XG5cbiAgICAgICAgICAgIGRhdGFTdG9yZSA9IGNoYXJ0LmRhdGFBZGFwdGVyLmdldERhdGFTdG9yZSgpO1xuXG4gICAgICAgICAgICBkYXRhU3RvcmUgJiYgZGF0YVN0b3JlLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGVsVXBkYXRlZCcsZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2hhcnQudXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY3JlYXRlQ2hhcnRDb25mID0ge1xuICAgICAgICAgICAgICAgICd0eXBlJyA6IGNoYXJ0LmNvbmYudHlwZSxcbiAgICAgICAgICAgICAgICAnd2lkdGgnIDogY2hhcnQuY29uZi53aWR0aCB8fCBNQVhfUEVSQ0VOVCxcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JyA6IGNoYXJ0LmNvbmYuaGVpZ2h0IHx8IE1BWF9QRVJDRU5ULFxuICAgICAgICAgICAgICAgICdkYXRhU291cmNlJyA6IGNoYXJ0LmRhdGFBZGFwdGVyLmdldEpTT04oKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2hhcnQuY2hhcnRJbnN0YW5jZSA9IGNoYXJ0Ll9fY3JlYXRlQ2hhcnRfXyhjcmVhdGVDaGFydENvbmYpO1xuICAgICAgICB9LFxuICAgICAgICBQcm90b0NoYXJ0ID0gQ2hhcnQucHJvdG90eXBlO1xuXG4gICAgUHJvdG9DaGFydC5fX2NyZWF0ZUNoYXJ0X18gPSBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICB2YXIgY2hhcnQgPSB0aGlzLFxuICAgICAgICAgICAgY2hhcnRPYmo7XG5cbiAgICAgICAgLy9yZW5kZXIgRkMgXG4gICAgICAgIGNoYXJ0T2JqID0gbmV3IEZ1c2lvbkNoYXJ0cyhqc29uKTtcblxuICAgICAgICBjaGFydE9iai5hZGRFdmVudExpc3RlbmVyKCd0cmVuZFJlZ2lvblJvbGxPdmVyJywgZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgIHZhciBkYXRhT2JqID0gY2hhcnQuX19nZXRSb3dEYXRhX18oZC5jYXRlZ29yeUxhYmVsKTtcbiAgICAgICAgICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLnJhaXNlRXZlbnQoJ2hvdmVyaW4nLCB7XG4gICAgICAgICAgICAgICAgZGF0YSA6IGRhdGFPYmosXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlMYWJlbCA6IGQuY2F0ZWdvcnlMYWJlbFxuICAgICAgICAgICAgfSwgY2hhcnQpO1xuICAgICAgICB9KTtcblxuICAgICAgIGNoYXJ0T2JqLmFkZEV2ZW50TGlzdGVuZXIoJ3RyZW5kUmVnaW9uUm9sbE91dCcsIGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLnJhaXNlRXZlbnQoJ2hvdmVyb3V0Jywge1xuICAgICAgICAgICAgICAgY2F0ZWdvcnlMYWJlbCA6IGQuY2F0ZWdvcnlMYWJlbFxuICAgICAgICAgICB9LCBjaGFydCk7XG4gICAgICAgfSk7XG5cblxuICAgICAgICByZXR1cm4gY2hhcnRPYmo7XG4gICAgfTtcblxuICAgIFByb3RvQ2hhcnQudXBkYXRlID0gZnVuY3Rpb24oY29uZil7XG4gICAgICAgIHZhciBjaGFydCA9IHRoaXMsXG4gICAgICAgICAgICBkYXRhQWRhcHRlckNvbmYgPSB7fSxcbiAgICAgICAgICAgIGNyZWF0ZUNoYXJ0Q29uZiA9ICB7fTtcblxuICAgICAgICBjb25mID0gY29uZiB8fCB7fTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGNoYXJ0LmNvbmYsIGNvbmYpO1xuXG4gICAgICAgIGRhdGFBZGFwdGVyQ29uZiA9IHtcbiAgICAgICAgICAgICdkaW1lbnNpb24nIDogY2hhcnQuY29uZi5kaW1lbnNpb24sXG4gICAgICAgICAgICAnbWVhc3VyZScgOiBjaGFydC5jb25mLm1lYXN1cmUsXG4gICAgICAgICAgICAnc2VyaWVzVHlwZScgOiBjaGFydC5jb25mLnNlcmllc1R5cGUsXG4gICAgICAgICAgICAnY2F0ZWdvcmllcycgOiBjaGFydC5jb25mLmNhdGVnb3JpZXMsXG4gICAgICAgICAgICAnYWdncmVnYXRlTW9kZScgOiBjaGFydC5jb25mLmFnZ3JlZ2F0aW9uLFxuICAgICAgICAgICAgJ2NvbmZpZycgOiBjaGFydC5jb25mLmNvbmZpZ1xuICAgICAgICB9O1xuXG4gICAgICAgIGNoYXJ0LmRhdGFBZGFwdGVyLnVwZGF0ZShjb25mLmRhdGFTb3VyY2UsIGRhdGFBZGFwdGVyQ29uZiwgY29uZi5jYWxsYmFjayk7XG5cbiAgICAgICAgY3JlYXRlQ2hhcnRDb25mID0ge1xuICAgICAgICAgICAgJ3R5cGUnIDogY2hhcnQuY29uZi50eXBlLFxuICAgICAgICAgICAgJ3dpZHRoJyA6IGNoYXJ0LmNvbmYud2lkdGggfHwgTUFYX1BFUkNFTlQsXG4gICAgICAgICAgICAnaGVpZ2h0JyA6IGNoYXJ0LmNvbmYuaGVpZ2h0IHx8IE1BWF9QRVJDRU5ULFxuICAgICAgICAgICAgJ2RhdGFTb3VyY2UnIDogY2hhcnQuZGF0YUFkYXB0ZXIuZ2V0SlNPTigpXG4gICAgICAgIH07XG5cbiAgICAgICAgY2hhcnQuX19jaGFydFVwZGF0ZV9fKGNyZWF0ZUNoYXJ0Q29uZik7XG4gICAgfTtcblxuICAgIFByb3RvQ2hhcnQuZ2V0Q2hhcnRJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFydEluc3RhbmNlO1xuICAgIH07XG5cbiAgICBQcm90b0NoYXJ0LnJlbmRlciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBjaGFydCA9IHRoaXMsXG4gICAgICAgIFx0Y29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG5cdFx0aWQgJiYgY2hhcnQuY2hhcnRJbnN0YW5jZS5yZW5kZXIoY2hhcnQuX19jaGFydENvbnRhaW5lcl9fKGNvbnRhaW5lcikpO1xuICAgIH07XG5cblx0UHJvdG9DaGFydC5fX2NoYXJ0Q29udGFpbmVyX18gPSBmdW5jdGlvbihjb250YWluZXIpIHtcblx0XHR2YXIgY2hhcnQgPSB0aGlzLFxuXHRcdFx0aWQgPSBjaGFydC5fX2lkQ3JlYXRvcl9fKCk7XG5cblx0XHRjaGFydC5jb250YWluZXIgPSB7fTtcblx0XHRjaGFydC5jb250YWluZXIuY29uZmlnID0ge307XG5cdFx0Y2hhcnQuY29udGFpbmVyLmNvbmZpZy5pZCA9IGlkO1xuXHRcdGNoYXJ0LmNvbnRhaW5lci5ncmFwaGljcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoU1BBTik7XG5cdFx0Y2hhcnQuY29udGFpbmVyLmdyYXBoaWNzLmlkID0gaWQ7XG5cdFx0Y2hhcnQuY29udGFpbmVyLmdyYXBoaWNzLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGFydC5jb250YWluZXIuZ3JhcGhpY3MpO1xuXHRcdHJldHVybiBpZDtcblx0fTtcblxuXHRQcm90b0NoYXJ0LmdldENoYXJ0Q29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGFpbmVyO1xuXHR9O1xuXG5cdFByb3RvQ2hhcnQudXBkYXRlQ2hhcnRDb250YWluZXIgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHR2YXIgY2hhcnQgPSB0aGlzO1xuXG5cdFx0Y29uZmlnIHx8IChjb25maWcgPSB7fSk7XG5cdFx0T2JqZWN0LmFzc2lnbihjaGFydC5jb250YWluZXIuY29uZmlnLCBjb25maWcpO1xuXG5cdFx0Y2hhcnQuY29udGFpbmVyLmdyYXBoaWNzLmhlaWdodCA9IGNoYXJ0LmNvbnRhaW5lci5oZWlnaHQgKyBQWDtcblx0XHRjaGFydC5jb250YWluZXIuZ3JhcGhpY3Mud2lkdGggPSBjaGFydC5jb250YWluZXIud2lkdGggKyBQWDtcblx0fTtcblxuXHRQcm90b0NoYXJ0Ll9faWRDcmVhdG9yX18gPSBmdW5jdGlvbigpe1xuICAgICAgICBjaGFydElkKys7ICAgICAgIFxuICAgICAgICByZXR1cm4gSUQgKyBjaGFydElkO1xuICAgIH07XG5cbiAgICBQcm90b0NoYXJ0Ll9fY2hhcnRVcGRhdGVfXyA9IGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICB2YXIgY2hhcnQgPSB0aGlzLFxuICAgICAgICBjaGFydEpzb24gPSBqc29uIHx8IHt9O1xuXG4gICAgICAgIGlmKGNoYXJ0LmNoYXJ0SW5zdGFuY2UuY2hhcnRUeXBlKCkgIT0gY2hhcnRKc29uLnR5cGUpIHtcbiAgICAgICAgICAgIGNoYXJ0LmNoYXJ0SW5zdGFuY2UuY2hhcnRUeXBlKGNoYXJ0SnNvbi50eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0LmNoYXJ0SW5zdGFuY2Uuc2V0SlNPTkRhdGEoY2hhcnRKc29uLmRhdGFTb3VyY2UpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgIH07XG5cbiAgICBQcm90b0NoYXJ0Ll9fZ2V0Um93RGF0YV9fID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhciBjaGFydCA9IHRoaXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGogPSAwLFxuICAgICAgICAgICAgayxcbiAgICAgICAgICAgIGtrLFxuICAgICAgICAgICAgbCxcbiAgICAgICAgICAgIGxlblIsXG4gICAgICAgICAgICBsZW4sXG4gICAgICAgICAgICBsZW5DLFxuICAgICAgICAgICAgZGF0YSA9IGNoYXJ0LmRhdGFBZGFwdGVyLl9nZXREYXRhSnNvbigpLFxuICAgICAgICAgICAgYWdncmVnYXRlZERhdGEgPSBjaGFydC5kYXRhQWRhcHRlci5fZ2V0QWdncmVnYXRlZERhdGEoKSxcbiAgICAgICAgICAgIGRpbWVuc2lvbiA9IGNoYXJ0LmRhdGFBZGFwdGVyLl9nZXRBZ2dyZWdhdGVkRGF0YSgpLFxuICAgICAgICAgICAgbWVhc3VyZSA9IGNoYXJ0LmRhdGFBZGFwdGVyLl9nZXRNZWFzdXJlKCksXG4gICAgICAgICAgICBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShkYXRhWzBdKSxcbiAgICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBtYXRjaE9iaiA9IHt9LFxuICAgICAgICAgICAgaW5kZXhPZkRpbWVuc2lvbiA9IGFnZ3JlZ2F0ZWREYXRhWzBdLmluZGV4T2YoZGltZW5zaW9uWzBdKTtcbiAgICBcbiAgICAgICAgZm9yKGxlblIgPSBkYXRhLmxlbmd0aDsgaSA8IGxlblI7IGkrKykge1xuICAgICAgICAgICAgaXNBcnJheSAmJiAoaW5kZXggPSBkYXRhW2ldLmluZGV4T2Yoa2V5KSk7XG4gICAgICAgICAgICBpZihpbmRleCAhPT0gLTEgJiYgaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIGZvcihsID0gMCwgbGVuQyA9IGRhdGFbaV0ubGVuZ3RoOyBsIDwgbGVuQzsgbCsrKXtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hPYmpbZGF0YVswXVtsXV0gPSBkYXRhW2ldW2xdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IoaiA9IDAsIGxlbiA9IG1lYXN1cmUubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBhZ2dyZWdhdGVkRGF0YVswXS5pbmRleE9mKG1lYXN1cmVbal0pO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwLCBrayA9IGFnZ3JlZ2F0ZWREYXRhLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFnZ3JlZ2F0ZWREYXRhW2tdW2luZGV4T2ZEaW1lbnNpb25dID09IGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoT2JqW21lYXN1cmVbal1dID0gYWdncmVnYXRlZERhdGFba11baW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaE9iajtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIWlzQXJyYXkgJiYgZGF0YVtpXVtkaW1lbnNpb25bMF1dID09IGtleSkge1xuICAgICAgICAgICAgICAgIG1hdGNoT2JqID0gZGF0YVtpXTtcblxuICAgICAgICAgICAgICAgIGZvcihqID0gMCwgbGVuID0gbWVhc3VyZS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGFnZ3JlZ2F0ZWREYXRhWzBdLmluZGV4T2YobWVhc3VyZVtqXSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayA9IDAsIGtrID0gYWdncmVnYXRlZERhdGEubGVuZ3RoOyBrIDwga2s7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYWdncmVnYXRlZERhdGFba11baW5kZXhPZkRpbWVuc2lvbl0gPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hPYmpbbWVhc3VyZVtqXV0gPSBhZ2dyZWdhdGVkRGF0YVtrXVtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoT2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLmNoYXJ0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICByZXR1cm4gbmV3IENoYXJ0KGNvbmZpZyk7XG4gICAgfTtcbn0pOyIsIlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoTXVsdGlDaGFydGluZyk7XG4gICAgfVxufSkoZnVuY3Rpb24gKE11bHRpQ2hhcnRpbmcpIHtcblxuICAgIHZhciBkb2N1bWVudCA9IE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLndpbi5kb2N1bWVudCxcbiAgICAgICAgUFggPSAncHgnLFxuICAgICAgICBESVYgPSAnZGl2JyxcbiAgICAgICAgRU1QVFlfU1RSSU5HID0gJycsXG4gICAgICAgIEFCU09MVVRFID0gJ2Fic29sdXRlJyxcbiAgICAgICAgUkVMQVRJVkUgPSAncmVsYXRpdmUnLFxuICAgICAgICBJRCA9ICdpZC1mYy1tYy0nLFxuICAgICAgICBCT1JERVJfQk9YID0gJ2JvcmRlci1ib3gnO1xuXG4gICAgdmFyIENlbGwgPSBmdW5jdGlvbiAoY29uZmlnLCBjb250YWluZXIpIHtcbiAgICAgICAgICAgIHZhciBjZWxsID0gdGhpcztcbiAgICAgICAgICAgIGNlbGwuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICAgICAgY2VsbC5jb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICBjZWxsLl9fZHJhd19fKCk7XG4gICAgICAgICAgICBjZWxsLmNvbmZpZy5jaGFydCAmJiBjZWxsLl9fcmVuZGVyQ2hhcnRfXygpO1xuICAgICAgICB9LFxuICAgICAgICBwcm90b0NlbGwgPSBDZWxsLnByb3RvdHlwZTtcblxuICAgIHByb3RvQ2VsbC5fX2RyYXdfXyA9IGZ1bmN0aW9uICgpe1xuICAgICAgICB2YXIgY2VsbCA9IHRoaXM7XG4gICAgICAgIGNlbGwuZ3JhcGhpY3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KERJVik7XG4gICAgICAgIGNlbGwuZ3JhcGhpY3MuaWQgPSBjZWxsLmNvbmZpZy5pZCB8fCBFTVBUWV9TVFJJTkc7ICAgICAgICBcbiAgICAgICAgY2VsbC5ncmFwaGljcy5zdHlsZS5oZWlnaHQgPSBjZWxsLmNvbmZpZy5oZWlnaHQgKyBQWDtcbiAgICAgICAgY2VsbC5ncmFwaGljcy5zdHlsZS53aWR0aCA9IGNlbGwuY29uZmlnLndpZHRoICsgUFg7XG4gICAgICAgIGNlbGwuZ3JhcGhpY3Muc3R5bGUudG9wID0gY2VsbC5jb25maWcudG9wICsgUFg7XG4gICAgICAgIGNlbGwuZ3JhcGhpY3Muc3R5bGUubGVmdCA9IGNlbGwuY29uZmlnLmxlZnQgKyBQWDtcbiAgICAgICAgY2VsbC5ncmFwaGljcy5zdHlsZS5wb3NpdGlvbiA9IEFCU09MVVRFO1xuICAgICAgICBjZWxsLmdyYXBoaWNzLnN0eWxlLmJveFNpemluZyA9IEJPUkRFUl9CT1g7XG4gICAgICAgIGNlbGwuZ3JhcGhpY3MuY2xhc3NOYW1lID0gY2VsbC5jb25maWcuY2xhc3NOYW1lO1xuICAgICAgICBjZWxsLmNvbmZpZy5jaGFydCB8fCAoY2VsbC5ncmFwaGljcy5pbm5lckhUTUwgPSBjZWxsLmNvbmZpZy5odG1sIHx8IEVNUFRZX1NUUklORyk7XG4gICAgICAgIGNlbGwuY29udGFpbmVyLmFwcGVuZENoaWxkKGNlbGwuZ3JhcGhpY3MpO1xuICAgIH07XG5cbiAgICBwcm90b0NlbGwuX19yZW5kZXJDaGFydF9fID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2VsbCA9IHRoaXMsXG4gICAgICAgICAgICBjaGFydENvbnRhaW5lcixcbiAgICAgICAgICAgIGNvbmYgPSB7XG4gICAgICAgICAgICAgICAgJ2hlaWdodCcgOiBjZWxsLmNvbmZpZy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJyA6IGNlbGwuY29uZmlnLndpZHRoXG4gICAgICAgICAgICB9LyosXG4gICAgICAgICAgICBkaXNwb3NhbEJveCA9IGNlbGwuZGlzcG9zYWxCb3gqLztcblxuICAgICAgICBjaGFydENvbnRhaW5lciA9IGNlbGwuY29uZmlnLmNoYXJ0LmdldENoYXJ0Q29udGFpbmVyKCk7XG4gICAgICAgIGNoYXJ0Q29udGFpbmVyICYmIGNlbGwuY29uZmlnLmNoYXJ0LnVwZGF0ZUNoYXJ0Q29udGFpbmVyKGNvbmYpO1xuICAgICAgICBjaGFydENvbnRhaW5lciAmJiAoY2VsbC5ncmFwaGljcy5hcHBlbmRDaGlsZChjaGFydENvbnRhaW5lci5ncmFwaGljcykpO1xuICAgICAgICBjaGFydENvbnRhaW5lciB8fCBjZWxsLmNvbmZpZy5jaGFydC5yZW5kZXIoY2VsbC5jb25maWcuaWQpO1xuICAgIH07XG5cbi8qICAgIHByb3RvQ2VsbC51cGRhdGUgPSBmdW5jdGlvbiAobmV3Q29uZmlnKSB7XG4gICAgICAgIHZhciBjZWxsID0gdGhpcyxcbiAgICAgICAgICAgIGlkID0gY2VsbC5jb25maWcuaWQ7XG5cbiAgICAgICAgaWYobmV3Q29uZmlnKXtcbiAgICAgICAgICAgIGNlbGwuY29uZmlnID0gbmV3Q29uZmlnO1xuICAgICAgICAgICAgY2VsbC5jb25maWcuaWQgPSBpZDtcbiAgICAgICAgICAgIGNlbGwuZ3JhcGhpY3MuaWQgPSBjZWxsLmNvbmZpZy5pZCB8fCBFTVBUWV9TVFJJTkc7ICAgICAgICBcbiAgICAgICAgICAgIGNlbGwuZ3JhcGhpY3MuY2xhc3NOYW1lID0gY2VsbC5jb25maWcuY2xhc3NOYW1lO1xuICAgICAgICAgICAgY2VsbC5ncmFwaGljcy5zdHlsZS5oZWlnaHQgPSBjZWxsLmNvbmZpZy5oZWlnaHQgKyBQWDtcbiAgICAgICAgICAgIGNlbGwuZ3JhcGhpY3Muc3R5bGUud2lkdGggPSBjZWxsLmNvbmZpZy53aWR0aCArIFBYO1xuICAgICAgICAgICAgY2VsbC5ncmFwaGljcy5zdHlsZS50b3AgPSBjZWxsLmNvbmZpZy50b3AgKyBQWDtcbiAgICAgICAgICAgIGNlbGwuZ3JhcGhpY3Muc3R5bGUubGVmdCA9IGNlbGwuY29uZmlnLmxlZnQgKyBQWDtcbiAgICAgICAgICAgIGNlbGwuZ3JhcGhpY3Muc3R5bGUucG9zaXRpb24gPSBBQlNPTFVURTtcbiAgICAgICAgICAgICFjZWxsLmNvbmZpZy5jaGFydCAmJiAoY2VsbC5ncmFwaGljcy5pbm5lckhUTUwgPSBjZWxsLmNvbmZpZy5odG1sIHx8IEVNUFRZX1NUUklORyk7XG4gICAgICAgICAgICBjZWxsLmNvbnRhaW5lci5hcHBlbmRDaGlsZChjZWxsLmdyYXBoaWNzKTtcbiAgICAgICAgICAgIGlmKGNlbGwuY29uZmlnLmNoYXJ0KSB7XG4gICAgICAgICAgICAgICAgY2VsbC5jaGFydCA9IGNlbGwucmVuZGVyQ2hhcnQoKTsgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjZWxsLmNoYXJ0O1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSAgXG4gICAgICAgIHJldHVybiBjZWxsOyAgICAgIFxuICAgIH07Ki9cblxuICAgIHZhciBNYXRyaXggPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSB0aGlzO1xuICAgICAgICAgICAgbWF0cml4LnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgICAgICAvL21hdHJpeCBjb250YWluZXJcbiAgICAgICAgICAgIG1hdHJpeC5tYXRyaXhDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgICAgICAgICBtYXRyaXguY29uZmlndXJhdGlvbiA9IGNvbmZpZ3VyYXRpb247XG4gICAgICAgICAgICBtYXRyaXguZGVmYXVsdEggPSAxMDA7XG4gICAgICAgICAgICBtYXRyaXguZGVmYXVsdFcgPSAxMDA7XG4gICAgICAgICAgICBtYXRyaXguZGlzcG9zYWxCb3ggPSBbXTtcbiAgICAgICAgICAgIC8vZGlzcG9zZSBtYXRyaXggY29udGV4dFxuICAgICAgICAgICAgbWF0cml4LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIC8vc2V0IHN0eWxlLCBhdHRyIG9uIG1hdHJpeCBjb250YWluZXIgXG4gICAgICAgICAgICBtYXRyaXguX19zZXRBdHRyQ29udGFpbmVyX18oKTtcbiAgICAgICAgICAgIC8vc3RvcmUgdmlydHVhbCBtYXRyaXggZm9yIHVzZXIgZ2l2ZW4gY29uZmlndXJhdGlvblxuICAgICAgICAgICAgbWF0cml4LmNvbmZpZ01hbmFnZXIgPSBjb25maWd1cmF0aW9uICYmIG1hdHJpeCAmJiBtYXRyaXguX19kcmF3TWFuYWdlcl9fKGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICB9LFxuICAgICAgICBwcm90b01hdHJpeCA9IE1hdHJpeC5wcm90b3R5cGUsXG4gICAgICAgIGNoYXJ0SWQgPSAwO1xuXG4gICAgLy9mdW5jdGlvbiB0byBzZXQgc3R5bGUsIGF0dHIgb24gbWF0cml4IGNvbnRhaW5lclxuICAgIHByb3RvTWF0cml4Ll9fc2V0QXR0ckNvbnRhaW5lcl9fID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYXRyaXggPSB0aGlzLFxuICAgICAgICAgICAgY29udGFpbmVyID0gbWF0cml4ICYmIG1hdHJpeC5tYXRyaXhDb250YWluZXI7ICAgICAgICBcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gUkVMQVRJVkU7XG4gICAgfTtcblxuICAgIC8vZnVuY3Rpb24gdG8gc2V0IGhlaWdodCwgd2lkdGggb24gbWF0cml4IGNvbnRhaW5lclxuICAgIHByb3RvTWF0cml4Ll9fc2V0Q29udGFpbmVyUmVzb2x1dGlvbl9fID0gZnVuY3Rpb24gKGhlaWdodEFyciwgd2lkdGhBcnIpIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBjb250YWluZXIgPSBtYXRyaXggJiYgbWF0cml4Lm1hdHJpeENvbnRhaW5lcixcbiAgICAgICAgICAgIGhlaWdodCA9IDAsXG4gICAgICAgICAgICB3aWR0aCA9IDAsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgbGVuO1xuICAgICAgICBmb3IoaSA9IDAsIGxlbiA9IGhlaWdodEFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaGVpZ2h0ICs9IGhlaWdodEFycltpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gMCwgbGVuID0gd2lkdGhBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHdpZHRoICs9IHdpZHRoQXJyW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFBYO1xuICAgICAgICBjb250YWluZXIuc3R5bGUud2lkdGggPSB3aWR0aCArIFBYO1xuICAgIH07XG5cbiAgICAvL2Z1bmN0aW9uIHRvIGRyYXcgbWF0cml4XG4gICAgcHJvdG9NYXRyaXguZHJhdyA9IGZ1bmN0aW9uKGNhbGxCYWNrKXtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBjb25maWdNYW5hZ2VyID0gbWF0cml4LmNvbmZpZ01hbmFnZXIsXG4gICAgICAgICAgICBsZW4gPSBjb25maWdNYW5hZ2VyICYmIGNvbmZpZ01hbmFnZXIubGVuZ3RoLFxuICAgICAgICAgICAgcGxhY2VIb2xkZXIgPSBbXSxcbiAgICAgICAgICAgIHBhcmVudENvbnRhaW5lciA9IG1hdHJpeCAmJiBtYXRyaXgubWF0cml4Q29udGFpbmVyLFxuICAgICAgICAgICAgbGVuQyxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqO1xuXG4gICAgICAgIG1hdHJpeC5kaXNwb3NlKCk7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBwbGFjZUhvbGRlcltpXSA9IFtdO1xuICAgICAgICAgICAgZm9yKGogPSAwLCBsZW5DID0gY29uZmlnTWFuYWdlcltpXS5sZW5ndGg7IGogPCBsZW5DOyBqKyspe1xuICAgICAgICAgICAgICAgIC8vc3RvcmUgY2VsbCBvYmplY3QgaW4gbG9naWNhbCBtYXRyaXggc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgcGxhY2VIb2xkZXJbaV1bal0gPSBuZXcgQ2VsbChjb25maWdNYW5hZ2VyW2ldW2pdLHBhcmVudENvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBtYXRyaXgucGxhY2VIb2xkZXIgPSBbXTtcbiAgICAgICAgbWF0cml4LnBsYWNlSG9sZGVyID0gcGxhY2VIb2xkZXI7XG4gICAgICAgIGNhbGxCYWNrICYmIGNhbGxCYWNrKCk7XG4gICAgfTtcblxuICAgIC8vZnVuY3Rpb24gdG8gbWFuYWdlIG1hdHJpeCBkcmF3XG4gICAgcHJvdG9NYXRyaXguX19kcmF3TWFuYWdlcl9fID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGxlblJvdyA9IGNvbmZpZ3VyYXRpb24ubGVuZ3RoLFxuICAgICAgICAgICAgLy9zdG9yZSBtYXBwaW5nIG1hdHJpeCBiYXNlZCBvbiB0aGUgdXNlciBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICBzaGFkb3dNYXRyaXggPSBtYXRyaXguX19tYXRyaXhNYW5hZ2VyX18oY29uZmlndXJhdGlvbiksICAgICAgICAgICAgXG4gICAgICAgICAgICBoZWlnaHRBcnIgPSBtYXRyaXguX19nZXRSb3dIZWlnaHRfXyhzaGFkb3dNYXRyaXgpLFxuICAgICAgICAgICAgd2lkdGhBcnIgPSBtYXRyaXguX19nZXRDb2xXaWR0aF9fKHNoYWRvd01hdHJpeCksXG4gICAgICAgICAgICBkcmF3TWFuYWdlck9iakFyciA9IFtdLFxuICAgICAgICAgICAgbGVuQ2VsbCxcbiAgICAgICAgICAgIG1hdHJpeFBvc1ggPSBtYXRyaXguX19nZXRQb3NfXyh3aWR0aEFyciksXG4gICAgICAgICAgICBtYXRyaXhQb3NZID0gbWF0cml4Ll9fZ2V0UG9zX18oaGVpZ2h0QXJyKSxcbiAgICAgICAgICAgIHJvd3NwYW4sXG4gICAgICAgICAgICBjb2xzcGFuLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICB0b3AsXG4gICAgICAgICAgICBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBjaGFydCxcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICByb3csXG4gICAgICAgICAgICBjb2w7XG4gICAgICAgIC8vY2FsY3VsYXRlIGFuZCBzZXQgcGxhY2Vob2xkZXIgaW4gc2hhZG93IG1hdHJpeFxuICAgICAgICBjb25maWd1cmF0aW9uID0gbWF0cml4Ll9fc2V0UGxjSGxkcl9fKHNoYWRvd01hdHJpeCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgIC8vZnVuY3Rpb24gdG8gc2V0IGhlaWdodCwgd2lkdGggb24gbWF0cml4IGNvbnRhaW5lclxuICAgICAgICBtYXRyaXguX19zZXRDb250YWluZXJSZXNvbHV0aW9uX18oaGVpZ2h0QXJyLCB3aWR0aEFycik7XG4gICAgICAgIC8vY2FsY3VsYXRlIGNlbGwgcG9zaXRpb24gYW5kIGhlaWh0IGFuZCBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlblJvdzsgaSsrKSB7ICBcbiAgICAgICAgICAgIGRyYXdNYW5hZ2VyT2JqQXJyW2ldID0gW107ICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChqID0gMCwgbGVuQ2VsbCA9IGNvbmZpZ3VyYXRpb25baV0ubGVuZ3RoOyBqIDwgbGVuQ2VsbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgcm93c3BhbiA9IHBhcnNlSW50KGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5yb3dzcGFuIHx8IDEpO1xuICAgICAgICAgICAgICAgIGNvbHNwYW4gPSBwYXJzZUludChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0uY29sc3BhbiB8fCAxKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0uY2hhcnQ7XG4gICAgICAgICAgICAgICAgaHRtbCA9IGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5odG1sO1xuICAgICAgICAgICAgICAgIHJvdyA9IHBhcnNlSW50KGNvbmZpZ3VyYXRpb25baV1bal0ucm93KTtcbiAgICAgICAgICAgICAgICBjb2wgPSBwYXJzZUludChjb25maWd1cmF0aW9uW2ldW2pdLmNvbCk7XG4gICAgICAgICAgICAgICAgbGVmdCA9IG1hdHJpeFBvc1hbY29sXTtcbiAgICAgICAgICAgICAgICB0b3AgPSBtYXRyaXhQb3NZW3Jvd107XG4gICAgICAgICAgICAgICAgd2lkdGggPSBtYXRyaXhQb3NYW2NvbCArIGNvbHNwYW5dIC0gbGVmdDtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBtYXRyaXhQb3NZW3JvdyArIHJvd3NwYW5dIC0gdG9wO1xuICAgICAgICAgICAgICAgIGlkID0gKGNvbmZpZ3VyYXRpb25baV1bal0gJiYgY29uZmlndXJhdGlvbltpXVtqXS5pZCkgfHwgbWF0cml4Ll9faWRDcmVhdG9yX18ocm93LGNvbCk7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gY29uZmlndXJhdGlvbltpXVtqXSAmJiBjb25maWd1cmF0aW9uW2ldW2pdLmNsYXNzTmFtZSB8fCAnJztcbiAgICAgICAgICAgICAgICBkcmF3TWFuYWdlck9iakFycltpXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wICAgICAgIDogdG9wLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0ICAgICAgOiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgICAgOiBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoICAgICA6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGlkICAgICAgICA6IGlkLFxuICAgICAgICAgICAgICAgICAgICByb3dzcGFuICAgOiByb3dzcGFuLFxuICAgICAgICAgICAgICAgICAgICBjb2xzcGFuICAgOiBjb2xzcGFuLFxuICAgICAgICAgICAgICAgICAgICBodG1sICAgICAgOiBodG1sLFxuICAgICAgICAgICAgICAgICAgICBjaGFydCAgICAgOiBjaGFydFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRyYXdNYW5hZ2VyT2JqQXJyO1xuICAgIH07XG5cbiAgICBwcm90b01hdHJpeC5fX2lkQ3JlYXRvcl9fID0gZnVuY3Rpb24oKXtcbiAgICAgICAgY2hhcnRJZCsrOyAgICAgICBcbiAgICAgICAgcmV0dXJuIElEICsgY2hhcnRJZDtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguX19nZXRQb3NfXyA9ICBmdW5jdGlvbihzcmMpe1xuICAgICAgICB2YXIgYXJyID0gW10sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHNyYyAmJiBzcmMubGVuZ3RoO1xuXG4gICAgICAgIGZvcig7IGkgPD0gbGVuOyBpKyspe1xuICAgICAgICAgICAgYXJyLnB1c2goaSA/IChzcmNbaS0xXSthcnJbaS0xXSkgOiAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4Ll9fc2V0UGxjSGxkcl9fID0gZnVuY3Rpb24oc2hhZG93TWF0cml4LCBjb25maWd1cmF0aW9uKXtcbiAgICAgICAgdmFyIHJvdyxcbiAgICAgICAgICAgIGNvbCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgbGVuUixcbiAgICAgICAgICAgIGxlbkM7XG5cbiAgICAgICAgZm9yKGkgPSAwLCBsZW5SID0gc2hhZG93TWF0cml4Lmxlbmd0aDsgaSA8IGxlblI7IGkrKyl7IFxuICAgICAgICAgICAgZm9yKGogPSAwLCBsZW5DID0gc2hhZG93TWF0cml4W2ldLmxlbmd0aDsgaiA8IGxlbkM7IGorKyl7XG4gICAgICAgICAgICAgICAgcm93ID0gc2hhZG93TWF0cml4W2ldW2pdLmlkLnNwbGl0KCctJylbMF07XG4gICAgICAgICAgICAgICAgY29sID0gc2hhZG93TWF0cml4W2ldW2pdLmlkLnNwbGl0KCctJylbMV07XG5cbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5yb3cgPSBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5yb3cgPT09IHVuZGVmaW5lZCA/IGkgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogY29uZmlndXJhdGlvbltyb3ddW2NvbF0ucm93O1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25bcm93XVtjb2xdLmNvbCA9IGNvbmZpZ3VyYXRpb25bcm93XVtjb2xdLmNvbCA9PT0gdW5kZWZpbmVkID8gaiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjb25maWd1cmF0aW9uW3Jvd11bY29sXS5jb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4Ll9fZ2V0Um93SGVpZ2h0X18gPSBmdW5jdGlvbihzaGFkb3dNYXRyaXgpIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGxlblJvdyA9IHNoYWRvd01hdHJpeCAmJiBzaGFkb3dNYXRyaXgubGVuZ3RoLFxuICAgICAgICAgICAgbGVuQ29sLFxuICAgICAgICAgICAgaGVpZ2h0ID0gW10sXG4gICAgICAgICAgICBjdXJySGVpZ2h0LFxuICAgICAgICAgICAgZGVmYXVsdEggPSBtYXRyaXguZGVmYXVsdEgsXG4gICAgICAgICAgICBtYXhIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlblJvdzsgaSsrKSB7XG4gICAgICAgICAgICBmb3IoaiA9IDAsIG1heEhlaWdodCA9IDAsIGxlbkNvbCA9IHNoYWRvd01hdHJpeFtpXS5sZW5ndGg7IGogPCBsZW5Db2w7IGorKykge1xuICAgICAgICAgICAgICAgIGlmKHNoYWRvd01hdHJpeFtpXVtqXSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJySGVpZ2h0ID0gc2hhZG93TWF0cml4W2ldW2pdLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0ID0gbWF4SGVpZ2h0IDwgY3VyckhlaWdodCA/IGN1cnJIZWlnaHQgOiBtYXhIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGVpZ2h0W2ldID0gbWF4SGVpZ2h0IHx8IGRlZmF1bHRIO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguX19nZXRDb2xXaWR0aF9fID0gZnVuY3Rpb24oc2hhZG93TWF0cml4KSB7XG4gICAgICAgIHZhciBtYXRyaXggPSB0aGlzLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgIGxlblJvdyA9IHNoYWRvd01hdHJpeCAmJiBzaGFkb3dNYXRyaXgubGVuZ3RoLFxuICAgICAgICAgICAgbGVuQ29sLFxuICAgICAgICAgICAgd2lkdGggPSBbXSxcbiAgICAgICAgICAgIGN1cnJXaWR0aCxcbiAgICAgICAgICAgIGRlZmF1bHRXID0gbWF0cml4LmRlZmF1bHRXLFxuICAgICAgICAgICAgbWF4V2lkdGg7XG4gICAgICAgIGZvciAoaSA9IDAsIGxlbkNvbCA9IHNoYWRvd01hdHJpeFtqXS5sZW5ndGg7IGkgPCBsZW5Db2w7IGkrKyl7XG4gICAgICAgICAgICBmb3IoaiA9IDAsIG1heFdpZHRoID0gMDsgaiA8IGxlblJvdzsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNoYWRvd01hdHJpeFtqXVtpXSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyV2lkdGggPSBzaGFkb3dNYXRyaXhbal1baV0ud2lkdGg7ICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGggPSBtYXhXaWR0aCA8IGN1cnJXaWR0aCA/IGN1cnJXaWR0aCA6IG1heFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpZHRoW2ldID0gbWF4V2lkdGggfHwgZGVmYXVsdFc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfTtcblxuICAgIHByb3RvTWF0cml4Ll9fbWF0cml4TWFuYWdlcl9fID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgdmFyIHNoYWRvd01hdHJpeCA9IFtdLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBrLFxuICAgICAgICAgICAgbCxcbiAgICAgICAgICAgIGxlblJvdyA9IGNvbmZpZ3VyYXRpb24ubGVuZ3RoLFxuICAgICAgICAgICAgbGVuQ2VsbCxcbiAgICAgICAgICAgIHJvd1NwYW4sXG4gICAgICAgICAgICBjb2xTcGFuLFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBvZmZzZXQ7XG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlblJvdzsgaSsrKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGogPSAwLCBsZW5DZWxsID0gY29uZmlndXJhdGlvbltpXS5sZW5ndGg7IGogPCBsZW5DZWxsOyBqKyspIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJvd1NwYW4gPSAoY29uZmlndXJhdGlvbltpXVtqXSAmJiBjb25maWd1cmF0aW9uW2ldW2pdLnJvd3NwYW4pIHx8IDE7XG4gICAgICAgICAgICAgICAgY29sU3BhbiA9IChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0uY29sc3BhbikgfHwgMTsgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aWR0aCA9IChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0ud2lkdGgpO1xuICAgICAgICAgICAgICAgIHdpZHRoID0gKHdpZHRoICYmICh3aWR0aCAvIGNvbFNwYW4pKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB3aWR0aCAmJiArd2lkdGgudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgICAgIGhlaWdodCA9IChjb25maWd1cmF0aW9uW2ldW2pdICYmIGNvbmZpZ3VyYXRpb25baV1bal0uaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAoaGVpZ2h0ICYmIChoZWlnaHQgLyByb3dTcGFuKSkgfHwgdW5kZWZpbmVkOyAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgJiYgK2hlaWdodC50b0ZpeGVkKDIpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChrID0gMCwgb2Zmc2V0ID0gMDsgayA8IHJvd1NwYW47IGsrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGwgPSAwOyBsIDwgY29sU3BhbjsgbCsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvd01hdHJpeFtpICsga10gPSBzaGFkb3dNYXRyaXhbaSArIGtdID8gc2hhZG93TWF0cml4W2kgKyBrXSA6IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gaiArIGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHNoYWRvd01hdHJpeFtpICsga11bb2Zmc2V0XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFkb3dNYXRyaXhbaSArIGtdW29mZnNldF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiAoaSArICctJyArIGopLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNoYWRvd01hdHJpeDtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguX19nZXRCbG9ja19fICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaWQgPSBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBtYXRyaXggPSB0aGlzLFxuICAgICAgICAgICAgcGxhY2VIb2xkZXIgPSBtYXRyaXggJiYgbWF0cml4LnBsYWNlSG9sZGVyLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBsZW5SID0gcGxhY2VIb2xkZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGVuQztcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgbGVuUjsgaSsrKSB7XG4gICAgICAgICAgICBmb3IoaiA9IDAsIGxlbkMgPSBwbGFjZUhvbGRlcltpXS5sZW5ndGg7IGogPCBsZW5DOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocGxhY2VIb2xkZXJbaV1bal0uY29uZmlnLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwbGFjZUhvbGRlcltpXVtqXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXgudXBkYXRlID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBjb250YWluZXIgPSBtYXRyaXggJiYgbWF0cml4Lm1hdHJpeENvbnRhaW5lcixcbiAgICAgICAgICAgIHBsYWNlSG9sZGVyID0gbWF0cml4ICYmIG1hdHJpeC5wbGFjZUhvbGRlcixcbiAgICAgICAgICAgIGRpc3Bvc2FsQm94ID0gW10sXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgajtcblxuICAgICAgICB3aGlsZShjb250YWluZXIuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmxhc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gcGxhY2VIb2xkZXIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGZvciAoaiA9IHBsYWNlSG9sZGVyW2ldLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VIb2xkZXJbaV1bal0uY29uZmlnICYmIHBsYWNlSG9sZGVyW2ldW2pdLmNvbmZpZy5jaGFydCAmJiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRpc3Bvc2FsQm94LnB1c2gocGxhY2VIb2xkZXJbaV1bal0uY29uZmlnLmNoYXJ0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG9DZWxsLmRpc3Bvc2FsQm94ID0gZGlzcG9zYWxCb3g7XG4gICAgICAgIG1hdHJpeC5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbiB8fCBtYXRyaXguY29uZmlndXJhdGlvbjtcbiAgICAgICAgbWF0cml4LmNvbmZpZ01hbmFnZXIgPSBtYXRyaXguX19kcmF3TWFuYWdlcl9fKG1hdHJpeC5jb25maWd1cmF0aW9uKTtcbiAgICAgICAgbWF0cml4LmRyYXcoKTtcbiAgICB9O1xuXG4gICAgcHJvdG9NYXRyaXguZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMsXG4gICAgICAgICAgICBub2RlICA9IG1hdHJpeCAmJiBtYXRyaXgubWF0cml4Q29udGFpbmVyLFxuICAgICAgICAgICAgcGxhY2VIb2xkZXIgPSBtYXRyaXggJiYgbWF0cml4LnBsYWNlSG9sZGVyLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBsZW5DLFxuICAgICAgICAgICAgbGVuUjtcbiAgICAgICAgZm9yKGkgPSAwLCBsZW5SID0gcGxhY2VIb2xkZXIgJiYgcGxhY2VIb2xkZXIubGVuZ3RoOyBpIDwgbGVuUjsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBsZW5DID0gcGxhY2VIb2xkZXJbaV0gJiYgcGxhY2VIb2xkZXJbaV0ubGVuZ3RoOyBqIDwgbGVuQzsgaisrKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VIb2xkZXJbaV1bal0uY2hhcnQgJiYgcGxhY2VIb2xkZXJbaV1bal0uY2hhcnQuY2hhcnRPYmogJiYgXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlSG9sZGVyW2ldW2pdLmNoYXJ0LmNoYXJ0T2JqLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAobm9kZS5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQobm9kZS5sYXN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XG4gICAgICAgIG5vZGUuc3R5bGUud2lkdGggPSAnMHB4JztcbiAgICB9O1xuXG4gICAgTXVsdGlDaGFydGluZy5wcm90b3R5cGUuY3JlYXRlTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeChhcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdKTtcbiAgICB9O1xufSk7IiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoTXVsdGlDaGFydGluZyk7XG4gICAgfVxufSkoZnVuY3Rpb24gKE11bHRpQ2hhcnRpbmcpIHtcbiAgICBcbiAgICAvKiBnbG9iYWwgRnVzaW9uQ2hhcnRzOiB0cnVlICovXG4gICAgdmFyIGdsb2JhbCA9IE11bHRpQ2hhcnRpbmcucHJvdG90eXBlLFxuICAgICAgICB3aW4gPSBnbG9iYWwud2luLFxuXG4gICAgICAgIG9iamVjdFByb3RvVG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBhcnJheVRvU3RyaW5nSWRlbnRpZmllciA9IG9iamVjdFByb3RvVG9TdHJpbmcuY2FsbChbXSksXG4gICAgICAgIGlzQXJyYXkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0UHJvdG9Ub1N0cmluZy5jYWxsKG9iaikgPT09IGFycmF5VG9TdHJpbmdJZGVudGlmaWVyO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEEgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGFic3RyYWN0aW9uIGxheWVyIHNvIHRoYXQgdGhlIHRyeS1jYXRjaCAvXG4gICAgICAgIC8vIGVycm9yIHN1cHByZXNzaW9uIG9mIGZsYXNoIGNhbiBiZSBhdm9pZGVkIHdoaWxlIHJhaXNpbmcgZXZlbnRzLlxuICAgICAgICBtYW5hZ2VkRm5DYWxsID0gZnVuY3Rpb24gKGl0ZW0sIHNjb3BlLCBldmVudCwgYXJncykge1xuICAgICAgICAgICAgLy8gV2UgY2hhbmdlIHRoZSBzY29wZSBvZiB0aGUgZnVuY3Rpb24gd2l0aCByZXNwZWN0IHRvIHRoZVxuICAgICAgICAgICAgLy8gb2JqZWN0IHRoYXQgcmFpc2VkIHRoZSBldmVudC5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaXRlbVswXS5jYWxsKHNjb3BlLCBldmVudCwgYXJncyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIENhbGwgZXJyb3IgaW4gYSBzZXBhcmF0ZSB0aHJlYWQgdG8gYXZvaWQgc3RvcHBpbmdcbiAgICAgICAgICAgICAgICAvLyBvZiBjaGFydCBsb2FkLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRoYXQgZXhlY3V0ZXMgYWxsIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBpbnZva2VkIHVwb24gdHJpZ2dlclxuICAgICAgICAvLyBvZiBhbiBldmVudC5cbiAgICAgICAgc2xvdExvYWRlciA9IGZ1bmN0aW9uIChzbG90LCBldmVudCwgYXJncykge1xuICAgICAgICAgICAgLy8gSWYgc2xvdCBkb2VzIG5vdCBoYXZlIGEgcXVldWUsIHdlIGFzc3VtZSB0aGF0IHRoZSBsaXN0ZW5lclxuICAgICAgICAgICAgLy8gd2FzIG5ldmVyIGFkZGVkIGFuZCBoYWx0IG1ldGhvZC5cbiAgICAgICAgICAgIGlmICghKHNsb3QgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAvLyBTdGF0dXRvcnkgVzNDIE5PVCBwcmV2ZW50RGVmYXVsdCBmbGFnXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHZhcmlhYmxlcy5cbiAgICAgICAgICAgIHZhciBpID0gMCwgc2NvcGU7XG5cbiAgICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgc2xvdCBhbmQgbG9vayBmb3IgbWF0Y2ggd2l0aCByZXNwZWN0IHRvXG4gICAgICAgICAgICAvLyB0eXBlIGFuZCBiaW5kaW5nLlxuICAgICAgICAgICAgZm9yICg7IGkgPCBzbG90Lmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG1hdGNoIGZvdW5kIHcuci50LiB0eXBlIGFuZCBiaW5kLCB3ZSBmaXJlIGl0LlxuICAgICAgICAgICAgICAgIGlmIChzbG90W2ldWzFdID09PSBldmVudC5zZW5kZXIgfHwgc2xvdFtpXVsxXSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBzZW5kZXIgb2YgdGhlIGV2ZW50IGZvciBnbG9iYWwgZXZlbnRzLlxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY2hvaWNlIG9mIHNjb3BlIGRpZmZlcmVzIGRlcGVuZGluZyBvbiB3aGV0aGVyIGFcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2xvYmFsIG9yIGEgbG9jYWwgZXZlbnQgaXMgYmVpbmcgcmFpc2VkLlxuICAgICAgICAgICAgICAgICAgICBzY29wZSA9IHNsb3RbaV1bMV0gPT09IGV2ZW50LnNlbmRlciA/XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zZW5kZXIgOiBnbG9iYWw7XG5cbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlZEZuQ2FsbChzbG90W2ldLCBzY29wZSwgZXZlbnQsIGFyZ3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSB1c2VyIHdhbnRlZCB0byBkZXRhY2ggdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5kZXRhY2hlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2xvdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5kZXRhY2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciBwcm9wYWdhdGlvbiBmbGFnIGlzIHNldCB0byBmYWxzZSBhbmQgZGlzY29udG51ZVxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGlvbiBpZiBuZWVkZWQuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmNlbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRNYXAgPSB7XG4gICAgICAgICAgICBob3ZlcmluIDogJ3RyZW5kUmVnaW9uUm9sbE92ZXInLFxuICAgICAgICAgICAgaG92ZXJvdXQgOiAndHJlbmRSZWdpb25Sb2xsT3V0JyxcbiAgICAgICAgICAgIGNsaWsgOiAnZGF0YXBsb3RjbGljaydcbiAgICAgICAgfSxcbiAgICAgICAgcmFpc2VFdmVudCxcblxuICAgICAgICBFdmVudFRhcmdldCA9IHtcblxuICAgICAgICAgICAgdW5wcm9wYWdhdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLmNhbmNlbGxlZCA9IHRydWUpID09PSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXRhY2hlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5kZXRhY2hlZCA9IHRydWUpID09PSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bmRlZmF1bHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5wcmV2ZW50ZWQgPSB0cnVlKSA9PT0gZmFsc2U7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBFbnRpcmUgY29sbGVjdGlvbiBvZiBsaXN0ZW5lcnMuXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IHt9LFxuXG4gICAgICAgICAgICAvLyBUaGUgbGFzdCByYWlzZWQgZXZlbnQgaWQuIEFsbG93cyB0byBjYWxjdWxhdGUgdGhlIG5leHQgZXZlbnQgaWQuXG4gICAgICAgICAgICBsYXN0RXZlbnRJZDogMCxcblxuICAgICAgICAgICAgYWRkTGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciwgYmluZCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHJlY3Vyc2VSZXR1cm4sXG4gICAgICAgICAgICAgICAgICAgIEZDRXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBpO1xuICAgICAgICAgICAgICAgIC8vIEluIGNhc2UgdHlwZSBpcyBzZW50IGFzIGFycmF5LCB3ZSByZWN1cnNlIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkodHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzZVJldHVybiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBsb29rIGludG8gZWFjaCBpdGVtIG9mIHRoZSAndHlwZScgcGFyYW1ldGVyIGFuZCBzZW5kIGl0LFxuICAgICAgICAgICAgICAgICAgICAvLyBhbG9uZyB3aXRoIG90aGVyIHBhcmFtZXRlcnMgdG8gYSByZWN1cnNlZCBhZGRMaXN0ZW5lclxuICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2QuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWN1cnNlUmV0dXJuLnB1c2goRXZlbnRUYXJnZXQuYWRkTGlzdGVuZXIodHlwZVtpXSwgbGlzdGVuZXIsIGJpbmQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjdXJzZVJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGUgdHlwZSBwYXJhbWV0ZXIuIExpc3RlbmVyIGNhbm5vdCBiZSBhZGRlZCB3aXRob3V0XG4gICAgICAgICAgICAgICAgLy8gdmFsaWQgdHlwZS5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgZXZlbnQgbmFtZSBoYXMgbm90IGJlZW4gcHJvdmlkZWQgd2hpbGUgYWRkaW5nIGFuIGV2ZW50IGxpc3RlbmVyLiBFbnN1cmUgdGhhdCB5b3UgcGFzcyBhXG4gICAgICAgICAgICAgICAgICAgICAqIGBzdHJpbmdgIHRvIHRoZSBmaXJzdCBwYXJhbWV0ZXIgb2Yge0BsaW5rIEZ1c2lvbkNoYXJ0cy5hZGRFdmVudExpc3RlbmVyfS5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogQHR5cGVkZWYge1BhcmFtZXRlckV4Y2VwdGlvbn0gRXJyb3ItMDMwOTE1NDlcbiAgICAgICAgICAgICAgICAgICAgICogQG1lbWJlck9mIEZ1c2lvbkNoYXJ0cy5kZWJ1Z2dlclxuICAgICAgICAgICAgICAgICAgICAgKiBAZ3JvdXAgZGVidWdnZXItZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5yYWlzZUVycm9yKGJpbmQgfHwgZ2xvYmFsLCAnMDMwOTE1NDknLCAncGFyYW0nLCAnOjpFdmVudFRhcmdldC5hZGRMaXN0ZW5lcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IoJ1Vuc3BlY2lmaWVkIEV2ZW50IFR5cGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBMaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24uIEl0IHdpbGwgbm90IGV2YWwgYSBzdHJpbmcuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIGV2ZW50IGxpc3RlbmVyIHBhc3NlZCB0byB7QGxpbmsgRnVzaW9uQ2hhcnRzLmFkZEV2ZW50TGlzdGVuZXJ9IG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIEB0eXBlZGVmIHtQYXJhbWV0ZXJFeGNlcHRpb259IEVycm9yLTAzMDkxNTUwXG4gICAgICAgICAgICAgICAgICAgICAqIEBtZW1iZXJPZiBGdXNpb25DaGFydHMuZGVidWdnZXJcbiAgICAgICAgICAgICAgICAgICAgICogQGdyb3VwIGRlYnVnZ2VyLWVycm9yXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucmFpc2VFcnJvcihiaW5kIHx8IGdsb2JhbCwgJzAzMDkxNTUwJywgJ3BhcmFtJywgJzo6RXZlbnRUYXJnZXQuYWRkTGlzdGVuZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKCdJbnZhbGlkIEV2ZW50IExpc3RlbmVyJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGVzZW5zaXRpemUgdGhlIHR5cGUgY2FzZSBmb3IgdXNlciBhY2Nlc3NhYmlsaXR5LlxuICAgICAgICAgICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgaW5zZXJ0aW9uIHBvc2l0aW9uIGRvZXMgbm90IGhhdmUgYSBxdWV1ZSwgdGhlbiBjcmVhdGUgb25lLlxuICAgICAgICAgICAgICAgIGlmICghKEV2ZW50VGFyZ2V0Lmxpc3RlbmVyc1t0eXBlXSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICBFdmVudFRhcmdldC5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3RlbmVyIHRvIHRoZSBxdWV1ZS5cbiAgICAgICAgICAgICAgICBFdmVudFRhcmdldC5saXN0ZW5lcnNbdHlwZV0ucHVzaChbbGlzdGVuZXIsIGJpbmRdKTtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50cyBvZiBmdXNpb25DaGFydCByYWlzZWQgdmlhIE11bHRpQ2hhcnRpbmcuXG4gICAgICAgICAgICAgICAgaWYgKEZDRXZlbnRUeXBlID0gZXZlbnRNYXBbdHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgRnVzaW9uQ2hhcnRzLmFkZEV2ZW50TGlzdGVuZXIoRkNFdmVudFR5cGUsIGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWlzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGQ0V2ZW50T2JqIDogZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGQ0RhdGFPYmogOiBkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBNdWx0aUNoYXJ0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciwgYmluZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNsb3QsXG4gICAgICAgICAgICAgICAgICAgIGk7XG5cbiAgICAgICAgICAgICAgICAvLyBMaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24uIEVsc2Ugd2UgaGF2ZSBub3RoaW5nIHRvIHJlbW92ZSFcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgZXZlbnQgbGlzdGVuZXIgcGFzc2VkIHRvIHtAbGluayBGdXNpb25DaGFydHMucmVtb3ZlRXZlbnRMaXN0ZW5lcn0gbmVlZHMgdG8gYmUgYSBmdW5jdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICogT3RoZXJ3aXNlLCB0aGUgZXZlbnQgbGlzdGVuZXIgZnVuY3Rpb24gaGFzIG5vIHdheSB0byBrbm93IHdoaWNoIGZ1bmN0aW9uIGlzIHRvIGJlIHJlbW92ZWQuXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIEB0eXBlZGVmIHtQYXJhbWV0ZXJFeGNlcHRpb259IEVycm9yLTAzMDkxNTYwXG4gICAgICAgICAgICAgICAgICAgICAqIEBtZW1iZXJPZiBGdXNpb25DaGFydHMuZGVidWdnZXJcbiAgICAgICAgICAgICAgICAgICAgICogQGdyb3VwIGRlYnVnZ2VyLWVycm9yXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucmFpc2VFcnJvcihiaW5kIHx8IGdsb2JhbCwgJzAzMDkxNTYwJywgJ3BhcmFtJywgJzo6RXZlbnRUYXJnZXQucmVtb3ZlTGlzdGVuZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKCdJbnZhbGlkIEV2ZW50IExpc3RlbmVyJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSW4gY2FzZSB0eXBlIGlzIHNlbnQgYXMgYXJyYXksIHdlIHJlY3Vyc2UgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGxvb2sgaW50byBlYWNoIGl0ZW0gb2YgdGhlICd0eXBlJyBwYXJhbWV0ZXIgYW5kIHNlbmQgaXQsXG4gICAgICAgICAgICAgICAgICAgIC8vIGFsb25nIHdpdGggb3RoZXIgcGFyYW1ldGVycyB0byBhIHJlY3Vyc2VkIGFkZExpc3RlbmVyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZC5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV2ZW50VGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHR5cGVbaV0sIGxpc3RlbmVyLCBiaW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHR5cGUgcGFyYW1ldGVyLiBMaXN0ZW5lciBjYW5ub3QgYmUgcmVtb3ZlZCB3aXRob3V0XG4gICAgICAgICAgICAgICAgLy8gdmFsaWQgdHlwZS5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgZXZlbnQgbmFtZSBwYXNzZWQgdG8ge0BsaW5rIEZ1c2lvbkNoYXJ0cy5yZW1vdmVFdmVudExpc3RlbmVyfSBuZWVkcyB0byBiZSBhIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogQHR5cGVkZWYge1BhcmFtZXRlckV4Y2VwdGlvbn0gRXJyb3ItMDMwOTE1NTlcbiAgICAgICAgICAgICAgICAgICAgICogQG1lbWJlck9mIEZ1c2lvbkNoYXJ0cy5kZWJ1Z2dlclxuICAgICAgICAgICAgICAgICAgICAgKiBAZ3JvdXAgZGVidWdnZXItZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5yYWlzZUVycm9yKGJpbmQgfHwgZ2xvYmFsLCAnMDMwOTE1NTknLCAncGFyYW0nLCAnOjpFdmVudFRhcmdldC5yZW1vdmVMaXN0ZW5lcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IoJ1Vuc3BlY2lmaWVkIEV2ZW50IFR5cGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbnNpdGl6ZSB0aGUgdHlwZSBjYXNlIGZvciB1c2VyIGFjY2Vzc2FiaWxpdHkuXG4gICAgICAgICAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHJlZmVyZW5jZSB0byB0aGUgc2xvdCBmb3IgZWFzeSBsb29rdXAgaW4gdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgICAgc2xvdCA9IEV2ZW50VGFyZ2V0Lmxpc3RlbmVyc1t0eXBlXTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHNsb3QgZG9lcyBub3QgaGF2ZSBhIHF1ZXVlLCB3ZSBhc3N1bWUgdGhhdCB0aGUgbGlzdGVuZXJcbiAgICAgICAgICAgICAgICAvLyB3YXMgbmV2ZXIgYWRkZWQgYW5kIGhhbHQgbWV0aG9kLlxuICAgICAgICAgICAgICAgIGlmICghKHNsb3QgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgc2xvdCBhbmQgcmVtb3ZlIGV2ZXJ5IGluc3RhbmNlIG9mIHRoZVxuICAgICAgICAgICAgICAgIC8vIGV2ZW50IGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNsb3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGxpc3RlbmVyIGZvdW5kIGluIHRoZSBxdWV1ZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNsb3RbaV1bMF0gPT09IGxpc3RlbmVyICYmIHNsb3RbaV1bMV0gPT09IGJpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gb3B0cyBjYW4gaGF2ZSB7IGFzeW5jOnRydWUsIG9tbmk6dHJ1ZSB9XG4gICAgICAgICAgICB0cmlnZ2VyRXZlbnQ6IGZ1bmN0aW9uICh0eXBlLCBzZW5kZXIsIGFyZ3MsIGV2ZW50U2NvcGUsIGRlZmF1bHRGbiwgY2FuY2VsRm4pIHtcblxuICAgICAgICAgICAgICAgIC8vIEluIGNhc2UsIGV2ZW50IHR5cGUgaXMgbWlzc2luZywgZGlzcGF0Y2ggY2Fubm90IHByb2NlZWQuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIGV2ZW50IG5hbWUgcGFzc2VkIHRvIHtAbGluayBGdXNpb25DaGFydHMucmVtb3ZlRXZlbnRMaXN0ZW5lcn0gbmVlZHMgdG8gYmUgYSBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIEB0eXBlZGVmIHtQYXJhbWV0ZXJFeGNlcHRpb259IEVycm9yLTAzMDkxNjAyXG4gICAgICAgICAgICAgICAgICAgICAqIEBtZW1iZXJPZiBGdXNpb25DaGFydHMuZGVidWdnZXJcbiAgICAgICAgICAgICAgICAgICAgICogQGdyb3VwIGRlYnVnZ2VyLWVycm9yXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucmFpc2VFcnJvcihzZW5kZXIsICcwMzA5MTYwMicsICdwYXJhbScsICc6OkV2ZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKCdJbnZhbGlkIEV2ZW50IFR5cGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGVzZW5zaXRpemUgdGhlIHR5cGUgY2FzZSBmb3IgdXNlciBhY2Nlc3NhYmlsaXR5LlxuICAgICAgICAgICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBNb2RlbCB0aGUgZXZlbnQgYXMgcGVyIFczQyBzdGFuZGFyZHMuIEFkZCB0aGUgZnVuY3Rpb24gdG8gY2FuY2VsXG4gICAgICAgICAgICAgICAgLy8gZXZlbnQgcHJvcGFnYXRpb24gYnkgdXNlciBoYW5kbGVycy4gQWxzbyBhcHBlbmQgYW4gaW5jcmVtZW50YWxcbiAgICAgICAgICAgICAgICAvLyBldmVudCBpZC5cbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRJZDogKEV2ZW50VGFyZ2V0Lmxhc3RFdmVudElkICs9IDEpLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXI6IHNlbmRlciB8fCBuZXcgRXJyb3IoJ09ycGhhbiBFdmVudCcpLFxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdG9wUHJvcGFnYXRpb246IHRoaXMudW5wcm9wYWdhdG9yLFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogdGhpcy51bmRlZmF1bHRlcixcbiAgICAgICAgICAgICAgICAgICAgZGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBkZXRhY2hIYW5kbGVyOiB0aGlzLmRldGFjaGVyXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEV2ZW50IGxpc3RlbmVycyBhcmUgdXNlZCB0byB0YXAgaW50byBkaWZmZXJlbnQgc3RhZ2VzIG9mIGNyZWF0aW5nLCB1cGRhdGluZywgcmVuZGVyaW5nIG9yIHJlbW92aW5nXG4gICAgICAgICAgICAgICAgICogY2hhcnRzLiBBIEZ1c2lvbkNoYXJ0cyBpbnN0YW5jZSBmaXJlcyBzcGVjaWZpYyBldmVudHMgYmFzZWQgb24gd2hhdCBzdGFnZSBpdCBpcyBpbi4gRm9yIGV4YW1wbGUsIHRoZVxuICAgICAgICAgICAgICAgICAqIGByZW5kZXJDb21wbGV0ZWAgZXZlbnQgaXMgZmlyZWQgZWFjaCB0aW1lIGEgY2hhcnQgaGFzIGZpbmlzaGVkIHJlbmRlcmluZy4gWW91IGNhbiBsaXN0ZW4gdG8gYW55IHN1Y2hcbiAgICAgICAgICAgICAgICAgKiBldmVudCB1c2luZyB7QGxpbmsgRnVzaW9uQ2hhcnRzLmFkZEV2ZW50TGlzdGVuZXJ9IG9yIHtAbGluayBGdXNpb25DaGFydHMjYWRkRXZlbnRMaXN0ZW5lcn0gYW5kIGJpbmRcbiAgICAgICAgICAgICAgICAgKiB5b3VyIG93biBmdW5jdGlvbnMgdG8gdGhhdCBldmVudC5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIFRoZXNlIGZ1bmN0aW9ucyBhcmUga25vd24gYXMgXCJsaXN0ZW5lcnNcIiBhbmQgYXJlIHBhc3NlZCBvbiB0byB0aGUgc2Vjb25kIGFyZ3VtZW50IChgbGlzdGVuZXJgKSBvZiB0aGVcbiAgICAgICAgICAgICAgICAgKiB7QGxpbmsgRnVzaW9uQ2hhcnRzLmFkZEV2ZW50TGlzdGVuZXJ9IGFuZCB7QGxpbmsgRnVzaW9uQ2hhcnRzI2FkZEV2ZW50TGlzdGVuZXJ9IGZ1bmN0aW9ucy5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBjYWxsYmFjayBGdXNpb25DaGFydHN+ZXZlbnRMaXN0ZW5lclxuICAgICAgICAgICAgICAgICAqIEBzZWUgRnVzaW9uQ2hhcnRzLmFkZEV2ZW50TGlzdGVuZXJcbiAgICAgICAgICAgICAgICAgKiBAc2VlIEZ1c2lvbkNoYXJ0cy5yZW1vdmVFdmVudExpc3RlbmVyXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnRPYmplY3QgLSBUaGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gaXMgYW4gZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgICAgICogdGhhdCBjb250YWlucyBhbGwgaW5mb3JtYXRpb24gcGVydGFpbmluZyB0byBhIHBhcnRpY3VsYXIgZXZlbnQuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRPYmplY3QudHlwZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBldmVudE9iamVjdC5ldmVudElkIC0gQSB1bmlxdWUgSUQgYXNzb2NpYXRlZCB3aXRoIHRoZSBldmVudC4gSW50ZXJuYWxseSBpdCBpcyBhblxuICAgICAgICAgICAgICAgICAqIGluY3JlbWVudGluZyBjb3VudGVyIGFuZCBhcyBzdWNoIGNhbiBiZSBpbmRpcmVjdGx5IHVzZWQgdG8gdmVyaWZ5IHRoZSBvcmRlciBpbiB3aGljaCAgdGhlIGV2ZW50IHdhc1xuICAgICAgICAgICAgICAgICAqIGZpcmVkLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtGdXNpb25DaGFydHN9IGV2ZW50T2JqZWN0LnNlbmRlciAtIFRoZSBpbnN0YW5jZSBvZiBGdXNpb25DaGFydHMgb2JqZWN0IHRoYXQgZmlyZWQgdGhpcyBldmVudC5cbiAgICAgICAgICAgICAgICAgKiBPY2Nhc3Npb25hbGx5LCBmb3IgZXZlbnRzIHRoYXQgYXJlIG5vdCBmaXJlZCBieSBpbmRpdmlkdWFsIGNoYXJ0cywgYnV0IGFyZSBmaXJlZCBieSB0aGUgZnJhbWV3b3JrLFxuICAgICAgICAgICAgICAgICAqIHdpbGwgaGF2ZSB0aGUgZnJhbWV3b3JrIGFzIHRoaXMgcHJvcGVydHkuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV2ZW50T2JqZWN0LmNhbmNlbGxlZCAtIFNob3dzIHdoZXRoZXIgYW4gIGV2ZW50J3MgcHJvcGFnYXRpb24gd2FzIGNhbmNlbGxlZCBvciBub3QuXG4gICAgICAgICAgICAgICAgICogSXQgaXMgc2V0IHRvIGB0cnVlYCB3aGVuIGAuc3RvcFByb3BhZ2F0aW9uKClgIGlzIGNhbGxlZC5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGV2ZW50T2JqZWN0LnN0b3BQcm9wYWdhdGlvbiAtIENhbGwgdGhpcyBmdW5jdGlvbiBmcm9tIHdpdGhpbiBhIGxpc3RlbmVyIHRvIHByZXZlbnRcbiAgICAgICAgICAgICAgICAgKiBzdWJzZXF1ZW50IGxpc3RlbmVycyBmcm9tIGJlaW5nIGV4ZWN1dGVkLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBldmVudE9iamVjdC5wcmV2ZW50ZWQgLSBTaG93cyB3aGV0aGVyIHRoZSBkZWZhdWx0IGFjdGlvbiBvZiB0aGlzIGV2ZW50IGhhcyBiZWVuXG4gICAgICAgICAgICAgICAgICogcHJldmVudGVkLiBJdCBpcyBzZXQgdG8gYHRydWVgIHdoZW4gYC5wcmV2ZW50RGVmYXVsdCgpYCBpcyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBldmVudE9iamVjdC5wcmV2ZW50RGVmYXVsdCAtIENhbGwgdGhpcyBmdW5jdGlvbiB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiBvZiBhblxuICAgICAgICAgICAgICAgICAqIGV2ZW50LiBGb3IgZXhhbXBsZSwgZm9yIHRoZSBldmVudCB7QGxpbmsgRnVzaW9uQ2hhcnRzI2V2ZW50OmJlZm9yZVJlc2l6ZX0sIGlmIHlvdSBkb1xuICAgICAgICAgICAgICAgICAqIGAucHJldmVudERlZmF1bHQoKWAsIHRoZSByZXNpemUgd2lsbCBuZXZlciB0YWtlIHBsYWNlIGFuZCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgICoge0BsaW5rIEZ1c2lvbkNoYXJ0cyNldmVudDpyZXNpemVDYW5jZWxsZWR9IHdpbGwgYmUgZmlyZWQuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV2ZW50T2JqZWN0LmRldGFjaGVkIC0gRGVub3RlcyB3aGV0aGVyIGEgbGlzdGVuZXIgaGFzIGJlZW4gZGV0YWNoZWQgYW5kIG5vIGxvbmdlclxuICAgICAgICAgICAgICAgICAqIGdldHMgZXhlY3V0ZWQgZm9yIGFueSBzdWJzZXF1ZW50IGV2ZW50IG9mIHRoaXMgcGFydGljdWxhciBgdHlwZWAuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBldmVudE9iamVjdC5kZXRhY2hIYW5kbGVyIC0gQWxsb3dzIHRoZSBsaXN0ZW5lciB0byByZW1vdmUgaXRzZWxmIHJhdGhlciB0aGFuIGJlaW5nXG4gICAgICAgICAgICAgICAgICogY2FsbGVkIGV4dGVybmFsbHkgYnkge0BsaW5rIEZ1c2lvbkNoYXJ0cy5yZW1vdmVFdmVudExpc3RlbmVyfS4gVGhpcyBpcyB2ZXJ5IHVzZWZ1bCBmb3Igb25lLXRpbWUgZXZlbnRcbiAgICAgICAgICAgICAgICAgKiBsaXN0ZW5pbmcgb3IgZm9yIHNwZWNpYWwgc2l0dWF0aW9ucyB3aGVuIHRoZSBldmVudCBpcyBubyBsb25nZXIgcmVxdWlyZWQgdG8gYmUgbGlzdGVuZWQgd2hlbiB0aGVcbiAgICAgICAgICAgICAgICAgKiBldmVudCBoYXMgYmVlbiBmaXJlZCB3aXRoIGEgc3BlY2lmaWMgY29uZGl0aW9uLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50QXJncyAtIEV2ZXJ5IGV2ZW50IGhhcyBhbiBhcmd1bWVudCBvYmplY3QgYXMgc2Vjb25kIHBhcmFtZXRlciB0aGF0IGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICogaW5mb3JtYXRpb24gcmVsZXZhbnQgdG8gdGhhdCBwYXJ0aWN1bGFyIGV2ZW50LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHNsb3RMb2FkZXIoRXZlbnRUYXJnZXQubGlzdGVuZXJzW3R5cGVdLCBldmVudE9iamVjdCwgYXJncyk7XG5cbiAgICAgICAgICAgICAgICAvLyBGYWNpbGl0YXRlIHRoZSBjYWxsIG9mIGEgZ2xvYmFsIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgICAgICAgICAgIHNsb3RMb2FkZXIoRXZlbnRUYXJnZXQubGlzdGVuZXJzWycqJ10sIGV2ZW50T2JqZWN0LCBhcmdzKTtcblxuICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgZGVmYXVsdCBhY3Rpb25cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50T2JqZWN0LnByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRydWU6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbmNlbEZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsRm4uY2FsbChldmVudFNjb3BlIHx8IHNlbmRlciB8fCB3aW4sIGV2ZW50T2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FsbCBlcnJvciBpbiBhIHNlcGFyYXRlIHRocmVhZCB0byBhdm9pZCBzdG9wcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvZiBjaGFydCBsb2FkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlZmF1bHRGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRGbi5jYWxsKGV2ZW50U2NvcGUgfHwgc2VuZGVyIHx8IHdpbiwgZXZlbnRPYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzIHx8IHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxsIGVycm9yIGluIGEgc2VwYXJhdGUgdGhyZWFkIHRvIGF2b2lkIHN0b3BwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIGNoYXJ0IGxvYWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU3RhdHV0b3J5IFczQyBOT1QgcHJldmVudERlZmF1bHQgZmxhZ1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0IG9mIGV2ZW50cyB0aGF0IGhhcyBhbiBlcXVpdmFsZW50IGxlZ2FjeSBldmVudC4gVXNlZCBieSB0aGVcbiAgICAgICAgICogcmFpc2VFdmVudCBtZXRob2QgdG8gY2hlY2sgd2hldGhlciBhIHBhcnRpY3VsYXIgZXZlbnQgcmFpc2VkXG4gICAgICAgICAqIGhhcyBhbnkgY29ycmVzcG9uZGluZyBsZWdhY3kgZXZlbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgbGVnYWN5RXZlbnRMaXN0ID0gZ2xvYmFsLmxlZ2FjeUV2ZW50TGlzdCA9IHt9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWludGFpbnMgYSBsaXN0IG9mIHJlY2VudGx5IHJhaXNlZCBjb25kaXRpb25hbCBldmVudHNcbiAgICAgICAgICogQHR5cGUgb2JqZWN0XG4gICAgICAgICAqL1xuICAgICAgICBjb25kaXRpb25DaGVja3MgPSB7fTtcblxuICAgIC8vIEZhY2lsaXRhdGUgZm9yIHJhaXNpbmcgZXZlbnRzIGludGVybmFsbHkuXG4gICAgcmFpc2VFdmVudCA9IGdsb2JhbC5yYWlzZUV2ZW50ID0gZnVuY3Rpb24gKHR5cGUsIGFyZ3MsIG9iaiwgZXZlbnRTY29wZSxcbiAgICAgICAgICAgIGRlZmF1bHRGbiwgY2FuY2VsbGVkRm4pIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50VGFyZ2V0LnRyaWdnZXJFdmVudCh0eXBlLCBvYmosIGFyZ3MsIGV2ZW50U2NvcGUsXG4gICAgICAgICAgICBkZWZhdWx0Rm4sIGNhbmNlbGxlZEZuKTtcbiAgICB9O1xuXG4gICAgZ2xvYmFsLmRpc3Bvc2VFdmVudHMgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciB0eXBlLCBpO1xuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIGV2ZW50cyBpbiB0aGUgY29sbGVjdGlvbiBvZiBsaXN0ZW5lcnNcbiAgICAgICAgZm9yICh0eXBlIGluIEV2ZW50VGFyZ2V0Lmxpc3RlbmVycykge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IEV2ZW50VGFyZ2V0Lmxpc3RlbmVyc1t0eXBlXS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gYSBtYXRjaCBpcyBmb3VuZCwgZGVsZXRlIHRoZSBsaXN0ZW5lciBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICAgICAgaWYgKEV2ZW50VGFyZ2V0Lmxpc3RlbmVyc1t0eXBlXVtpXVsxXSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIEV2ZW50VGFyZ2V0Lmxpc3RlbmVyc1t0eXBlXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBhbGxvd3MgdG8gdW5pZm9ybWx5IHJhaXNlIGV2ZW50cyBvZiBGdXNpb25DaGFydHNcbiAgICAgKiBGcmFtZXdvcmsuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBzcGVjaWZpZXMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHJhaXNlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJncyBhbGxvd3MgdG8gcHJvdmlkZSBhbiBhcmd1bWVudHMgb2JqZWN0IHRvIGJlXG4gICAgICogcGFzc2VkIG9uIHRvIHRoZSBldmVudCBsaXN0ZW5lcnMuXG4gICAgICogQHBhcmFtIH0gb2JqIGlzIHRoZSBGdXNpb25DaGFydHMgaW5zdGFuY2Ugb2JqZWN0IG9uXG4gICAgICogYmVoYWxmIG9mIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSByYWlzZWQuXG4gICAgICogQHBhcmFtIHthcnJheX0gbGVnYWN5QXJncyBpcyBhbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYmUgcGFzc2VkIG9uXG4gICAgICogdG8gdGhlIGVxdWl2YWxlbnQgbGVnYWN5IGV2ZW50LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IHNvdXJjZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlZmF1bHRGblxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbmNlbEZuXG4gICAgICpcbiAgICAgKiBAdHlwZSB1bmRlZmluZWRcbiAgICAgKi9cbiAgICBnbG9iYWwucmFpc2VFdmVudFdpdGhMZWdhY3kgPSBmdW5jdGlvbiAobmFtZSwgYXJncywgb2JqLCBsZWdhY3lBcmdzLFxuICAgICAgICAgICAgZXZlbnRTY29wZSwgZGVmYXVsdEZuLCBjYW5jZWxsZWRGbikge1xuICAgICAgICB2YXIgbGVnYWN5ID0gbGVnYWN5RXZlbnRMaXN0W25hbWVdO1xuICAgICAgICByYWlzZUV2ZW50KG5hbWUsIGFyZ3MsIG9iaiwgZXZlbnRTY29wZSwgZGVmYXVsdEZuLCBjYW5jZWxsZWRGbik7XG4gICAgICAgIGlmIChsZWdhY3kgJiYgdHlwZW9mIHdpbltsZWdhY3ldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aW5bbGVnYWN5XS5hcHBseShldmVudFNjb3BlIHx8IHdpbiwgbGVnYWN5QXJncyk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGFsbG93cyBvbmUgdG8gcmFpc2UgcmVsYXRlZCBldmVudHMgdGhhdCBhcmUgZ3JvdXBlZCB0b2dldGhlciBhbmRcbiAgICAgKiByYWlzZWQgYnkgbXVsdGlwbGUgc291cmNlcy4gVXN1YWxseSB0aGlzIGlzIHVzZWQgd2hlcmUgYSBjb25ncmVnYXRpb25cbiAgICAgKiBvZiBzdWNjZXNzaXZlIGV2ZW50cyBuZWVkIHRvIGNhbmNlbCBvdXQgZWFjaCBvdGhlciBhbmQgYmVoYXZlIGxpa2UgYVxuICAgICAqIHVuaWZpZWQgZW50aXR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoZWNrIGlzIHVzZWQgdG8gaWRlbnRpZnkgZXZlbnQgZ3JvdXBzLiBQcm92aWRlIHNhbWUgdmFsdWVcbiAgICAgKiBmb3IgYWxsIGV2ZW50cyB0aGF0IHlvdSB3YW50IHRvIGdyb3VwIHRvZ2V0aGVyIGZyb20gbXVsdGlwbGUgc291cmNlcy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBzcGVjaWZpZXMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHJhaXNlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYXJncyBhbGxvd3MgdG8gcHJvdmlkZSBhbiBhcmd1bWVudHMgb2JqZWN0IHRvIGJlXG4gICAgICogcGFzc2VkIG9uIHRvIHRoZSBldmVudCBsaXN0ZW5lcnMuXG4gICAgICogQHBhcmFtIH0gb2JqIGlzIHRoZSBGdXNpb25DaGFydHMgaW5zdGFuY2Ugb2JqZWN0IG9uXG4gICAgICogYmVoYWxmIG9mIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSByYWlzZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50U2NvcGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBkZWZhdWx0Rm5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYW5jZWxsZWRGblxuICAgICAqXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBnbG9iYWwucmFpc2VFdmVudEdyb3VwID0gZnVuY3Rpb24gKGNoZWNrLCBuYW1lLCBhcmdzLCBvYmosIGV2ZW50U2NvcGUsXG4gICAgICAgICAgICBkZWZhdWx0Rm4sIGNhbmNlbGxlZEZuKSB7XG4gICAgICAgIHZhciBpZCA9IG9iai5pZCxcbiAgICAgICAgICAgIGhhc2ggPSBjaGVjayArIGlkO1xuXG4gICAgICAgIGlmIChjb25kaXRpb25DaGVja3NbaGFzaF0pIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChjb25kaXRpb25DaGVja3NbaGFzaF0pO1xuICAgICAgICAgICAgZGVsZXRlIGNvbmRpdGlvbkNoZWNrc1toYXNoXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpZCAmJiBoYXNoKSB7XG4gICAgICAgICAgICAgICAgY29uZGl0aW9uQ2hlY2tzW2hhc2hdID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhaXNlRXZlbnQobmFtZSwgYXJncywgb2JqLCBldmVudFNjb3BlLCBkZWZhdWx0Rm4sIGNhbmNlbGxlZEZuKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbmRpdGlvbkNoZWNrc1toYXNoXTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhaXNlRXZlbnQobmFtZSwgYXJncywgb2JqLCBldmVudFNjb3BlLCBkZWZhdWx0Rm4sIGNhbmNlbGxlZEZuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFeHRlbmQgdGhlIGV2ZW50bGlzdGVuZXJzIHRvIGludGVybmFsIGdsb2JhbC5cbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciwgYmluZCkge1xuICAgICAgICByZXR1cm4gRXZlbnRUYXJnZXQuYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGJpbmQpO1xuICAgIH07XG4gICAgZ2xvYmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIsIGJpbmQpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50VGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBiaW5kKTtcbiAgICB9O1xufSk7Il19
