const express = require('express');
const { authenticateToken, requireVerifiedEmail } = require('../middleware/auth');
const { createSubmission, listUserSubmissions, getSubmissionDetail } = require('../services/submissions');
const { logAudit } = require('../services/audit');

const router = express.Router();

router.post('/', authenticateToken, requireVerifiedEmail, async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_INPUT',
        message: 'payload is required.'
      });
    }

    const submission = await createSubmission({
      user: req.user,
      payload
    });

    await logAudit({
      userId: req.user.id,
      action: 'submit_benchmark',
      entityType: 'submission',
      entityId: String(submission.id),
      metadata: { benchmark_id: submission.benchmark.id }
    });

    res.status(201).json({
      success: true,
      submission,
      message: 'Submission received. Results are pending until the benchmark is published.'
    });
  } catch (error) {
    await logAudit({
      userId: req.user.id,
      action: 'submission_validation_failed',
      entityType: 'submission',
      metadata: { error_code: error.errorCode, message: error.message }
    });

    res.status(error.status || 400).json({
      success: false,
      error_code: error.errorCode || 'SUBMISSION_FAILED',
      message: error.message
    });
  }
});

router.get('/my', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    submissions: await listUserSubmissions(req.user.id)
  });
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const submission = await getSubmissionDetail(req.params.id, req.user);
    res.json({ success: true, submission });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      error_code: error.errorCode || 'SUBMISSION_FAILED',
      message: error.message
    });
  }
});

module.exports = router;
