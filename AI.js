var P = require('./Person');
var F = require('./_FUNCTION.js');

/**
 * AI玩家
 */
var AI = () => {
    var ai = new P(F.RandomId(), null);
    ai.IAmAI();
    return ai;
}

module.exports = AI;