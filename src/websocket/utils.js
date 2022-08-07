const { MD5, AES, enc, mode, pad } = require('crypto-js');

module.exports.getTopicUrl = function (websocketUrl, accessId, env, query) {
    return `${websocketUrl}ws/v2/consumer/persistent/${accessId}/out/${env}/${accessId}-sub${query}`;
}

module.exports.buildQuery = function (query) {
    return Object.keys(query)
        .map((key) => `${key}=${encodeURIComponent(query[key])}`)
        .join('&');
}

module.exports.buildPassword = function (accessId, accessKey) {
    const key = MD5(accessKey).toString();
    return MD5(`${accessId}${key}`).toString().substr(8, 16);
}

module.exports.decrypt = function (data, accessKey) {
    try {
        const realKey = enc.Utf8.parse(accessKey.substring(8, 24));
        const json = AES.decrypt(data, realKey, {
            mode: mode.ECB,
            padding: pad.Pkcs7,
        });
        const dataStr = enc.Utf8.stringify(json).toString();
        return JSON.parse(dataStr);
    } catch (e) {
        return '';
    }
}

module.exports.encrypt = function (data, accessKey) {
    try {
        const realKey = enc.Utf8.parse(accessKey.substring(8, 24));
        const realData = JSON.stringify(data);
        const retData = AES.encrypt(realData, realKey, {
            mode: mode.ECB,
            padding: pad.Pkcs7,
        }).toString();
        return retData;
    } catch (e) {
        return '';
    }
}
