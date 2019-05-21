define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-'),__append(panelType),__append(' orders-details">\n  <div class="panel-heading">'),__append(panelTitle),__append('</div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"!_id",value:function(e){return linkOrderNo&&e?'<a href="#orders/'+e+'" title="'+helpers.t("details:showMoreLink")+'">'+e+"</a>":e}},"nc12","mrp","name",{id:"description",value:model.name===model.description?"":model.description||""},{id:"!leadingOrder",value:function(e){return e&&e!==model._id?user.isAllowedTo("LOCAL","ORDERS:VIEW")?'<a href="'+window.location.origin+window.location.pathname+window.location.search+"#orders/"+e+'">'+e+"</a>":e:""}},{id:"salesOrder",value:(model.salesOrder||"-")+"/"+(model.salesOrderItem||"-")},"soldToParty"])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"qty",value:model.qtyUnit},{id:"qtyDone",value:model.qtyDoneUnit},"priority",{id:"!statuses",value:model.statusLabels},"psStatus","delayReason","delayComponent","m4"])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"sapCreatedAt",value:model.sapCreatedAtText},{id:"startDate",value:model.startDateText},{id:"finishDate",value:model.finishDateText},{id:"scheduledStartDate",value:model.scheduledStartDateText},{id:"scheduledFinishDate",value:model.scheduledFinishDateText},{id:"createdAt",value:model.createdAtText},{id:"updatedAt",value:model.updatedAtText},"changedBy"])),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});