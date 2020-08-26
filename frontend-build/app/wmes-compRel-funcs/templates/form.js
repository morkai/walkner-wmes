define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),editMode?(__append("\n      "),__append(helpers.formGroup({name:"_id",label:"PROPERTY:name",type:"static",value:model.name})),__append("\n      ")):(__append("\n      "),__append(helpers.formGroup({name:"_id",label:"PROPERTY:name",type:"select2",required:!0})),__append("\n      ")),__append('\n      <div class="form-group">\n        <label class="control-label is-required">'),__append(t("PROPERTY:mor")),__append("</label>\n        "),["none","mrp","all"].forEach(function(e){__append('\n          <br>\n          <label class="radio-inline">\n            <input type="radio" name="mor" value="'),__append(e),__append('" required>\n            '),__append(t("mor:"+e)),__append("\n          </label>\n        ")}),__append("\n      </div>\n      "),__append(helpers.formGroup({name:"users",label:"PROPERTY:",type:"select2"})),__append('\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});