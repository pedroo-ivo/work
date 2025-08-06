define([
        'N/format'
    ],
    function (format) {
        return {
            Timezone: format.Timezone,
            leftPad: function leftPad(str, len, pad) {
                str = str ? str.trim() : '';
                len = len || 0;
                pad = pad || ' ';
                if (len + 1 >= str.length) {
                    str = Array(len + 1 - str.length).join(pad) + str;
                    // truncate on least significant digits (padded digits)
                    if (str.length > len) {
                        str = str.substring(str.length - len, str.length);
                    }
                } else {
                    str = str.substring(str.length - len, str.length);
                }
                return str;
            },
            DateFormat: {
                STANDARD: 'YYYY-MM-DD'
            },
            dateToString: function dateToString(date) {
                return format.format({value: date, type: format.Type.DATE});
            },
            stringToDate: function stringToDate(dateString, timezone) {
                var options = {value: dateString, type: format.Type.DATE};
                if (timezone) {
                    options.timezone = timezone;
                }
                return format.parse(options);
            },
            dateToLocalDate: function dateToLocalDate(date, timezone) {
                var strLocalDate = format.format({
                    value: date,
                    type: format.Type.DATETIME,
                    timezone: timezone
                });
                log.debug('dateToLocalDate', strLocalDate);
                return this.stringToDate(strLocalDate, timezone);
            },
            dateToLocalDateString: function dateToLocalDateString(date, timezone) {
                var strLocalDate = this.dateToLocalDate(date, timezone);
                return this.dateToString(strLocalDate);
            },
            dateToFormattedString: function dateToFormattedString(date, zeroPadded, dateFormat) {
                var me = this;
                var constMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                dateFormat = dateFormat || this.DateFormat.STANDARD;
                if (date && dateFormat) {
                    return dateFormat.replace(/Y{2,4}|MM|Month|MONTH|D{2,3}/g, function (match) {
                        var replacement = '';
                        switch (match) {
                            case 'DD':
                                replacement = date.getDate();
                                break;
                            case 'Month':
                                replacement = constMonths[date.getMonth()];
                                break;
                            case 'MONTH':
                                replacement = constMonths[date.getMonth()].toUpperCase();
                                break;
                            case 'MM':
                                replacement = date.getMonth() + 1;
                                break;
                            case 'YY':
                            case 'YYYY':
                                replacement = date.getFullYear().toString().substr(-match.length);
                                break;
                        }
                        return zeroPadded ? me.leftPad(replacement.toString(), match.length, '0') : replacement;
                    }) || '';
                }
                return '';
            },
            exceptionToString: function exceptionToString(ex, noStackTrace) {
                var exStr = '';
                if (ex) {
                    if (ex instanceof Error) {
                        exStr += ex.toString() + '\n' + (noStackTrace ? ex.stack : '');
                    } else if (ex.hasOwnProperty && ex.hasOwnProperty('recordId')) {
                        exStr += 'Event Type: ' + ex.eventType + '\n' + 'Record Id: ' + ex.recordId;
                    } else {
                        var stackTrace = ex.stack;
                        if (stackTrace && stackTrace.join) {
                            stackTrace = stackTrace.join('\n');
                        }
                        exStr += ex.name + '\n' + ex.message + (stackTrace && !noStackTrace? '\n' + stackTrace : '');
                    }
                }
                return exStr;
            },
            floatToRounded: function floatToRounded(n, decimals) {
                decimals = decimals || 0;

                var precision = Math.pow(10, decimals);
                n = parseFloat((n * precision).toFixed(11));

                return Math.round(n) / precision;
            },
            floatToRoundedUp: function floatToRoundedUp(n, decimals) {
                decimals = decimals || 0;

                var precision = Math.pow(10, decimals);
                n = parseFloat((n * precision).toFixed(11));

                return Math.ceil(n) / precision;
            },
            floatToRoundedDown: function floatToRoundedDown(n, decimals) {
                decimals = decimals || 0;

                var precision = Math.pow(10, decimals);
                n = parseFloat((n * precision).toFixed(11));

                return Math.floor(n) / precision;
            },
            csvToJSONArray: function csvToJSONArray(csv) {
                var jsonArray = [];
                if (csv) {
                    var csvLines = csv.split('\r\n');
                    var header = csvLines[0];
                    var keys = header.split(',');
                    for (var i = 1, ii = csvLines.length; i < ii; i++) {
                        var csvLine = csvLines[i];
                        var values = csvLine.split(',');
                        var obj = {};
                        keys.forEach(function (key, j) {
                            obj[key] = values[j];
                        });
                        jsonArray.push(obj);
                    }
                }

                return jsonArray;
            },
            arrayToSentence: function arrayToSentence(arr, conjunction) {
                var nArr = [].concat(arr);
                var val = '';
                conjunction = conjunction || 'or';
                if (nArr.length > 0) {
                    val += nArr[0] || '';
                    if (nArr.length > 1) {
                        var lastElement = nArr.pop();
                        val = [nArr.join(', '), lastElement].join([' ', ' '].join(conjunction));
                    }
                }
                return val;
            },
            floatToCurrency: function floatToCurrency(value) {
                return format.format({value: Number(value), type: format.Type.CURRENCY});
            },
            arrayToCSVString: function arrayToCSVString(array, separator) {
                separator = separator || ',';
                return  (array.map(function (line) {
                    return line.join(separator);
                })).join('\n');;
            },
            stringToChunks: function stringToChunks(str, length) {
                var chunks = [];
                for (var offset = 0, strLen = str.length; offset < strLen; offset += length) {
                    chunks.push(str.slice(offset, length + offset));
                }
                return chunks;
            }
        };
    });