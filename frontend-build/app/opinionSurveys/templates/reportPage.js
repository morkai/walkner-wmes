define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="opinionSurveys-report">\n  <div class="filter-container"></div>\n  <div class="opinionSurveys-report-responseCount-container"></div>\n  <div class="opinionSurveys-report-columns">\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-responseCountByDivision-container panel panel-default"></div>\n    </div>\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-responseCountBySuperior-container panel panel-default"></div>\n    </div>\n  </div>\n  <div class="opinionSurveys-report-columns">\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-responsePercentBySurvey-container panel panel-default"></div>\n    </div>\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-responsePercentByDivision-container panel panel-default"></div>\n    </div>\n  </div>\n  <div class="opinionSurveys-report-answerCountBySurvey-container panel panel-default"></div>\n  <div class="opinionSurveys-report-answerCountBySuperior-container panel panel-default"></div>\n  <div class="opinionSurveys-report-columns">\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-positiveAnswerPercentBySurvey-container panel panel-default"></div>\n    </div>\n    <div class="opinionSurveys-report-column">\n      <div class="opinionSurveys-report-positiveAnswerPercentByDivision-container panel panel-default"></div>\n    </div>\n  </div>\n</div>\n');return __output.join("")}});