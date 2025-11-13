import { db } from './_firebase.js'; // Use our existing Firebase helper
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

/**
 * Helper function to safely format a string for a CSV cell.
 * It wraps the string in double quotes and escapes any existing double quotes.
 */
function escapeCSV(str) {
  const stringValue = String(str || ''); // Ensure value is a string
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape double quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return stringValue;
}

export default async function handler(req, res) {
  // We could add admin-checking logic here, but for simplicity,
  // we'll rely on the admin panel being the only thing that knows this URL.

  try {
    // 1. Define the headers for our CSV file
    const headers = [
      'SubmittedDate',
      'ApplicantName',
      'Email',
      'Phone',
      'JobTitle',
      'Company',
      'Location',
      'JobType',
      'CV_Link'
    ];
    
    // Start the CSV content with the header row
    let csvContent = headers.join(',') + '\n';

    // 2. Fetch all documents from the "applications" collection in Firestore
    const applicationsRef = collection(db, 'applications');
    // Order by submission date, newest first
    const q = query(applicationsRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    // 3. Loop through each document and build a CSV row
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert timestamp to a readable ISO date string
      const submittedDate = data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : 'N/A';

      // Create an array for the row, ensuring order matches headers
      const row = [
        submittedDate,
        escapeCSV(data.name),
        escapeCSV(data.email),
        escapeCSV(data.phone),
        escapeCSV(data.jobTitle),
        escapeCSV(data.company),
        escapeCSV(data.location),
        escapeCSV(data.type),
        escapeCSV(data.cvUrl) // This is the direct link to the CV in Firebase Storage
      ];
      
      // Add the new row to our CSV content
      csvContent += row.join(',') + '\n';
    });

    // 4. Set the response headers to trigger a file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="job_fair_applications.csv"');
    
    // 5. Send the CSV content as the response
    res.status(200).send(csvContent);

  } catch (e) {
    console.error("Export Applications Error:", e);
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ ok: false, error: 'Failed to export data.', details: message });
  }
}
