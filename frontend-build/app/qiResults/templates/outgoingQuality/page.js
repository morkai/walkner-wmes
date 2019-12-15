define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="qi-oql">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <h3>'),__append(helpers.t("report:oql:title:ppm")),__append('</h3>\n  <div id="'),__append(idPrefix),__append('-ppm-chart"></div>\n  <div id="'),__append(idPrefix),__append('-ppm-table" class="qi-oql-table-container"></div>\n  <div class="row">\n    <div class="col-lg-6">\n      <h3>'),__append(helpers.t("report:oql:title:where")),__append('</h3>\n      <div id="'),__append(idPrefix),__append('-where-chart"></div>\n      <div id="'),__append(idPrefix),__append('-where-table" class="qi-oql-table-container"></div>\n    </div>\n    <div class="col-lg-6">\n      <h3>'),__append(helpers.t("report:oql:title:what")),__append('</h3>\n      <div id="'),__append(idPrefix),__append('-what-chart"></div>\n      <div id="'),__append(idPrefix),__append('-what-table" class="qi-oql-table-container"></div>\n    </div>\n  </div>\n  <h3>'),__append(helpers.t("report:oql:title:results")),__append('</h3>\n  <div id="'),__append(idPrefix),__append('-results" style="margin-top: 10px"></div>\n</div>\n');return __output}});