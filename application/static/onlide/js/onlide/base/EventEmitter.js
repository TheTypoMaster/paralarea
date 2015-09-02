define([
    "onlide/Class"
], function(Class) {

    /**
     * @class onlide.base.EventEmitter
     * Является базовым для классов, вызывающих события и предоставляющие
     * возможность подписаться на них
     */
    return Class.create({

        className: "onlide.base.EventEmitter",

        /**
         * @method constructor
         * Конструктор
         */
        constructor: function EventEmitter(){
            this.events = {};
        },
        

        /**
         * @methods hasEvent
         * Проверяет наличие события
         * @param {String} event проверяемое событие
         * @return {Boolean} если событие зарегистрировано, то вернет true,
         * иначе - false
         */
        hasEvent: function(event){
            return typeof this.events[event] !== "undefined";
        },

        /**
         * @methods hasHandler
         * Проверяет наличие обработчика у события
         * @param {String} event событие
         * @param {Function} handler проверяемый обработчик
         * @return {Boolean} если указанный обработчик присутствует, то
         * вернет true, иначе - false
         */
        hasHandler: function(event, handler){
            return this.events[event].some(function(item){
                return item.handler === handler;
            });
        },

        /**
         * @method registerEvent
         * Регистрирует событие. Событие не будет добавлено, если оно уже
         * зарегистрировано
         * @param {String} event идентификатор регистрируемого события
         */
        registerEvent: function (event) {
            if (!this.hasEvent(event)) {
                this.events[event] = [];
            }
        },

        /**
         * @method registerEvents
         * Регистрирует события. События которые уже зарегистрированы,
         * не дублируются
         * @param {String[]} events идентификаторы регистрируемых событий
         */
        registerEvents: function (events) {
            var self = this;

            events.forEach(function(event){
                self.registerEvent(event);
            });
        },

        /**
         * @method emit
         * Вызывает событие. При вызове обработчики получают в качестве
         * контекста this, то есть вызвавший событие объект
         * @param {String} event событие
         * @param {Object} [eventData] данные, передаваемые обработчикам
         * @return {Boolean} если все обработчки были вызваны, то вернет true
         */
        emit: function(event, eventData){
            var handlers, self=this;

            handlers = this.events[event];

            return handlers.slice().every(function(item, index){
                var result = item.handler.call(self, eventData);

                if(item.once){
                    handlers.splice(index, 1);
                }

                if(typeof result === "undefined"){
                    result = true;
                }

                return result;
            });
        },

        /**
         * @method on
         * Добавляет обработчкик события
         * @param {String} event событие
         * @param {Function} handler обработчик
         * @param {Boolean} [once=false] если обработчик должен сработать
         * единожды, то устанавливается в true
         * @return {Function} установленный обработчик
         */
        on: function (event, handler, once) {

            var handlers = this.events[event];

            if (handlers.indexOf(handler) < 0) {
                handlers.push({handler: handler, once: once});
                return handler;
            }
        },

        /**
         * @method off
         * Удаляет обработчкик события
         * @param {String} event событие
         * @param {Function} handler удаляемый обработчик
         */
        off: function (event, handler) {

            this.events[event].some(function(item, i, arr){
                if(handler === item.handler){
                    arr.splice(i,1);
                    return true;
                }
                return false;
            });

        },

        /**
         * @method offAll
         * Удаляет все обработчкики события
         * @param {String} event событие
         */
        offAll: function(event){
            this.events[event] = [];
        }
    });
});
