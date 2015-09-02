define([
    "onlide/dijitutils",
    "onlide/ui/TabPane",
    "onlide/Class",
    "onlide/ui/Layout"], function(dijitutils, TabPane, Class, Layout) {

    'use strict';

    /**
     * @class onlide.ui.Workspace
     * Представляет рабочее пространство. При удалении всех виджетов какой-либо
     * панели, они удаляются. Для удобства имеется метод, для возвращения
     * панели по-умолчанию. Если панель по-умолчанию удалена, то при вызове
     * этого метода она будет создана. Панели по-умолчанию имеют приоритет 1000
     * @extends onlide.ui.Layout
     */
    return Class.create({

        className: "onlide.ui.Workspace",
        baseClass: Layout,

        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         */
        constructor: function Workspace(params){
            params = params || {};
            Layout.call(this, params);
            this._defPanes = {};
            this._panes = {};

            this.registerEvents(["showPane", "hidePane"]);
        },



        _hidePane: function(pane){
            if(pane.show) {
                Layout.prototype.removeWidget.call(this, pane.pane.getId());
                pane.show = false;
                this.emit("hidePane", {
                    pane: pane.pane
                });
            }
        },

        _showPane: function(pane){
            if(!pane.show){
                this.addWidget(pane.pane, pane.region, pane.priority, true);
                pane.show = true;
                this.emit("showPane", {
                    pane: pane.pane
                });
            }
        },

        /**
         * @method addPane
         * Добавляет панель
         * @param {"left"/"right"/"top"/"bottom"} region регион
         * @param {String} [id] идентификатор
         * @param {Number} [priority] приоритет панели. Чем выше, тем панель
         * ближе к центральной
         * @return {onlide.ui.TabPane} добавленная панель
         */
        addPane: function(region, id, priority){

            var cx, cy;

            priority = priority || 0;

            var self = this,
                pane = {
                    pane: new onlide.ui.TabPane({id: id}),
                    region: region,
                    priority: priority,
                    show: false,
                    onWidgetRemoved: function(){
                        if(!this.hasWidgets()){
                            self._hidePane(pane);
                        }
                    },
                    onWidgetAdded: function(){
                        self._showPane(pane);
                    }
                };

            pane.id = pane.pane.getId();

            this._panes[pane.id] = pane;

            pane.pane.on("widgetRemoved", pane.onWidgetRemoved);
            pane.pane.on("widgetAdded", pane.onWidgetAdded);

            cx = document.documentElement.clientWidth;
            cy = document.documentElement.clientHeight;

            pane.pane.getDomNode().style.width = cx*0.2+"px";
            pane.pane.getDomNode().style.height = cy*0.3+"px";

            return pane.pane;
        },

        /**
         * @method getPane
         * Возвращает панель
         * @param {String} id идентификатор
         * @return {onlide.ui.TabPane}
         */
        getPane: function(id){
            return (this._panes[id] && this._panes[id].pane) || null;
        },

        /**
         * @method getDefaultPane
         * Возвращает панель по-умолчанию. Будет создана, если была удалена.
         * Панель по-умолчанию имеет приоритет 100
         * @param region
         * @return {onlide.ui.TabPane}
         */
        getDefaultPane: function(region){
            if(!this._defPanes[region]){
                this._defPanes[region] = this.addPane(region, null, 100);
            }
            return this._defPanes[region];
        },

        /**
         * @method removePane
         * Удаляет панель
         * @param {onlide.ui.TabPane} pane панель
         */
        removePane: function(pane){
            var mypane = this._panes[pane.getId()];
            if(mypane){

                if(this._defPanes[pane.region] === pane){
                    delete this._defPanes[pane.region];
                }
                delete this._panes[pane.getId()];

                pane.off("widgetRemoved", mypane.onWidgetRemoved);
                pane.off("widgetAdded", mypane.onWidgetAdded);
            }
            Layout.prototype.removeWidget.call(this, pane.id);
        },

        removeWidget: function(id){
            if(this._panes[id]){
                this.removePane(this._panes[id].pane);
            }else{
                Layout.prototype.removeWidget.call(this, id);
            }
        }
    });


});