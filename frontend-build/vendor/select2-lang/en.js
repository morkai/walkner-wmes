!function(e){"use strict";return"function"==typeof define&&define.amd?define(["jquery","select2"],e):void e(window.jQuery)}(function(e){"use strict";var t={formatNoMatches:function(){return"No matches found."},formatInputTooShort:function(e,t){var n=t-e.length;return"Please enter "+n+" more character"+(1===n?"":"s")},formatInputTooLong:function(e,t){var n=e.length-t;return"Please delete "+n+" character"+(1===n?"":"s")},formatSelectionTooBig:function(e){return"You can only select "+e+" item"+(1===e?"":"s")},formatLoadMore:function(){return"Loading more results..."},formatSearching:function(){return"Searching..."}};return e.extend(e.fn.select2.defaults,t),t});