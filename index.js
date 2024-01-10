const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const {render} = require("ejs");

const app = express();
const memoryStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(session({
    secret: 'BQyAeqIkZPhQaOqFTGD3fNdYyzfI0Yiv',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

const keycloak = new Keycloak({
    store: memoryStore,
});

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
}));

app.get('/', (req, res) => res.redirect('/home'));

const parseToken = raw => {
    if (!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];

        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.error('Error while parsing token: ', e);
    }
};

app.get('/', (req, res) => {
    console.log('Index page');
    if (req.session['keycloak-token']) {
        return res.redirect('/home');
    } else {
        return res.redirect('/login');
    }
})


app.get('/home', keycloak.protect(), (req, res, next) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('home', {
        user: embedded_params,
        details: details,

    });
});

app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
});

//Route pour lire UE01
app.get('/ue01', keycloak.enforcer(['ue-01:lecture1'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.render('ue01');
});

//Route pour lire UE02
app.get('/ue02', keycloak.enforcer(['ue-02:lecture2'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.render('ue02');
});

//Route pour lire UE03
app.get('/ue03', keycloak.enforcer(['ue-03:lecture3'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.render('ue03');
});

//Route pour ecrire dans UE01
app.get('/ue01/ecrire', keycloak.enforcer(['ue-01:ecriture1'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});

//Route pour ecrire dans UE02
app.get('/ue02/ecrire', keycloak.enforcer(['ue-02:ecriture2'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});

//Route pour ecrire dans UE03
app.get('/ue03/ecrire', keycloak.enforcer(['ue-03:ecriture3'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});

//Route pour valider UE01
app.get('/ue01/valider', keycloak.enforcer(['ue-01:valider1'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});

//Route pour valider UE02
app.get('/ue02/valider', keycloak.enforcer(['ue-02:valider2'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});

//Route pour valider UE03
app.get('/ue03/valider', keycloak.enforcer(['ue-03:valider3'], {
    resource_server_id: 'my-app'
}), (req, res) => {
    return res.status(200).end('success');
});



app.use((req, res, next) => {
    return res.status(404).end('Not Found');
});

app.use((err, req, res, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal Server Error');
});

const server = app.listen(3000, '127.0.0.1', () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Application running at http://%s:%s', host, port);
});