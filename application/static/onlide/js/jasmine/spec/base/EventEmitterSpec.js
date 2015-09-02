define(["onlide/base/EventEmitter"], function(){
    describe("Тестирование onlide.base.EventEmitter", function(){

        it("Должен добавить обработчики и вызвать их", function(){
            var obj = new onlide.base.EventEmitter();
            var check = { h1:0, h2:0, h3:0};
            var handler1 = function(){ ++check.h1; };
            var handler2 = function(){ ++check.h2; };
            var handler3 = function(){ ++check.h3; };

            obj.registerEvent("event1");
            obj.registerEvent("event2");

            obj.on("event1", handler1);
            obj.on("event1", handler2);
            obj.on("event2", handler2);
            obj.on("event2", handler3);

            obj.emit("event1");
            obj.emit("event2");

            expect(check).toEqual({h1:1, h2:2, h3:1});
        });

        it("Должен добавить обработчик, вызываемый единожды", function(){
            var obj = new onlide.base.EventEmitter();
            var check = 0;
            var handler = function(){ ++check; };

            obj.registerEvent("event");
            obj.on("event", handler, true);

            obj.emit("event");
            obj.emit("event");

            expect(check).toBe(1);
        });

        it("Должен убрать обработчик", function(){
            var obj = new onlide.base.EventEmitter();
            var check = 0;
            var handler = function(){ ++check; };

            obj.registerEvent("event");
            obj.on("event", handler);

            obj.emit("event");
            obj.off("event", handler);
            obj.emit("event");

            expect(check).toBe(1);
        });
    });
});

