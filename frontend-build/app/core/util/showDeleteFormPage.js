// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/viewport"],function(e,n){"use strict";return function(r,t,o,i){var a=new r({_id:t.params.id});n.loadPage("app/core/pages/ActionFormPage",function(n){return new n(e.extend({model:a,actionKey:"delete",successUrl:a.genClientUrl("base"),cancelUrl:o||a.genClientUrl("base"),formMethod:"DELETE",formAction:a.url(),formActionSeverity:"danger"},i))})}});