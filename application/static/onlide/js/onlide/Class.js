
define(function(){

    'use strict';

    // Корневое пространство имен
    if(typeof window.onlide === "undefined") {
        window.onlide = {};
    }

    /**
     *  @class Class
     *  Представляет методы для создания "классов". Стоит напомнить, что в
     *  javascript классов, в их традицинном понимании, нет
     *  @static
     */
    window.onlide.Class = (function () {

        return {

            mix: function(obj, mixins){

                if(!mixins.forEach){
                    mixins = [mixins];
                }

                mixins.forEach(function(mixin){
                    var key;
                    for(key in mixin){
                        if(mixin.hasOwnProperty(key)){
                            obj[key] = mixin[key];
                        }
                    }
                });
            },

            /**
             * @method getClass
             * Возвращает класс
             * @param {String} className имя класса, включая простарнство имен
             * @return {Function?} конструктор класса или null, если такого нет
             */
            getClass: function(className){
                var parts, target;

                target = window;
                parts = className.split(".");
                parts.every(function(part){
                    target = target[part];
                    return target;
                });
                return target;
            },

            /**
             * @method createNamespaces
             * Создает пространства имен. Не заменяет уже существующие объекты
             * @param {String} namespaces имена пространств имен, разделенных
             * точкой
             * @return {Object} последнее указанное пространство имен
             */
            createNamespaces: function(namespaces){
                var parts, i, len, current, next;

                current = window;
                parts = namespaces.split(".");

                for(i=0, len=parts.length; i<len; ++i){
                    next = current[parts[i]];
                    if(typeof next === "undefined"){
                        current[parts[i]] = next = {};
                    }
                    current = next;
                }
                return current;
            },

            /**
             * @methods create
             * Создает новый класс
             * @param {Object} desc описание класса
             * @param {String} [desc.fullName] имя класса. Включает пространство
             * имен
             * @param {Function|Object|null} [desc.baseClass] базовый класс
             * @param {Function} [desc.constructor] конструктор
             * @param {Object} [desc.methods] методы, создаваемые в прототипе
             * @param {Object} [desc.statics] статические свойства и методы
             * @return {Function} конструктор созданного класса
             */
            create: function (desc) {
                var parts, namespaces, namespace, New, statics, constructor, prop, name,
                    className, baseClass;

                className = desc.className;
                delete desc.className;
                baseClass = desc.baseClass;
                delete desc.baseClass;
                constructor = desc.hasOwnProperty("constructor") ?
                    desc.constructor : function(){};
                delete desc.constructor;
                statics = desc.statics || {};
                delete desc.statics;

                New = constructor;

                if(typeof baseClass === "string"){
                    baseClass = this.getClass(baseClass);
                }

                // наследуем базовый "класс", если такой есть
                if(baseClass) {
                    New.prototype = Object.create(baseClass.prototype);
                    New.Base = baseClass;
                }
                New.prototype.constructor = New;

                // создаем класс в глобальном пространстве имен
                if(className){
                    parts = className.split(".");
                    name = parts.pop();
                    namespaces = parts.join(".");
                    namespace = this.createNamespaces(namespaces);
                    namespace[name] = New;
                }

                // добавляем методы...
                for(prop in desc){
                    if(desc.hasOwnProperty(prop)){
                        New.prototype[prop] = desc[prop];
                    }
                }
                // ...и статические члены
                for(prop in statics){
                    if(statics.hasOwnProperty(prop)){
                        New[prop] = statics[prop];
                    }
                }
                return New;
            },

            /**
             * @methods createStatic
             * Создает статический класс
             * @param className имя, включая пространство имен
             * @param statics статические члены
             * @return {Object} статический класс
             */
             createStatic: function(className, statics){
                var namespaces, ns;
                if(typeof className === "string") {
                    namespaces = className.split(".");
                    className = namespaces.pop();
                    namespaces = namespaces.join(".");
                    ns = this.createNamespaces(namespaces);
                    ns[className] = statics;
                }
                return statics;
             }
        };
    }());

    return window.onlide.Class;
});







