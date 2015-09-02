
define([
    "onlide/Class",
    "onlide/base/EventEmitter",
    "q/q"
], function(Class, EventEmitter, Q){

    'use strict';

    var ProjectModel = Class.create({

        className: "onlide.project.ProjectModel",
        baseClass: EventEmitter,

        constructor: function(){
            EventEmitter.call(this);

            this.name = null;
            this.type = null;
            this.configs = null;
            this.loaded = false;

            this.registerEvents([
                "beforeChangeConfig", "afterChangeConfig",
                "beforeChangeConfigs", "afterChangeConfigs",
                "beforeLoad", "afterLoad", "faliedToLoad",
                "beforeReadFile", "afterReadFile", "failedToReadFile",
                "beforeReadFolder", "afterReadFolder", "failedToReadFolder",
                "beforeWriteFile", "afterWriteFile", "failedToWriteFile",
                "beforeMove", "afterMove", "failedToMove",
                "beforeRemove", "afterRemove", "failedToRemove",
                "beforeCreateFile", "afterCreateFile", "failedToCreateFile",
                "beforeCreateFolder", "afterCreateFolder", "failedToCreateFolder",
            ]);
        },

        getProjectModelList: function(){
            return Q.reject();
        },

        /**
         * @method createProject
         * Создает новый проект
         * @param {String} name путь к проекту, включая его имя
         * @param {String} type     тип проекта
         * @param {Object} configs  настройки проекта
         * @fires projectCreated
         */
        createProject: function(name, type, configs){
            return Q.reject();
        },

        removeProject: function(name){
            return Q.reject();
        },

        loadProject: function(name){
            return Q.reject();
        },

        setConfig: function(name, value){
            return Q.reject();
        },

        setConfigs: function(configs){
            return Q.reject();
        },

        readFile: function(path){
            return Q.reject();
        },

        readFolder: function(path){
            return Q.reject();
        },

        writeFile: function(path, data){
            return Q.reject();
        },

        move: function(what, where, copy, overwrite){
            return Q.reject();
        },

        remove: function(path){
            return Q.reject();
        },

        createFile: function(path, data){
            return Q.reject();
        },

        createFolder: function(path){
            return Q.reject();
        },

        exist: function(what){
            return Q.reject();
        }
    });

    return ProjectModel;
});