// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time","app/core/views/ListView","../util/buildStepLabels"],function(i,s,e,a){"use strict";return e.extend({className:"xiconfPrograms-list is-clickable",columns:[{id:"name",className:"is-min"},{id:"prodLines",className:"is-min"},{id:"programType",label:i.bound("xiconfPrograms","PROPERTY:type"),className:"is-min"},"steps",{id:"updatedAt",className:"is-min"}],serializeRow:function(i){var s=i.serialize();return s.steps=a(s.steps),s}})});