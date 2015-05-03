// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/orders/OrderCollection"],function(t,e){"use strict";return e.extend({url:"/reports/2;orders",rqlQuery:function(t){return t.Query.fromObject({fields:{name:1,mrp:1,qty:1,statusesSetAt:1,finishDate:1,delayReason:1,changes:1}})},initialize:function(t,e){if(!e.query)throw new Error("query option is required!");this.query=e.query,this.displayOptions=e.displayOptions,this.rqlQuery.limit=+this.query.get("limit"),this.rqlQuery.skip=+this.query.get("skip")},sync:function(){function t(t,e){return{name:"eq",args:[t,e]}}var r=this.rqlQuery.selector;r.args=[t("from",+this.query.get("from")),t("to",+this.query.get("to"))];var i=this.query.get("orgUnitType"),s=this.query.get("orgUnitId");i&&s&&r.args.push(t("orgUnitType",i),t("orgUnitId",s));var n=this.query.get("statuses");return n.length&&r.args.push(t("filter",this.query.get("filter")),t("statuses",n)),e.prototype.sync.apply(this,arguments)},genPaginationUrlTemplate:function(){var t=this.query.serializeToString().replace(/limit=[0-9]+/,"limit=${limit}").replace(/skip=[0-9]+/,"skip=${skip}");return"#reports/2?"+t+"#"+(this.displayOptions?this.displayOptions.serializeToString():"")}})});