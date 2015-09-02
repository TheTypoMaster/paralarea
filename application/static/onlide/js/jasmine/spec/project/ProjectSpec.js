
define([
    "onlide/project/Project"
], function(Project){

    function getDecide(permit){
        return function(decide){
            decide(permit);
        };
    }

    describe("Тестирование Project", function(){

        it("Должен добавить элементы в проект", function(){
            var project = new Project("myproject", "c/c++", {
                compiler: "g++"
            }, null);

            project.createFolder("item1");
            project.createFolder("item2");
            project.appendFile("item2/item3");
            project.createFolder("item2/item4");

            expect(project.getItem("item1")).toBeDefined();
            expect(project.getItem("item2")).toBeDefined();
            expect(project.getItem("item2/item3")).toBeDefined();
            expect(project.getItem("item2/item4")).toBeDefined();
        });

        it("Должен не добавлять элемент в каталог, " +
            "уже содержащий элемент с таким именем", function(){

            var project = new Project("myproject", "c/c++", {
                compiler: "g++"
            }, null);

            var test = false;

            project.on("appendFailed", function(e){
                test = true;
            });

            project.createFolder("item1");
            project.appendFile("item1/item2");
            project.appendFile("item1/item2");

            expect(test).toBe(true);
        });

        it("Должен переместить элемент в каталог, не содержащий " +
            "элемент с таким же именем", function(){

            var project = new Project("myproject", "c/c++", {
                compiler: "g++"
            }, null);

            project.createFolder("item1", true);
            project.appendFile("item2");
            project.appendFile("item1/item3");

            project.move("item2", "item1");

            expect(project.getItem("item2")).toBe(null);
            expect(project.getItem("item1/item2")).toBeDefined();
        });

        it("Должен скопировать элемент в каталог, не содержащий " +
            "элемент с таким же именем", function(){

            var project = new Project("myproject", "c/c++", {
                compiler: "g++"
            }, null);

            project.createFolder("item1", true);
            project.appendFile("item2");
            project.appendFile("item1/item3");

            project.move("item2", "item1", true);

            expect(project.getItem("item2")).toBeDefined();
            expect(project.getItem("item1/item2")).toBeDefined();

        });

        it("Должен заменить файл", function () {

            var project = new Project("myproject", "c/c++", {
                    compiler: "g++"
                }, null),
                orig = Project.permitReplacement;

            project.createFolder("item1");
            project.appendFile("item2");
            project.appendFile("item1/item2");

            Project.permitReplacement = function (decide) {
                decide(true);
            };

            var item = project.getItem("item2");

            project.move("item2", "item1");

            expect(project.getItem("item1/item2")).toBe(item);

            Project.permitReplacement = orig;
        });

        it("Должен перенести содержимое каталога в " +
            "другой каталог, а т.ж. выполнить замену", function () {

            var project = new Project("myproject", "c/c++", {
                    compiler: "g++"
                }, null),
                orig = Project.permitReplacement;


            project.createFolder("item1");
            project.createFolder("item2");
            project.createFolder("item1/item2");
            project.appendFile("item1/item2/item3");
            project.appendFile("item1/item2/item4");
            project.appendFile("item2/item3");
            project.appendFile("item2/item5");

            var item = project.getItem("item2/item3");

            Project.permitReplacement = getDecide(true);
            project.move("item2", "item1");

            expect(project.getItem("item1/item2/item3")).toBe(item);
            expect(project.getItem("item1/item2/item5")).toBeDefined();

            Project.permitReplacement = orig;
        });

        it("Должен перенести содержимое каталога в " +
            "другой каталог и оставить исходный с элементом, который" +
            " не заменил элемент в целевом", function () {

            var project = new Project("myproject", "c/c++", {
                    compiler: "g++"
                }, null),
                orig = Project.permitReplacement;


            project.createFolder("item1");
            project.createFolder("item2");
            project.createFolder("item1/item2");
            project.appendFile("item1/item2/item3");
            project.appendFile("item1/item2/item4");
            project.appendFile("item2/item3");
            project.appendFile("item2/item5");

            var item = project.getItem("item2/item3");

            Project.permitReplacement = getDecide(false);
            project.move("item2", "item1");

            expect(project.getItem("item2/item3")).toBeDefined();
            expect(project.getItem("item1/item2/item3") === item).toBe(false);

            Project.permitReplacement = orig;
        });
    });
});