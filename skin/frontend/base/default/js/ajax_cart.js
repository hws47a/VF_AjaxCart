/**
 * Vladimir Fishchenko extension for Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade
 * the Oggetto AjaxCart module to newer versions in the future.
 * If you wish to customize the Oggetto AjaxCart module for your needs
 * please refer to http://www.magentocommerce.com for more information.
 *
 * @category   design
 * @package    base_default
 * @copyright  Copyright (C) 2012 Vladimir Fishchenko (http://fishchenko.com/)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
var AjaxCart = Class.create({
    buttonSelector: '.btn-cart',
    sidebarCartSelector: '.block-cart',
    removeLinkSelector: 'a.btn-remove',
    cartPageSelector: '.checkout-cart-index',
    cartPageUpdateButtonsSelector: 'button[name=update_cart_action]',
    topLinksSelector: '.links',
    urlMatch: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/,
    initialize: function () {
        this.isLoading = false;

        this._observeButtons();
        this._observeSidebar();
        this._observeCartPage();
    },
    _observeButtons: function() {
        var _this = this;
        $$(this.buttonSelector).each(function(th) {
            var href = '';
            if (th.onclick) {
                href = th.onclick.toString().match(_this.urlMatch);
                if (href) {
                    href = href[0];
                }
                th.onclick = null;
            }
            if (!href) {
                var form = th.up('form');
                if (form) {
                    href = form.action;
                }
            }
            th.observe('click', function(e) {
                Event.stop(e);
                var form = th.up('form');
                var params = '';
                if (form) {
                    params = form.serialize();
                }
                _this.openCart(href, params);
            });
        });
    },
    _observeSidebar : function () {
        var _this = this;
        $$(this.sidebarCartSelector + ' ' + this.removeLinkSelector).each(function(th) {
            th.observe('click', function (e) {
                Event.stop(e);
                _this.openCart(th.href, {});
            });
        });
    },
    _observeCartPage : function () {
        var _this = this;

        var updateCartPage = function (transport) {
            var response = transport.responseJSON;
            if (response) {
                if (response['custom_content_data']['checkout.cart']) {
                    var element = new Element('div');
                    element.update(response['custom_content_data']['checkout.cart']);

                    //update cart table
                    var cartTableNew = element.down('#shopping-cart-table');
                    var cartTable = $('shopping-cart-table');
                    if (cartTable && cartTableNew) {
                        cartTable.replace(cartTableNew);
                        _this._observeCartPage();
                    }

                    //update totals
                    var totalsNew = element.down('#shopping-cart-totals-table');
                    var totals = $('shopping-cart-totals-table');
                    if (totals && totalsNew) {
                        totals.replace(totalsNew);
                    }

                    //if no cartTable and totals - update all (usually for empty cart)
                    if (!cartTableNew && !totalsNew) {
                        var cart = $$('.cart').first();
                        if (cart) {
                            cart.replace(response['custom_content_data']['checkout.cart']);
                        }
                    }
                }
                _this.hideLoader();
            }
        };

        $$(this.cartPageSelector + ' ' + this.cartPageUpdateButtonsSelector).each(function (el) {
            el.observe('click', function (e) {
                var form = el.up('form');
                if (form) {
                    Event.stop(e);
                    var formData = '';
                    if (el.value == 'empty_cart') {
                        formData = 'update_cart_action=empty_cart';
                    } else {
                        formData = form.serialize();
                    }

                    if (_this.isLoading) {
                        return false;
                    }
                    _this.showLoader();
                    new EasyAjax.Request(form.action, {
                        method: 'post',
                        custom_content: ['checkout.cart'],
                        parameters: formData,
                        onComplete: updateCartPage
                    });
                }
            });
        });
        $$(this.cartPageSelector + ' ' + this.removeLinkSelector).each(function (el) {
            el.observe('click', function (e) {
                Event.stop(e);
                if (_this.isLoading) {
                    return false;
                }
                _this.showLoader();
                new EasyAjax.Request(el.href, {
                    method: 'get',
                    custom_content: ['checkout.cart'],
                    onComplete: updateCartPage
                });
            });
        });
    },
    _updateSidebarCart : function(data) {
        var cartOld = $$(this.sidebarCartSelector).first();
        if (cartOld) {
            cartOld.replace(data);
            this._observeSidebar();
        }
    },
    _updateTopLinks: function(data) {
        var topLinks = $$(this.topLinksSelector).first();
        if (topLinks) {
            topLinks.replace(data);
        }
    },
    openCart: function(href, params) {
        var _this = this;
        if (this.isLoading) {
            return false;
        }
        this.showLoader();
        new EasyAjax.Request(href, {
            method: 'post',
            action_content: ['cart_sidebar', 'top.links'],
            parameters: params,
            onComplete: function (transport) {
                var response = transport.responseJSON;
                if (response) {
                    var messages = response.messages;
                    var actionContent = response['action_content_data'];
                    if (actionContent) {
                        var cartNewData = actionContent['cart_sidebar'];
                        if (cartNewData) {
                            _this._updateSidebarCart(cartNewData);
                        }
                        var topLinks = actionContent['top.links'];
                        if (topLinks) {
                            _this._updateTopLinks(topLinks);
                        }
                    }
                    _this.hideLoader();
                    if (messages) {
                        var message = messages[0];
                        if (message) {
                            _this.showMessage(message);
                        }
                    }
                } else {
                    alert('ERROR!');
                }
            }
        });
    },
    showMessage : function (message) {
        var modal = $('ajax-cart-modal');
        if (modal) {
            $('ajax-cart-modal-message').update(message.code);
            modal.show();
        } else {
            alert(message.code);
        }
    },
    showLoader : function () {
        this.isLoading = true;
        var loader = $('ajax-cart-loading-mask');
        if (loader) {
            loader.show();
        }
    },
    hideLoader : function () {
        this.isLoading = false;
        var loader = $('ajax-cart-loading-mask');
        if (loader) {
            loader.hide();
        }
    }
});

document.observe("dom:loaded", function() {
    new AjaxCart;
});