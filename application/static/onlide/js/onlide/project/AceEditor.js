define([
    "onlide/project/EditorBase",
    "ace/ace",
    "ace/ext/modelist",
    "onlide/Class"
], function(EditorBase, ace, modelist, Class){

    'use strict';

    /**
     * @class onlide.project.AceEditor
     * Класс редактора файлов - Ace
     * @extends onlide.project.EditorBase
     */
    return Class.create({

        className: "onlide.project.AceEditor",
        baseClass: EditorBase,

        /**
         * @method constructor
         * Конструктор
         * @param {params}
         * @param {Object} params.file редактируемый файл
         * @param {String} [params.id] уникальный идентификатор
         */
        constructor: function AceEditor(params){

            this._domNode = document.createElement("div");

            this._domNode.style.top  = "0px";
            this._domNode.style.bottom  = "0px";
            this._domNode.style.left  = "0px";
            this._domNode.style.right  = "0px";
            this._domNode.style.position  = "absolute";

            this._editor = ace.edit(this._domNode);
            this.setReadOnly(true);

            this._editor.getSession().setMode(modelist.getModeForPath(
                    params.file.name
                ).mode);
            this._editor.setValue("Пожалуйста, подождите...");

            AceEditor.Base.call(this, params);

            this.on("placed", function(){
                this._editor.resize(true);
            });
        },

        setReadOnly: function(readonly){
            this._editor.setReadOnly(readonly);
        },

        resize: function(){
            this._editor.resize(true);
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

            this._editor.setValue(data);
            this._editor.setReadOnly(false);
        },

        /**
         * @method toFileData
         * Конвертирует данные редактора в строку для последующего
         * сохранения в редактируемый файл
         * @abstract
         * @return {String} данные файла
         */
        toFileData: function(){
            return this._editor.getValue();
        },

        statics: {
            supports: function(file){
                var mode = modelist.getModeForPath(file.name);
                if(mode.name === "text"){
                    return (file.name.split(".").pop() === "txt");
                }
                return true;
            }
        }
    });
});





