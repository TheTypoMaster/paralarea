define([
    "dojo/dom-construct",
    "onlide/Class",
    "onlide/base/EventEmitter"
], function(dom, Class, EventEmitter) {

    'use strict';

    var _count = 0;

    /**
     * @class onlide.base.WidgetBase
     * Представляет базовый класс для виджетов
     * @extends onlide.base.EventEmitter
     */
    return Class.create({

            className: "onlide.base.WidgetBase",
            baseClass: EventEmitter,

            /**
             * @method constructor
             * Конструктор
             * @param {String} [id] уникальный идентификатор. Если не указан,
             * то будет сгенерирован. Сгенерированный id соотвествует следующему
             * шаблону: "widget_" + N, где N - число, начиная с 0, которое
             * увеличивается после генерации.
             * Это именно идентификатор виджета, и id dom-узла, которым он
             * представлен, не обязательно равен id виджета
             */
            constructor: function WidgetBase(params){

                params = params || {};

                var id = params.id;

                WidgetBase.Base.call(this);

                if(!id){
                    id = "widget_" + (_count++).toString();
                }

                this._id= id;
                this._placed = false;

                this.registerEvent("placed");
            },


            /**
             * @method getId
             * Возвращает идентификатор виджета
             * @return {String} идентификатор
             */
            getId: function(){
                return this._id;
            },

            getDomNode: function(){
                return null;
            },

            placed: function(){
                return this._placed; // !!this.getDomNode().parentNode;
            },

            /**
             * @method place
             * Размещает виджет внутри блочного dom-узла
             * @param {DOMNoode|String} dstDomNode идентификатор dom-узла
             * или сам узел, относительно которого будет происходить
             * размещение
             * @param {"before"/"after"/"replace"/"inside"} pos как
             * разместить виджет
             * @fires placed
             */
            place: function(dstDomNode, pos){
                pos = pos || "inside";
                if(pos === "inside"){
                    pos = "only";
                }
                dom.place(this.getDomNode(), dstDomNode, pos);

                this._placed = true;

                this.emit("placed", {
                    dstDomNode: dstDomNode,
                    pos: pos
                });
            },

            /**
             * @method resize
             * Данный метод реализуются для виджетов, которым нужно как-то обновляться после
             * изменения размеров родительского виджета (если такой есть). Данный метод,
             * например, вызывается в Layout после изменения размера контейнера виджета.
             * По-умолчанию ничего не делает
             */
            resize: function(){
            }

            /**
             * @event placed
             * Вызывается после размещения виджета
             * @param dstDomNode
             * @param pos
             */

        });



});