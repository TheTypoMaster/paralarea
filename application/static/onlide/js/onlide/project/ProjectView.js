define([
    "dojo/aspect",
    "onlide/ui/MenuBar",
    "dijit/Tree",
    "dijit/tree/dndSource",
    "onlide/dijitutils",
    "onlide/Class"
], function(aspect, MenuBar, Tree, dndSource, dijitutils, Class){

    'use strict';

    var ProjectView;

    /**
     * @class onlide.project.ProjectView
     * Представляет класс, отвечающий за представление дерева проекта и
     * контекстного меню, содержащего действия над элементами проекта
     * @extends onlide.base.WidgetBase
     */
    ProjectView = Class.create({

        className: "onlide.project.ProjectView",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {Object} params
         * @param {String} [params.id] идентификатор виджета
         * @param {onlide.project.Project} project проект
         */
        constructor: function ProjectView(params){

            var self =this;

            params = params || {};

            this._model = new dijitutils.DijitProjectModel(params.project);

            aspect.after(this._model, "onLoadProject", function(){
                var nodes = self._dijitWidget.getNodesByItem(self._model.projectRoot);

                if(!nodes[0].isExpanded){
                    self._dijitWidget._expandNode(nodes[0]);
                }
            });

            params.dijitWidget = new Tree({

                model: this._model,
                showRoot: false,
                dndController: dndSource,
                openOnDblClick: true,
                betweenThreshold: 5,

                // Переделать под провайдеры стиля
                getIconClass: function(item, opened){
                    if(item && !item.folder){
                        return "dijitLeaf";
                    }else{
                        return (
                            opened ? "dijitFolderOpened" : "dijitFolderClosed"
                        );
                    }
                },

                checkItemAcceptance: function(target, source, position){

                    var item = dijit.getEnclosingWidget(target).item;

                    if(item.path === "root"){
                        return false;
                    }

                    if(position === "before" || position === "after") {
                        return true;
                    }
                    return item.folder;
                },

                onDblClick: function(item){
                    if(!item.folder && !item.busy) {
                        self.emit("fileDoubleClick", {
                            file: item
                        });
                    }
                }
            });

            ProjectView.Base.call(this, params);

            this._contextMenu = new MenuBar.Menu({
                context: {
                    targetNodes: [this.getDomNode()],
                    selector: ".dijitTreeNode"
                }
            });

            this.registerEvents(["fileDoubleClick", "collapsed", "expanded"]);
            this._iconProviders = [];
        },

        getContextMenu: function(){
            return this._contextMenu;
        },

        getTargets: function(){

            var target = dijit.getEnclosingWidget(this._contextMenu.getTarget()).item,
                selected = this.getSelectedItems(), i=selected.length;

            while(i--){
                if(selected[i] === target){
                    return selected;
                }
            }
            return [target];
        },

        /**
         * @methods changeProjectModel
         * Устанавливает проект
         * @param {onlide.project.ProjectModel} model проект
         */
        setProjectModel: function(model){
            this._model.setProjectModel(model);
        },

        /**
         * @method collapseAll
         * Сворачивает все каталоги
         */
        collapseAll: function(){
            this._dijitWidget.collapseAll();
            this.emit("collapsed", {
                folder: null,
                all: true
            });
        },

        /**
         * @method expandAll
         * Разворачивает все каталоги
         */
        expandAll: function(){
            this._dijitWidget.expandAll();
            this.emit("expanded", {
                folder: null,
                all: true
            });
        },

        /**
         * @method addIconStyleProvider
         * Добавляет функцию-поставщик css-стиля для отображения иконки
         * перед элементом дерева
         * @param {Function} provider   поставщик css-стиля для отображения
         * иконки
         * @param {onlide.project.ProjectItem} provider.item элемент дерева
         * проекта, для которого определется иконка
         * @param {Boolean} provider.opened если item - элемент-контейнер,
         * и если он раскрыт, то opened будет равен true, иначе - false
         * @param {String?} provider.return css-стиль для отображения иконки
         * или null, если для данного элемента иконка не предоставляется.
         * В этом случае будет вызван следующий провайдер
         * @param {Boolean}  [top=true] false - чтобы добавить поставщика
         * в конец
         */
        addIconStyleProvider: function(provider, top){
            if(typeof top === "undefined"){
                top = true;
            }
            if(top){
                this._iconProviders.unshift(provider);
            }else{
                this._iconProviders.push(provider);
            }
        },

        /**
         * @method getSelectedItems
         * Возвращает выбранные элементы дерева
         * @return {Object[]} выделенные элементы
         * проекта
         */
        getSelectedItems: function(){
            return this._dijitWidget.selectedItems;
        }

        /**
         * @event fileDoubleClick
         * Вызывается при двойном щелчке по элементу, представляющему файл
         * @param {Object} event объект события
         * @param {Object} event.file файл
         */

        /**
         * @event collapsed
         * Вызывается после сворачивания
         * @param {Object} event объект события
         * @param {Boolean} event.all если были рекурсивно все каталоги,
         * то примет значение true, иначе - false
         * @param {Object|null} event.folder если был свернут
         * отдельный каталог, то folder будет ссылаться на него
         */

        /**
         * @event expanded
         * Вызывается после разворачивания
         * @param {Object} event объект события
         * @param {Boolean} event.all если были развернуты все каталоги,
         * то примет значение true, иначе - false
         * @param {Object|null} event.folder если был развернут
         * отдельный каталог, то folder будет ссылаться на него
         */
    });

    return ProjectView;
});




