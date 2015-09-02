define([
    "dojo/aspect",
    "dijit/MenuBar",
    "dijit/PopupMenuBarItem",
    "dijit/Menu",
    "dijit/PopupMenuItem",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dijit/MenuSeparator",
    "onlide/dijitutils",
    "onlide/Class"
], function(aspect, DijitMenuBar, DijitPopupMenuBarItem, DijitMenu, DijitPopupMenuItem,
            DijitMenuItem, DijitCheckedMenuItem, DijitMenuSeparator, dijitutils, Class){

    'use strict';

    var MenuBar, MenuItem, Menu, Action;

    /**
     * @class onlide.ui.MenuBar
     * Представляет виджет панели меню
     * @extends onlide.base.WidgetBase
     */
    MenuBar = Class.create({

        className: "onlide.ui.MenuBar",
        baseClass: dijitutils.DijitWidgetBase,

        /**
         * @method constructor
         * Конструктор
         * @param {String} [params] параметры инициализации
         * @param {String] [params.id] идентификатор виджета
         */
        constructor: function MenuBar(params){
            params = params || {};
            MenuBar.Base.call(this, {
                id: params.id,
                dijitWidget: new DijitMenuBar()
            });
            this.roots = {};

            this.registerEvents(["menuAdded", "menuRemoved"]);
        },



        /**
         * @method addMenu
         * Добавляет меню верхнего уровня
         * @param {Object} params
         * @param {String} params.label отображаемое имя меню
         * @param {onlide.ui.MenuBar.MenuItem[]} [params.items] элементы
         * меню
         * @param {String} [params.id] идентификатор меню
         * @return {onlide.ui.MenuBar.Menu} меню
         * @fires menuAdded
         */
        addMenu: function(params){
            var root = null;
            root = new Menu({
                id: params.id,
                _root: true,
                label: params.label,
                items: params.items
            });
            this.roots[root.getId()] = root;
            this._dijitWidget.addChild(root._dijitWidget);
            return root;
        },

        /**
         * @method getMenu
         * Возвращает меню
         * @param {String} id идентификатор меню
         * @return {onlide.ui.MenuBar.Menu}
         */
        getMenu: function(id){
            return this.roots[id];
        },

        /**
         * @method removeMenu
         * Удаляет меню
         * @param {String} id идентификатор меню
         * @fires menuRemoved
         */
        removeMenu: function(id){
            var menu = this.roots[id];
            if(menu){
                this._dijitWidget.removeChild(menu._dijitWidget);
                delete this.roots[id];
            }
        }

        /**
         * @event menuAdded
         * Вызывается после добавления меню верхнего уровня
         * @param {Object} event объект события
         * @param {onlide.ui.MenuBar.Menu} menu добавленное меню
         */

        /**
         * @event menuRemoved
         * Вызывается после удаления меню верхнего уровня
         * @param {Object} event объект события
         * @param {onlide.ui.MenuBar.Menu} menu удаленное  меню
         */
    });

    MenuItem = Class.create({

        className: "onlide.ui.MenuItem",
        baseClass: dijitutils.DijitWidgetBase,

        constructor: function MenuItem(params){
            MenuItem.Base.call(this, params);

            this.registerEvents([
                "labelChanged", "enableChanged", "changeVisibility", "beforeOpenParent"
            ]);

            this.setLabel(params.label);

            if(params.hasOwnProperty("enable")){
                this.setEnable(params.enable);
            }

            if(params.onBeforeOpenParent){
                this.on("beforeOpenParent", params.onBeforeOpenParent);
            }

            this._visibleStyle = this.getDomNode().style.display;
            this._hiddenStyle = "none";

            this.parent = null;
        },

        setVisible: function(visible){
            this._dijitWidget.set("style", {
                display: visible ? this._visibleStyle : this._hiddenStyle
            });
            this.emit("changeVisibility", {
                visible: visible
            });
        },

        isVisible: function(){
            return this.getDomNode().style.display === "";
        },

        getLabel: function(){
            return this._dijitWidget.label;
        },

        setLabel: function(label){
            var prevLabel = this.getLabel();
            this._dijitWidget.set("label", label);
            this.emit("labelChanged", {
                prevLabel: prevLabel
            });
        },

        setEnable: function(enable){
            this._dijitWidget.set("disabled", !enable);
            this.emit("enableChanged");
        },

        isEnable: function(){
            return !this._dijitWidget.disabled;
        }

        /**
         * @event labelChanged
         * Вызывается после изменения отображаемого имени элемента
         * @param {Object} event объект события
         * @paran {String} prevLabel предыдущее имя
         */

        /**
         * @event enableChanged
         * Вызывается после вкл/выкл
         */

        /**
         * @event changeVisibility
         * Вызывается после смены состояния видимости
         */
    });

    /**
     * @class onlide.ui.Menu
     * Представляет меню
     * @extends onlide.ui.MenuItem
     */
    Menu = Class.create({

        className: "onlide.ui.Menu",
        baseClass: MenuItem,

        /**
         * @constructor
         * Конструктор
         * @param {Object} params параметры инициализации
         * @param {String} params.label отображаемое имя меню
         * @param {String} [params.id] идентификатор виджета
         * @param {Boolean} [params.enable=true] если нужно, чтобы меню
         * не было включено, устанавливается в false
         * @param {Object} [context] если меню нужно использовать как контекстное, то
         * устанавливается данный параметр
         * @param {Array} context.targetNodes в массиве указываются целевые узлы, при нажатии по
         * которым правой кнопкой данное меню отобразиться
         * @param {String} [context.selector] указывается css-селектор для выборки внутренних
         * элементов целевых узлов, к которым будет привязано меню
         * @param {Array} [params.items] элементы меню (Menu и MenuItem)
         */
        constructor: function Menu(params){
            var opts = {}, self = this, itemId;
            this._items = {};
            this._count = 0;
            this._root = params._root;

            var DijitMenuClass;

            // если меню контекстное
            if(params.context){
                opts.targetNodeIds = params.context.targetNodes;

                if(params.context.selector){
                    opts.selector = params.context.selector;
                }

                DijitMenuClass = DijitMenu;

            }else {
                if (params._root) {
                    DijitMenuClass = DijitPopupMenuBarItem;
                } else {
                    DijitMenuClass = DijitPopupMenuItem;
                }

                opts = { label: params.label, popup: new DijitMenu() };
            }

            params.dijitWidget = new DijitMenuClass(opts);

            Menu.Base.call(this, params);
            this._dijitMenu = this._dijitWidget.popup || this._dijitWidget;
            this.registerEvents(["itemAdded", "itemRemoved", "open", "close"]);

            this._open = false;

            aspect.around(this._dijitMenu, "onOpen",
                function(orig){
                    return function(){

                        for(itemId in self._items){
                            if(self._items.hasOwnProperty(itemId)) {
                                self._items[itemId].item.emit("beforeOpenParent");
                            }
                        }

                        orig.apply(self._dijitMenu, arguments);

                        self._open = true;
                        self.emit("open");
                    };
                }
            );

            aspect.after(this._dijitMenu, "onClose", function(){
                self._open = false;
                self.emit("close");
            });

            if(params.items){
                this.addItems(params.items);
            }
        },



        isOpen: function(){
          return this._open;
        },

        getTarget: function(){
            return this._dijitWidget.currentTarget;
        },

        /**
         * @method addItems
         * Добавляет элементы в меню
         * @param {onlide.ui.MenuBar.MenuItem[]} items элементы меню
         * @fires itemAdded
         */
        addItems: function(items){
            var self = this;
            items.forEach(function(item){
                self.addItem(item);
            });
        },

        _hideItIfNeed: function(){
            var count = 0, itemIds = Object.keys(this._items);
            itemIds.forEach(function(id){
                if(!this.getItem(id).isVisible()){
                    ++count;
                }
            }.bind(this));
            this.setVisible(count !== itemIds.length);
        },

        /**
         * @method addItem
         * Добавляет элемент в меню
         * @param {onlide.ui.MenuBar.MenuItem} item элемент меню
         * @return {onlide.ui.MenuBar.MenuItem} добавленный элемент
         * @fires itemAdded
         */
        addItem: function(item){

            var self = this;

            if(!this._items[item.getId()]){

                if(!this._root && item.isVisible()){
                    this.setVisible(true);
                }

                ++this._count;

                item.parent = this;

                item = {
                    item: item,
                    onChangeVisibility: function(e){
                        if(e.visible){
                            self.setVisible(true);
                        }else{
                            self._hideItIfNeed();
                        }
                    }
                };

                this._items[item.item.getId()] = item
                this._dijitMenu.addChild(item.item._dijitWidget);

                item.item.on("changeVisibility", item.onChangeVisibility);

                this.emit("itemAdded", {
                    item: item.item
                });

                return item.item;
            }
        },

        /**
         * @method removeItem
         * Удаляет элемент меню
         * @param {String} id идентификатор элемента меню
         * @fires itemRemoved
         */
        removeItem: function(id){
            var item = this._items[id];
            if(item){

                --this._count;

                item.item.parent = null;

                item.item.off("changeVisibility", item.onChangeVisibility);

                this._dijitMenu.removeChild(
                    item.item._dijitWidget
                );
                delete this.items[id];

                this.emit("itemRemoved", {
                    item: item.item
                });
            }
        },

        /**
         * @method getItem
         * Возвращает элемент меню
         * @param {String} id идентификатор меню
         * @return {onlide.ui.MenuBar.MenuItem} элемент меню
         */
        getItem: function(id){
            return this._items[id].item;
        },

        getItems: function(){
            return Object.keys(this._items).map(function(id){
                return this._items[id].item;
            }.bind(this));
        },

        hasItems: function(){
            return this._count > 0;
        }

        /**
         * @event itemAdded
         * Вызывается после добавления элемента меню
         * @param {Object} event объект события
         * @param {onlide.ui.MenuBar.MenuItem} item добавленный элемент
         */

        /**
         * @event itemRemoved
         * Вызывается после удаления элемента меню
         * @param {Object} event объект события
         * @param {onlide.ui.MenuBar.MenuItem} item удаленный элемент
         */

        /**
         * @event open
         * Вызывается после открытия меню
         * @param {Object} target узел, по которому было произведено нажатие для открытия меню
         */

        /**
         * @event close
         * Вызывается после открытия меню
         * @param {Object} target узел, по которому было произведено нажатие для открытия меню
         */
    });

    /**
     * @class onlide.ui.Action
     * Представляет элемент-действие
     * @extends onlide.ui.MenuItem
     */
    Action = Class.create({

        className: "onlide.ui.Action",
        baseClass: MenuItem,

        /**
         * @method constructor
         * Конструктор
         * @param {Object} params параметры инициализации
         * @param {String} params.label отображаемое имя меню
         * @param {Function} params.onClick обработчик события itemActivated
         * @param {String} [params.id] идентификатор виджета
         * @param {Boolean} [params.enable=true] если нужно, чтобы действие
         * не было включено, устанавливается в false
         * @param {"triggered"/"checked"/"separator"} [params.type="triggered"]
         * тип элемента (активируемый, отмечаемый или разделитель)
         */
        constructor: function Action(params){
            var MenuItemClass, opts, self = this;
            params = params || {};

            this.type = params.type || "triggered";

            if(this.type === "checked"){
                MenuItemClass = DijitCheckedMenuItem;
            } else if(this.type === "triggered"){
                MenuItemClass = DijitMenuItem;
            } else if(this.type === "separator"){
                MenuItemClass = DijitMenuSeparator;
            }

            if(this.type !== "separator"){
                opts = {
                    label: params.label||"",
                    onClick: function(){
                        self.emit("click");
                        self.emit("toggle");
                    }
                };
            }

            params.dijitWidget = new MenuItemClass(opts);
            Action.Base.call(this, params);

            this.registerEvents(["click", "toggle"]);

            if(params.onClick){
                this.on("click", params.onClick);
            }

            if(params.onToggle){
                this.on("toggle", params.onToggle);
            }

            if(this.type === "checked"){
                this.setChecked(!!params.checked);
            }
        },


        /**
         * @method setChecked
         * Отмечает/снимает метку
         * @param {Boolean} checked если нужно, чтобы элемент был
         * отмеченным, устанавливается в true. Имеет смысл только
         * для отмечаемого элемента
         * @fires itemActivated
         */
        setChecked: function(checked){
            this._dijitWidget.set("checked", checked);
            this.emit("toggle");

        },

        /**
         * Возвращает состояние отмечаемого элемента
         * @return {Boolean} если элемент отмечен, то вернет true
         */
        isChecked: function(){
            return !!this._dijitWidget.checked;
        },

        /**
         * Возвращает тип элемента
         * @return {"triggered"/"checked"/"separator"} тип элемента
         */
        getType: function(){
            return this.type;
        }

        /**
         * @event click
         * Вызывается после нажатия на элемент и после вызова setChecked
         */
    });

    return {
        MenuBar: MenuBar,
        MenuItem: MenuItem,
        Menu: Menu,
        Action: Action
    };
});















