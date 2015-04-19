// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/ListView"],function(e,i){"use strict";return i.extend({className:"xiconfPrograms-list is-clickable",columns:[{id:"name",className:"is-min"},"steps",{id:"updatedAt",className:"is-min"}],serializeRow:function(i){var s=i.serialize();return s.steps=s.steps.filter(function(e){return e.enabled}).map(function(i){var s=i.type;return"wait"===i.type&&(s="auto"===i.kind?e.toString(i.duration):"W8"),'<span class="label label-info label-'+i.type+'">'+s+"</span>"}).join(" "),s}})});