// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/viewport"],function(e,n){return function(r,o,t,a){var i=new r({_id:o.params.id});n.loadPage("app/core/pages/ActionFormPage",function(n){return new n(e.extend({model:i,actionKey:"delete",successUrl:i.genClientUrl("base"),cancelUrl:t||i.genClientUrl("base"),formMethod:"DELETE",formAction:i.url(),formActionSeverity:"danger"},a))})}});