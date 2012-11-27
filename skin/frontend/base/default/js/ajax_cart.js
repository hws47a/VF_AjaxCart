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
    urlMatch: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/,
    initialize: function () {
        this.observeButtons();
    },
    observeButtons: function() {
        var self = this;
        $$(this.buttonSelector).each(function(th) {
            var href = '';
            var params = {};
            if (th.onclick) {
                href = th.onclick.toString().match(self.urlMatch);
                if (href) {
                    href = href[0];
                }
                th.onclick = null;
            }
            if (!href) {
                var form = th.up('form');
                if (form) {
                    href = form.action;
                    params = form.serialize();
                }
            }
            th.observe('click', function(e) {
                Event.stop(e);
                self.openCart(href, params);
            });
        });
    },
    openCart: function(href, params) {
        new Ajax.Request(href, {
            method: 'post',
            parameters: params,
            onComplete: function (transport) {
                var response = transport.responseJSON;
                if (response) {
                    var messages = response.messages;
                    if (messages) {
                        var message = messages[0];
                        if (message) {
                            alert(message.code);
                        }
                    }
                } else {
                    alert('ERROR!');
                }
            }
        });
    }
});

document.observe("dom:loaded", function() {
    new AjaxCart;
});