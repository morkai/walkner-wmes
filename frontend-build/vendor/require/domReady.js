/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */

define([],function(){function e(e){var t;for(t=0;t<e.length;t+=1)e[t](u)}function t(){var t=c;l&&t.length&&(c=[],e(t))}function n(){l||(l=!0,a&&clearInterval(a),t())}function r(e){return l?e(u):c.push(e),r}var i,o,a,s="undefined"!=typeof window&&window.document,l=!s,u=s?document:null,c=[];if(s){if(document.addEventListener)document.addEventListener("DOMContentLoaded",n,!1),window.addEventListener("load",n,!1);else if(window.attachEvent){window.attachEvent("onload",n),o=document.createElement("div");try{i=null===window.frameElement}catch(d){}o.doScroll&&i&&window.external&&(a=setInterval(function(){try{o.doScroll(),n()}catch(e){}},30))}"complete"===document.readyState&&n()}return r.version="2.0.1",r.load=function(e,t,n,i){i.isBuild?n(null):r(n)},r});