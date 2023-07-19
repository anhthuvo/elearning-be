const FactorRecord = require("../../models/factor-record");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/factor/record/update/:id:
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
const updateRecord = async (req, res, next) => {
    let existingRecord;
    let updatedRecord;
    try {
        existingRecord = await FactorRecord.findOne({ _id: req.params.id });
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
        existingRecord.icon_source = req.body.icon_source
        existingRecord.value = req.body.value
        existingRecord.unit = req.body.unit
        existingRecord.start_at = req.body.start_at
        existingRecord.end_at = req.body.end_at

        updatedRecord = await existingRecord.save();
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Update record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(updatedRecord);
};

module.exports = updateRecord;
