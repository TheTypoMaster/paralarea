
define([
    "dijit/layout/ContentPane",
    "onlide/dijitutils",
    "onlide/Class"
], function(ContentPane, dijitutils, Class){

    'use strict';

    /**
     * @class Pane
     * Представляет виджет панели для отображения html-контента
     */
    return Class.create({
        className: "onlide.ui.Pane",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         * @param {DOMNode|String} [params.content] отображаеый контент
         * @param {Function} [params.onClick] обработчик нажатия по панели
         */
        constructor: function Pane(params){
            params = params || {};

            var opts = {content: params.content || ""};
            if(params.onClick){
                opts.onClick = params.onClick.bind(this);
            }

            params.dijitWidget = new ContentPane(opts);

            Pane.Base.call(this, params);
        },

        /**
         * @method setContent
         * Устанавливает отображаемый контент
         * @param {DOMNode|String} content контент
         */
        setContent: function(content){
            this._dijitWidget.set("content", content);
        },
        /**
         * @method getContent
         * Возвращает контент
         * @return {DOMNode|String}
         */
        getContent: function(){
            return this._dijitWidget.content;
        }
    });
});