

define([
    "onlide/modules",
    "onlide/project/CodeMirrorEditor"
], function(){

    'use strict';

    onlide.Class.createStatic("onlide.App", {

        /**
         * @property {String} version
         * Версия Onlide
         */
        version: "0.0.0",

        /**
         * @method initialize
         * Инициализация
         */
        initialize: function(){
            console.log("Инициализация приложения");
            console.time("Инициализация приложения завершена");

            onlide.ui.MainUILayout.initialize();
            onlide.project.ProjectManager.initialize(
                onlide.project.CodeMirrorEditor
            );

            console.timeEnd("Инициализация приложения завершена");
        }
    });


    return onlide.App;
});





