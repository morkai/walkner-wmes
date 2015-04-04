// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./WorkCenter"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"select(mrpController,prodFlow,description,deactivatedAt)&sort(_id)",comparator:"_id"})});