const SleepSummary = require("../../models/sleep-summary");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/sleep/summary/submit:
 *   post:
 *     summary: submit factor record
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               confidence:
 *                  type: int
 *               motion:
 *                 type: int
 *               light:
 *                 type: int
 *               time:
 *                 type: date
 *             example:   # Sample object
 *               confidence: 85
 *               motion: 1
 *              light: 1
 *               time: 2023-07-10T23:19:13.146+00:00
 *     responses:
 *          '200':
 *              description: OK
 */
const submitSleepSummary = async (req, res, next) => {
  const { userId } = req.userData;

  let sleepSummary;
  try {
    sleepSummary = new SleepSummary({
      self_assessment: req.body.self_assessment,
      latency: req.body.latency,
      duration: req.body.duration,
      efficiency: req.body.efficiency,
      overall_score: req.body.overall_score,
      in_bed_at: req.body.in_bed_at,
      sleep_at: req.body.sleep_at,
      wakeup_at: req.body.wakeup_at,
      wakeup_time: req.body.wakeup_time,
      user: userId,
    });
    await sleepSummary.save();
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Submit record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(factorRecord);
};

module.exports = submitSleepSummary;
