// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../settings/Setting"],function(t){return t.extend({urlRoot:"/reports/settings",getType:function(){return/color$/.test(this.id)?"color":/coeff$/.test(this.id)?"coeff":/(id|prodTask)$/.test(this.id)?"id":"ref"},getMetricName:function(){var t=this.id.match(/^reports\.(.*?)\./);return t?t[1]:null},getOrgUnit:function(){var t=this.id.match(/^reports\..*?\.(.*?)$/);return t?t[1]:null}})});