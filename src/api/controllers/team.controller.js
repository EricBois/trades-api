const Team = require('../models/team.model');

exports.get = async (req, res, next) => {
  try {
    const team = await Team.findOne({ user: req.user.sub });
    if (!team) {
      await (new Team({ user: req.user.sub })).save();
    }
    res.json(team);
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const team = await Team.findOneAndUpdate({ user: req.user.sub },
      { $push: { team: req.body.team } },
      { safe: true, upsert: true, new: true });
    res.json(team);
  } catch (e) {
    next(e);
  }
};