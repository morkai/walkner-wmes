// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var n={"Ę":"E","ę":"e","Ó":"O","ó":"o","Ą":"A","ą":"a","Ś":"S","ś":"s","Ł":"L","ł":"l","Ż":"Z","ż":"z","Ź":"Z","ź":"z","Ć":"C","ć":"c","Ń":"N","ń":"n"},e=new RegExp(Object.keys(n).join("|"),"g");return function(r){return String(r).replace(e,function(e){return n[e]})}});