define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form suggestions-filter">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix,labels:[{text:t("filter:date"),input:{type:"radio",name:"dateType",value:"date"},ranges:!0},{text:t("filter:finishedAt"),input:{type:"radio",name:"dateType",value:"finishedAt"},ranges:!0}]})),__append('\n  <div class="form-group">\n    <input id="'),__append(id("userType")),__append('" name="userType" type="hidden" value="others">\n    <input id="'),__append(id("user")),__append('" name="user" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("status")),__append('">'),__append(t("PROPERTY:status")),__append('</label>\n    <select id="'),__append(id("status")),__append('" name="status[]" class="form-control is-expandable" multiple size="1">\n      '),statuses.forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("categories")),__append('">'),__append(t("PROPERTY:category")),__append('</label>\n    <select id="'),__append(id("categories")),__append('" name="categories[]" class="form-control is-expandable" multiple size="1" data-expanded-length="15" style="max-width: 225px">\n      '),categories.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("productFamily")),__append('">'),__append(t("PROPERTY:productFamily")),__append('</label>\n    <select id="'),__append(id("productFamily")),__append('" name="productFamily[]" class="form-control is-expandable" multiple size="1" data-expanded-length="15" style="max-width: 225px">\n      '),productFamilies.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("section")),__append('">'),__append(t("PROPERTY:section")),__append('</label>\n    <select id="'),__append(id("section")),__append('" name="section[]" class="form-control is-expandable" multiple size="1" data-expanded-length="15" style="max-width: 225px">\n      '),sections.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append("\n    </select>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output}});