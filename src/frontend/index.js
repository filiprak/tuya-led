new Vue({
    el: '#app',
    template: `
        <div class="wrapper">
            <form class="led-form">
                <div id="picker"></div>
            </form>
        </div>
    `,
    data () {
        return {
            color: {
                h: 0,
                s: 0,
                v: 0,
            }
        }
    },
    methods: {
        onColorChange (color) {
            const old = JSON.stringify(this.color);
            const nw = JSON.stringify(color.hsv);
            this.color = color.hsv;

            if (nw !== old) {
                this.sendUpdate();
            }
        },
        sendUpdate () {
            if (!this._dbSendUpdate) {
                this._dbSendUpdate = _.debounce(() => {
                    electronAPI.send({
                        color: {
                            h: (+this.color.h).toFixed(0),
                            s: (+this.color.s * 2.55).toFixed(0),
                            v: (+this.color.v * 2.55).toFixed(0),
                        },
                    });
                }, 200);
            }
            this._dbSendUpdate();
        },
        onServerMessage (message) {
            const code = message.status.filter(i => i.code === 'colour_data')[0];

            if (code) {
                const hsv = JSON.parse(code.value);
                this._picker.color.set({
                    h: (hsv.h).toFixed(0),
                    s: (hsv.s / 2.55).toFixed(0),
                    v: (hsv.v / 2.55).toFixed(0),
                });
            }
        },
    },
    mounted () {
        this._picker = new iro.ColorPicker('#picker');
        this._picker.on('color:change', this.onColorChange);
    },
    created () {
        electronAPI.listen(this.onServerMessage);
    },
});
