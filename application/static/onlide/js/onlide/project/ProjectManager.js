define([
    "dijit/Dialog",
    "onlide/project/ServerProjectModel",
    "onlide/project/ProjectView",
    "onlide/ui/MainUILayout",
    "onlide/ui/MenuBar",
    "onlide/Class",
    "q/q"
], function(Dialog, ProjectModel, ProjectView, MainUILayout, MenuBar, Class, Q){

    'use strict';

    var ProjectManager, OpenFileManager, ProjectListDialog;

    ProjectListDialog = Class.create({

        constructor: function ProjectListDialog(){

            var self = this;

            this.listbox = document.createElement("select");
            this.listbox.setAttribute("size", "10");

            this.listbox.style.width = "90%";
            this.listbox.style.overflow = "auto";
            this.listbox.addEventListener("change", function(){
                self.okButton.disabled = self.listbox.selectedIndex < 0;
            });
            this.listbox.addEventListener("dblclick", function(){
                self.okDefer.resolve(self.listbox.options[self.listbox.selectedIndex].value);
                self.dialog.hide();
            });

            this.okDefer = null;

            this.okButton = document.createElement("button");
            this.okButton.style.margin = "5px";
            this.okButton.innerHTML = "Загрузить";
            this.okButton.addEventListener("click", function(){
                self.okDefer.resolve(self.listbox.options[self.listbox.selectedIndex].value);
                self.dialog.hide();
            });

            this.dialog = new Dialog({
                title: "Список ваших проектов",
                content: [this.listbox, this.okButton],
                onClose: function(){
                    self.okDefer.reject();
                    return true;
                },
                style: {
                    textAlign: "center",
                    minWidth: "30%"
                }
            });
        },

        show: function(){

            var self= this, option, i = this.listbox.length;

            this.okDefer = Q.defer();
            this.okButton.disabled = true;

            while(i--){
                this.listbox.remove(i);
            }

            this.dialog.show();

            ProjectManager.getProjectModel().getProjectModelList()
            .then(
                function(projectList){
                    projectList.forEach(function (name) {
                        option = document.createElement("option");
                        option.text = name;
                        self.listbox.add(option);
                    });
                }
            );

            return this.okDefer.promise;
        }

    });

    /**
     * @class onlide.project.ProjectManager
     * Представляет статический класс, объединяющий модель проекта и его представление, а т.ж
     * добавляющий действия в главное меню (такие как открытие и сохранение проекта) и в контекстное
     * меню представления проекта (такие как добавление файла, каталога, удаление элемента,
     * переименовывание)
     * @extends onlide.base.EventEmitter
     */
    ProjectManager = Class.createStatic( "onlide.project.ProjectManager", {

        initialize: function(TextEditorClass){

            var self = this;

            this._project = new ProjectModel();
            this._view = new ProjectView({project: this._project});
            this._TextEditorClass = TextEditorClass;
            this._EditorClassList = [];
            this._openedFiles = {};
            this._types = {};
            this._projectListDialog = new ProjectListDialog();

            this.setProjectViewPane(MainUILayout.workspace.getDefaultPane("left"));
            this.setEditorPane(MainUILayout.workspace.getDefaultPane("center"));

            this.registerEditorClass(TextEditorClass);

            // Добавление действий в главное меню
            MainUILayout.mainMenus.file.addItem(new MenuBar.Action({
                id: "file.loadproject",
                label: "Открыть проект",
                onClick: function(){
                    self._projectListDialog.show()
                    .then(
                        function(projectName){

                            // Надо также будет здесь учесть смену модели
                            if(self._project.loaded && self._project.name === projectName){
                                alert("Этот проект уже открыт");
                                return;
                            }

                            if(!projectName){
                                return;
                            }

                            self.commitAll(true)
                            .then(
                                function(){

                                    console.log("Загружается проект '"+projectName+"'");
                                    console.time("Проект '"+projectName+"' загружен");
                                    self._project.loadProject(projectName)
                                        .then(
                                        function(){
                                            self.showProjectView(true);
                                            console.timeEnd("Проект '"+projectName+"' загружен");
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            }));

            MainUILayout.mainMenus.file.addItem(new MenuBar.Action({
                id: "file.saveproject",
                label: "Сохранить проект",

                onBeforeOpenParent: function(){
                    this.setEnable(Object.keys(self._openedFiles).length > 0);
                },

                onClick: function(){
                    console.log("Сохранение проекта...");
                    console.time("Проект сохранен");
                    self.commitAll()
                    .then(
                        function(){
                            console.timeEnd("Проект сохранен");
                        }
                    );
                }
            }));

            MainUILayout.mainMenus.view.addItem(new MenuBar.Action({
                id: "view.showprojroot",
                label: "Дерево проекта",
                type: "checked",
                checked: false,

                onBeforeOpenParent: function(){
                    this.setChecked(self.projectViewShown());
                },

                onClick: function(){
                    self.showProjectView(this.isChecked());
                }
            }));

            var contextMenu = this._view.getContextMenu();
            /* Добавление основных действий в контекстное меню */

            // Меню с действиями для добавления файла и каталога
            contextMenu.addItem(new MenuBar.Menu({
                id: "tree.add",
                label: "Добавить",
                onBeforeOpenParent: function(){
                    var targets = self._view.getTargets();
                    this.setVisible(targets.length === 1 && targets[0].folder);
                },
                items: [
                    // Добавить файл
                    new MenuBar.Action({
                        id: "tree.add.file",
                        label: "Файл",

                        onClick: function(){
                            var target = self._view.getTargets()[0],
                                name = prompt("Введите имя нового файла"),
                                path = target.path;

                            if(!name){
                                return;
                            }

                            if(path !== ""){
                                path += "/";
                            }

                            self._project.createFile(path + name, "");
                        }
                    }),
                    // Добавить каталог
                    // Добавить файл
                    new MenuBar.Action({
                        id: "tree.add.folder",
                        label: "Каталог",

                        onClick: function(){
                            var target = self._view.getTargets()[0],
                                name = prompt("Введите имя нового каталога"),
                                path = target.path;

                            if(!name){
                                return;
                            }

                            if(path !== ""){
                                path += "/";
                            }

                            self._project.createFolder(path + name);
                        }
                    })
                ],


            }));

            contextMenu.addItem(new MenuBar.Action({
                id: "tree.remove",
                label: "Удалить",
                onBeforeOpenParent: function(){
                    this.setVisible(self._view.getTargets().every(function(entry){
                        return entry.path !== "";
                    }));
                },
                onClick: function(){

                    if(!confirm("Вы уверены, что хотите удалить выбранные элементы?")){
                       return;
                    }

                    self._view.getTargets().forEach(function(entry){
                        self._project.remove(entry.path);
                    });
                }
            }));

            // Переименовывание элементов
            contextMenu.addItem(new MenuBar.Action({
                id: "tree.rename",
                label: "Переименовать",
                onBeforeOpenParent: function(){
                    var targets = self._view.getTargets();
                    this.setVisible(targets.length === 1 && targets[0].path !== "");
                },
                onClick: function(){

                    var newName, target, newPath;
                    target = self._view.getTargets()[0];

                    newName = prompt("Введите новое имя", target.name);

                    if(newName === null || newName === target.name){
                        return;
                    }

                    if(!/^[^\/]+$/.test(newName)){
                        alert("Некорректное имя!");
                        return;
                    }

                    newPath = target.path.split("/").slice(0, -1).join("/");

                    if(newPath !== ""){
                        newPath += "/";
                    }

                    newPath += newName;

                    self._project.move(target.path, newPath, false, false);
                }
            }));

            this._view.on("fileDoubleClick", function(e){
                self.openFile(e.file);
            });
        },

        commitAll: function(close){

            var keys, count, self, defer;

            defer = Q.defer();
            self = this;
            keys = Object.keys(this._openedFiles);
            count = keys.length;

            if(count === 0){
                return Q.resolve();
            }

            keys.forEach(function(key){
                self._openedFiles[key].editor.commit()
                .then(
                    function(){
                        --count;
                        if(close) {
                            self._openedFiles[key].editor.canCommit = false;
                            self._editorPane.removeWidget(self._openedFiles[key].editor);
                            self._openedFiles[key].onCloseTab();
                        }
                        if(count === 0){
                            defer.resolve();
                        }
                    }
                );
            });

            return defer.promise;
        },

        projectViewShown: function(){
            return this.getProjectModelViewPane().hasWidget(this._view);
        },

        showProjectView: function(show){

            if(show && this._viewPane && !this.projectViewShown()){
                this.getProjectModelViewPane().addWidget(this._view, "Дерево проекта");
            }else if(!show && this.projectViewShown()){
                this.getProjectModelViewPane().removeWidget(this._view);
            }

        },

        setProjectViewPane: function(tabPane){

            var self= this, show = false;

            if(this._viewPane) {
                show = this.projectViewShown();
                this._viewPane.removeWidget(this._view);
            }

            this._viewPane = tabPane;

            if(tabPane) {
                if(show) {
                    this._viewPane.addWidget(this._view, "Дерево проекта");
                }
            }
        },

        setEditorPane: function(tabPane){

            var self = this;

            Object.keys(this._openedFiles).forEach(function(path){
                if(self._editorPane){
                    self._editorPane.removeWidget(self._openedFiles[path].editor);
                }
                tabPane.addWidget(
                    self._openedFiles[path].editor, path, self._openedFiles[path].onCloseTab
                );
            });

            this._editorPane = tabPane;
        },

        getProjectModelViewPane: function(){
            return MainUILayout.workspace.getDefaultPane("left");//this._viewPane;
        },

        getEditorPane: function(){
            return this._editorPane;
        },

        setProjectModel: function(project){

            var self = this;

            this.commitAll(true)
            .then(
                function(){
                    self._project = project;
                    self._view.setProjectModel(project);
                }
            );
        },

        /**
         *
         */
        getProjectModel: function(){
            return this._project;
        },

        /**
         *
         */
        getView: function(){
            return this._view;
        },

        /**
         * @method setTextEditorClass
         * Устанавливает класс текстового редактора
         * @param {Function} TextEditorClass класс текстового редактора
         */
        setTextEditor: function(TextEditorClass){
            this._TextEditorClass = TextEditorClass;
        },

        /**
         * @method registerEditorClass
         * Регистрирует класс редактора файлов
         * @param {Function} EditorClass класс редактора  
         */
        registerEditorClass: function(EditorClass){
            this._EditorClassList.push(EditorClass);
        },

        openFileInEditor: function (file, EditorClass) {

            var editor = new EditorClass({file: file}), self = this, onAfterMove ,onCloseTab,
                onAfterRemove, onWidgetRemoved;

            // После перемещения файла или его переименовывания, нужно поменять заголовок
            // закладки. Также, нужно изменить путь и имя в объекте, представляющего файл
            onAfterMove = function(e){

                var openFileInfo;

                if(file.path === e.where){
                    openFileInfo = self._openedFiles[e.what]
                    delete self._openedFiles[e.what];
                    self._openedFiles[file.path] = openFileInfo;
                    self._editorPane.setTabCaption(editor, file.path);
                }
            };

            onAfterRemove = function(e){
                if(e.path === file.path){
                    editor.canCommit = false;
                    self._editorPane.removeWidget(editor);
                    //self._openedFiles[file.path].onCloseTab();
                }
            };

            // Так сработает только при закрытии вкладки
            /*onCloseTab = function(){
                editor.commit();
                delete self._openedFiles[file.path];
                self._project.off("afterMove", onAfterMove);

                if(self._project.hasHandler("afterRemove", onAfterRemove)) {
                    self._project.off("afterRemove", onAfterRemove);
                }
            };*/

            onWidgetRemoved = function(e){
                if(e.widget === editor){
                    editor.commit();
                    delete self._openedFiles[file.path];
                    self._project.off("afterMove", onAfterMove);

                    if(self._project.hasHandler("afterRemove", onAfterRemove)) {
                        self._project.off("afterRemove", onAfterRemove);
                    }
                }
            }

            this._openedFiles[file.path] = {
                editor: editor,
                onCloseTab: onCloseTab
            };

            this._project.on("afterMove", onAfterMove);
            this._editorPane.on("widgetRemoved", onWidgetRemoved, true);
            this._project.on("afterRemove", onAfterRemove, true);

            this._editorPane.addWidget(editor, file.path/*, onCloseTab*/);
            editor.read();
        },

        /**
         * @method openFile
         * Открывает файл в подходящем редакторе, если такой есть
         * @param {onlide.project.File} file открываемый файл
         * @fires fileOpened
         */
        openFile: function(file){

            if(this._openedFiles[file.path]){
                this._editorPane.selectWidget(this._openedFiles[file.path].editor);
                return;
            }

            var EditorClass = null;

            this._EditorClassList.some(function(item){
                if(item.supports(file)){
                    EditorClass = item;
                    return true;
                }
                return false;
            });

            if(!EditorClass){
                if(confirm("Для данного расширения нет подходящего редактора." +
                        " Открыть его в текстовом редакторе?")){
                    this.openFileAsText(file);
                }
            }else {
                this.openFileInEditor(file, EditorClass);
            }
        },

        /**
         * @method openFileAsText
         * Открывает файл в текстовом редакторе
         * @param {onlide.project.File} file открываемый файл
         * @fires fileOpened
         */
        openFileAsText: function(file){
            this.openFileInEditor(file, this._TextEditorClass);
        },

        /**
         * @method registerProjectType
         * Регистрирует новый тип проекта
         * @param {String}   type тип проекта. Должно быть уникальным
         * строковым значением
         * @param {Function} configurator конфигуратор проекта
         * @param {Object} configurator.configs настройки
         * @static
         */
        registerProjectType: function(type, configurator){
            this._types[type] = configurator;
        }

    });

    return ProjectManager;
});





