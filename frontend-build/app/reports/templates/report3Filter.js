define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="well filter-form">\n  <div class="form-group">\n    <label for="',idPrefix,'-from" title="',t("core","filter:date:from:info"),'"><span class="fa fa-info-circle"></span> ',t("core","filter:date:from"),'</label>\n    <input id="',idPrefix,'-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-to" title="',t("core","filter:date:to:info"),'"><span class="fa fa-info-circle"></span> ',t("core","filter:date:to"),'</label>\n    <input id="',idPrefix,'-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label>',t("reports","filter:interval"),'</label>\n    <div id="',idPrefix,'-intervals" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week","day"].forEach(function(e){buf.push('\n      <label class="btn btn-default" title="',t("reports","filter:interval:title:"+e),'" data-interval="',e,'">\n        <input type="radio" name="interval" value="',e,'"> ',t("reports","filter:interval:"+e),"\n      </label>\n      ")}),buf.push('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-majorMalfunction">',t("reports","filter:majorMalfunction"),'</label>\n    <input id="',idPrefix,'-majorMalfunction" class="form-control" name="majorMalfunction" type="number" min="0.1" max="8" step="0.1">\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>',escape(t("reports","filter:submit")),'</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </button>\n      <ul class="dropdown-menu">\n        <li><a data-range="today">',escape(t("reports","filter:submit:today")),'</a></li>\n        <li><a data-range="yesterday">',escape(t("reports","filter:submit:yesterday")),'</a></li>\n        <li><a data-range="currentWeek">',escape(t("reports","filter:submit:currentWeek")),'</a></li>\n        <li><a data-range="prevWeek">',escape(t("reports","filter:submit:prevWeek")),'</a></li>\n        <li><a data-range="currentMonth">',escape(t("reports","filter:submit:currentMonth")),'</a></li>\n        <li><a data-range="prevMonth">',escape(t("reports","filter:submit:prevMonth")),'</a></li>\n        <li><a data-range="q1">',escape(t("reports","filter:submit:q1")),'</a></li>\n        <li><a data-range="q2">',escape(t("reports","filter:submit:q2")),'</a></li>\n        <li><a data-range="q3">',escape(t("reports","filter:submit:q3")),'</a></li>\n        <li><a data-range="q4">',escape(t("reports","filter:submit:q4")),'</a></li>\n        <li><a data-range="currentYear">',escape(t("reports","filter:submit:currentYear")),'</a></li>\n        <li><a data-range="prevYear">',escape(t("reports","filter:submit:prevYear")),'</a></li>\n      </ul>\n    </div><hr>\n  </div>\n  <div class="form-group">\n    <label>',t("reports","filter:divisions"),'</label>\n    <div id="',idPrefix,'-divisions" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),divisions.forEach(function(e){buf.push('\n      <label class="btn btn-default" title="',escape(e.title),'">\n        <input type="checkbox" name="divisions[]" value="',escape(e.id),'"> ',escape(e.label),"\n      </label>\n      ")}),buf.push('\n    </div>\n  </div>\n  <div class="form-group">\n    <label>',t("reports","filter:subdivisionType"),'</label>\n    <div id="',idPrefix,'-subdivisionTypes" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="checkbox" name="subdivisionType" value="assembly"> ',t("reports","filter:subdivisionType:prod"),'\n      </label>\n      <label class="btn btn-default">\n        <input type="checkbox" name="subdivisionType" value="press"> ',t("reports","filter:subdivisionType:press"),"\n      </label>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});