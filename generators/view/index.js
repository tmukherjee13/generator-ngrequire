'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var path = require('path');
var util = require('util');
var ScriptBase = require('../script-base.js');

var ngRequireViewGenerator = ScriptBase.extend({
  constructor: function() {
    ScriptBase.apply(this, arguments);
  },

  createViewFile: function() {
    this.htmlTemplate(
      '../common/app/views/view.html',
      path.join(
        'views',
        this.name.toLowerCase() + '.html'
      )
    );
  }
});

module.exports = ngRequireViewGenerator;
