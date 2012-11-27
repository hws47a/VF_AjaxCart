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
    sidebarRemoveLinkSelector: 'a.btn-remove',
    urlMatch: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/,
    initialize: function () {
        this._observeButtons();
        this._observeSidebar();
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
        $$(this.sidebarCartSelector + ' ' + this.sidebarRemoveLinkSelector).each(function(th) {
            th.observe('click', function (e) {
                Event.stop(e);
                _this.openCart(th.href, {});
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
    openCart: function(href, params) {
        var _this = this;
        var loadContent = 'action_content[0]=cart_sidebar'
        params = (params) ? params + '&' + loadContent : loadContent;
        //set that it is easy ajax
        params += '&easy_ajax=1';
        new Ajax.Request(href, {
            method: 'post',
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
                    }
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
        alert(message.code);
    }
});

document.observe("dom:loaded", function() {
    new AjaxCart;
});