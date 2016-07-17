var CryptoJS;//= require("../lib/crypto-js/index");

class SecureService {
    private key: string = "CHITCHAT!@#$%^&*()_+|===";
    private passiv: string = "ThisIsUrPassword";

    constructor() {

    }

    public hashCompute(content: string, callback: (err, res) => void) {
        let hash = CryptoJS.MD5(content);
        let md = hash.toString(CryptoJS.enc.Hex);

        callback(null, md);
        
        // require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
        //     var hash = CryptoJS.MD5(content);
        //     var md = hash.toString(CryptoJS.enc.Hex);

        //     callback(null, md);
        // });
    }

    public encryption(content: string, callback: Function) {
        let self = this;
        let ciphertext = CryptoJS.AES.encrypt(content, self.key);
        callback(null, ciphertext.toString());

        // require([], function (CryptoJS) {
        //     var ciphertext = CryptoJS.AES.encrypt(content, self.key);

        //     callback(null, ciphertext.toString());
        // });
    }

    public decryption(content: string, callback: Function) {
        let self = this;
        let bytes = CryptoJS.AES.decrypt(content, self.key);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        callback(null, plaintext);
        /*
                require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
                    //   var words = CryptoJS.enc.Base64.parse(content);
                    var bytes = CryptoJS.AES.decrypt(content, self.key);
                    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    callback(null, plaintext);
                });
                */
    }

    public encryptWithSecureRandom(content: string, callback: Function) {
        let self = this;
        let key = CryptoJS.enc.Utf8.parse(self.key);
        let iv = CryptoJS.enc.Utf8.parse(self.passiv);
        let ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });

        callback(null, ciphertext.toString());

        /*
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });

            callback(null, ciphertext.toString());
        });
        */
    }
    public decryptWithSecureRandom(content: string, callback: Function) {
        let self = this;
        let key = CryptoJS.enc.Utf8.parse(self.key);
        let iv = CryptoJS.enc.Utf8.parse(self.passiv);
        let bytes = CryptoJS.AES.decrypt(content, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
        let plaintext;
        try {
            plaintext = bytes.toString(CryptoJS.enc.Utf8);
        }
        catch (e) {
            console.warn(e);
        }

        if (!!plaintext)
            callback(null, plaintext);
        else
            callback(new Error("cannot decrypt content"), content);

        /*
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var bytes = CryptoJS.AES.decrypt(content, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            var plaintext;
            try {
                plaintext = bytes.toString(CryptoJS.enc.Utf8);
            }
            catch (e) {
                console.warn(e);
            }

            if (!!plaintext)
                callback(null, plaintext);
            else
                callback(new Error("cannot decrypt content"), content);
        });
        */
    }
}