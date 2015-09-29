define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(t("opinionSurveyScanTemplates","PANEL:TITLE:details")),__output.push('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:createdAt")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.createdAt),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:creator")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.creator),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:survey")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.survey)),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:employer")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.employer)),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:superior")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.superior)),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:division")),__output.push('</div>\n          <div class="prop-value">'),__output.push(escape(model.division)),__output.push('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__output.push(t("opinionSurveyScanTemplates","PANEL:TITLE:comment")),__output.push('</div>\n    <div class="panel-body">\n      '),__output.push(escape(model.comment||t("opinionSurveyScanTemplates","noComment"))),__output.push('\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__output.push(t("opinionSurveyScanTemplates","PANEL:TITLE:answers")),__output.push('</div>\n    <table class="table table-bordered table-condensed">\n      <thead>\n      <tr>\n        <th class="is-min">'),__output.push(t("opinionSurveys","PROPERTY:questions._id")),__output.push('</th>\n        <th class="is-min">'),__output.push(t("opinionSurveys","PROPERTY:questions.short")),__output.push("</th>\n        <th>"),__output.push(t("opinionSurveys","PROPERTY:questions.full")),__output.push('</th>\n        <th class="is-min">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:answer")),__output.push("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.answers.forEach(function(u){__output.push('\n      <tr>\n        <td class="is-min">'),__output.push(u.question._id),__output.push('</td>\n        <td class="is-min">'),__output.push(escape(u.question["short"])),__output.push("</td>\n        <td>"),__output.push(escape(u.question.full)),__output.push('</td>\n        <td class="is-min">'),__output.push(t("opinionSurveyScanTemplates","answer:"+u.answer)),__output.push("</td>\n      </tr>\n      ")}),__output.push("\n      </tbody>\n    </table>\n  </div>\n</div>\n");return __output.join("")}});