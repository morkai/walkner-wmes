// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../core/Collection","./EventType"],function(e,n,t){return n.extend({model:t,parse:function(n){return n.map(function(n){return{_id:n,text:e.bound("events","TYPE:"+n)}})},comparator:"text"})});