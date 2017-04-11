define('jira/ajs/select/single-select', [
    'jira/util/formatter',
    'jira/ajs/layer/layer-constants',
    'jira/ajs/select/queryable-dropdown-select',
    'jira/ajs/select/select-helper',
    'jira/ajs/select/select-model',
    'jira/ajs/select/suggestion-collection-model',
    'jira/ajs/select/suggestions/select-suggest-handler',
    'jira/ajs/layer/inline-layer-factory',
    'jira/ajs/list/list',
    'jira/ajs/list/item-descriptor',
    'jira/util/navigator',
    'jquery'
], function(
    formatter,
    LayerConstants,
    QueryableDropdownSelect,
    SelectHelper,
    SelectModel,
    SuggestionCollectionModel,
    SelectSuggestHandler,
    InlineLayerFactory,
    List,
    ItemDescriptor,
    Navigator,
    jQuery) {

    /**
     * @class SingleSelect
     * @extends QueryableDropdownSelect
     * @since 4.4
     * @description
     * A smarter replacement for &lt;select&gt;. Allows you to convert existing &lt;select&gt; controls into
     * `SingleSelect`s without any modification of your markup.
     *
     * `SingleSelect` allows you to:
     *
     * - Filter suggestions using the advanced autocomplete input
     * - Navigate and select suggestions with the mouse or keyboard
     *
     * Suggestions for the control can be retrieved in one of two ways:
     *
     * - Statically - the suggestions are already present in the DOM, or
     * - AJAX - server queried (much better for large suggestion lists)
     *
     * @screenshot https://extranet.atlassian.com/download/attachments/1900691161/single.png?version=1&modificationDate=1304902200616&api=v2
     *
     * @example <caption>The static approach</caption>
     * <select id="drinks" class="hidden">
     *     <optgroup label="Beers">
     *     <option value="1">Victoria Bitter</option>
     *     <option value="2">Blue tongue</option>
     *     <option value="3">James Squires</option>
     *     </optgroup>
     *     <optgroup label="Wines">
     *     <option value="4" selected="selected">Jacobs Creek</option>
     *     <option value="5">Oyster Bay</option>
     *     </optgroup>
     * </select>
     *
     * <script type="text/javascript">
     *     new AJS.SingleSelect({
     *         element: AJS.$("#drinks"),
     *         itemAttrDisplayed: "label" // show full text, not value, in lozenges. (e.g "Oyster Bay" instead of "5")
     *     });
     * </script>
     *
     * @example <caption>The AJAX approach</caption>
     * <select id="drinks" class="hidden"></select>
     *
     * <script type="text/javascript">
     * new AJS.SingleSelect({
     *     element: AJS.$("#drinks"),
     *     itemAttrDisplayed: "label",
     *     ajaxOptions: {
     *         url: "drinks.json",
     *         query: true, // keep going back to the sever for each keystroke
     *         formatResponse: function (response) {
     *
     *             var ret = [];
     *
     *             AJS.$(response).each(function(i, category) {
     *
     *                 var groupDescriptor = new AJS.GroupDescriptor({
     *                     weight: i, // order or groups in suggestions dropdown
     *                     label: category.label // Heading of group
     *                 });
     *
     *                 AJS.$(category.drinks).each(function(){
     *                     groupDescriptor.addItem(new AJS.ItemDescriptor({
     *                         value: this.value, // value of item added to select
     *                         label: this.label, // title of lozenge
     *                         html: this.label // html used in suggestion
     *                         title: this.label // tooltip to display on hover [from JIRA 5.2]
     *                         meta: { label: this.label } // js object data stored per element. For example: getSelectedDescriptor().meta().label [from JIRA 5.2]
     *                     }));
     *                 });
     *
     *                 ret.push(groupDescriptor);
     *             });
     *
     *             return ret;
     *         }
     *     }
     * });
     * </script>
     */
    return QueryableDropdownSelect.extend({

        /**
         * This constructor:
         * <ul>
         *  <li>Overrides default options with user options</li>
         *  <li>Inserts an input field before dropdown</li>
         *  <li>Displays selection in input field, if there is a selected option in the select field</li>
         * </ul>
         *
         * @param {Object} options
         * @param {jQuery | HTMLElement | String} options.element - The &lt;select&gt; element. This will be used as the model; suggestions and selections will be updated here.
         * @param {Number} [options.width] - Width of input. If undefined left up to external CSS to decide dimensions.
         * @param {String} [options.itemAttrDisplayed='value'] - The attribute from the &lt;option&gt; element to use as the label for the lozenge. Use label for innerText.
         * @param {String} [options.errorMessage=AJS.params.multiselectGenericError] - Message displayed to the user when the field is unfocused with an invalid input remaining.
         * @param {Boolean} [options.showDropdownButton=true] - Whether or not to show the down arrow that allows users to access the suggestions with the mouse.
         * @param {Boolean} [options.ajaxOptions={minQueryLength: 1}] - Ajax Options used to retrieve suggestions. There is an additional ajax option, formatResponse, this is used to map the server response into suggestion descriptors that can be consumed by the control.
         * @param {Boolean} [options.removeOnUnSelect=false] - If true, when a selection is removed, the suggestion will be also. It will not appear again using the autocomplete.
         * @param {String} [options.matchingStrategy=(^|.*\s+)({0})(.*)] - Regular expression used to find and highlight matching suggestions from autocomplete. This is ignored if using ajax to retrieve suggestions.
         * @param {Boolean} [options.submitInputVal=false] - By default (when `false`) the user must select from the suggested list or press Enter to set the option value. If this is set to `true`, whatever the user has typed will be used, regardless.
         * @param {Boolean} [options.disabled=false] - If true, the select is converted to an input box with no suggestions
         * @param {Boolean} [options.uneditable=false] - If true, the select disabled field is set making it not able to be modified by the user
         * @fires SingleSelect#initialized
         * @constructs
         * @override
         */
        init: function (options) {

            if (this._setOptions(options) === this.INVALID) {
                return this.INVALID;
            }

            this._createSelectModel();

            /**
             * This is not actually disabling the single select, what it does it change it to not show the select
             * options and the user can still type a value into here. This is kept for backwards compatibility, such
             * as reporter in CreateIssue when the user does not have browse users permission. If you want to make
             * it disabled (e.g. uneditable) use the 'uneditable' option parameter
             */
            if (this.options.disabled) {
                this._createFurniture(true);
                return this;
            }

            jQuery.extend(this, SelectHelper);

            this._createFurniture();
            this._createSuggestionsController();
            this._createDropdownController();
            this._createListController();
            this._assignEventsToFurniture();
            this._setInitState();

            if (this.options.width) {
                this.setFieldWidth(this.options.width);
            }
            if (this.$overlabel) {
                this.$overlabel.overlabel(this.$field);
            }

            if (this.options.uneditable) {
                this.disable();
            }

            /**
             * Fired when the control has finished rendering and prepared for user input. Emitted from the &lt;select&gt; element.
             * @event SingleSelect#initialized
             * @type {jQuery}
             * @property {SingleSelect} instance
             */
            this.model.$element.addClass("aui-ss-select").trigger("initialized", [this]);
        },

        /**
         * Disable the select field by making the user unable to modify the contents or input any value
         */
        disable: function() {
            this.$container.find(".drop-menu").addClass('hidden');
            this.$container.find("input").attr("disabled", "disabled");
            this.$container.find("input").attr("aria-disabled", "true");

            this._super();
        },

        /**
         * Enable the select field again allowing the user to change the contents in the select field.
         */
        enable: function() {
            this.$container.find(".drop-menu").removeClass('hidden');
            this.$container.find("input").removeAttr("disabled");
            this.$container.find("input").removeAttr("aria-disabled");

            this._super();
        },

        _setInitState: function () {
            if (this.options.editValue) {
                this._setEditingMode();
                this.$field.val(this.options.editValue);
                // display selected, if there is one.
            } else if (this.getSelectedDescriptor()) {
                this.setSelection(this.getSelectedDescriptor());
                // otherwise turn editing on
            } else {
                this._setEditingMode();
                if (this.options.inputText) { // inputText is really placeholder text
                    this.$field.val(this.options.inputText);
                }
            }
        },

        _createSelectModel: function () {
            if (this.options.model) {
                //use provided model type
                this.model = new this.options.model({
                    element: this.options.element,
                    removeOnUnSelect: this.options.removeOnUnSelect
                });
            }
            else {
                // Used to retrieve and set options in our <select> element via a JSON interface
                this.model = new SelectModel({
                    element: this.options.element,
                    removeOnUnSelect: this.options.removeOnUnSelect
                });
            }

        },

        _createDropdownController: function () {
            this.dropdownController = InlineLayerFactory.createInlineLayers({
                alignment: LayerConstants.LEFT,
                offsetTarget: this.$field,
                content: jQuery(".aui-list", this.$container),
                setMaxHeightToWindow: this.options.setMaxHeightToWindow,
                minHeight: this.options.minHeight
            });
        },

        _createSuggestionsController: function () {
            this.suggestionsHandler = this.options.suggestionsHandler ?
                    new this.options.suggestionsHandler(this.options, this.model) :
                    new SelectSuggestHandler(this.options, this.model);
        },

        _assignEventsToFurniture: function () {
            var instance = this;
            this._super();
            this.model.$element.bind("reset", function () {
                var selectedDescriptor = instance.getSelectedDescriptor();
                if (selectedDescriptor) {
                    instance.setSelection(instance.getSelectedDescriptor());
                }
            })
            .bind("showSuggestions", function (e) {
                instance._handleDown(e);
            })
            .bind("hideSuggestions", function () {
                instance.hideSuggestions();
            })
            .bind("set-selection-value", function (e, value) {
                instance._setDescriptorWithValue(value);
            });
        },

        /**
         * Sets field width
         *
         * @param {Number} width - field width
         */
        setFieldWidth: function (width) {
            this.$container.css({maxWidth: width});
            this.$field.css({maxWidth: width});
        },

        _createListController: function () {
            var instance = this;
            this.listController = new List({
                containerSelector: jQuery(".aui-list", this.$container),
                groupSelector: "ul.aui-list-section",
                matchingStrategy: this.options.matchingStrategy,
                maxInlineResultsDisplayed: this.options.maxInlineResultsDisplayed,
                matchItemText: this.options.matchItemText,
                hasLinks: this.options.hasLinks,
                selectionHandler: function (e) {
                    var selectedSuggestion = this.getFocused();
                    var selectedDescriptor = selectedSuggestion.data("descriptor");

                    instance.setSelection(selectedDescriptor);
                    instance.$field.select();

                    e.preventDefault();
                    return false;
                }
            });
        },

        /**
         * Returns the selected descriptor. Undefined if there is none.
         *
         * @return {ItemDescriptor}
         */
        getSelectedDescriptor: function () {
            return this.model.getDisplayableSelectedDescriptors()[0];
        },

        /**
         * Gets the value that has been configured to display to the user. Uses label by default.
         *
         * @param {ItemDescriptor} descriptor
         * @return {String}
         */
        getDisplayVal: function (descriptor) {
            return descriptor[this.options.itemAttrDisplayed || "label"]();
        },

        /**
         * Gets default options
         *
         * @protected
         * @return {Object}
         */
        _getDefaultOptions: function () {
            return jQuery.extend(true, this._super(), {
                errorMessage: formatter.I18n.getText("jira.ajax.autocomplete.error"),
                revertOnInvalid: false,
                showDropdownButton: true
            });
        },

        /**
         * Appends furniture around specified dropdown element. This includes:
         *
         * <ul>
         *  <li>errorMessage - A container for error messages is created but not appended until needed</li>
         *  <li>selectedItemsWrapper - A wrapper for selected items</li>
         *  <li>selectedItemsContainer - A container for selected items</li>
         * </ul>
         *
         * @protected
         */
        _createFurniture: function (disabled) {

            var id = this.model.$element.attr("id");
            this.model.$element.data("aui-ss", true);
            this.$container = this._render("container", this.model.id);

            var containerClass = this.model.$element.data('container-class');
            if (containerClass) {
                this.$container.addClass(containerClass);
            }

            if (disabled) {
                var value = this.model.$element.val() && this.model.$element.val()[0];
                value = value || "";
                this.model.$element.replaceWith(this._render("disableSelectField", id, value));
            } else {
                var placeholder = this.model.getPlaceholder();

                this.$field = this._render("field", this.model.id, placeholder).appendTo(this.$container);

                this.$label = jQuery('label[for=' + jQuery.escapeSelector(this.model.id) + ']');
                if(this.$label.length) {
                    this.$label.attr('for', this.$field.attr('id'));
                }
                if (placeholder && !this._placeholderSupported()) { // emulate HTML5 placeholder attribute behaviour.
                    this.options.overlabel = placeholder;
                    this.$overlabel = this._render("overlabel").insertBefore(this.$field);
                }
                var $suggestionsContainer = this._render("suggestionsContainer", this.model.id);
                this.suggestionsContainerId = $suggestionsContainer.attr("id");
                this.$container.append($suggestionsContainer);
                this.$field.attr("aria-controls", $suggestionsContainer.attr("id"));
                this.$container.insertBefore(this.model.$element);
                this.$dropDownIcon = this._render("dropdownAndLoadingIcon", this._hasDropdownButton()).appendTo(this.$container);
                this.$errorMessage = this._render("errorMessage");
            }
        },

        _placeholderSupported: function() {
            return !(Navigator.isIE() && Navigator.majorVersion() < 10);
        },

        /**
         * If there is a selection, search for everything, otherwise use the field value.
         *
         * @return {String}
         */
        getQueryVal: function () {
            if (this.$container.hasClass("aui-ss-editing")) {
                return jQuery.trim(this.$field.val());
            } else {
                return "";
            }
        },

        /**
         * Adds supplied suggestions to dropdown and &lt;select&gt; list
         *
         * @param {Object} data - JSON representing suggestions
         * @param {Object} context - JSON representing suggestion context, including:
         */
        _setSuggestions: function (data, context) {
            if (data) {
                this._super(data, context);
                this.model.$element.trigger("suggestionsRefreshed", [this]);
            } else {
                this.hideSuggestions();
            }
        },

        /**
         * Sets to editing mode. Clearing the appearence of a selection.
         */
        _setEditingMode: function () {
            this.$container.addClass("aui-ss-editing")
                    .removeClass("aui-ss-has-entity-icon");
            // Workaround for IE9 form element styling bug JRADEV-6299
            this.$field.css("paddingLeft");
        },

        _hasIcon: function () {
            var icon;
            var selectedDescriptor = this.getSelectedDescriptor();
            if (selectedDescriptor) {
                icon = selectedDescriptor.icon();
                return icon && icon !== "none";
            }
        },

        /**
         * Sets to readonly mode. Displaying the appearence that something is selected.
         */
        _setReadOnlyMode: function () {

            this.$container.removeClass("aui-ss-editing");

            if (this._hasIcon()) {
                this.$container.addClass("aui-ss-has-entity-icon");
                // Workaround for IE9 form element styling bug JRADEV-6299
                if (Navigator.isIE() && Navigator.majorVersion() > 8) {
                    this.$container.append(this.$field.detach());
                }
            }
        },

        /**
         * Submits form
         */
        submitForm: function () {
            if (!this.suggestionsVisible) {
                this.handleFreeInput();
                jQuery(this.$field[0].form).submit(); // submit on enter if field is empty
            }
        },

        /**
         * Allows a selection to made based on the value of an option. Useful for tests.
         *
         * @param value - internal value of an option item to select. If no matching options exists nothing happens.
         */
        selectValue: function (value) {
            this.listController.selectValue(value);
        },

        /**
         * The selected value of the `SingleSelect` has changed. Emitted from {@link #$field}.
         * @event SingleSelect#change
         * @type {jQuery}
         */

        /**
         * Sets as selected in model and changes styling to demonstrate selection
         * @fires SingleSelect#change
         * @fires SingleSelect#selected
         * @param {ItemDescriptor} descriptor
         * @param {boolean} triggerChangeEvent should selection change trigger underlying DOM element change event
         */
        setSelection: function (descriptor,triggerChangeEvent) {
            triggerChangeEvent = typeof triggerChangeEvent !== 'undefined' ? triggerChangeEvent : true;
            if (typeof descriptor === "string") {
                descriptor = new ItemDescriptor({
                    value: descriptor,
                    label: descriptor
                });
            }

            this.removeFreeInputVal();

            // We need to update this.$field's value *before* calling this.model.setSelected(descriptor),
            // otherwise subsequent this.getSelectedDescriptor() calls won't return the descriptor we want.
            this.$field.val(descriptor.fieldText() || this.getDisplayVal(descriptor));

            this.$field.trigger("change");

            if (this.model.setSelected(descriptor,triggerChangeEvent)) {
                this.hideErrorMessage();
            }

            if (this._hasIcon()) {
                if (this.$entityIcon) {
                    this.$entityIcon.remove();
                }

                this.$entityIcon = this._render("entityIcon", descriptor.icon()).appendTo(this.$container);
            }

            this._setReadOnlyMode();
            this.hideSuggestions();

            this.lastSelection = descriptor;
            /**
             * Indicates a new value has been set on the `SingleSelect` model. Emitted from the &lt;select&gt; element.
             * @event SingleSelect#selected
             * @type {jQuery}
             * @property {ItemDescriptor} descriptor
             * @property {SingleSelect} instance
             */
            this.model.$element.trigger("selected", [descriptor, this]);
        },

        /**
         * Clears the control - selection and field text.
         */
        clear: function () {
            this.$field.val('');
            this.hideSuggestions();
            this.clearSelection();
        },

        /**
         * Clears selection and sets back to editing mode
         * @fires SingleSelect#unselect
         */
        clearSelection: function () {

            var instance = this;
            instance._setEditingMode();
            instance.model.setAllUnSelected();
            /**
             * Indicates the `SingleSelect`'s value has been cleared. Emitted from the &lt;select&gt; element.
             * @event SingleSelect#unselect
             * @type {jQuery}
             * @prop {SingleSelect} instance
             */
            instance.model.$element.trigger("unselect", [this]);
        },

        /**
         * Removal of items in select list if we are replacing them from the server.
         *
         * @override
         * @protected
         * @param {Array} data
         */
        _handleServerSuggestions: function (data) {
            this.cleanUpModel();
            this._super(data);
        },

        /**
         * If we are querying the server then the server will return the full result set to be displayed. We do not
         * want any linguring options in there.
         */
        cleanUpModel: function () {
            if (this.options.ajaxOptions.query) {
                this.model.clearUnSelected();
            }
        },

        /**
         * Handles editing of input value
         * @fires SingleSelect#query
         */
        onEdit: function() {
            if (this.getSelectedDescriptor()) {
                this.clearSelection();
            }
            this._super();
            /**
             * The user has typed something in to the input of the `SingleSelect`. Emitted from the &lt;select&gt; element.
             * @event SingleSelect#query
             * @type {jQuery}
             */
            this.model.$element.trigger("query");
        },

        /**
         * Handle the case where text remains unselected in the text field
         */
        handleFreeInput: function(value) {

            value = value || jQuery.trim(this.$field.val());

            if (this.options.revertOnInvalid && !this.model.getDescriptor(value)) {
                this.setSelection(this.lastSelection || "");
            } else if (this.$container.hasClass("aui-ss-editing")) {
                if (this._setDescriptorWithValue(value)) {
                    this.hideErrorMessage();
                } else if (!this.options.submitInputVal) {
                    this.showErrorMessage(value);
                }
            }
        },

        _setDescriptorWithValue: function (value) {
            var descriptor = this.model.getDescriptor(value);
            if (descriptor) {
                this.setSelection(descriptor);
                return true;
            }
            return false;
        },

        _handleCharacterInput: function (force) {
            this._super(force);
            if (this.$container.hasClass("aui-ss-editing")) {
                this.updateFreeInputVal();
            }
        },

        _deactivate: function () {
            this.handleFreeInput();
            this.hideSuggestions();
        },

        keys: {
            "Return": function (e) {
                this.submitForm();
                e.preventDefault();
             },
            "Tab" : function () {
                this.acceptFocusedSuggestion();
            }
        },

        _events: {
            field: {
                focus: function () {
                    var instance = this;
                    window.setTimeout(function () {
                        if (instance.$field.is(":focus")) {
                            instance.$field.select();
                        }
                    }, 0);
                },
                click: function () {
                    this._handleCharacterInput(true);
                }
            }
        },

        _renders: {
            label: function (label, id) {
                return jQuery("<label />").attr("for", id).attr("id", id + '-label').text(label).addClass("overlabel");
            },
            errorMessage: function () {
                return jQuery('<div class="error" />');
            },
            entityIcon: function (url) {
                var icon = jQuery('<img class="aui-ss-entity-icon" alt=""/>');
                icon.attr("src", url);
                return icon;
            },
            field: function (idPrefix, placeholder) {
                var $field = this._render("baseField").attr({
                    "class": "text aui-ss-field ajs-dirty-warning-exempt",
                    "id": idPrefix + "-field",
                    "type": "text"
                });
                if (placeholder) {
                    $field.attr("placeholder", placeholder);
                }
                return $field;
            },
            disableSelectField: function (id, value) {
                return jQuery("<input type='text' class='text long-field' />").attr({
                    "value": value,
                    "name": id,
                    "id": id
                });
            },
            container : function (idPrefix) {
                return jQuery('<div class="aui-ss" />')
                    .toggleClass("ajax-ss", !!this.options.ajaxOptions)
                    .attr("id", idPrefix + '-single-select');
            },
            dropdownAndLoadingIcon: function (showDropdown) {
                return jQuery('<span class="icon aui-ss-icon noloading"><span>More</span></span>')
                    .toggleClass("drop-menu", !!showDropdown);
            }
        }
    });

});

AJS.namespace('AJS.SingleSelect', null, require('jira/ajs/select/single-select'));