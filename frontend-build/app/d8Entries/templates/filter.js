define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form d8Entries-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="userType" type="radio" value="mine">\n        '),__append(t("d8Entries","filter:user:mine")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="unseen">\n        '),__append(t("d8Entries","filter:user:unseen")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="owner">\n        '),__append(t("d8Entries","filter:user:owner")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="others">\n        '),__append(t("d8Entries","filter:user:others")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-user" name="user" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-status">'),__append(t("d8Entries","PROPERTY:status")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-status" name="status" class="form-control" size="1">\n      <option></option>\n      '),statuses.forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("d8Entries","status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-area">'),__append(t("d8Entries","PROPERTY:area")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-area" name="area" class="form-control" size="1">\n      <option></option>\n      '),areas.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-entrySource">'),__append(t("d8Entries","PROPERTY:entrySource")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-entrySource" name="entrySource" class="form-control" size="1">\n      <option></option>\n      '),entrySources.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-problemSource">'),__append(t("d8Entries","PROPERTY:problemSource")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-problemSource" name="section" class="form-control" size="1">\n      <option></option>\n      '),problemSources.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append("\n    </select>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("d8Entries","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});