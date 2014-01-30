  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
        {
            "file": "www/js/InAppPurchase.js",
            "id": "com.phonegap.plugins.inapppurchase.InAppPurchase",
            "clobbers": [
                "storekit"
        ]
        }
    ]
    });