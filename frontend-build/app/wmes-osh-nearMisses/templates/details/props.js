define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="osh-nearMisses-details-props">\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-primary">\n        <div class="panel-heading">'),__append(t("details:general")),__append('</div>\n        <div class="panel-details">\n          '),__append(helpers.props(details,["subject","workplace","division","building","location","eventDate",{id:"!kind",value:e=>`<span title="${_.escape(details.descriptions.kind)}">${_.escape(e)} `+(details.descriptions.kind?'<i class="fa fa-question-circle"></i>':"")+"</span>"},{id:"materialLoss",visible:model.materialLoss},{id:"!eventCategory",value:e=>`<span title="${_.escape(details.descriptions.eventCategory)}">${_.escape(e)} `+(details.descriptions.eventCategory?'<i class="fa fa-question-circle"></i>':"")+"</span>"},{id:"!reasonCategory",value:e=>`<span title="${_.escape(details.descriptions.reasonCategory)}">${_.escape(e)} `+(details.descriptions.reasonCategory?'<i class="fa fa-question-circle"></i>':"")+"</span>"}])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">'),__append(t("details:users")),__append('</div>\n        <div class="panel-details">\n          '),__append(helpers.props(details,["!creator","!implementer",{id:"!coordinators",value:e=>e.length?1===e.length||e.length>11?e.join(", "):`<ul><li>${e.join("<li>")}</ul>`:""}])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">'),__append(t("details:extra")),__append('</div>\n        <div class="panel-details">\n          '),__append(helpers.props(details,[{id:"!status",value:e=>{let n=e;return model.statusComment&&(n+=`<br><span class="small text-lines"><i class="fa fa-comment-o"></i> ${_.escape(model.statusComment)}</span>`),n}},"priority","createdAt","startedAt","plannedAt","finishedAt","duration"])),__append('\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-danger">\n        <div class="panel-heading">'),__append(t("PROPERTY:problem")),__append('</div>\n        <div class="panel-body text-lines">'),__append(escapeFn(details.problem)),__append('</div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-warning">\n        <div class="panel-heading">'),__append(t("PROPERTY:reason")),__append('</div>\n        <div class="panel-body text-lines">'),__append(escapeFn(details.reason||"?")),__append('</div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-success">\n        <div class="panel-heading">'),__append(t("PROPERTY:solution")),__append('</div>\n        <div class="panel-body text-lines">'),__append(escapeFn(details.solution||"?")),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output}});