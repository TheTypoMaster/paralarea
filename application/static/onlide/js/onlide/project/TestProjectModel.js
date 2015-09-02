
define([
    "onlide/Class",
    "onlide/base/EventEmitter",
    "q/q",
    "onlide/project/ProjectModel"
], function(Class, EventEmitter, Q, ProjectModel){

    'use strict';

    var projects = [
        {
            name: "Тестовый проект №1",
            path: "",
            type: "c/c++",
            configs: {},
            entries: [
                {
                    name: "main.cpp", path: "main.cpp", folder: false,
                    data: "int main(){ return 0; }"
                },

                {
                    name: "lib", path: "lib", folder: true,
                    entries: [
                        {name: "lib.h", path: "lib/lib.h", folder: false, data: "// lib.h"},
                        {name: "lib.cpp", path: "lib/lib.cpp", folder: false, data: "// lib.cpp"},
                    ]
                }
            ]
        },

        {
            name: "Тестовый проект №2",
            path: "",
            type: "python",
            configs: {},
            entries: [
                {
                    name: "main.py", path: "main.py", folder: false,
                    data: "# main.py"
                },

                {
                    name: "lib", path: "lib", folder: true,
                    entries: [
                        {name: "lib.py", path: "lib/lib.py", folder: false, data: "# lib.py"},
                        {
                            name: "text.txt", path: "lib/text.txt", folder: false,
                            data: "Просто текст"
                        },
                    ]
                }
            ]
        }
    ];

    var emulation = function(func, min, max){

        var defer = Q.defer();

        min = min || 0;
        max = max || 1000;

        setTimeout(function(){
            func().then(function(result){
                return defer.resolve(result);
            });
        }, min+Math.floor(Math.random()*max));

        return defer.promise;
    }


    var TestProjectModel = Class.create({

        className: "onlide.project.TestProjectModel",
        baseClass: ProjectModel,

        constructor: function(){
            ProjectModel.call(this);

            this._project = null;
        },

        getProjectModelList: function(){
            return emulation(function(){
                return Q.resolve(projects.map(function(project){
                    return project.name;
                }));
            });
        },

        createProject: function(name, type, configs){
            projects.push({
                name: name,
                type: type,
                configs: configs,
                path: "",
                entries: []
            });
        },

        removeProject: function(name){


            return emulation(function(){
                projects.some(function(project, i){
                    if(project.name === name){
                        projects.splice(i, 1);
                        return true;
                    }
                });
            });
        },

        loadProject: function(name){

            var self = this;
            this.loaded = false;
            this._project = null;

            if(!this.emit("beforeLoad", {
                    name: name
                })){
                return Q.reject();
            }

            self.loaded = false;

            return emulation(function(){

                projects.some(function(project){
                    if(project.name === name){
                        self._project = project;
                        return true;
                    }
                });

                self.loaded = true;

                if(!self._project){
                    self.emit("faliedToLoad", {
                        name: name
                    });

                    return Q.reject({
                        name: name
                    });
                }

                self.name = name;
                self.type = self._project.type;
                self.configs = self._project.configs;
                self.loaded = true;

                self.emit("afterLoad");
                return Q.resolve();
            });
        },

        setConfig: function(name, value){

            var self = this;

            if(!this.emit("beforeChangeConfig", {
                    name: name,
                    value: value
                })){
                return Q.reject();
            }

            return emulation(function(){

                var prevValue = self.configs[name];
                self.configs[name] = value;

                self.emit("afterChangeConfig", {
                    name: name,
                    prevValue: prevValue
                });

                return Q.resolve({
                    name: name,
                    prevValue: prevValue
                });
            });
        },

        setConfigs: function(configs){

            var self = this;

            if(!this.emit("beforeChangeConfigs", {
                    configs: configs
                })){
                return Q.reject();
            }

            return emulation(function(){

                var prevConfigs = self.configs;

                self.configs = configs;

                self.emit("afterChangeConfig", {
                    prevConfigs: prevConfigs
                });

                return Q.resolve({
                    prevConfigs: prevConfigs
                });
            });
        },

        _read: function(from, parts){

            var name, next;

            if(!from){
                return null;
            }

            if(parts.length === 0){
                return from;
            }

            name = parts.shift();
            next = null;

            from.entries.some(function(entry){
                if(entry.name === name){
                    next = entry;
                    return true;
                }
            });

            return this._read(next, parts);
        },

        readFile: function(path){

            var self = this;

            if(!this.emit("beforeReadFile", {
                    path: path
                })){
                return Q.reject();
            }

            return emulation(function(){

                var file = self._read(self._project, path.split("/"));

                if(!file){
                    self.emit("failedToReadFile", {
                        path: path
                    });

                    return Q.reject({
                        path: path
                    });
                }

                self.emit("afterReadFile", {
                    path: path,
                    data: file.data
                });

                return Q.resolve({
                    path: path,
                    data: file.data
                });
            });
        },

        readFolder: function(path){

            var self = this;

            if(!this.emit("beforeReadFolder", {
                    path: path
                })){
                return Q.reject();
            }

            return emulation(function(){

                var folder, entries;

                if(path === ""){
                    folder = self._project;
                }else {
                    folder = self._read(self._project, path.split("/"));
                }

                if(!folder){
                    self.emit("failedToReadFolder", {
                        path: path
                    });

                    return Q.reject({
                        path: path
                    });
                }

                entries = folder.entries.map(function(entry){
                    return {
                        path: entry.path,
                        folder: entry.folder
                    };
                });

                self.emit("afterReadFolder", {
                    path: path,
                    entries: entries
                });

                return Q.resolve({
                    path: path,
                    entries: entries
                });
            });
        },

        writeFile: function(path, data){

            var self = this;

            if(!this.emit("beforeWriteFile", {
                    path: path
                })){
                return Q.reject();
            }

            return emulation(function(){

                var file = self._read(self._project, path.split("/"));

                if(!file){
                    self.emit("failedToWriteFile", {
                        path: path,
                        data: data
                    });

                    return Q.reject({
                        path: path,
                        data: data
                    });
                }

                file.data = data;

                self.emit("afterWriteFile", {
                    path: path,
                    data: data
                });

                return Q.resolve({
                    path: path,
                    data: data
                });
            });
        },

        _move: function(fromEntry, whatEntry, whereEntry, newName, copy, overwrite){

            var conflict, self, index, path, target;

            self = this;
            conflict = null;

            whereEntry.entries.some(function(entry){
                if(entry.name === newName){
                    conflict = entry;
                    return true;
                }
            });

            if(conflict &&
                (!overwrite || (overwrite && conflict.folder !== whatEntry.folder))){
                return false;
            }

            if(whatEntry.folder){

                // вырезаем каталог
                if(!copy) {
                    index = fromEntry.entries.indexOf(whatEntry);
                    fromEntry.entries.splice(index, 1);
                }

                if(!conflict) {
                    target = {
                        name: newName,
                        folder: true,
                        entries: []
                    };

                    path = whereEntry.path;

                    if (path !== "") {
                        path += "/";
                    }

                    target.path = path + newName;
                    whereEntry.entries.push(target);
                }else{
                    target = conflict;
                }

                whatEntry.entries.slice().forEach(function(entry){
                    self._move(
                        whatEntry, entry, target, entry.name, copy, overwrite
                    );
                });

            }else{

                if(conflict){
                    index = whereEntry.entries.indexOf(conflict);
                    whereEntry.entries.splice(index, 1);
                }

                if(!copy){
                    index = fromEntry.entries.indexOf(whatEntry);
                    fromEntry.entries.splice(index, 1);
                }else{
                    whatEntry = {
                        folder: false,
                        data: whatEntry.data
                    };
                }
                path =  whereEntry.path;

                if(path !== ""){
                    path += "/";

                }

                whatEntry.path = path + newName;
                whatEntry.name = newName;

                whereEntry.entries.push(whatEntry);
            }
            return true;
        },

        move: function(what, where, copy, overwrite){

            var self = this, result = {
                what: what,
                where: where,
                copy: copy,
                overwrite: overwrite
            };

            if(!this.emit("beforeMove", {
                    name: name
                })){
                return Q.reject();
            }

            if(what === where){
                this.emit("failedToMove", result);
                return Q.reject(result);
            }

            return emulation(function(){

                var whatEntry = self._read(self._project, what.split("/")),
                    fromEntry = self._read(self._project, what.split("/").slice(0,-1)),
                    whereEntry = self._read(self._project, where.split("/").slice(0, -1)),
                    newName = where.split("/").pop();

                if(!whatEntry || !fromEntry || !whereEntry ||
                    !self._move(fromEntry, whatEntry, whereEntry, newName, copy, overwrite)){

                    self.emit("failedToMove", result);
                    return Q.reject(result);
                }
                self.emit("afterMove", result);
                return Q.resolve(result);
            });
        },

        remove: function(path){

            var self = this;

            if(!this.emit("beforeRemove", {
                    path: path
                })){
                return Q.reject({path: path});
            }

            return emulation(function(){
                var from = self._read(self._project, path.split("/").slice(0,-1)),
                    what = self._read(self._project, path.split("/")), index;

                if(!from || !what){

                    self.emit("failedToRemove", {
                        path: path
                    });

                    return Q.reject({
                        path: path
                    });
                }

                index = from.entries.indexOf(what)
                from.entries.splice(index, 1);

                self.emit("afterRemove", {
                    path: path
                });

                return Q.resolve({
                    path: path
                });
            });
        },


        createFile: function(path, data){

            var self = this, result = {
                path: path,
                data: data
            };

            if(!this.emit("beforeCreateFile", {
                    path: path,
                    data: data
                })){
                return Q.reject();
            }

            return emulation(function(){
                var conflict = self._read(self._project, path.split("/")),
                    where = self._read(self._project, path.split("/").slice(0,-1)),
                    name = path.split("/").pop();

                if(!where || conflict){
                    self.emit("failedToCreateFile", result);
                    return Q.reject(result);
                }else{

                    where.entries.push({
                        path: path,
                        name: name,
                        folder: false,
                        data: data
                    });

                    self.emit("afterCreateFile", result);
                    return Q.resolve(result);
                }
            });
        },

        createFolder: function(path){

            var self = this, result = {
              path: path
            };

            if(!this.emit("beforeCreateFolder", result)){
                return Q.reject();
            }

            return emulation(function(){
                var conflict = self._read(self._project, path.split("/")),
                    where = self._read(self._project, path.split("/").slice(0,-1)),
                    name = path.split("/").pop();

                if(!where || conflict){
                    self.emit("failedToCreateFolder", result);
                    return Q.reject(result);
                }else{

                    where.entries.push({
                        path: path,
                        name: name,
                        folder: true,
                        entries: []
                    });

                    self.emit("afterCreateFolder", result);
                    return Q.resolve(result);

                }
            });
        },

        exist: function(what){

            var self = this;

            return emulation(function(){
                var exist = self._read(self._project, what.split("/")) !== null;
                return Q.resolve(exist);
            });
        }
    });

    return TestProjectModel;
});