const SleepSummary = require("../../models/sleep-summary");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/sleep/summary/update/:id:
 *   post:
 *     summary: submit factor record
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               icon_source:
 *                  type: string
 *               value:
 *                 type: string
 *               unit:
 *                 type: string
 *             example:   # Sample object
 *               email: admin@gmail.com
 *               password: admin@123
 *     responses:
 *          '200':
 *              description: OK
 */
const updateSleepSummary = async (req, res, next) => {
    let existingRecord;
    let updatedRecord;
    try {
        existingRecord = await SleepSummary.findOne({ _id: req.params.id });
    }
    catch (err) {
        const error = new HttpError(
            'Failed to update Record information',
            500
        );
        return next(error);
    }

    if (!existingRecord) {
        return next(new HttpError(
            'No Record exist with this id ' + req.params.id,
            404
        ));
    }

    try {
        existingRecord.self_assessment = req.body.self_assessment
        existingRecord.latency = req.body.latency
        existingRecord.duration = req.body.duration
        existingRecord.efficiency = req.body.efficiency
        existingRecord.overall_score = req.body.overall_score
        existingRecord.in_bed_at = req.body.in_bed_at,
        existingRecord.sleep_at = req.body.sleep_at,
        existingRecord.wakeup_at = req.body.wakeup_at,
        existingRecord.wakeup_time = req.body.wakeup_time,

        updatedRecord = await existingRecord.save();
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Update record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(updatedRecord);
};

module.exports = updateSleepSummary;
