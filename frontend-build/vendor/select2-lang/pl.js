!function(n){return"function"==typeof define&&define.amd?define(["jquery","select2"],n):(n(window.jQuery),void 0)}(function(n){function e(n,e){return 1===n?"":n%100>1&&5>n%100||n%100>20&&n%10>1&&5>n%10?e:"ów"}var t={formatNoMatches:function(){return"Brak wyników."},formatInputTooShort:function(n,t){var o=t-n.length;return"Wpisz jeszcze "+o+" znak"+e(o,"i")+"."},formatInputTooLong:function(n,t){var o=n.length-t;return"Wpisana fraza jest za długa o "+o+" znak"+e(o,"i")+"."},formatSelectionTooBig:function(n){return"Możesz zaznaczyć najwyżej "+n+" element"+e(n,"y")+"."},formatLoadMore:function(){return"Ładowanie kolejnych wyników..."},formatSearching:function(){return"Szukanie..."}};return n.extend(n.fn.select2.defaults,t),t});