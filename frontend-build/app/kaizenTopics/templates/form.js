define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),__append(helpers.formGroup({id:"shortName",label:"PROPERTY:",required:!0,maxLength:100})),__append("\n      "),__append(helpers.formGroup({id:"fullName",label:"PROPERTY:",required:!0,maxLength:200})),__append('\n      <div class="checkbox">\n        <label class="control-label">\n          <input type="checkbox" name="active" value="true">\n          '),__append(t("PROPERTY:active")),__append("\n        </label>\n      </div>\n      "),__append(helpers.formGroup({id:"position",type:"number",label:"PROPERTY:",required:!0,min:0,max:1e6})),__append('\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});