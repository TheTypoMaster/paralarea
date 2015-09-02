define([
    "onlide/Class",
    "onlide/base/WidgetBase",
    "onlide/project/ProjectManager",
    "q/q"
], function(Class, WidgetBase, ProjectManager, Q){

    'use strict';

    /**
     * @class onlide.project.EditorBase
     * Базовый класс редактора файлов
     * @extends onlide.base.WidgetBase
     */
    return Class.create({

        className: "onlide.project.EditorBase",
        baseClass: WidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {params}
         * @param {Object} params.file редактируемый файл
         * @param {String} [params.id] уникальный идентификатор
         */
        constructor: function EditorBase(params){

            EditorBase.Base.call(this, params);
            this.file = params.file;
            this.canCommit = true;
        },



        read: function(){

            var self = this, defer;

            if(this.file.write){

                defer = Q.defer();

                ProjectManager.getProjectModel().on("afterWriteFile", function(e){
                    if(e.path === self.file.path){
                        self.initialize(self.preprocessor(e.data));
                        defer.resolve();
                    }
                }, true);

                return defer.promise;
            }

            return ProjectManager.getProjectModel().readFile(this.file.path)
                .then(
                function(result){
                    self.initialize(this.preprocessor(result.data));
                    return Q.resolve();
                }.bind(this)
            );
        },

        preprocessor: function(data){
          return data;
        },

        /**
         * @method initialize
         * Здесь реализуется инициализация редактора. Данный метод будет
         * вызван после чтения файла
         * @abstract
         */
        initialize: function(data){
        },

        /**
         * @method toFileData
         * Конвертирует данные редактора в строку для последующего
         * сохранения в редактируемый файл
         * @abstract
         * @return {String} данные файла
         */
        toFileData: function(){
        },

        /**
         * @method dataChanged
         * Возвращает true, если данные файла были изменены в редакторе.
         * Перегружаемый метод, по-умолчанию всегда возращает true
         * @return {Boolean} если данные файла изменены, вернет true
         */
        dataChanged: function(){
            return true;
        },

        setReadOnly: function(readonly){
        },

        /**
         * @method commit
         * Если данные были изменены, то сохранит их в файл
         */
        commit: function(){

            var self = this;

            if(this.canCommit && this.dataChanged()) {
                this.file.write = true;
                this.setReadOnly(true);
                return ProjectManager.getProjectModel().writeFile(this.file.path, this.toFileData())
                .then(
                    function(){
                        self.setReadOnly(false);
                        self.file.write = false;
                        return Q.resolve();
                    }
                );
            }
            return Q.reject();
        },

        statics: {
            supports: function(file){
                return false;
            }
        }
    });
});





