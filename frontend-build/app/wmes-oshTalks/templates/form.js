define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="oshTalks-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(id("auditor")),__append('" class="control-label is-required">'),__append(t("PROPERTY:auditor")),__append('</label>\n          <input id="'),__append(id("auditor")),__append('" type="text" name="auditor" required>\n        </div>\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(id("section")),__append('" class="control-label is-required">'),__append(t("PROPERTY:section")),__append('</label>\n          <input id="'),__append(id("section")),__append('" type="text" name="section" required>\n        </div>\n        <div class="form-group">\n          <label for="'),__append(id("date")),__append('" class="control-label is-required">'),__append(t("PROPERTY:date")),__append('</label>\n          <input id="'),__append(id("date")),__append('" class="form-control" type="date" name="date" required min="2020-01-01" max="'),__append(time.format(Date.now(),"YYYY-MM-DD")),__append('">\n        </div>\n      </div>\n      <div class="form-group has-required-select2 settings-select2-long">\n        <label for="'),__append(id("topics")),__append('" class="control-label is-required">'),__append(t("PROPERTY:topics")),__append('</label>\n        <input id="'),__append(id("topics")),__append('" type="text" name="topics" required>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__append(id("participants")),__append('" class="control-label is-required">'),__append(t("PROPERTY:participants")),__append('</label>\n        <input id="'),__append(id("participants")),__append('" type="text" name="participants" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("notes")),__append('" class="control-label">'),__append(t("PROPERTY:notes")),__append('</label>\n        <textarea id="'),__append(id("notes")),__append('" name="notes" class="form-control" rows="4"></textarea>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(id("submit")),__append('" type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});