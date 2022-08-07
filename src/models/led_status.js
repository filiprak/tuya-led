class LEDCode {
    static SWITCH_LED = 'switch_led'
}

class LEDStatus {
    loading = false
    switch_led = false

    constructor(params) {
        for (let key in params) {
            this[key] = params[key];
        }
    }

    static fromJSON(json) {
        const params = {};

        json.forEach(param => {
            if (param.code === LEDCode.SWITCH_LED) {
                params.switch_led = !!param.value;
            }
        });

        return new LEDStatus(params);
    }

    isEnabled() {
        return this.switch_led
    }

    setEnabled(enabled) {
        this.switch_led = !!enabled
    }

    isLoading() {
        return this.loading
    }

    setLoading(loading) {
        this.loading = !!loading
    }
}

module.exports = LEDStatus;
