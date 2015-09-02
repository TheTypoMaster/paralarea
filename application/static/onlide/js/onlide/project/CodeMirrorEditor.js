define([
    "onlide/ui/MenuBar",
    "onlide/ui/MainUILayout",
    "codemirror/lib/codemirror",
    "onlide/Class",
    "onlide/project/EditorBase",
    "codemirror/mode/meta"
], function(MenuBar, MainUILayout, CodeMirror, Class, EditorBase){

    'use strict';

    var link = document.createElement("link"), themes, themesMenu, themeName;

    link.setAttribute("rel", "stylesheet");
    document.head.appendChild(link);

    function loadTheme(theme){
        link.setAttribute("href", "static/onlide/js/codemirror/theme/"+theme+".css");
        themeName = theme;
    }

    loadTheme("ambiance");

    themes = [
        "3024-day", "3024-night", "ambiance", "base16-dark", "base16-light", "cobalt", "eclipse",
        "midnight", "monokai", "twilight"
    ];

    themesMenu = new MenuBar.Menu({
        id: "view.codemirror.themes",
        label: "Темы"
    });

    themes.forEach(function(theme){
        themesMenu.addItem(new MenuBar.Action({
            id: "view.codemirror.themes." + theme,
            label: theme,
            onClick: function(){
                loadTheme(theme);
            }
        }));
    });

    function addEditorMenu(){
        MainUILayout.mainMenus.view.addItem(new MenuBar.Menu({
            id: "view.codemirror",
            label: "Редактор CodeMirror",
            items: [themesMenu]
        }));
    }

    if(MainUILayout.initialized){
        addEditorMenu();
    }else{
        MainUILayout.addInitializeHandler(addEditorMenu);
    }



    /**
     * @class onlide.project.CodeMirrorEditor
     * Класс редактора файлов - CodeMirror
     * @extends onlide.base.WidgetBase
     */
    return Class.create({

        className: "onlide.project.CodeMirrorEditor",
        baseClass: EditorBase,

        /**
         * @method constructor
         * Конструктор
         * @param {params}
         * @param {Object} params.file редактируемый файл
         * @param {String} [params.id] уникальный идентификатор
         */
        constructor: function CodeMirrorEditor(params){

            var self = this;

            this._editor = CodeMirror(function(el){
                    self._domNode = el;
                    self._domNode.style.height = "100%";
                },
                {
                    readOnly: true,
                    lineNumbers: true,
                    value: "Данные загружаются. Пожалуйста, подождите...",
                    theme: themeName
                }
            );

            var mode = CodeMirror.findModeByFileName(params.file.name);

            if(mode) {
                // если mode === "null", то файл определился как Plain Text
                if (mode.mode !== "null") {
                    require(["codemirror/mode/" + mode.mode + "/" + mode.mode],
                        function () {
                            self._editor.setOption(
                                "mode", (mode.mime === "null" ?
                                    mode.mode : mode.mime)
                            );
                        }
                    );
                } else {
                    self._editor.setOption("mode", mode.mime);
                }
            }else{
                self._editor.setOption("mode", "text/plain");
            }
            CodeMirrorEditor.Base.call(this, params);
        },

        setReadOnly: function(reaonly){
            this._editor.setOption("readOnly", reaonly);
        },

        resize: function(){
            this._editor.refresh();

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
            this._editor.setOption("readOnly", false);
            this._editor.refresh();
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

        /**
         * @method dataChanged
         * Возвращает true, если данные файла были изменены в редакторе.
         * Перегружаемый метод, по-умолчанию всегда возращает true
         * @return {Boolean} если данные файла изменены, вернет true
         */
        dataChanged: function(){
            return true;
        },

        statics: {
            supports: function(file){
                return !!CodeMirror.findModeByFileName(file.name);
            }
        }
    });
});