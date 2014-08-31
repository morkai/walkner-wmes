// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport"],function(e,o){return function(r,n,t,a){function s(){o.msg.loaded()}function d(r){var n=r.statusText;if("abort"===n)return o.msg.loaded();var s=r.responseJSON;s&&s.error&&(s.error.code?n=s.error.code:s.error.message&&(n=s.error.message)),o.msg.loadingFailed(e(a,t,{code:n}))}return a||(a=r.nlsDomain?r.nlsDomain:r.model&&r.model.prototype.nlsDomain?r.model.prototype.nlsDomain:"core"),t||(t=r.model?"MSG:LOADING_FAILURE":"MSG:LOADING_SINGLE_FAILURE"),n.listenTo(r,"request",function(e,r,n){"read"===n.syncMethod&&(o.msg.loading(),r.done(s),r.fail(d))}),r}});