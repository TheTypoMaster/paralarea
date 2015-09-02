define([
    "dijit/Toolbar",
    "dijit/ToolbarSeparator",
    "onlide/dijitutils",
    "onlide/Class"
], function(DijitToolbar, DijitToolbarSeparator, dijitutils, Class){

    'use strict';

    /**
     * @class onlide.ui.Toolbar
     * Представляет класс виджета панели инструментов
     * @extends onlide.base.WidgetBase
     */
    return Class.create({

        className: "onlide.ui.Toolbar",
        baseClass: dijitutils.DijitWidgetBase,
        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         */
        constructor: function Toolbar(params){
            params = params || {};
            dijitutils.DijitWidgetBase.call(this, {
                    id: params.id,
                    dijitWidget: new DijitToolbar()
            });
        },

        /**
         * @method addWidget
         * Добавляет виджет
         * @param {onlide.base.WidgetBase} widget виджет
         */
        addWidget: function(widget){
            this._dijitWidget.addChild(
                dijitutils.toDijitWidget(widget)._dijitWidget);
        },

        /**
         * @method removeWidget
         * Удаляет виджет
         * @param {onlide.base.WidgetBase} widget удаляемый виджет
         */
        removeWidget: function(widget){
            var self = this;
            this._dijitWidget.getChildren().some(function(item){
                if(widget === dijitutils.orig(item)){
                    self._dijitWidget.removeChild(item);
                    return true;
                }
                return false;
            });
        },

        /**
         * @method addSeparator
         * Добавляет разделитель после последнего добавленного виджета
         */
        addSeparator: function(){
            this._dijitWidget.addChild(new DijitToolbarSeparator());
        }

    });


});

