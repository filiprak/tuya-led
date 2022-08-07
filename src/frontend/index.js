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
            this.color = color.hsv;
            this.sendUpdate();
        },
        sendUpdate () {
            if (!this._dbSendUpdate) {
                this._dbSendUpdate = _.debounce(() => {
                    electronAPI.send({
                        color: {
                            h: (+this.color.h).toFixed(3),
                            s: (+this.color.s * 2.55).toFixed(3),
                            v: (+this.color.v * 2.55).toFixed(3),
                        },
                    });
                }, 200);
            }
            this._dbSendUpdate();
        },
    },
    mounted () {
        this._picker = new iro.ColorPicker('#picker');
        this._picker.on('color:change', this.onColorChange);
    },
    created () {

    },
});
