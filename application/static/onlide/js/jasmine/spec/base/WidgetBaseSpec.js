define(["onlide/base/WidgetBase"], function() {
    describe("Тестирование onlide.base.WidgetBase", function () {

        it("Должен создать два виджета с указанным и сгенерированным id",
            function () {

            var widget1 = new onlide.base.WidgetBase({id: "widget"}),
                widget2 = new onlide.base.WidgetBase();

            expect(widget1.getId()).toBe("widget");
            expect(widget2.getId()).toMatch(/^widget_(0|[1-9][0-9]*)$/);
        });

    });
});