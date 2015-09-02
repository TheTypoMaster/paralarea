
define([
    "dijit/Toolbar",
    "onlide/dijitutils",
    "onlide/Class",
    "onlide/ui/Pane"
], function(Toolbar, dijitutils, Class, Pane) {

    'use strict';

    /**
     * @class onlide.ui.Statusbar
     * Представляет виджет строки состояния для отображения временной и
     * постоянной информации, такой как состояние приложения, текущий номер
     * строки и столбца в редакторе кода и пр.
     * @extends onlide.base.WidgetBase
     */
   return Class.create({

        className: "onlide.ui.Statusbar",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         */
        constructor: function Statusbar(params){
            params = params || {};
            dijitutils.DijitWidgetBase.call(this, {
                    id: params.id,
                    dijitWidget: new Toolbar({
                        style: {
                            border: "none",
                            width: "100%",
                            textAlign: "right"
                        }
                    })
                }
            );

            this._leftBar = new Toolbar({
                style: {
                    border: "none",
                    float: "left",
                    background: "transparent",
                    padding: "0px"

                }
            });
            this._rightBar = new Toolbar({
                style: {
                    display: "inline",
                    border: "none",
                    background: "transparent"
                }
            });
            this._infoPane = new Pane();

            this._infoPane._dijitWidget.set("style", {
                display: "inline",

            });
            this._leftBar.addChild(this._infoPane._dijitWidget);

            this._dijitWidget.addChild(this._leftBar);
            this._dijitWidget.addChild(this._rightBar);
        },


        /**
         * @method showMessage
         * Отобразит сообщение
         * @param {String} message сообщение
         * @param {Number} [timeout=0] время отображения. Если равно 0,
         * сообщение будет отображаться до следующего вызова данного метода
         */
        showMessage: function(message, timeout){
            var self = this;

            this._infoPane.setContent(message);
            if(timeout){
                setTimeout(function(){
                    self.clearMessage();
                }, timeout*1000)
            }
        },

        /**
         * @method getCurrentMessage
         * Возвращает текущее сообщение
         * @return {String} сообщение
         */
        getCurrentMessage: function(){
            return this._infoPane.getContent();
        },

        /**
         * @method clearMessage
         * Очищает текущее сообщение
         */
        clearMessage: function(){
            this._infoPane.setContent("");
        },

        /**
         * @method addPane
         * Добавляет панель для отображения постоянной информации
         * @param {onlide.ui.Pane} pane панель
         */
        addPane: function(pane){
            pane = dijitutils.toDijitWidget(pane);
            pane._dijitWidget.set("style", {
                display: "inline",
                border: "none"
            });
            this._rightBar.addChild(pane._dijitWidget);
        },

        /**
         * @method removePane
         * Удаляет панель
         * @param {onlide.ui.Pane} pane удаляемая панель
         * <b>Возможно стоит передавать id виджета?</b>
         */
        removePane: function(pane){
            var self = this;
            this._rightBar.getChildren().every(function(item){
                if(dijitutils.orig(item) === pane){
                    self._rightBar.removeChild(pane._dijitWidget);
                    return false;
                }
                return true;
            });
        },

        /**
         * @methods getPane
         * Возвращает панель
         * @param {String} id идентификатор панели
         * @return {onlide.ui.Pane} панель
         */
        getPane: function(id){
            var pane = null;
            this._rightBar.getChildren().every(function(item){
                item = dijitutils.orig(item);
                if(item.getId() === id){
                    pane = item;
                    return false;
                }
                return true;
            });
            return pane;
        }
    });
});



