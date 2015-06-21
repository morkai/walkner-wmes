define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="xiconfPrograms-form" method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(formMethod),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-name" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:name")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-name" class="form-control" type="text" name="name" maxlength="100" required autofocus>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-type" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:type")),__output.push("</label>\n        "),programTypes.forEach(function(u){__output.push('\n        <div class="radio">\n          <label>\n            <input id="'),__output.push(idPrefix),__output.push("-type-"),__output.push(u),__output.push('" name="type" type="radio" value="'),__output.push(u),__output.push('" required>\n            '),__output.push(t("xiconfPrograms","type:"+u)),__output.push("\n          </label>\n        </div>\n        ")}),__output.push('\n      </div>\n      <div id="'),__output.push(idPrefix),__output.push('-steps" class="xiconfPrograms-form-steps"></div>\n      <div class="form-group">\n        <select id="'),__output.push(idPrefix),__output.push('-stepType" class="form-control xiconfPrograms-form-stepType">\n          <option value="" disabled selected>'),__output.push(t("xiconfPrograms","form:steps:placeholder")),__output.push("</option>\n          "),stepTypes.forEach(function(u){__output.push('\n          <option value="'),__output.push(u),__output.push('">'),__output.push(t("xiconfPrograms","step:"+u)),__output.push("</option>\n          ")}),__output.push('\n        </select>\n        <button id="'),__output.push(idPrefix),__output.push('-addStep" class="btn btn-default" type="button"><i class="fa fa-plus"></i><span>'),__output.push(t("xiconfPrograms","form:steps:add")),__output.push('</span></button>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});