'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');
var camelize = require('underscore.string/camelize');
var slugify = require('underscore.string/slugify');
var humanize = require('underscore.string/humanize');
var angularUtils = require('../util.js');
var ngRequireJs = yeoman.Base.extend({
    constructor: function() {
        // Calling the super constructor is important so our generator is correctly set up
        yeoman.Base.apply(this, arguments);
        // Next, add your custom code
        this.option('app-suffix', {
            desc: 'Allow a custom suffix to be added to the module name',
            type: 'String',
            defaults: 'App'
        });
        this.option('appPath', {
            desc: 'path/to/app is now accepted to choose where to write the files',
            banner: 'path/to/app is now accepted to choose where to write the files',
            type: 'String',
            defaults: 'app',
            required: 'false'
        });
        this.argument('appname', {
            type: String,
            required: false
        });
        this.appname = this.appname || path.basename(process.cwd());
        this.appname = camelize(slugify(humanize(this.appname)));
        this.appSlugName = slugify(humanize(this.appname))
        this.env.options['app-suffix'] = this.options['app-suffix'] || 'App';
        this.scriptAppName = this.appname + angularUtils.appName(this);
        this.env.options.appPath = this.options.appPath || 'app';
        this.config.set('appPath', this.env.options.appPath);
        this.appPath = this.env.options.appPath;
        this.pkg = require('../../package.json');
        this.sourceRoot(path.join(__dirname, '../templates/common'));
    },
    prompting: function() {
        var done = this.async();
        // Have Yeoman greet the user.
        this.log(yosay('Welcome to the awe-inspiring ' + chalk.red('generator-ngrequire') + ' generator!'));
        this.log('Out of the box I include Bootstrap and some AngularJS recommended modules.\n');
        var prompts = [{
            type: 'confirm',
            name: 'sass',
            message: 'Would you like to use Sass for your project(with gulp-sass)?',
            default: true
        }, {
            type: 'confirm',
            name: 'bootstrap',
            message: 'Would you like to include Bootstrap?',
            default: true
        }, {
            type: 'confirm',
            name: 'sassBootstrap',
            message: 'Would you like to use the Sass version of Bootstrap?',
            default: true,
            when: function(props) {
                return props.bootstrap && props.sass;
            }
        }, {
            type: 'checkbox',
            name: 'modules',
            message: 'Which modules would you like to include?',
            choices: [{
                value: 'resourceModule',
                name: 'angular-resource.js',
                checked: true
            }, {
                value: 'cookiesModule',
                name: 'angular-cookies.js',
                checked: true
            }, {
                value: 'sanitizeModule',
                name: 'angular-sanitize.js',
                checked: true
            }, {
                value: 'routeModule',
                name: 'angular-route.js',
                checked: true
            }, {
                value: 'animateModule',
                name: 'angular-animate.js',
                checked: true
            }, {
                value: 'touchModule',
                name: 'angular-touch.js',
                checked: true
            }, {
                value: 'ariaModule',
                name: 'angular-aria.js',
                checked: false
            }, {
                value: 'messagesModule',
                name: 'angular-messages.js',
                checked: false
            }]
        }];
        this.prompt(prompts).then(function(props) {
            // To access props later use this.props.someAnswer;
            this.props = props;
            this.sass = props.sass;
            this.bootstrap = props.bootstrap;
            this.sassBootstrap = props.sassBootstrap;
            var hasMod = function(mod) {
                return props.modules.indexOf(mod) !== -1;
            };
            this.ariaModule = hasMod('ariaModule');
            this.messagesModule = hasMod('messagesModule');
            this.resourceModule = hasMod('resourceModule');
            this.cookiesModule = hasMod('cookiesModule');
            this.sanitizeModule = hasMod('sanitizeModule');
            this.routeModule = hasMod('routeModule');
            this.animateModule = hasMod('animateModule');
            this.touchModule = hasMod('touchModule');
            var angMods = [];
            if (this.cookiesModule) {
                angMods.push('ngCookies');
            }
            if (this.ariaModule) {
                angMods.push('ngAria');
            }
            if (this.messagesModule) {
                angMods.push('ngMessages');
            }
            if (this.resourceModule) {
                angMods.push('ngResource');
            }
            if (this.sanitizeModule) {
                angMods.push('ngSanitize');
            }
            if (this.routeModule) {
                angMods.push('ngRoute');
                this.env.options.ngRoute = true;
            }
            if (this.animateModule) {
                angMods.push('ngAnimate');
                this.env.options.ngAnimate = true;
            }
            if (this.touchModule) {
                angMods.push('ngTouch');
                this.env.options.ngTouch = true;
            }
            this.env.options.angularDeps = angMods;
            done();
        }.bind(this));
    },
    configuring: {
        bowerConfig: function() {
            this.fs.copyTpl(this.templatePath('root/_bowerrc'), this.destinationPath('.bowerrc'));
            this.fs.copyTpl(this.templatePath('root/_bower.json'), this.destinationPath('bower.json'), {
                appSlugName: this.appSlugName,
                animateModule: this.animateModule,
                ariaModule: this.ariaModule,
                cookiesModule: this.cookiesModule,
                messagesModule: this.messagesModule,
                resourceModule: this.resourceModule,
                routeModule: this.routeModule,
                sanitizeModule: this.sanitizeModule,
                touchModule: this.touchModule,
                bootstrap: this.bootstrap,
                compassBootstrap: this.compassBootstrap,
                appPath: this.appPath,
                scriptAppName: this.scriptAppName
            });
        },
        packageJson: function() {
            this.fs.copyTpl(this.templatePath('root/_package.json'), this.destinationPath('package.json'), {
                appSlugName: this.appSlugName,
                sass: this.sass
            });
        },
        gulpfile: function() {
            this.copy(this.templatePath('root/_gulpfile.js'), this.destinationPath('gulpfile.js'));
        },
        editorConfig: function() {
            this.copy(this.templatePath('root/.editorconfig'), this.destinationPath('.editorconfig'));
        },
        jscsrc: function() {
            this.copy(this.templatePath('root/.jscsrc'), this.destinationPath('.jscsrc'));
        },
        git: function() {
            this.copy(this.templatePath('root/.gitattributes'), this.destinationPath('.gitattributes'));
            this.copy(this.templatePath('root/gitignore'), this.destinationPath('.gitignore'));
        },
        jshint: function() {
            this.copy(this.templatePath('root/.jshintrc'), this.destinationPath('.jshintrc'));
        },
        readme: function() {
            this.fs.copyTpl(this.templatePath('root/README.md'), this.destinationPath('README.md'), {
                appSlugName: this.appSlugName,
                pkg: this.pkg
            });
        },
        testDirectory: function() {
            this.directory('test');
        },
    },
    writing: {
        bootstrapFiles: function() {
            var cssFile = 'styles/main.' + (this.sass ? 's' : '') + 'css';
            this.copy(path.join('app', cssFile), path.join(this.appPath, cssFile));
        },
        indexHtml: function() {
            this.ngRoute = this.env.options.ngRoute;
            this.copy(path.join('app', 'index.html'), path.join(this.appPath, 'index.html'));
        },
        requireJsAppConfig: function() {
            this.copy(this.templatePath('scripts/main.js'), path.join(this.appPath, 'scripts/main.js'));
        },
        requireJsTestConfig: function() {
            this.copy(this.templatePath('scripts/test-main.js'), 'test/test-main.js');
        },
        webFiles: function() {
            this.sourceRoot(path.join(__dirname, '../templates/common'));
            var appPath = this.options.appPath;
            var copy = function(dest) {
                this.copy(path.join('app', dest), path.join(this.appPath, dest));
            }.bind(this);
            copy('404.html');
            copy('favicon.ico');
            copy('robots.txt');
            copy('views/main.html');
            this.directory(path.join('app', 'images'), path.join(this.appPath, 'images'));
        },
        appFile: function() {
                // var mods = this.env.options.angularDeps.map(function(m) {
                //   return "'"+m+"'";
                // });
                // // this.angularModules = mods;
                this.angularModules = this.env.options.angularDeps;
                this.ngRoute = this.env.options.ngRoute;
                this.copy(this.templatePath('../javascript/app.js'), path.join(this.appPath, 'scripts/app.js'));
            }
            // this.fs.copy(this.templatePath('dummyfile.txt'), this.destinationPath('dummyfile.txt'));
    },
    install: function() {
        this.installDependencies();
    }
});
module.exports = ngRequireJs;