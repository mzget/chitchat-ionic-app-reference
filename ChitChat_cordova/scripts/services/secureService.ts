class SecureService {
    private password: string = "CHITCHAT!@#$%^&*()_+|===";
//    private passiv: string = "ThisIsUrPassword";

    constructor() { }

    public hashCompute(content: string, callback: (err, res) => void) {
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var hash = CryptoJS.MD5(content);
            var md = hash.toString(CryptoJS.enc.Hex);

            callback(null, md);
        });
    }

    public encryption(content: string, callback: Function) {
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var ciphertext = CryptoJS.AES.encrypt(content, password);

            callback(null, ciphertext.toString());
        });
    }

    public decryption(content: string, callback: Function) {
        this.hashCompute(password, (err, res) => {
            require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
                //   var words = CryptoJS.enc.Base64.parse(content);
                var bytes = CryptoJS.AES.decrypt(content, password);
                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                callback(null, plaintext);
            });
        });
    }
}