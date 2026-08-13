const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

const router = express.Router();

// Store files in memory (buffer) before uploading to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and PDF files are allowed.'));
    }
  },
});

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/upload/prescription
 * Accepts multipart form-data with a "file" field.
 * Uploads to Supabase Storage "prescriptions" bucket and returns the public URL.
 */
router.post('/prescription', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Build a unique path: userId/timestamp-originalname
    const ext = req.file.originalname.split('.').pop();
    const fileName = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Debug: list all existing buckets in Supabase project
    const { data: allBuckets, error: listError } = await supabase.storage.listBuckets();
    console.log('📦 Existing Supabase Storage Buckets:', allBuckets?.map(b => ({ name: b.name, public: b.public })));
    if (listError) console.error('Error listing buckets:', listError);

    // Ensure the 'prescriptions' bucket exists
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('prescriptions');
    if (bucketError || !bucket) {
      const { error: createError } = await supabase.storage.createBucket('prescriptions', {
        public: true,
      });
      if (createError && !createError.message.includes('already exists')) {
        console.error('Failed to auto-create prescriptions bucket:', createError);
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Storage upload failed.' });
    }

    // Generate signed URL (valid for 10 years) so it works regardless of whether bucket is public or private
    const { data: signedData, error: signedError } = await supabase.storage
      .from('prescriptions')
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);

    // Fallback to public URL if signed URL creation fails
    const publicUrl = supabase.storage.from('prescriptions').getPublicUrl(data.path).data.publicUrl;
    const finalUrl = signedData?.signedUrl || publicUrl;

    console.log('✅ Prescription Upload Successful! Final URL:', finalUrl);

    res.status(201).json({
      success: true,
      file_url: finalUrl,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
