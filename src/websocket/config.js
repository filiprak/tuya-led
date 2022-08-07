class TuyaRegionConfigEnum {
    static CN = 'wss://mqe.tuyacn.com:8285/'
    static US = 'wss://mqe.tuyaus.com:8285/'
    static EU = 'wss://mqe.tuyaeu.com:8285/'
    static IN = 'wss://mqe.tuyain.com:8285/'
}

class TUYA_PASULAR_ENV {
    static PROD = 'prod'
    static TEST = 'test'
}

const TuyaEnvConfig = Object.freeze({
    [TUYA_PASULAR_ENV.PROD]: {
        name: TUYA_PASULAR_ENV.PROD,
        value: 'event',
        desc: 'online environment',
    },
    [TUYA_PASULAR_ENV.TEST]: {
        name: TUYA_PASULAR_ENV.TEST,
        value: 'event-test',
        desc: 'test environment',
    },
})

module.exports.TuyaEnvConfig = TuyaEnvConfig

module.exports.getTuyaEnvConfig = function (env) {
    return TuyaEnvConfig[env]
}

module.exports.TUYA_PASULAR_ENV = TUYA_PASULAR_ENV
module.exports.TuyaRegionConfigEnum = TuyaRegionConfigEnum
