const Team = require('../models/team.model');

exports.get = async (req, res, next) => {
  try {
    const team = await Team.findOne({ user: req.user.sub });
    if (!team) {
      const newTeam = await (new Team({ user: req.user.sub })).save();
      return res.json(newTeam);
    }
    res.json(team);
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const team = await Team.findOneAndUpdate({ user: req.user.sub },
      { $set: { team: req.body.team } },
      { safe: true, upsert: true, new: true });
    res.json(team);
  } catch (e) {
    next(e);
  }
};