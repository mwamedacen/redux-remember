import * as actionTypes from '../action-types';

describe('index.js', () => {
    let mockRehydrate;
    let mockInit;
    let index;
    let reduxRemember;

    beforeEach(() => {
        mockRehydrate = {
            rehydrateReducer: spy(() => 'REHYDRATE_REDUCER')
        };

        mockInit = spy(() => {});

        jest.mock('../rehydrate', () => mockRehydrate);
        jest.mock('../init', () => mockInit);

        index = require('../index');

        reduxRemember = (...args) => index.default(
            ...args
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('exports proper items', () => {
        index.REMEMBER_REHYDRATED.should.equal(
            actionTypes.REMEMBER_REHYDRATED
        );

        index.REMEMBER_PERSISTED.should.equal(
            actionTypes.REMEMBER_PERSISTED
        );

        index.rememberReducer.should.be.a(
            'function'
        );

        index.rememberEnhancer.should.be.a(
            'function'
        );
    });

    describe('rememberReducer()', () => {
        let mockReducer;

        const exec = (state, action) => index.rememberReducer(
            mockReducer
        )(state, action);

        beforeEach(() => {
            mockReducer = spy((state, action) => state);
        });

        it('does not break when state and action are empty', () => {
            exec(undefined, undefined).should.eql(
                {}
            );
        });

        it('returns preloaded state', () => {
            const state = { 'cool': 'state' };

            exec(state, { type: '@@INIT' }).should.eql(
                state
            );

            exec(state, { type: '@@redux/INIT.12345' }).should.eql(
                state
            );
        });

        it('returns rehydrated state', () => {
            const payload = {
                wow: 'beep',
                nah: 'lol'
            };

            exec(
                null,
                {
                    type: actionTypes.REMEMBER_REHYDRATED,
                    payload
                }
            )
            .should.eql(payload);
        });

        it('does not fail if there is missing payload', () => {
            exec(
                null,
                { type: actionTypes.REMEMBER_REHYDRATED }
            )
            .should.eql({});
        });
    });

    describe('rememberEnhancer()', () => {
        it('throws when no driver', () => {
            expect(() => index.rememberEnhancer()).to.throw(
                Error,
                'redux-remember error: driver required'
            );
        });

        it('throws when rememberedKeys is not an array', () => {
            expect(() => index.rememberEnhancer('driver1')).to.throw(
                Error,
                'redux-remember error: rememberedKeys needs to be an array'
            );
        });

        it('calls createStore function and returns its result', () => {
            const store = 'dummy store!!!';
            const createStore = spy(() => store);

            const rootReducer = 'dummyRootReducer';
            const initialState = 'dummyInitialState';
            const enhancer = 'dummyEnhancer';

            const res = index.rememberEnhancer('driver2', [])(createStore)(
                rootReducer, initialState, enhancer
            );

            createStore.should.be.calledWith(
                rootReducer, initialState, enhancer
            );

            res.should.equal(store);
        });

        it('calls init()', () => {
            const store = 'the store!!!';
            const driver = 'driver3';
            const rememberedKeys = [ 'zz', 'bb', 'kk' ];

            const rootReducer = 'the root of the reducers';
            const initialState = 'yup, initial state';
            const enhancer = 'another enhancer';

            const opts = {
                prefix: '@@yay!',
                persistThrottle: 432,
                serialize: 'so cool',
                persistWholeStore: true,
                unserialize: 'i am passed'
            };

            index.rememberEnhancer(driver, rememberedKeys, opts)(() => store)(
                rootReducer, initialState, enhancer
            );

            mockInit.should.be.calledWith(
                store,
                rememberedKeys,
                { driver, ...opts }
            )
        });
    });
});
