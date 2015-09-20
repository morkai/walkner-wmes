// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore"],function(e){"use strict";return function(s){var t='<div class="opinionSurveys-select2">';return t+="<h3>"+e.escape(s["short"]||s.question.get("short"))+"</h3>",t+="<p>"+e.escape(s.full||s.question.get("full"))+"</p>",t+="</div>"}});