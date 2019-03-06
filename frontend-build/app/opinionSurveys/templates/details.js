define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="opinionSurveys-details">\n  <div class="panel panel-primary opinionSurveys-details-props">\n    <div class="panel-heading">'),__append(panelTitle),__append('</div>\n    <div class="panel-details">\n      '),__append(helpers.props(model,["_id","label","template","startDate","endDate","company"])),__append('\n    </div>\n  </div>\n  <div class="panel panel-default opinionSurveys-details-intro">\n    <div class="panel-heading">\n      '),__append(helpers.t("PROPERTY:intro")),__append('\n    </div>\n    <div class="panel-body">'),__append(model.intro),__append('</div>\n  </div>\n  <div class="panel panel-default opinionSurveys-details-employers">\n    <div class="panel-heading">\n      '),__append(helpers.t("PROPERTY:employers")),__append('\n    </div>\n    <table class="table table-condensed table-bordered">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:employers._id")),__append('</th>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:employers.short")),__append("</th>\n        <th>"),__append(helpers.t("PROPERTY:employers.full")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.employers.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(n._id),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.short)),__append("</td>\n        <td>"),__append(escapeFn(n.full)),__append("</td>\n      </tr>\n      ")}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="panel panel-default opinionSurveys-details-superiors">\n    <div class="panel-heading">\n      '),__append(helpers.t("PROPERTY:superiors")),__append('\n    </div>\n    <table class="table table-condensed table-bordered">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:superiors.short")),__append('</th>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:superiors.full")),__append("</th>\n        <th>"),__append(helpers.t("PROPERTY:superiors.division")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.superiors.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(escapeFn(n.short)),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.full)),__append("</td>\n        <td>"),__append(escapeFn(n.division)),__append("</td>\n      </tr>\n      ")}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="panel panel-default opinionSurveys-details-questions">\n    <div class="panel-heading">\n      '),__append(helpers.t("PROPERTY:questions")),__append('\n    </div>\n    <table class="table table-condensed table-bordered">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:questions._id")),__append('</th>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:questions.short")),__append("</th>\n        <th>"),__append(helpers.t("PROPERTY:questions.full")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.questions.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(escapeFn(n._id)),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.short)),__append("</td>\n        <td>"),__append(escapeFn(n.full)),__append("</td>\n      </tr>\n      ")}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="panel panel-default opinionSurveys-details-employeeCount">\n    <div class="panel-heading">\n      '),__append(helpers.t("PROPERTY:employeeCount")),__append('\n    </div>\n    <table class="table table-condensed table-bordered">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:employeeCount.division")),__append('</th>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:employeeCount.employer")),__append("</th>\n        <th>"),__append(helpers.t("PROPERTY:employeeCount.count")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.employeeCount.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(escapeFn(n.division)),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.employer)),__append("</td>\n        <td>"),__append(n.count),__append("</td>\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n  </div>\n</div>\n");return __output.join("")}});