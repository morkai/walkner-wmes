// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView"],function(s){"use strict";return s.extend({className:"is-clickable",localTopics:{"companies.synced":"render"},columns:[{id:"personellId",className:"is-min"},{id:"lastName",className:"is-min"},{id:"firstName",className:"is-min"},{id:"company",className:"is-min"},{id:"orgUnit",className:"is-min"},"prodFunction"]})});