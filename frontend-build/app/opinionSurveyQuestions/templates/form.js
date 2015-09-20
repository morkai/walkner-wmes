define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-id" class="control-label is-required">'),__output.push(t("opinionSurveyQuestions","PROPERTY:_id")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-id" class="form-control" type="text" name="_id" autofocus required maxlength="30" pattern="^[A-Za-z0-9-_]+$">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-short" class="control-label is-required">'),__output.push(t("opinionSurveyQuestions","PROPERTY:short")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-short" class="form-control" type="text" name="short" required maxlength="30">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-full" class="control-label is-required">'),__output.push(t("opinionSurveyQuestions","PROPERTY:full")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-full" class="form-control" type="text" name="full" required maxlength="250">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});