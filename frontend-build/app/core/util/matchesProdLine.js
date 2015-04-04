// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/user","app/data/prodLines"],function(r,e,i){"use strict";return function(n,t){var u=r.find(n.selector.args,function(r){return"eq"===r.name&&"prodLine"===r.args[0]});if(u)return u.args[1]===t;if(e.data["super"])return!0;var a=i.get(t);if(!a)return!0;var s=e.getDivision();if(!s)return!0;var d=e.getSubdivision(),o=a.getSubdivision();return d?d===o:s.id===o.get("division")}});