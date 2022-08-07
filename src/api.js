const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const env = require('../.env.json');
const LEDStatus = require('./models/led_status');


class ApiClient {
    static base_url = 'https://openapi.tuyaeu.com';
    static client_id = env.TUYA_CLIENT_ID;
    static secret_key = env.TUYA_SECRET_KEY;

    device_id = env.TUYA_DEVICE_ID;
    token = '';
    refresh_token = '';
    token_expire = Date.now();

    constructor() {
        this.axios = axios.create({
            baseURL: ApiClient.base_url,
            timeout: 5000,
        });
    }

    async getToken () {
        if (!this.refresh_token) {
            const method = 'GET';
            const timestamp = Date.now().toString();
            const sign_url = '/v1.0/token?grant_type=1';
            const content_hash = crypto.createHash('sha256').update('').digest('hex');
            const string_to_hash = [method, content_hash, '', sign_url].join('\n');
            const sign_str = ApiClient.client_id + timestamp + string_to_hash;

            const headers = {
                t: timestamp,
                sign_method: 'HMAC-SHA256',
                client_id: ApiClient.client_id,
                sign: await this.encryptStr(sign_str, ApiClient.secret_key),
            };
            const { data: login } = await this.axios.get(sign_url, { headers });

            if (!login || !login.success) {
                throw Error(`Failed to load token: ${login.msg}`);
            }

            this.refresh_token = login.result.refresh_token;
            this.token_expire = Date.now() + (login.result.expire_time * 1000);

            return this.token = login.result.access_token;

        } else if (Date.now() > this.token_expire - 5000) {
            return this.refreshToken();
        } else {
            return this.token;
        }
    }

    async refreshToken () {
        const method = 'GET';
        const timestamp = Date.now().toString();
        const sign_url = `/v1.0/token/${this.refresh_token}`;
        const content_hash = crypto.createHash('sha256').update('').digest('hex');
        const string_to_hash = [method, content_hash, '', sign_url].join('\n');
        const sign_str = ApiClient.client_id + timestamp + string_to_hash;

        const headers = {
            t: timestamp,
            sign_method: 'HMAC-SHA256',
            client_id: ApiClient.client_id,
            sign: await this.encryptStr(sign_str, ApiClient.secret_key),
        };
        const { data: login } = await this.axios.get(sign_url, { headers });

        if (!login || !login.success) {
            throw Error(`Failed to refresh token: ${login.msg}`);
        }

        this.refresh_token = login.result.refresh_token;
        this.token_expire = Date.now() + (login.result.expire_time * 1000);

        return this.token = login.result.access_token;
    }

    /**
     * HMAC-SHA256 crypto function
     */
    async encryptStr (str, secret) {
        return crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex').toUpperCase();
    }

    async getRequestSign (
        url,
        method,
        headers = {},
        query = {},
        body = {},
    ) {
        await this.getToken()

        const t = Date.now().toString();

        const [uri, path_query] = url.split('?');
        const query_merged = Object.assign(query, qs.parse(path_query));
        const sorted_query = {};

        Object.keys(query_merged)
            .sort()
            .forEach((i) => (sorted_query[i] = query[i]));

        const querystring = decodeURIComponent(qs.stringify(sorted_query));
        const path = querystring ? `${uri}?${querystring}` : uri;
        const content_hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
        const string_to_sign = [method, content_hash, '', url].join('\n');
        const sign_str = ApiClient.client_id + this.token + t + string_to_sign;

        return {
            t,
            path: path,
            client_id: ApiClient.client_id,
            sign: await this.encryptStr(sign_str, ApiClient.secret_key),
            sign_method: 'HMAC-SHA256',
            access_token: this.token,
        };
    }

    async call (url, method, body = {}, query = {}) {
        const req_headers = await this.getRequestSign(url, method, {}, query, body);

        const { data } = await this.axios.request({
            method,
            data: body,
            params: {},
            headers: req_headers,
            url: req_headers.path,
        });

        if (!data || !data.success) {
            throw Error(`API Request failed: ${data.msg}`);
        }

        return data;
    }

    async getLEDStatus () {
        const { result } = await this.call(
            `/v1.0/devices/${this.device_id}/status`,
            'GET'
        )

        return LEDStatus.fromJSON(result);
    }

    async switchLED (enable) {
        return await this.call(
            `/v1.0/devices/${this.device_id}/commands`,
            'POST',
            {
                commands: [
                    {
                        code: 'switch_led',
                        value: !!enable,
                    }
                ],
            }
        )
    }

    async toggleLED (enable) {
        const status = await this.getLEDStatus();

        enable = enable !== undefined ? enable : !status.isEnabled()

        await this.switchLED(enable);
    }

    async setLEDColor (hsv_color) {
        return await this.call(
            `/v1.0/devices/${this.device_id}/commands`,
            'POST',
            {
                commands: [
                    {
                        code: 'colour_data',
                        value: hsv_color,
                    }
                ],
            }
        )
    }
}

module.exports = ApiClient;
