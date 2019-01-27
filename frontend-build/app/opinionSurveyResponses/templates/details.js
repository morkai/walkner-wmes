define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:details")),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:createdAt")),__append('</div>\n          <div class="prop-value">'),__append(model.createdAt),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:creator")),__append('</div>\n          <div class="prop-value">'),__append(model.creator),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:survey")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.survey)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:employer")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.employer)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:superior")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.superior)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:division")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.division)),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:comment")),__append('</div>\n    <div class="panel-body">\n      '),__append(escapeFn(model.comment||helpers.t("noComment"))),__append('\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:answers")),__append('</div>\n    <table class="table table-bordered table-condensed">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(t("opinionSurveys","PROPERTY:questions._id")),__append('</th>\n        <th class="is-min">'),__append(t("opinionSurveys","PROPERTY:questions.short")),__append("</th>\n        <th>"),__append(t("opinionSurveys","PROPERTY:questions.full")),__append('</th>\n        <th class="is-min">'),__append(helpers.t("PROPERTY:answer")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.answers.forEach(function(n){__append('\n      <tr>\n        <td class="is-min">'),__append(n.question._id),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.question.short)),__append("</td>\n        <td>"),__append(escapeFn(n.question.full)),__append('</td>\n        <td class="is-min">'),__append(/^[0-9]+$/.test(n.answer)?n.answer:helpers.t("answer:"+n.answer)),__append("</td>\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n  </div>\n</div>\n");return __output.join("")}});