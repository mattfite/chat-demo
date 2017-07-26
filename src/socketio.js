import v4 from 'aws-signature-v4';
import crypto from 'crypto';
import { MqttClient } from 'mqtt';
import websocket from 'websocket-stream';

import {
    AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY,
    AWS_IOT_ENDPOINT_HOST,
    AWS_REGION,
    MQTT_TOPIC
} from '../credentials.json';

import $ from 'jquery';

const client = new MqttClient(() => {
    const url = v4.createPresignedURL(
        'GET',
        AWS_IOT_ENDPOINT_HOST.toLowerCase(),
        '/mqtt',
        'iotdevicegateway',
        crypto.createHash('sha256').update('', 'utf8').digest('hex'),
        {
            'region': AWS_REGION,
            'key': AWS_ACCESS_KEY,
            'secret': AWS_SECRET_ACCESS_KEY,
            'protocol': 'wss',
            'expires': 15
        }
    );

    console.debug('Connecting to URL: ' + url);
    return websocket(url, [ 'mqttv3.1' ]);
});

client.on('connect', () => {
    console.debug('Successfully connected to AWS IoT Broker!  :-)');
    client.subscribe(MQTT_TOPIC);
});

client.on('close', () => {
    console.debug('Failed to connect :-(');
    client.end();  // don't reconnect
});

client.on('message', (topic, message) => {
    console.debug('Incoming message: ' + message.toString());
    $('#messages').append($('<li>').text(message));
});

$('form').submit(() => {
    const $m = $('#m');
    const message = $m.val();

    if (client.connected) {
        console.debug('Outgoing message: ' + message);
        client.publish(MQTT_TOPIC, message);
        $m.val('');
    }

    return false;
});
