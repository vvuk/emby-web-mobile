﻿define(['apphost', 'connectionManager', 'events', 'globalize', 'browser', 'require', 'dom', 'embyRouter', 'emby-tabs'], function (appHost, connectionManager, events, globalize, browser, require, dom, embyRouter) {
    'use strict';

    // Make sure this is pulled in after button and tab css
    require(['css!./dockedtabs']);

    var currentUser = {};
    var currentUserViews = [];

    function showUserView(id) {

        var view = currentUserViews.filter(function (current) {
            return current.Id == id;
        })[0];

        if (view) {
            embyRouter.showItem(view);
        }
    }

    function executeCommand(id) {

        switch (id) {

            case 'settings':
                embyRouter.showSettings();
                break;
            case 'signout':
                Dashboard.logout();
                break;
            case 'selectserver':
                embyRouter.showSelectServer();
                break;
            case 'reports':
                Dashboard.navigate('reports.html');
                break;
            case 'metadatamanager':
                Dashboard.navigate('edititemmetadata.html');
                break;
            case 'manageserver':
                Dashboard.navigate('dashboard.html');
                break;
            case 'remotecontrol':
                Dashboard.navigate('nowplaying.html');
                break;
            case 'sync':
                Dashboard.navigate('mysync.html');
                break;
            case 'nowplaying':
                Dashboard.navigate('nowplaying.html');
                break;
            default:
                showUserView(id);
                break;
        }
    }

    function showMenu(menuItems, button, tabIndex) {

        var actionSheetType = browser.safari ? 'actionsheet' : 'webActionSheet';

        require([actionSheetType], function (actionSheet) {

            actionSheet.show({

                items: menuItems,
                positionTo: button,
                entryAnimation: 'slideup',
                exitAnimation: 'fadeout',
                entryAnimationDuration: 160,
                exitAnimationDuration: 100,
                offsetTop: -35,
                positionY: 'top',
                dialogClass: 'dockedtabs-dlg',
                menuItemClass: 'dockedtabs-dlg-menuitem'

            }).then(function (id) {

                executeCommand(id);
                if (id) {
                    var tabs = dom.parentWithClass(button, 'dockedtabs-tabs');
                    tabs.selectedIndex(tabIndex, false);
                }
            });
        });
    }

    function showLibrariesMenu(button) {

        var commands = currentUserViews.map(function (view) {

            return {
                name: view.Name,
                id: view.Id
            };
        });

        showMenu(commands, button, 1);
    }

    function showMoreMenu(button) {

        var commands = [];

        // manage server, metadata manager, reports, sync to other devices
        if (currentUser.Policy.IsAdministrator) {
            commands.push({
                name: globalize.translate('ButtonManageServer'),
                id: 'manageserver'
            });

            if (dom.getWindowSize().innerWidth >= 1000) {
                commands.push({
                    name: globalize.translate('MetadataManager'),
                    id: 'metadatamanager'
                });
            }

            commands.push({
                name: globalize.translate('ButtonReports'),
                id: 'reports'
            });
        }

        if (appHost.supports('multiserver')) {
            commands.push({
                name: globalize.translate('HeaderSelectServer'),
                id: 'selectserver'
            });
        }

        commands.push({
            name: globalize.translate('TabSettings'),
            id: 'settings'
        });

        if (currentUser.Policy.EnableSync) {
            commands.push({
                name: globalize.translate('SyncToOtherDevices'),
                id: 'sync'
            });
        }

        commands.push({
            name: globalize.translate('ButtonSignOut'),
            id: 'signout'
        });

        showMenu(commands, button, 5);
    }

    function onTabClick(e) {

        var index = parseInt(this.getAttribute('data-index'));

        switch (index) {

            case 0:
                embyRouter.goHome();
                break;
            case 1:
                showLibrariesMenu(this);
                e.preventDefault();
                e.stopPropagation();
                break;
            case 2:
                embyRouter.showLiveTV();
                break;
            case 3:
                Dashboard.navigate('mysync.html?mode=offline');
                break;
            case 4:
                Dashboard.navigate('nowplaying.html');
                break;
            case 5:
                showMoreMenu(this);
                e.preventDefault();
                e.stopPropagation();
                break;
            default:
                break;
        }
    }

    function addNoFlexClass(buttons) {

        setTimeout(function () {
            for (var i = 0, length = buttons.length; i < length; i++) {

                var button = buttons[i];

                if (button.classList.contains('emby-button-noflex')) {
                    button.classList.add('dockedtabs-tab-button-noflex');
                }
            }
        }, 300);
    }

    function render(options) {

        var elem = document.createElement('div');

        elem.classList.add('hide');
        elem.classList.add('dockedtabs');
        elem.classList.add('dockedtabs-bottom');

        // tabs: 
        // home
        // favorites
        // live tv
        // now playing

        var html = '';

        html += '    <div is="emby-tabs" class="dockedtabs-tabs" data-selectionbar="false">\
            <button is="emby-button" class="dockedtabs-tab-button emby-tab-button emby-tab-button-active" data-index="0">\
                <div class="dockedtabs-tab-button-foreground emby-button-foreground"><i class="dockedtabs-tab-button-icon md-icon">home</i><div>' + globalize.translate('TabHome') + '</div></div>\
            </button>\
            <button is="emby-button" class="dockedtabs-tab-button emby-tab-button docked-tab-livetv hide" data-index="2">\
                <div class="dockedtabs-tab-button-foreground emby-button-foreground"><i class="dockedtabs-tab-button-icon md-icon">live_tv</i><div>' + globalize.translate('HeaderLiveTV') + '</div></div>\
            </button>\
';

        if (appHost.supports('sync')) {
            html += '<button is="emby-button" class="dockedtabs-tab-button docked-tab-syncdownloads emby-tab-button hide" data-index="3">\
                <div class="dockedtabs-tab-button-foreground emby-button-foreground"><i class="dockedtabs-tab-button-icon md-icon">file_download</i><div>' + globalize.translate('Downloads') + '</div></div>\
            </button>\
            ';
        }

        html += '<button is="emby-button" class="dockedtabs-tab-button emby-tab-button" data-index="4">\
                <div class="dockedtabs-tab-button-foreground emby-button-foreground"><i class="dockedtabs-tab-button-icon md-icon">&#xE037;</i><div>' + globalize.translate('HeaderNowPlaying') + '</div></div>\
            </button>\
            ';

        html += '<button is="emby-button" class="dockedtabs-tab-button emby-tab-button" data-index="5">\
                <div class="dockedtabs-tab-button-foreground emby-button-foreground"><i class="dockedtabs-tab-button-icon md-icon">menu</i><div>' + globalize.translate('ButtonMore') + '</div></div>\
            </button>\
    </div>\
';

        elem.innerHTML = html;

        var buttons = elem.querySelectorAll('.emby-tab-button');
        for (var i = 0, length = buttons.length; i < length; i++) {

            var button = buttons[i];
            button.addEventListener('click', onTabClick);
        }
        addNoFlexClass(buttons);

        options.appFooter.add(elem);

        return elem;
    }

    function onUserViewResponse(user, views, element) {

        var hasSync = false;
        var downloadsTab = element.querySelector('.docked-tab-syncdownloads');
        if (downloadsTab) {
            if (user.Policy.EnableSync) {
                downloadsTab.classList.remove('hide');
                hasSync = true;
            } else {
                downloadsTab.classList.add('hide');
            }
        }

        var hasLiveTv = views.filter(function (v) {

            return v.CollectionType == 'livetv';

        }).length > 0;

        if (hasLiveTv) {
            element.querySelector('.docked-tab-livetv').classList.remove('hide');
        } else {
            element.querySelector('.docked-tab-livetv').classList.add('hide');
        }

        var downloadsTab = element.querySelector('.docked-tab-syncdownloads');
        if (downloadsTab) {
            if (user.Policy.EnableSync) {
                downloadsTab.classList.remove('hide');
            } else {
                downloadsTab.classList.add('hide');
            }
        }
    }

    function showUserTabs(user, element) {

        currentUser = user;

        var apiClient = ConnectionManager.getApiClient(user.ServerId);

        apiClient.getUserViews({}, user.Id).then(function (result) {

            currentUserViews = result.Items;
            onUserViewResponse(user, result.Items, element);

        }, function () {
            currentUserViews = [];
            onUserViewResponse(user, [], element);
        });
    }

    function showCurrentUserTabs(element) {

        if (!Dashboard.getCurrentUserId()) {
            return;
        }

        Dashboard.getCurrentUser().then(function (user) {
            showUserTabs(user, element);
        });
    }

    var instance;

    function onViewShow(e) {
        if (e.detail.properties.indexOf('fullscreen') !== -1 || !Dashboard.getCurrentUserId()) {
            instance.hide();
        } else {
            instance.show();
        }
    }

    function dockedTabs(options) {

        var self = this;
        instance = self;

        self.element = render(options);

        events.on(connectionManager, 'localusersignedin', function (e, user) {
            self.show();
            showUserTabs(user, self.element);
        });

        events.on(connectionManager, 'localusersignedout', function () {
            self.hide();
        });

        showCurrentUserTabs(self.element);
        document.addEventListener('viewshow', onViewShow);
    }

    dockedTabs.prototype.destroy = function () {

        document.removeEventListener('viewshow', onViewShow);
        instance = null;

        var self = this;

        var elem = self.element;
        if (elem) {
        }
        self.element = null;
    };

    dockedTabs.prototype.show = function () {
        this.element.classList.remove('hide');
    };

    dockedTabs.prototype.hide = function () {
        this.element.classList.add('hide');
    };

    return dockedTabs;
});