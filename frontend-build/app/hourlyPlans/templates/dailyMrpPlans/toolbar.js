define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="btn-toolbar dailyMrpPlan-toolbar">\n  <div class="btn-group" role="group">\n    <button id="'),__append(idPrefix),__append('-generatePlan" type="button" class="btn btn-default" title="'),__append(t("hourlyPlans","planning:toolbar:generatePlan")),__append('"><i class="fa fa-calculator"></i></button>\n    <button id="'),__append(idPrefix),__append('-savePlan" type="button" class="btn btn-default" title="'),__append(t("hourlyPlans","planning:toolbar:savePlan")),__append('"><i class="fa fa-save"></i></button>\n    <button id="'),__append(idPrefix),__append('-setHourlyPlan" type="button" class="btn btn-default" title="'),__append(t("hourlyPlans","planning:toolbar:setHourlyPlan")),__append('"><i class="fa fa-calendar"></i></button>\n  </div>\n  <div class="btn-group" role="group">\n    <div id="'),__append(idPrefix),__append('-printDropdown" class="btn-group" role="group">\n      <button id="'),__append(idPrefix),__append('-printPlan" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(t("hourlyPlans","planning:toolbar:printPlan")),__append('" '),__append(lines.length?"":"disabled"),__append('>\n        <i class="fa fa-print"></i>\n      </button>\n      <ul id="'),__append(idPrefix),__append('-printList" class="dropdown-menu dropdown-menu-right">\n        '),function(){lines.length>1&&(__append('\n<li><a data-print-line="__ALL__" href="javascript:void(0)">'),__append(escape(t("hourlyPlans","planning:toolbar:printPlan:all"))),__append("</a>\n")),__append("\n"),lines.forEach(function(n){__append('\n<li><a data-print-line="'),__append(escape(n)),__append('" href="javascript:void(0)">'),__append(escape(n)),__append("</a>\n")}),__append('\n<li class="divider">\n<li>\n  <a id="'),__append(idPrefix),__append('-showTimes" class="dailyMrpPlan-toolbar-showTimes" href="javascript:void(0)">\n    <span>'),__append(t("hourlyPlans","planning:toolbar:showTimes")),__append('</span><span class="fa fa-check"></span>\n  </a>\n')}.call(this),__append("\n      </ul>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});