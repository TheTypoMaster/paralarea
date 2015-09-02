define([
    "dijit/layout/ContentPane",
    "dojo/_base/declare",
    "dojo/aspect",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/tree/model",

    "onlide/Class",
    "onlide/base/WidgetBase"
], function(ContentPane, declare, aspect, _WidgetBase, _TemplatedMixin, model, Class, WidgetBase){

    'use strict';

    var dijitutils = {};

    var __WidgetAdapter = declare([_WidgetBase, _TemplatedMixin], {

        templateString: '<div class="${baseClass}" ' +
        'data-dojo-attach-point="containerNode"></div>',

        constructor: function(params){

            var self = this;
            aspect.after(self, "startup", function(){
                params.widget.place(self.containerNode, "replace");
            });
        }
    });

    // Базовый класс для виджетов, использующих dijit-виджет
    dijitutils.DijitWidgetBase = Class.create({

        baseClass: WidgetBase,

        constructor: function DijitWidgetBase(params) {
            var dijitWidget = params.dijitWidget;

            if(!dijitWidget || !dijitWidget.buildRendering){
                throw new Error("DijitWidgetAdapter: параметр dijitWidget должен быть dijit-виджетом");
            }

            this._dijitWidget = dijitWidget;
            this._dijitWidget._dijitWrapper = this;

            WidgetBase.call(this, params);

            this.on("placed", function(){
                this._dijitWidget.startup();
            });
        },

        getDomNode: function(){
            return this._dijitWidget.domNode;
        }

    });

    dijitutils.DijitWidgetAdapter = Class.create({

        baseClass: dijitutils.DijitWidgetBase,

        constructor: function (params) {
            if(!(params.widget instanceof onlide.base.WidgetBase)){
                throw new Error("DijitWidgetAdapter: параметр widget должен быть объектом onlide.base.WidgetBase");
            }
            dijitutils.DijitWidgetBase.call(this, {
                id: params.id,
                dijitWidget: new __WidgetAdapter(params)
            });
            this._origWidget = params.widget;
        }

    });

    // Создает из dijit-виджета объект DijitWidgetBase
    dijitutils.fromDijitWidget = function(dijitWidget){
        return new dijitutils.DijitWidgetBase({dijitWidget: dijitWidget});
    };

    // Преобразует не dijit-виджет к DijitWidgetBase-объекту. Если же это
    // DijitWidgetBase-объект, то просто вернет его
    dijitutils.toDijitWidget = function(widget){
        if(widget instanceof dijitutils.DijitWidgetBase){
            return widget;
        }
        return new dijitutils.DijitWidgetAdapter({widget:widget});
    };

    // возвращает оригинальный виджет
    dijitutils.orig = function(widget){
        widget = (widget && widget._dijitWrapper) || widget;
        // если адаптер
        if(widget instanceof dijitutils.DijitWidgetAdapter){
            return widget._origWidget;
        }
        return widget;
    };

    var nextId = 0;
    dijitutils.DijitProjectModel = declare(model, {

        constructor: function(project){

            var self = this;

            this.project = project;
            this.root = {
                id: -1,
                path: null,
                name: null,
                folder: true
            };
            this.projectRoot = null;

            this.connections = {

                beforeLoad: function(){
                    self.onChildrenChange(self.root, []);
                },

                afterLoad: function(){

                    self.projectRoot = {
                        id: nextId++,
                        name: self.project.name,
                        path: "",
                        folder: true
                    };

                    self.onChildrenChange(self.root, [self.projectRoot]);
                    self.onLoadProject();
                },

                beforeRemove: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    if(what.busy){
                        return false;
                    }
                    what.busy = true;
                    return true;
                },

                afterRemove: function(e){

                    var parent = self.getItemByParts(
                        self.projectRoot,
                        e.path.split("/").slice(0,-1)
                    );

                    parent.children.some(function(child, i, arr){
                        if(child.path === e.path){
                            child.busy = false;
                            arr.splice(i, 1);
                            return true;
                        }
                    });

                    self.onChildrenChange(parent, parent.children);
                },

                failedToRemove: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                failedToMove: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.what.split("/"));
                    what.busy = false;
                },

                afterMove: function(e){

                    var from, where, what, conflict, index;

                    from = e.what.split("/").slice(0,-1);
                    where = e.where.split("/").slice(0,-1)

                    what = self.getItemByParts(self.projectRoot, e.what.split("/"));
                    from = self.getItemByParts(self.projectRoot, from);
                    where = self.getItemByParts(self.projectRoot, where);

                    if(e.overwrite){
                        conflict = self.getItemByParts(self.projectRoot, e.where.split("/"));

                        if(conflict){
                            index = where.children.indexOf(conflict);
                            where.children.splice(index, 1);
                        }
                    }

                    what.busy = false;

                    // ПЕРЕПИСАТЬ! БЫДЛОКОД!
                    if(from !== where || what.folder) {
                        if(what.folder){
                            // ?!Здесь стоит сделать перемещение каталога без считывания!?
                            self.updateChildren(from);
                            if(from !== where) {
                                self.updateChildren(where);
                            }
                        }else {

                            if(!e.copy) {
                                index = from.children.indexOf(what);
                                from.children.splice(index, 1);
                            }else{
                                what = {
                                    id: nextId++
                                };
                            }

                            what.path = e.where;
                            what.name = e.where.split("/").pop();

                            where.children.push(what);

                            self.onChildrenChange(from, self.prepareChildren(from.children));
                            self.onChildrenChange(where, self.prepareChildren(where.children));
                        }
                    }else{
                        what.path = e.where;
                        what.name = e.where.split("/").pop();
                        self.onChange(what);
                    }
                },

                afterCreateFile: function(e){
                    var where = self.getItemByParts(
                        self.projectRoot, e.path.split("/").slice(0,-1)
                    );

                    if(where.children){
                        where.children.push({
                            id: nextId++,
                            path: e.path,
                            name: e.path.split("/").pop(),
                            folder: false
                        });

                        where.children = self.prepareChildren(where.children);
                        self.onChildrenChange(where, where.children);
                    }
                },

                afterCreateFolder: function(e){
                    var where = self.getItemByParts(
                        self.projectRoot, e.path.split("/").slice(0,-1)
                    );

                    if(where.children){
                        where.children.push({
                            id: nextId++,
                            path: e.path,
                            name: e.path.split("/").pop(),
                            folder: true
                        });

                        where.children = self.prepareChildren(where.children);
                        self.onChildrenChange(where, where.children);
                    }
                },

                beforeWriteFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    if(what.busy){
                        return false;
                    }
                    what.busy = true;
                    return true;
                },

                failedToWriteFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                afterWriteFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                beforeReadFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    if(what.busy){
                        return false;
                    }
                    what.busy = true;
                    return true;
                },

                failedToReadFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                afterReadFile: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                beforeReadFolder: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    if(what.busy){
                        return false;
                    }
                    what.busy = true;
                    return true;
                },

                failedToReadFolder: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                },

                afterReadFolder: function(e){
                    var what = self.getItemByParts(self.projectRoot, e.path.split("/"));
                    what.busy = false;
                }
            };

            if(project){
                this.connect();
            }
        },

        getItemByParts: function(from, parts){

            var name, next = null;

            if(!from){
                return null;
            }

            if(parts.length === 0 || parts[0] === ""){
                return from;
            }

            name = parts.shift();

            from.children.some(function(child){
                if(child.name === name){
                    next = child;
                    return true;
                }
            });

            return this.getItemByParts(next, parts);
        },

        setProjectModel: function(project){
            if(this.project){
                this.disconnect();
            }

            this.project = project;
            this.onChildrenChange(this.root, []);

            if(project){
                this.connect();
            }
        },

        connect: function(){
            var self = this;

            Object.keys(this.connections).forEach(function(event){
                self.project.on(event, self.connections[event]);
            });
        },

        disconnect: function(){

            var self = this;

            Object.keys(this.connections).forEach(function(event){
                self.project.off(event, self.connections[event]);
            });
        },

        onLoadProject: function(){
        },

        prepareChildren: function(children){
            return children.sort(function(a,b){
                if(a.folder && !b.folder){
                    return -1;
                }else if(!a.folder && b.folder){
                    return 1;
                }else{
                    if(String.prototype.localeCompare){
                        return a.name.localeCompare(b.name);
                    }else{
                        if(a.name < b.name){
                            return -1;
                        }else if(a.name === b.name){
                            return 0;
                        }else if(a.name > b.name){
                            return 1;
                        }
                    }
                }
            });
        },

        destroy: function(){
            if(this.project){
                this.disconnect();
            }
        },

        getRoot: function(onItem){
            onItem(this.root);
        },

        mayHaveChildren: function(item){
            return item.folder;
        },

        getChildren: function(parentItem, onComplete){

            var self = this;

            if(!parentItem.folder){
                onComplete();
                return;
            }

            if(parentItem === this.root){

                this.root.children = this.project.loaded ?  [{
                    name: this.project.name,
                    path: this.project.path,
                    folder: true
                }] : [];

                onComplete(this.root.children);
                return;
            }

            this.project.readFolder(parentItem.path).then(function(result){

                var children = result.entries.map(function(entry){
                    return {
                        id: nextId++,
                        name: entry.path.split("/").pop(),
                        path: entry.path,
                        folder: entry.folder
                    };
                });

                parentItem.children = children;

                children = self.prepareChildren(children);
                parentItem.children = children;
                onComplete(children);
            });
        },

        isItem: function(something){
            return typeof something === "object" && something !== null;
        },

        getIdentity: function(item){
            return item.id;
        },

        getLabel: function(item){
            return item.name;
        },


        updateChildren: function(parent){

            var self = this;

            this.getChildren(parent, function(children){
                self.onChildrenChange(parent, children);
            });
        },

        pasteItem: function(childItem, oldParentItem, newParentItem, bCopy){

            var self = this;


            if(oldParentItem === newParentItem || childItem.busy){
                return;
            }

            var path = newParentItem.path, overwrite = false;

            if(path !== ""){
                path += "/";
            }

            path += childItem.name;

            childItem.busy = true;

            this.project.exist(path)
            .then(
                function(exist){

                    if(exist){
                        overwrite = confirm("Заменить?");
                    }

                    if(!exist || overwrite){
                        self.project.move(childItem.path, path, bCopy, true);
                    }else{
                        childItem.busy = false;
                    }
                }
            );
        }

    });

    return dijitutils;
});