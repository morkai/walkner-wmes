define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="opinionSurveys-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-id" class="control-label is-required">'),__append(t("opinionSurveys","PROPERTY:_id")),__append("</label>\n        "),editMode?(__append('\n        <p class="form-control-static">'),__append(model._id),__append("</p>\n        ")):(__append('\n        <input id="'),__append(idPrefix),__append('-id" class="form-control" type="text" name="_id" autofocus required maxlength="20" pattern="^[A-Za-z0-9-_]+$">\n        <p class="help-block">'),__append(t("opinionSurveys","form:help:_id")),__append("</p>\n        ")),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-label" class="control-label is-required">'),__append(t("opinionSurveys","PROPERTY:label")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-label" class="form-control" type="text" name="label" required>\n        <p class="help-block">'),__append(t("opinionSurveys","form:help:label")),__append('</p>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-startDate" class="control-label is-required">'),__append(t("opinionSurveys","PROPERTY:startDate")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-startDate" class="form-control" type="date" name="startDate" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-endDate" class="control-label is-required">'),__append(t("opinionSurveys","PROPERTY:endDate")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-endDate" class="form-control" type="date" name="endDate" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-intro" class="control-label">'),__append(t("opinionSurveys","PROPERTY:intro")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-intro" class="form-control" name="intro" rows="8"></textarea>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__append(idPrefix),__append('-employers" class="control-label is-required">'),__append(t("opinionSurveys","PROPERTY:employers")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-employers" type="text" name="employers" required placeholder="'),__append(t("opinionSurveys","form:placeholder:employers")),__append('">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-superiors" class="control-label">'),__append(t("opinionSurveys","PROPERTY:superiors")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-superiors" type="text">\n        <table id="'),__append(idPrefix),__append('-superiorsTable" class="table table-condensed table-hover opinionSurveys-form-superiorsTable">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("opinionSurveys","PROPERTY:superiors.full")),__append('</th>\n            <th class="opinionSurveys-form-superiorsTable-short">'),__append(t("opinionSurveys","PROPERTY:superiors.short")),__append("</th>\n            <th>"),__append(t("opinionSurveys","PROPERTY:superiors.division")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n          </tr>\n          </thead>\n          <tbody></tbody>\n        </table>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-questions" class="control-label">'),__append(t("opinionSurveys","PROPERTY:questions")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-questions" type="text" placeholder="'),__append(t("opinionSurveys","form:placeholder:questions")),__append('">\n        <table id="'),__append(idPrefix),__append('-questionsTable" class="table table-condensed table-hover opinionSurveys-form-questionsTable">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("opinionSurveys","PROPERTY:questions._id")),__append('</th>\n            <th class="opinionSurveys-form-questionsTable-short">'),__append(t("opinionSurveys","PROPERTY:questions.short")),__append("</th>\n            <th>"),__append(t("opinionSurveys","PROPERTY:questions.full")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n          </tr>\n          </thead>\n          <tbody></tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">'),__append(formActionText),__append('</button>\n      <button id="'),__append(idPrefix),__append('-preview" type="button" class="btn btn-default" accesskey="p">'),__append(t("opinionSurveys","FORM:ACTION:preview")),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});