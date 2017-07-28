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

let client;
addLogEntry('Hello World!');

function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
}

$('form#connect').on('submit', () => {
    if(!isAuthenticated()) {
        console.log("not authenticated" );
    };
    console.log("is authenticated" );

    $('form#connect button[type="submit"]').prop('disabled', true);

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

        $('form#input').show();
        $('section#output').show();
    });

    client.on('close', () => {
        addLogEntry('Failed to connect :-(');
        if( client != undefined ) {
            client.end(); // don't reconnect
            client = undefined;
        }
    });

    client.on('message', (topic, message) => {
        addLogEntry('Incoming message: ' + message.toString());
    });

    return false;
});

$('form#input').on('submit', () => {
    const message = $('#message').val();
    addLogEntry('Outgoing message: ' + message);
    client.publish(MQTT_TOPIC, message);
    $('#message').val('');
    return false;
});

function addLogEntry(info) {
    const newLogEntry = document.createElement('li');
    newLogEntry.textContent = '[' + (new Date()).toTimeString().slice(0, 8) + '] ' + info;

    const theLog = document.getElementById('the-log');
    theLog.insertBefore(newLogEntry, theLog.firstChild);
}

window.addEventListener('load', function() {
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid',
    leeway: 60
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');

  // buttons and event listeners
  var homeViewBtn = document.getElementById('btn-home-view');
  var loginBtn = document.getElementById('btn-login');
  var logoutBtn = document.getElementById('btn-logout');

  var connectBtn = document.getElementById('btn-connect');
  var    sendBtn = document.getElementById('btn-send');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    loginView.style.display = 'none';
  });

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
    client = undefined;
    displayButtons();
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        setSession(authResult);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        homeView.style.display = 'inline-block';
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
      connectBtn.style.display = 'inline-block';
      sendBtn.style.display = 'inline-block';
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
      connectBtn.style.display = 'none';
      sendBtn.style.display = 'none';
    }
  }

  handleAuthentication();
});
