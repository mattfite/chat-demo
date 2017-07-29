import v4 from 'aws-signature-v4';
import crypto from 'crypto';
import { MqttClient } from 'mqtt';
import websocket from 'websocket-stream';

import {
    AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY,
    AWS_IOT_ENDPOINT_HOST,
    AWS_REGION,
    MQTT_TOPIC,
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN
} from '../credentials.json';

var AUTH0_CALLBACK_URL=location.href;

import $ from 'jquery';

function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
}

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

$(function(){
    console.log('loaded');

    var webAuth = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        redirectUri: AUTH0_CALLBACK_URL,
        audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
        responseType: 'token id_token',
        scope: 'openid',
        leeway: 60
    });

    var loginStatus = document.getElementById('status');
    var    loginBtn = document.getElementById('btn-login');
    var   logoutBtn = document.getElementById('btn-logout');
    var     sendBtn = document.getElementById('btn-send');

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        webAuth.authorize();
    });

    logoutBtn.addEventListener('click', logout);

    function setSession(authResult) {
        // Set the time that the access token will expire at
        var expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
    }

    function logout() {
        // Remove tokens and expiry time from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        client.end();
        displayButtons();
    }

    function handleAuthentication() {
        webAuth.parseHash(function(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                setSession(authResult);
                loginBtn.style.display = 'none';
            } else if (err) {
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    function displayButtons() {
        if (isAuthenticated()) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            loginStatus.innerHTML = 'You are logged in!';
            sendBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            loginStatus.innerHTML =
            'You are not logged in! Please log in to continue.';
            sendBtn.style.display = 'none';
        }
    }

    handleAuthentication();
});
