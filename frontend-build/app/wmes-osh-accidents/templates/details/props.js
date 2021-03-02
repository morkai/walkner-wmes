define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="osh-entries-details-props">\n  <div class="row">\n    <div class="col-lg-8">\n      <div class="panel panel-primary">\n        <div class="panel-heading">'),__append(t("details:general")),__append('</div>\n        <div class="panel-details">\n          '),__append(helpers.props(details,[{id:"subject",nameClassName:unseen("subject",1)},{id:"division",nameClassName:unseen("division",1)},{id:"workplace",nameClassName:unseen("workplace",1)},{id:"department",nameClassName:unseen("department",1)},{id:"building",nameClassName:unseen("building",1)},{id:"location",nameClassName:unseen("location",1)},{id:"station",nameClassName:unseen("station",1)},{id:"eventDate",nameClassName:unseen("eventDate",1)}])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">'),__append(t("details:extra")),__append('</div>\n        <div class="panel-details">\n          '),__append(helpers.props(details,[{id:"!creator",nameClassName:unseen("creator",1)},{id:"createdAt",nameClassName:unseen("createdAt",1)}])),__append("\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output}});