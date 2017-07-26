// refer to: http://eslint.org/docs/user-guide/

module.exports = {
    extends: 'eslint:recommended',

    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },

    env: {
        browser: true,
        es6: true,
        node: true
    },

    rules: {
        'indent':     [ 'error', 4 ],
        'quotes':     [ 'error', 'single' ],
        'semi':       [ 'error', 'always' ],
        'no-console': [ 'off' ]
    }
};
