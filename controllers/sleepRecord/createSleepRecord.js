const SleepRecord = require("../../models/sleep-record");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/sleep/record/submit:
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
const submitSleepRecord = async (req, res, next) => {
  const { userId } = req.userData;

  let sleepRecord;
  try {
    sleepRecord = new SleepRecord({
      confidence: req.body.confidence,
      motion: req.body.motion,
      light: req.body.light,
      time: req.body.time,
      user: userId,
    });
    await sleepRecord.save();
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Submit record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(factorRecord);
};

module.exports = submitSleepRecord;
