class LEDCode {
    static SWITCH_LED = 'switch_led'
    static COLOUR_DATA = 'colour_data'
}

class LEDStatus {
    loading = false
    switch_led = false
    colour_data = {}

    constructor(params = {}) {
        for (let key in params) {
            this[key] = params[key];
        }
    }

    static fromJSON(json) {
        return new LEDStatus().merge(json);
    }

    merge(json) {
        json.forEach(param => {
            if (param.code === LEDCode.SWITCH_LED) {
                this.switch_led = !!param.value
            }
            if (param.code === LEDCode.COLOUR_DATA) {
                this.colour_data = param.value
            }
        });

        return this;
    }

    isEnabled() {
        return this.switch_led
    }

    setEnabled(enabled) {
        this.switch_led = !!enabled
    }

    getColourData() {
        return this.colour_data
    }

    isLoading() {
        return this.loading
    }

    setLoading(loading) {
        this.loading = !!loading
    }
}

module.exports = LEDStatus;
