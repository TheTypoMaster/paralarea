define(["onlide/Class"], function() {
    describe("Тестирование onlide.Class", function () {

        it("Должен создать пространство имен", function () {
            var ns = onlide.Class.createNamespaces("my.name.space");
            expect(ns).toBeDefined();
            expect(ns).toBe(my.name.space);
        });

        it("Должен создать пустой класс", function () {
            var MyClass = onlide.Class.create({});
            expect(MyClass).toBeDefined();
            var obj = new MyClass();
        });

        it("Должен создать класс с конструктором и свойствами", function () {
            var MyClass = onlide.Class.create({
                constructor: function (foo) {
                    this.foo = foo;
                }
            });
            var obj = new MyClass(42);
            expect(obj.foo).toBe(42);
        });

        it("Должен создать класс с методами", function () {
            var MyClass = onlide.Class.create({

                constructor: function (foo) {
                    this.foo = foo;
                },
                methods: {
                    getFoo: function () {
                        return this.foo;
                    }
                }
            });
            var obj = new MyClass(42);
            expect(obj.getFoo()).toBe(42);
        });

        it("Должен создать класс со статическими членами", function () {
            var MyClass = onlide.Class.create({

                constructor: function MyClass() {
                    ++MyClass.count;
                },
                statics: {
                    count: 0
                }
            });
            var obj = new MyClass();
            expect(MyClass.count).toBe(1);
        });

        it("Должен создать класс внутри пространства имен", function () {
            var MyClass = onlide.Class.create({
                className: "my.Class"
            });
            expect(my.Class).toBeDefined();
            var obj = new my.Class();
        });

        it("Должен создать подкласс", function () {
            var MyClass = onlide.Class.create({
                constructor: function (foo) {
                    this.foo = foo;
                },
                methods: {
                    getFoo: function () {
                        return this.foo;
                    }
                }
            });
            var MySubClass = onlide.Class.create({
                baseClass: MyClass,
                constructor: function (foo) {
                    MyClass.call(this, foo);
                }
            });
            var obj = new MySubClass(42);
            expect(obj.getFoo()).toBe(42);
        });

        it("Должен создать статический класс", function () {
            var MyStaticClass = onlide.Class.createStatic("my.StaticClass", {
                getFoo: function () {
                    return MyStaticClass.foo;
                },
                foo: 42
            });
            expect(MyStaticClass).toBeDefined();
            expect(MyStaticClass).toBe(my.StaticClass);
            expect(MyStaticClass.getFoo()).toBe(42);
        });

    });
});






