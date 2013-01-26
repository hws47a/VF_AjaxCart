This is a simple ajax cart based on [VF_EasyAjax module](https://github.com/hws47a/VF_EasyAjax). Install it before usage current module.

Module contains only one .js file and no block/controller/helper/model files.
All ajax functionality based only on ajax js requests and [VF_EasyAjax module](https://github.com/hws47a/VF_EasyAjax).

Current works via ajax:
* On each page:
  * add product to cart from product and category pages via ajax and show messages as alert.
  * remove item from cart sidebar via ajax
  * update cart sidebar for community edition
  * update top links
* On configure product page:
  * update product on configure page via ajax
* On cart page:
  * update qty and clear items button
  * remove item buttons

Module is comportable with [modman](https://github.com/hws47a/modman-relative-links).
Developed with help of [MTool](https://github.com/hws47a/MTool)
