define([
    "dojo/aspect",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "onlide/base/EventEmitter",
    "onlide/dijitutils",
    "onlide/Class"
], function(aspect, BorderContainer, ContentPane, EventEmitter, dijitutils, Class){

    'use strict';

    var Container, Layout;

    /**
     * @class onlide.ui.Layout
     * Представляет макет для аранжировки виджетов, поделенный на регионы:
     * левый, правый, верхний, нижний и центральный. Каждый регион, кроме
     * центрального, может состоять из нескольких виджетов
     * @extends onlide.base.WidgetBase
     */
    Layout = Class.create({

        className: "onlide.ui.Layout",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         * @param {Boolean} [params.stretch] если нужно растянуть макет на всю
         * ширину и высоту родительского узла, то устанавливается в true
         */
        constructor: function Layout(params){
            params = params || {};
            var stretch = params.stretch || true;
            var id = params.id;
            dijitutils.DijitWidgetBase.call(this, {
                    id: id,
                    dijitWidget: new BorderContainer({
                        design: "sidebar",
                        style: stretch ? {
                            width: "100%",
                            height: "100%",
                            border: "none"
                        } : null,
                        gutters: true
                    })
                }
            );

            this._defCenterWidget = (new Container({
                region:"center"
            }))._dijitWidget;

            this._center = this._defCenterWidget;
            this._dijitWidget.addChild(this._center);

            this.registerEvents(["widgetAdded", "widgetRemoved"]);
        },

        /**
         * @method hasWidget
         * Проверяет виджет на наличие
         * @param {onlide.base.WidgetBase} widget проверяемый виджет
         * @return {Boolean} если виджет присутствует, то вернет true,
         * иначе false
         */
        hasWidget: function(widget){
            return this._dijitWidget.getChildren().some(function(item){
                return widget === dijitutils.orig(item.content);
            });
        },

        /**
         * @method addWidget
         * Добавляет виджет. Для центрального региона выполнит замену.
         * Виджет не будет добавлен, если он уже есть в макете
         * @param {onlide.base.WidgetBase} widget добавляемый виджет
         * @param {"left"/"right"/"top"/"bottom"/"center"} [region="center"]
         * регион
         * @param {onlide.base.WidgetBase} [priority=0] приоритет виджета.
         * Чем выше приоритет, тем ближе виджет к центру. Не имеет смысла
         * для центрального региона
         * @param {Boolean} [splitter] если нужен перемещаемый разделитель
         * для изменения размера виджета, устанавливаетcя в true
         * @return {onlide.ui.Layout.Container} container
         * @fires widgetAdded
         */
        addWidget: function(widget, region, priority, splitter){

            var container = null;

            if(!this.hasWidget(widget)) {

                region = region || "center";
                priority = priority || 0;

                container = new Container({widget: widget, region: region});

                container._dijitWidget.layoutPriority = priority;
                container._dijitWidget.splitter = !!splitter;

                if(region === "center"){
                    this._dijitWidget.removeChild(
                        this._center
                    );
                    this._center = container._dijitWidget;
                }
                this._dijitWidget.addChild(container._dijitWidget);
            }
            return container;
        },

        /**
         * @method getWidget
         * Возвращает виджет
         * @param {String} id идентификатор
         * @return {onlide.base.WidgetBase?} виджет или null, если
         * такого нет
         */
        getWidget: function(id){
            var widget = null;
            this._dijitWidget.getChildren().some(function(item){

                item = dijitutils.orig(item.content);

                if(item && item.getId() === id){
                    widget = item;
                    return true;
                }
                return false;
            });
            return widget;
        },

        /**
         * @method getWidgetsByRegion
         * Возвращает виджеты указанного региона
         * @param {"left"/"right"/"top"/"bottom"/"center"} region регион
         * @return {onlide.base.WidgetBase[]} виджеты
         */
        getWidgetsByRegion: function(region){
            var widgets = [];

            if(region === "center"){
                if(this._center.content){
                    widgets.push(dijitutils.orig(this._center.content));
                }
            }else {
                this._dijitWidget.getChildren().forEach(function (item) {
                    if (item.region === region) {
                        widgets.push(dijitutils.orig(item.content));
                    }
                });
            }
            return widgets;
        },

        /**
         * @method getWidgets
         * Возвращает все виджеты
         * @return {onlide.base.WidgetBase[]} виджеты
         */
        getWidgets: function(){
            var widgets = [];
            this._dijitWidget.getChildren().forEach(function(item){
                if(item === this._center){
                    if(item.content !== "") {
                        widgets.push(dijitutils.orig(this._center.content));
                    }
                }else {
                    widgets.push(dijitutils.orig(item.content));
                }
            }.bind(this));
            return widgets;
        },

        /**
         * @method removeWidget
         * Удаляет виджет
         * @param {String} id идентификатор удаляемого
         * виджета
         * @widgetRemoved
         */
        removeWidget: function(id){
            var self = this;
            this._dijitWidget.getChildren().some(function(item){

                var orig = dijitutils.orig(item.content);

                if(orig && id === orig.getId()){

                    self._dijitWidget.removeChild(item);
                    if(item === self._center){
                        self._dijitWidget.addChild(self._defCenterWidget);
                        self._center = self._defCenterWidget;
                    }
                    return true;
                }
                return false;
            });
        },

        /**
         * @method update
         * Обновляет макет. Вызывайте данный метод после добавления
         * виджетов или изменения их размеров
         */
        update: function(){
            this._dijitWidget.resize();
        }

        /**
         * @event widgetAdded
         * Вызывается после добавления виджета
         * @param {Object} event объект события
         * @param {onlide.base.WidgetBase} event.widget добавленный виджет
         * @param {String} event.region регион, куда был добавлен виджет
         */

        /**
         * @event widgetRemoved
         * Вызывается после удаления виджета
         * @param {Object} event объект события
         * @param {onlide.base.WidgetBase} event.widget удаленный виджет
         */

    });

    Container = Class.create({

        className: "onlide.ui.Container",
        baseClass: dijitutils.DijitWidgetBase,

        constructor: function(params){
            var self = this;

            params = params || {};

            params.dijitWidget = new ContentPane({
                content: (params.widget
                && dijitutils.toDijitWidget(params.widget)._dijitWidget) || null,
                style: {
                    margin: "0px",
                    padding: "0px",
                    overflow: "hidden"
                },
                region: params.region
            });
            Container.Base.call(this, params);

            aspect.after(this._dijitWidget, "resize", function(){
                if(self.getWidget()) {
                    self.getWidget().resize();
                }
            });
        },

        setWidget: function(widget){
            this._dijitWidget.set(
                "content", dijitutils.toDijitWidget(widget) || null
            );
        },

        getWidget: function(){
            return this._dijitWidget.content === null ?
                null : dijitutils.orig(this._dijitWidget.content);
        }
    });

    return Layout;
});