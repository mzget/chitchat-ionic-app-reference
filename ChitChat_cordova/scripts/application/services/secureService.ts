class SecureService {
    private key: string = "CHITCHAT!@#$%^&*()_+|===";
    private passiv: string = "ThisIsUrPassword";

    constructor() { }

    public hashCompute(content: string, callback: (err, res) => void) {
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var hash = CryptoJS.MD5(content);
            var md = hash.toString(CryptoJS.enc.Hex);

            callback(null, md);
        });
    }

    public encryption(content: string, callback: Function) {
        var self = this;
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var ciphertext = CryptoJS.AES.encrypt(content, self.key);

            callback(null, ciphertext.toString());
        });
    }

    public decryption(content: string, callback: Function) {
        var self = this;
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            //   var words = CryptoJS.enc.Base64.parse(content);
            var bytes = CryptoJS.AES.decrypt(content, self.key);
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            callback(null, plaintext);
        });
    }

    public encryptWithSecureRandom(content: string, callback: Function) {
        var self = this;
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });

            callback(null, ciphertext.toString());
        });
    }
    public decryptWithSecureRandom(content: string, callback: Function) {
        var self = this;
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var bytes = CryptoJS.AES.decrypt(content, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            var plaintext;
            try {
                plaintext = bytes.toString(CryptoJS.enc.Utf8);
            }
            catch (e) {
                console.error(e);
            }
            
            if (!!plaintext)
                callback(null, plaintext);
            else
                callback(new Error("cannot decrypt content"), content);
        });
    }
}