import mongoose from 'mongoose';

if (!global.StrategySchema) {
  mongoose.Promise = global.Promise;

  /**
   * Strategy schema - a particular rule for calculating shipping costs
   *
   * @constructor Strategy
   */
  global.StrategySchema = new mongoose.Schema(
    {
      name: { // map the specific function
        type: String,
      },
      display_name: { // display the particular strategy to the mapped Type
        type: String,
      },
    },
  );
}

module.exports = {
  StrategySchema: global.StrategySchema,
  Strategy: mongoose.model('Strategy', global.StrategySchema),
};
