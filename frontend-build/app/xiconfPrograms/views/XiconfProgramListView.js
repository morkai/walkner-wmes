// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView"],function(e){return e.extend({className:"xiconfPrograms-list",columns:["name","updatedAt"],serializeRow:function(e){var n=e.serialize();return n.name+=" "+n.steps.filter(function(e){return e.enabled}).map(function(e){return'<span class="label label-info label-'+e.type+'">'+e.type+"</span>"}).join(" "),n}})});