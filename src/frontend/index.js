iro.ColorPicker.prototype.setColor = function (hsv) {
    this.color.$.h = hsv.h
    this.color.$.s = hsv.s
    this.color.$.v = hsv.v
    this.color.$.a = 1
    this.forceUpdate()
}

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
            },
            last_t: -1,
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
            console.log(message)
            const code = message.status.filter(i => i.code === 'colour_data')[0];

            if (code && code.t > this.last_t) {
                const hsv = JSON.parse(code.value);
                this._picker.setColor({
                    h: (hsv.h).toFixed(0),
                    s: (hsv.s / 2.55).toFixed(0),
                    v: (hsv.v / 2.55).toFixed(0),
                });

                this.last_t = code.t;
            }
        },
    },
    mounted () {
        this._picker = window.p = new iro.ColorPicker('#picker', {
            borderWidth: 2
        })
        this._picker.on('input:end', this.onColorChange)
        this._picker.on('mount', () => {
            electronAPI.listen(this.onServerMessage)
            electronAPI.requestState()
        });
    },
});
