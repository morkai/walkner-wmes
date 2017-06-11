define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="d8Entries-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div id="'),__append(idPrefix),__append('-statusGroup" class="form-group clearfix">\n        <label for="'),__append(idPrefix),__append('-status" class="control-label">'),__append(t("d8Entries","PROPERTY:status")),__append('</label>\n        <div id="'),__append(idPrefix),__append('-status" class="btn-group d8Entries-form-statusBtnGroup" data-toggle="buttons">\n          '),statuses.forEach(function(e){__append('\n          <label class="btn btn-default">\n            <input type="radio" name="status" value="'),__append(e),__append('">'),__append(t("d8Entries","status:"+e)),__append("\n          </label>\n          ")}),__append('\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-rid" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:rid")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-rid" class="form-control" type="number" name="rid" required min="1">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-subject" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:subject")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-subject" class="form-control" type="text" name="subject" required>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group has-required-select2">\n          <label for="'),__append(idPrefix),__append('-entrySource" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:entrySource")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-entrySource" type="text" name="entrySource" required>\n        </div>\n        <div class="col-md-3 form-group has-required-select2">\n          <label for="'),__append(idPrefix),__append('-area" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:area")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-area" type="text" name="area" required>\n        </div>\n        <div class="col-md-6 form-group has-required-select2">\n          <label for="'),__append(idPrefix),__append('-manager" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:manager")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-manager" type="text" name="manager" required>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-owner" class="control-label">'),__append(t("d8Entries","PROPERTY:owner")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-owner" type="text" name="owner">\n        </div>\n        <div class="col-md-9 form-group">\n          <label for="'),__append(idPrefix),__append('-members" class="control-label">'),__append(t("d8Entries","PROPERTY:members")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-members" type="text" name="members">\n        </div>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("d8Entries","PROPERTY:strips")),__append('</label>\n        <table class="table table-bordered table-condensed d8Entries-form-stripsTable">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("d8Entries","PROPERTY:strips.no")),__append('</th>\n            <th class="is-min">'),__append(t("d8Entries","PROPERTY:strips.family")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-strips"></tbody>\n        </table>\n        <button id="'),__append(idPrefix),__append('-addStrip" class="btn btn-default" type="button"><i class="fa fa-plus"></i><span>'),__append(t("d8Entries","FORM:strips:add")),__append('</span></button>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group has-required-select2">\n          <label for="'),__append(idPrefix),__append('-problemSource" class="control-label is-required">'),__append(t("d8Entries","PROPERTY:problemSource")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-problemSource" type="text" name="problemSource" required>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-problemDescription" class="control-label">'),__append(t("d8Entries","PROPERTY:problemDescription")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-problemDescription" class="form-control" name="problemDescription" rows="3"></textarea>\n      </div>\n      <div class="d8Entries-form-dates">\n        '),["crsRegisterDate","d5PlannedCloseDate"].forEach(function(e){__append('\n        <div class="form-group">\n          <label for="'),__append(idPrefix),__append("-"),__append(e),__append('" class="control-label">'),__append(t("d8Entries","PROPERTY:"+e)),__append('</label>\n          <input id="'),__append(idPrefix),__append("-"),__append(e),__append('" class="form-control" type="date" name="'),__append(e),__append('" min="2013-01-01" max="'),__append(nextYear),__append('">\n        </div>\n        ')}),__append('\n        <div class="form-group d8Entries-form-d5CloseDate">\n          <label for="'),__append(idPrefix),__append('-d5CloseDate" class="control-label">'),__append(t("d8Entries","PROPERTY:d5CloseDate")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-d5CloseDate" class="form-control" type="date" name="d5CloseDate" min="2013-01-01" max="'),__append(nextYear),__append('"><!--\n          //--><button id="'),__append(idPrefix),__append('-d5CloseDateOk" type="button" class="btn btn-default btn-success"><i class="fa"></i></button>\n        </div>\n        <div class="form-group">\n          <label for="'),__append(idPrefix),__append('-d8CloseDate" class="control-label">'),__append(t("d8Entries","PROPERTY:d8CloseDate")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-d8CloseDate" class="form-control" type="date" name="d8CloseDate" min="2013-01-01" max="'),__append(nextYear),__append('">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-attachment" class="control-label">\n          '),__append(t("d8Entries","PROPERTY:attachment")),__append("\n          "),editMode&&model.attachment&&(__append('\n          <span class="d8Entries-form-attachmentHelp">'),__append(t("d8Entries","FORM:help:attachment")),__append("</span>\n          ")),__append('\n        </label>\n        <input id="'),__append(idPrefix),__append('-attachment" class="form-control" type="file">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-subscribers" class="control-label">'),__append(t("d8Entries","PROPERTY:subscribers")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-subscribers" type="text" name="subscribers">\n        <p class="help-block">'),__append(t("d8Entries","FORM:help:subscribers")),__append("</p>\n      </div>\n      "),editMode&&(__append('\n      <div class="form-group d8Entries-form-comment">\n        <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("d8Entries","PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n        <i class="fa fa-spinner fa-spin"></i>\n        <span>'),__append(formActionText),__append("</span>\n      </button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});