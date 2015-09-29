define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="form-group has-required-select2">\n        <label for="'),__output.push(idPrefix),__output.push('-survey" class="control-label is-required">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:survey")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-survey" name="survey" type="text" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-comment" class="control-label">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:comment")),__output.push('</label>\n        <textarea id="'),__output.push(idPrefix),__output.push('-comment" name="comment" class="form-control" rows="3"></textarea>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__output.push(idPrefix),__output.push('-employer" class="control-label is-required">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:employer")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-employer" name="employer" type="text" required>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__output.push(idPrefix),__output.push('-superior" class="control-label is-required">'),__output.push(t("opinionSurveyScanTemplates","PROPERTY:superior")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-superior" name="superior" type="text" required>\n      </div>\n      <div id="'),__output.push(idPrefix),__output.push('-answers" class="opinionSurveyScanTemplates-form-answers"></div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});