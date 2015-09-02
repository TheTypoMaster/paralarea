
define([
    "onlide/Class",
    "onlide/project/ProjectModel",
    "q/q",
    "jquery"
], function(Class, ProjectModel, Q, $){

    'use strict';

    function callServiceProc(method, params){
        var defer = Q.defer(), data = {
            'service': 'project',
            'method': method,
            'params': params || {}
        };

        $.ajax('/api', {
            data: JSON.stringify(data),
            async: true,
            datatype: 'json',
            //timeout: 10000,
            type: 'POST'
        })
        .done(function(data){
            defer.resolve(data)
        })
        .fail(function(){
            defer.reject()
        });

        return defer.promise;
    }

    var ServerProjectModel = Class.create({

        className: "onlide.project.ServerProjectModel",
        baseClass: ProjectModel,

        constructor: function ServerProjectModel(){
            ProjectModel.call(this);
        },

        getProjectModelList: function(){
            return callServiceProc('get_project_list')
            .then(function(data){
                return data['result'];
            })
        },

        createProject: function(name, type, configs){
            return Q.reject();
        },

        removeProject: function(name){
            return Q.reject();
        },

        loadProject: function(name){

            var self = this;

            if(!this.emit("beforeLoad", {
                    name: name
                })){
                return Q.reject();
            }

            this.loaded = false;

            return callServiceProc('load_project', {'proj_name': name})
            .then(function(data){
                data = data['result'];

                if(data === false){
                    self.emit("faliedToLoad", {name: name});
                    return Q.reject({name: name});
                }

                self.name = name;
                self.type = data.type;
                self.configs = data.configs;

                self.loaded = true;

                self.emit("afterLoad");
                return Q.resolve();
            })
            .fail(function(){
                self.emit("failedToLoad", {name: name});
                return Q.reject({name: name});
            });
        },

        setConfig: function(name, value){
            return Q.reject();
        },

        setConfigs: function(configs){
            return Q.reject();
        },

        readFile: function(path){
            var self = this;

            if(!this.emit("beforeReadFile", {
                    path: path
                })){
                return Q.reject();
            }

            return callServiceProc('read_file', {
                'fullpath': path,
                'proj_name': self.name
            })
            .then(function(data){
                data = data['result'];

                self.emit("afterReadFile", {
                    path: path,
                    data: data
                });

                return Q.resolve({
                    path: path,
                    data: data
                });
            })
            .fail(function(){
                self.emit("failedToReadFile", {path: path});
                return Q.reject({path: path});
            });
        },

        readFolder: function(path){

            var self = this;

            if(!this.emit("beforeReadFolder", {
                    path: path
                })){
                return Q.reject();
            }

            return callServiceProc('read_folder', {
                'fullpath': path,
                'proj_name': self.name
            })
            .then(function(data){
                data = data['result'];

                self.emit("afterReadFolder", {
                    path: path,
                    entries: data
                });

                return Q.resolve({
                    path: path,
                    entries: data
                });
            })
            .fail(function(){
                self.emit("failedToReadFolder", {path: path});
                return Q.reject({path: path});
            });
        },

        writeFile: function(path, fileData){
            var self = this;

            if(!this.emit("beforeWriteFile", {
                    path: path
                })){
                return Q.reject();
            }

            return callServiceProc('write_file', {
                'fullpath': path,
                'data': fileData,
                'proj_name': self.name
            })
            .then(function(data){
                data = data['result']

                if(!data){
                    self.emit("failedToWriteFile", {
                        path: path,
                        data: fileData
                    });

                    return Q.reject({
                        path: path,
                        data: fileData
                    });
                }

                self.emit("afterWriteFile", {
                    path: path,
                    data: fileData
                });

                return Q.resolve({
                    path: path,
                    data: fileData
                });
            })
            .fail(function(){
                self.emit("failedToWriteFile", {
                    path: path,
                    data: fileData
                });

                return Q.reject({
                    path: path,
                    data: fileData
                });
            });
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

            return callServiceProc('move', {
                'proj_name': self.name,
                'src': what,
                'dst': where,
                'copy': copy,
                'overwrite': overwrite
            })
            .then(function(data){
                data = data['result']

                if(!data){
                    self.emit("failedToMove", result);
                    return Q.reject(result);
                }
                self.emit("afterMove", result);
                return Q.resolve(result);
            })
            .fail(function(){
                self.emit("failedToMove", result);
                return Q.reject(result);
            });
        },

        remove: function(path){
            var self = this;

            if(!this.emit("beforeRemove", {path: path})){
                return Q.reject({path: path});
            }

            return callServiceProc('remove', {
                'fullpath': path,
                'proj_name': self.name
            })
            .then(function(data){
                data = data['result'];

                if(!data){
                    self.emit("failedToRemove", {path: path});
                    return Q.reject({path: path});
                }
                self.emit("afterRemove", {path: path});
                return Q.resolve({path: path});
            })
            .fail(function(){
                self.emit("failedToRemove", {path: path});
                return Q.reject({path: path});
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

            return callServiceProc('create_file', {
                'proj_name': self.name,
                'file_path': path,
                'data': data
            })
            .then(function(data){
                data = data['result']

                if(!data){
                    self.emit("failedToCreateFile", result);
                    return Q.reject(result);
                }

                self.emit("afterCreateFile", result);
                return Q.resolve(result);
            })
            .fail(function(){
                self.emit("failedToCreateFile", result);
                return Q.reject(result);
            });
        },

        createFolder: function(path){
            var self = this, result = {path: path};

            if(!this.emit("beforeCreateFolder", {path: path})){
                return Q.reject();
            }

            return callServiceProc('create_folder', {
                'proj_name': self.name,
                'folder_path': path
            })
            .then(function(data){
                data = data['result']

                if(!data){
                    self.emit("failedToCreateFolder", result);
                    return Q.reject(result);
                }

                self.emit("afterCreateFolder", result);
                return Q.resolve(result);
            })
            .fail(function(){
                self.emit("failedToCreateFolder", result);
                return Q.reject(result);
            });
        },

        exist: function(what){
            var self = this;

            return callServiceProc('exists', {
                'proj_name': self.name,
                'fullpath': what
            })
            .then(function(data){
                data = data['result'];
                return Q.resolve(data);
            })
            .fail(function(){

            });
        }
    });

    return ServerProjectModel;
});