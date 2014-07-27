define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form id="',idPrefix,'-form" class="well filter-form">\n  <div class="form-group">\n    <label for="',idPrefix,'-from-date">',t("core","filter:date:from"),'</label>\n    <div id="',idPrefix,'-from" class="form-group-datetime">\n      <input id="',idPrefix,'-from-date" class="form-control" name="from-date" type="date" placeholder="YYYY-MM-DD">\n      <input id="',idPrefix,'-from-time" class="form-control" name="from-time" type="time" placeholder="hh:mm">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-to-date">',t("core","filter:date:to"),'</label>\n    <div id="',idPrefix,'-to" class="form-group-datetime">\n      <input id="',idPrefix,'-to-date" class="form-control" name="to-date" type="date" placeholder="YYYY-MM-DD">\n      <input id="',idPrefix,'-to-time" class="form-control" name="to-time" type="time" placeholder="hh:mm">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-prodLine">',t("prodLogEntries","PROPERTY:prodLine"),'</label>\n    <input id="',idPrefix,'-prodLine" name="prodLine" type="text" data-placeholder="',t("prodLogEntries","filter:placeholder:prodLine"),'">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-type">',t("prodLogEntries","PROPERTY:type"),'</label>\n    <select id="',idPrefix,'-type" name="type" data-placeholder="',t("prodLogEntries","filter:placeholder:type"),'">\n      <option></option>\n      '),["changeShift","changeMaster","changeLeader","changeOperator","changeQuantitiesDone","changeOrder","correctOrder","changeQuantityDone","changeWorkerCount","finishOrder","startDowntime","finishDowntime","corroborateDowntime","endWork","editShift","editOrder","editDowntime","deleteOrder","deleteDowntime"].forEach(function(e){buf.push('\n      <option value="',e,'">',t("prodLogEntries","type:"+e),"</option>\n      ")}),buf.push("\n    </select>\n  </div>\n  ",renderLimit(),'\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>',escape(t("prodLogEntries","filter:submit")),"</span></button>\n  </div>\n</form>\n")}();return buf.join("")}});