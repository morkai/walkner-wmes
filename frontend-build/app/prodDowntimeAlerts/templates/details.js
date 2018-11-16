define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="prodDowntimeAlerts-details">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(t("prodDowntimeAlerts","PANEL:TITLE:details")),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("prodDowntimeAlerts","PROPERTY:name")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.name)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("prodDowntimeAlerts","PROPERTY:repeatInterval")),__append('</div>\n          <div class="prop-value">'),__append(model.repeatInterval?time.toString(model.repeatInterval):"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("prodDowntimeAlerts","PROPERTY:userWhitelist")),__append('</div>\n          <div class="prop-value">\n            '),model.userWhitelist.length?(__append("\n            "),__append(escapeFn(_.pluck(model.userWhitelist,"label").join("; "))),__append("\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("prodDowntimeAlerts","PROPERTY:userBlacklist")),__append('</div>\n          <div class="prop-value">\n            '),model.userBlacklist.length?(__append("\n            "),__append(escapeFn(_.pluck(model.userBlacklist,"label").join("; "))),__append("\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(t("prodDowntimeAlerts","PROPERTY:conditions")),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        '),_.forEach(model.conditions,function(n){__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(t("prodDowntimeAlerts","DETAILS:conditions:"+n.type,{mode:n.mode})),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(n.labels.join("; "))),__append("</div>\n        </div>\n        ")}),__append('\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(t("prodDowntimeAlerts","PROPERTY:actions")),__append('</div>\n    <div class="panel-body prodDowntimeAlerts-details-actions">\n      '),_.forEach(model.actions,function(n){__append('\n      <div class="prodDowntimeAlerts-details-action">\n        <p>\n          '),n.sendEmail&&n.sendSms?(__append("\n          "),__append(t("prodDowntimeAlerts","DETAILS:actions:emailAndSms",{delay:time.toString(n.delay)})),__append("\n          ")):n.sendEmail?(__append("\n          "),__append(t("prodDowntimeAlerts","DETAILS:actions:emailOnly",{delay:time.toString(n.delay)})),__append("\n          ")):(__append("\n          "),__append(t("prodDowntimeAlerts","DETAILS:actions:smsOnly",{delay:time.toString(n.delay)})),__append("\n          ")),__append("\n        </p>\n        <ul>\n          "),_.forEach(["informAor","informManager","informMaster","informLeader"],function(e){__append("\n          "),n[e]&&(__append("\n          <li>"),__append(t("prodDowntimeAlerts","actions:"+e)),__append("</li>\n          ")),__append("\n          ")}),__append("\n          "),n.userWhitelist.length&&(__append("\n          <li>"),__append(t("prodDowntimeAlerts","actions:userWhitelist")),__append(" "),__append(escapeFn(_.pluck(n.userWhitelist,"label").join("; "))),__append("</li>\n          ")),__append("\n        </ul>\n        "),n.userBlacklist.length&&(__append("\n        <p>"),__append(t("prodDowntimeAlerts","actions:userBlacklist")),__append(" "),__append(escapeFn(_.pluck(n.userBlacklist,"label").join("; "))),__append("</p>\n        ")),__append("\n      </div>\n      ")}),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});