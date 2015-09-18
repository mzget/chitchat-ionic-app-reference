class HashGenerator {
    constructor() { }

    public hashCompute(content: string, callback: (err, res) => void) {
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var hash = CryptoJS.MD5(content);
            var md = hash.toString(CryptoJS.enc.Hex);

            callback(null, md);
        });
    }
}