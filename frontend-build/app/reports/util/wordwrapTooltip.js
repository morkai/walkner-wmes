define(function(){"use strict";return function(n){if(n<35)return n;var t=[];return n.split(" ").forEach(function(n){var e=0===t.length?"":t[t.length-1];0===t.length||e.length+n.length>30?t.push(n):t[t.length-1]+=" "+n}),t.join("<br>")}});