console.log("Загрузка модулей");
console.time("Модули загружены");
define([
    "onlide/Class",

    "onlide/base/EventEmitter",
    "onlide/base/WidgetBase",

    "onlide/ui/Pane",
    "onlide/ui/Layout",
    "onlide/ui/TabPane",
    "onlide/ui/MenuBar",
    "onlide/ui/Statusbar",
    "onlide/ui/Toolbar",
    "onlide/ui/Workspace",
    "onlide/ui/MainUILayout",

    "onlide/project/EditorBase",
    "onlide/project/ProjectModel",
    "onlide/project/ProjectView",
    "onlide/project/ProjectManager",

], function(){
    'use strict';
    console.timeEnd("Модули загружены");
});




