"use strict";

import v4 from 'aws-signature-v4';
import crypto from 'crypto';
import MqttClient from './node_modules/mqtt/lib/client';
import websocket from 'websocket-stream';

import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_IOT_ENDPOINT_HOST,
  AWS_REGION,
  MQTT_TOPIC
} from './credentials.json';

var client;
addLogEntry('Hello World!');

document.getElementById('connect').addEventListener('click', () => {
    client = new MqttClient(() => {
        var url = v4.createPresignedURL(
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

        addLogEntry('Connecting to URL: ' + url);
        return websocket(url, [ 'mqttv3.1' ]);
    });

    client.on('connect', () => {
        addLogEntry('Successfully connected to AWS IoT Broker!  :-)');
        client.subscribe(MQTT_TOPIC);
    });

    client.on('close', () => {
        addLogEntry('Failed to connect :-(');
        client.end();  // don't reconnect
        client = undefined;
    });

    client.on('message', (topic, message) => {
        addLogEntry('Incoming message: ' + message.toString());
    });
});

document.getElementById('send').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    addLogEntry('Outgoing message: ' + message);
    client.publish(MQTT_TOPIC, message);
});

function addLogEntry(info) {
    const newLogEntry = document.createElement('li');
    newLogEntry.textContent = '[' + (new Date()).toTimeString().slice(0, 8) + '] ' + info;

    const theLog = document.getElementById('the-log');
    theLog.insertBefore(newLogEntry, theLog.firstChild);
}
