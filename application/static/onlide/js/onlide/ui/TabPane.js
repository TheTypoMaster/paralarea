define([
    "dojo/aspect",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "onlide/dijitutils",
    "onlide/Class",
], function(aspect, TabContainer, ContentPane, dijitutils, Class) {

    'use strict';

    /**
     * @class onlide.ui.TabPane
     * Представляет класс виджета таб-панели. Может содержать множество
     * виджетов, среди которых отображается только один. Для переключения между
     * виджетами используются вкладки и/или выпадающий список
     * @extends onlide.base.WidgetBase
     */
    return Class.create({

        className: "onlide.ui.TabPane",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         */
        constructor: function TabPane(params){
            params = params || {};
            dijitutils.DijitWidgetBase.call(this, {
                    id: params.id,
                    dijitWidget: new TabContainer({
                        style: {
                            margin: "4px"
                        }
                    })
            });

            this.registerEvents([
                "widgetAdded", "widgetRemoved", "widgetSelected"
            ]);

            var self = this;
            aspect.around(this._dijitWidget, "removeChild",
                function(origRemoveChild){
                    return function(child){
                        origRemoveChild.call(self._dijitWidget, child);
                        self.emit("widgetRemoved", {
                            widget: dijitutils.orig(child.content)
                        });
                    };
                }
            );
        },

        /**
         * @method addWidget
         * Добавляет виджет. Не выполнится, если такой виджет уже есть
         * @param {onlide.base.WidgetBase} widget виджет
         * @param {String} caption отображаемое имя. Не обязательно
         * уникально
         * @param {Function} [onCloseTab] обработчик закрытия вкладки
         * @param {Boolean} onCloseTab.return если вкладка должна быть
         * закрыта, то нужно вернуть true
         * @fires widgetAdded
         */
        addWidget: function(widget, caption, onCloseTab){

            var self = this;

            if(!this.hasWidget(widget)) {

                var cpane = new ContentPane({
                    closable: true, title: caption,
                    content: dijitutils.toDijitWidget(
                        widget
                    )._dijitWidget,
                    onClose: function(){
                        self.removeWidget(widget);
                        if(onCloseTab){
                            onCloseTab.call(widget);
                        }
                        //return true;
                    },
                    style: {
                        margin: "0xp",
                        padding: "0px",
                        border: "none"
                    }
                });

                cpane.__resizeConnection = aspect.after(cpane, "resize", function(){
                    widget.resize();
                });

                this._dijitWidget.addChild(cpane);
                this._dijitWidget.selectChild(cpane);
                this.emit("widgetAdded", {
                    widget: widget
                });
            }
        },

        getWidgets: function(){
            return this._dijitWidget.getChildren().map(function(item){
                return dijitutils.orig(item.content);
            });
        },

        /**
         * #method hasWidget
         * Проверяет виджет на наличие
         * @param {onlide.ui.WidgetBase} widget виджет
         * @return {Boolean} если виджет содержится в таб-контейнере, то
         * вернет true, иначе false
         */
        hasWidget: function(widget){
            return this._dijitWidget.getChildren().some(function(item){
                return widget === dijitutils.orig(item.content);
            });
        },

        /**
         * @method hasWidgets
         * Используется для проверки наличия виджетов в таб-контейнере
         * @return {Boolean} если в таб-контейнере есть виджеты или виджет,
         * то вернет true, иначе false
         */
        hasWidgets: function(){
            return this._dijitWidget.hasChildren();
        },

        /**
         * @method removeWidget
         * Удаляет виджет
         * @param {onlide.base.WidgetBase} widget удаляемый виджет
         * @fires widgetRemoved
         */
        removeWidget: function(widget){
            var self = this;
            return this._dijitWidget.getChildren().some(function(item){
                if(widget === dijitutils.orig(item.content)){
                    item.__resizeConnection.remove();
                    self._dijitWidget.removeChild(item);
                    return true;
                }
                return false;
            });
        },

        /**
         * @method removeAllWidgets
         * Удаляет все виджеты
         * @fires widgetRemoved
         */
        removeAllWidgets: function(){
            var self = this;
            this._dijitWidget.getChildren().forEach(function(item){
                self._dijitWidget.removeChild(item);
            });
        },

        setTabCaption: function(widget, caption){
            this._dijitWidget.getChildren().some(function(item){
                if(widget === dijitutils.orig(item.content)){
                    item.set("title", caption);
                    return true;
                }
            });
        },

        /**
         * @method selectWidget
         * Выбирает текущий отображаемый виджет
         * @param {onlide.base.WidgetBase} widget виджет
         * @fires widgetSelected
         */
        selectWidget: function(widget){
            var self = this, prev = this._dijitWidget.selectedChildWidget;
            this._dijitWidget.getChildren().some(function(item){
                if(widget === dijitutils.orig(item.content)){
                    self._dijitWidget.selectChild(item);
                    return true;
                }
                return false;
            });
            this.emit("widgetSelected", {
                prevWidget: dijitutils.orig(prev),
                currentWidget: widget
            });
        }

        /**
         * @event widgetSelected
         * Вызывается после переключения на др. виджет
         * @param {Object} event объект события
         * @param {onlide.base.WidgetBase} event.prevWidget предыдущий
         * отображаемый виджет
         * @param {onlide.base.WidgetBase} event.currentWidget текущий
         * отображаемый виджет
         */

        /**
         * @event widgetAdded
         * Вызывается после добавления виджета
         * @param {Object} event объект события
         * @param {onlide.base.WidgetBase} event.widget добавленный виджет
         */

        /**
         * @event widgetRemoved
         * Вызывается после удаления виджета. Удаление может быть вызвано
         * закрытием вкладки
         * @param {Object} event объект события
         * @param {onlide.base.WidgetBase} event.widget удаленный виджет
         */
    });



});