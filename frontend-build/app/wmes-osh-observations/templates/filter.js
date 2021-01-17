define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  '),__append(helpers.formGroup({name:"status",type:"select",label:"PROPERTY:",expandable:!0,options:statuses,groupAttrs:{"data-filter":"status"}})),__append("\n  "),__append(forms.dateTimeRange({idPrefix:idPrefix,hidden:!0,labels:["createdAt","finishedAt"].map(e=>({text:t(`PROPERTY:${e}`),ranges:!0,value:e}))})),__append('\n  <div class="form-group" style="min-width: 280px">\n    <input id="'),__append(id("userType")),__append('" name="userType" type="hidden" value="others">\n    <input id="'),__append(id("user")),__append('" name="user" type="text">\n  </div>\n  <div id="'),__append(id("locationPath")),__append('" class="form-group hidden" data-filter="locationPath"></div>\n  '),__append(helpers.formGroup({name:"observationKind",type:"select",label:"PROPERTY:",groupClassName:"hidden",groupAttrs:{"data-filter":"observationKind"},expandable:!0,options:observationKinds})),__append('\n  <div class="form-group" style="min-width: 280px">\n    <div style="display: flex">\n      <input id="'),__append(id("obsType")),__append('" name="obsType" type="hidden" value="any">\n      <input id="'),__append(id("obsFilter")),__append('" name="obsFilter" type="hidden" value="any">\n      <abbr id="'),__append(id("clearObs")),__append('" class="filter-clear-label"></abbr>\n    </div>\n    <input id="'),__append(id("obsCategory")),__append('" name="obsCategory" type="text">\n  </div>\n  '),__append(renderLimit({hidden:!0})),__append('\n  <div class="form-group filter-actions">\n    '),__append(renderButton()),__append("\n  </div>\n</form>\n");return __output}});