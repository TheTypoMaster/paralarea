define([
    "onlide/dijitutils",
    "onlide/Class",
    "onlide/ui/Layout",
    "onlide/ui/MenuBar",
    "onlide/ui/Toolbar",
    "onlide/ui/Workspace",
    "onlide/ui/Statusbar",

    "require"
], function(dijitutils, Class, Layout, MenuBar, Toolbar, Workspace, Statusbar, require) {

    'use strict';

    /**
     * @class onlide.ui.MainUILayout
     * Отвечает за размещение и предоставление главных элементов
     * пользовательского интерфейса: панели меню, панели инструментов,
     * информационной панели и рабочего пространства
     * @static
     */
    return Class.createStatic("onlide.ui.MainUILayout", {

        /**
         * @property {onlide.ui.Layout} layout
         * Макет
         * @readonly
         */
        layout: new Layout(),

        /**
         *  @property {onlide.ui.MenuBar} menubar
         *  Главная панель меню
         *  @readonly
         */
        menubar: new MenuBar.MenuBar(),

        /**
         * @property {Object} mainMenus
         * @readonly
         * Главные меню верхнего уровня
         */
        mainMenus: {},

        /**
         *  @property {onlide.ui.Toolbar} toolbar
         *  Главная панель инструментов
         *  @readonly
         */
        toolbar: new Toolbar(),

        /**
         *  @property {onlide.ui.Layout} workspace
         *  Рабочее пространство
         *  @readonly
         */
        workspace: new Workspace(),

        /**
         *  @property {onlide.ui.Infobar} infobar
         *  Информационная панель
         *  @readonly
         */
        statusbar: new Statusbar(),


        // Потом можно вынести в отдельную примесь ////
        _initHandlers: [],
        initialized: false,
        addInitializeHandler: function(handler){
            if(!this.initialized) {
                this._initHandlers.push(handler);
            }
        },
        finishInitialize: function(){
            this._initHandlers.forEach(function(handler){
                handler();
            });
            this.initialized = true;
            this._initHandlers = null;
        },
        //////////////////////////////////////////////

        /**
         * @method constructor
         * Конструктор
         * Здесь создаются основные элементы интерфейса и происходит их
         * размещение
         */
        initialize: function(){

            if(this.initialized){
                throw new Error("MainUILayout уже был инициализирован");
            }

            // Размещение макета
            this.layout.place("main", "replace");

            this.layout.addWidget(this.menubar, "top", 0);
            this.layout.addWidget(this.toolbar, "top", 100);
            this.layout.addWidget(this.workspace, "center");
            this.layout.addWidget(this.statusbar, "bottom", 100);

            // Добавление стандартных меню и сохранение их для быстрого доступа
            this.mainMenus.file = this.menubar.addMenu({
                id: "file", label: "Файл"
            });
            this.mainMenus.edit = this.menubar.addMenu({
                id: "edit", label: "Редактирование"
            });
            this.mainMenus.view = this.menubar.addMenu({
                id: "view", label: "Вид"
            });
            this.mainMenus.help = this.menubar.addMenu({
                id: "help", label: "Помощь"
            });

            // Добавление виджетов в панель инструментов
            var Button = require("dijit/form/Button");
            this.toolbar.addWidget(dijitutils.fromDijitWidget(new Button({
                label:"тестовая"
            })));

            // Вывод сообщения в строку состояния
            this.statusbar.showMessage("Готово", 5);

            // Обновляем макет
            this.layout.update();

            this.finishInitialize();
        }
    });
});