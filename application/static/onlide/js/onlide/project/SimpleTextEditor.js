define([
    "onlide/project/EditorBase",
    "onlide/Class"
], function(EditorBase, Class){

    'use strict';

    /**
     * @class onlide.project.SimpleTextEditor
     * Тестовый
     * @extends onlide.project.EditorBase
     */
    return Class.create({

        className: "onlide.project.SimpleTextEditor",
        baseClass: EditorBase,

        /**
         * @method constructor
         * Конструктор
         * @param {params}
         * @param {Object} params.file редактируемый файл
         * @param {String} [params.id] уникальный идентификатор
         */
        constructor: function SimpleTextEditor(params){

            this._domNode = document.createElement("textarea");
            this._domNode.style.width = "100%";
            this._domNode.style.height = "100%";
            this._domNode.style.margin = "0px";
            this._domNode.style.padding = "0px";
            this._domNode.style.border = "none";

            this.setReadOnly(true);
            this._domNode.value = "Пожалуйста, подождите...";

            SimpleTextEditor.Base.call(this, params);
        },

        setReadOnly: function(readonly){
            this._domNode.readOnly =  readonly;
        },

        getDomNode: function(){
            return this._domNode;
        },

        /**
         * @method initialize
         * Здесь реализуется инициализация редактора. Данный метод будет
         * вызван после чтения файла
         * @abstract
         */
        initialize: function(data){
            this._domNode.value = data;
            this.setReadOnly(false);
        },

        /**
         * @method toFileData
         * Конвертирует данные редактора в строку для последующего
         * сохранения в редактируемый файл
         * @abstract
         * @return {String} данные файла
         */
        toFileData: function(){
            return this._domNode.value;
        }
    });
});





