
jest.dontMock('../dryads');
jest.dontMock('../dryadic');

var f = require('../dryads');
var ext = require('../internals/side-effects');
var nodeWatcher = require('../node-watcher');
import {Promise} from 'bluebird';

// move this into a describe
describe('dryads', function() {

  /**
   * supply return values for mocked functions
   */
  function mockExternals() {
    var values = {
      server: {
        options: {
          host: '127.0.0.1',
          port: '57110'
        },
        mutateState: jest.genMockFunction()
      },
      lang: {
        options: {
          host: '127.0.0.1',
          port: '57120'
        }
      },
      msg: ['/hi', 'how', 2],
      nodeID: 1,
      defName: 'defName'
    };

    ext.bootServer.mockReturnValue(Promise.resolve(values.server));
    ext.bootLang.mockReturnValue(Promise.resolve(values.lang));

    ext.sendMsg.mockReturnValue({
      then: function(callback) {
        callback(values.msg);
      }
    });

    ext.nextNodeID.mockReturnValue(values.nodeID);
    nodeWatcher.nodeGo.mockReturnValue(Promise.resolve(values.nodeID));

    return values;
  }

  function fail(error) {
    console.error(error);
    // trying to force the test to be a failure
    expect(error).toBe(null);
    // throw new Error(error);
  }


  describe('synth', function() {
    pit('should resolve with a nodeID', function() {

      var values = mockExternals();

      var synth = f.synth('def', {freq: 400});
      return synth().then((nodeID) => {
        expect(nodeID).toBe(values.nodeID);
      });
    });
    // expect sendMsg to have been called
    // expect args to have been spawned
  });


  describe('compileSynthDef', function() {
    pit('should resolve with a defName', function() {

      var defName = 'defName';

      ext.interpret.mockReturnValue(Promise.resolve({result: 'some object'}));

      return f.compileSynthDef(defName, 'sc source code')().then((resolvedDefName) => {
        expect(resolvedDefName).toBe(defName);
      });
    });

    pit('should propagate a compile or runtime error in sc source code', function() {
      var defName = 'defName';

      ext.interpret.mockReturnValue(Promise.reject({error: 'some reason'}));

      return f.compileSynthDef(defName, 'sc source code')().then((resolvedDefName) => {
        expect(true).toBe(false); // should not have resolved
        expect(resolvedDefName).toBe(defName);
      }, (error) => {
        // this is to be expected
        // console.log(error, 'did error');
        return Promise.resolve(true);
      });
    });
  });
});
