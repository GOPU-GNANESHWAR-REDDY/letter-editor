const { google } = require('googleapis');

const uploadLetterToDrive = async (accessToken, content) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken }); // Set token manually

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    const fileMetadata = {
      name: `Letter_${Date.now()}.doc`,
      mimeType: 'application/vnd.google-apps.document',
    };

    const media = {
      mimeType: 'text/html',
      body: content, // Save content as an HTML file
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    return `https://docs.google.com/document/d/${file.data.id}`;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

module.exports = { uploadLetterToDrive };

