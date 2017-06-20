// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(e){"use strict";return function(s){var t='<div class="opinionSurveys-select2">';return t+="<h3>"+e.escape(s.short||s.question.get("short"))+"</h3>",t+="<p>"+e.escape(s.full||s.question.get("full"))+"</p>",t+="</div>"}});