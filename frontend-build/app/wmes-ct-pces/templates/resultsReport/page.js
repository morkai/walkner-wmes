define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="ct-report-results-page">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <h3>'),__append(t("resultsReport:vs:title")),__append('</h3>\n  <div id="'),__append(idPrefix),__append('-vs"></div>\n  <h3 style="display: flex">\n    '),__append(t("resultsReport:avgOutput:title")),__append('\n    <a href="javascript:void(0)" class="ct-reports-results-mode" data-prop="upph" data-value="standard">'),__append(t("resultsReport:avgOutput:standard")),__append('</a>\n    <a href="javascript:void(0)" class="ct-reports-results-mode" data-prop="upph" data-value="normalized">'),__append(t("resultsReport:avgOutput:normalized")),__append("</a>\n    "),canManage&&(__append('\n    <a id="'),__append(idPrefix),__append('-editUpphConfig" href="javascript:void(0)" style="margin-left: 10px"><i class="fa fa-edit" style="vertical-align: bottom"></i></a>\n    ')),__append('\n  </h3>\n  <div id="'),__append(idPrefix),__append('-avgOutput"></div>\n  <div id="'),__append(idPrefix),__append('-table"></div>\n</div>\n');return __output}});