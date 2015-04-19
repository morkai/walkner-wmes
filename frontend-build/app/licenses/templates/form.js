define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="licenses-form" method="post" action="'),__output.push(formAction),__output.push('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-_id" class="control-label">'),__output.push(t("licenses","PROPERTY:_id")),__output.push("</label>\n        "),editMode?(__output.push('\n        <p class="form-control-static">'),__output.push(escape(model._id)),__output.push("</p>\n        ")):(__output.push('\n        <input id="'),__output.push(idPrefix),__output.push('-_id" class="form-control" type="text" name="_id">\n        ')),__output.push('\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-appId" class="control-label is-required">'),__output.push(t("licenses","PROPERTY:appId")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-appId" class="form-control" type="text" name="appId" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-appVersion" class="control-label">'),__output.push(t("licenses","PROPERTY:appVersion")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-appVersion" class="form-control" type="text" name="appVersion">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-date" class="control-label">'),__output.push(t("licenses","PROPERTY:date")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-date" class="form-control" type="text" name="date" placeholder="YYYY-MM-DD">\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-licensee" class="control-label is-required">'),__output.push(t("licenses","PROPERTY:licensee")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-licensee" class="form-control" type="text" name="licensee" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-features" class="control-label is-required">'),__output.push(t("licenses","PROPERTY:features")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-features" class="form-control" type="number" name="features" required min="0">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});