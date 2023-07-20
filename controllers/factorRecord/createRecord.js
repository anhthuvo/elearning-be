const FactorRecord = require("../../models/factor-record");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/factor/record/submit:
 *   post:
 *     summary: submit factor record
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               password:
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *             example:   # Sample object
 *               email: admin@gmail.com
 *               password: admin@123
 *     responses:
 *          '200':
 *              description: OK
 */
const submitRecord = async (req, res, next) => {
  const { userId } = req.userData;

  let factorRecord;
  try {
    factorRecord = new FactorRecord({
      icon_source: req.body.icon_source,
      value: req.body.value,
      unit: req.body.unit,
      start_at: req.body.start_at,
      end_at: req.body.end_at,
      user: userId,
    });
    await factorRecord.save();
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Submit record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(factorRecord);
};

module.exports = submitRecord;
