// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView"],function(e){"use strict";return e.extend({className:"xiconfPrograms-list is-clickable",columns:[{id:"name",className:"is-min"},"steps",{id:"updatedAt",className:"is-min"}],serializeRow:function(e){var i=e.serialize();return i.steps=i.steps.filter(function(e){return e.enabled}).map(function(e){var i=e.type;return"wait"===e.type&&(i="auto"===e.kind?time.toString(e.duration):"W8"),'<span class="label label-info label-'+e.type+'">'+i+"</span>"}).join(" "),i}})});