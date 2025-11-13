import { db, storage } from './_firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Busboy from 'busboy';
import { Buffer } from 'node:buffer'; // <-- ADD THIS LINE

// This config tells Vercel to not parse the body, so we can stream the file
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse the multipart/form-data
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, { filename, mimeType }) => {
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        files.push({
          fieldname,
          buffer: Buffer.concat(chunks), // This line needs the imported Buffer
          filename,
          mimeType,
        });
      });
    });

    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ fields, files }));

    req.pipe(busboy);
  });
}

// The main API handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // 1. Parse the incoming form data (fields and file)
    const { fields, files } = await parseMultipart(req);
    const file = files[0];

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded.' });
    }

    // 2. Upload the file to Firebase Storage
    const storagePath = `applications/${fields.jobId || 'unknown'}_${Date.now()}_${file.filename}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimeType,
    });

    const cvUrl = await getDownloadURL(storageRef);

    // 3. Save the application data (including the URL) to Firestore
    const applicationData = {
      ...fields, 
      cvUrl: cvUrl,
      storagePath: storagePath,
      submittedAt: serverTimestamp(), 
    };

    const docRef = await addDoc(collection(db, 'applications'), applicationData);

    // 4. Send a success response
    return res.status(200).json({ 
      ok: true, 
      id: docRef.id, 
      cvUrl: cvUrl 
    });

  } catch (e) {
    console.error("Apply Job Error:", e);
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ ok: false, error: message });
  }
}
