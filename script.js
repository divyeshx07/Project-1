// === CONFIGURE THESE ===
const S3_BUCKET = 'your-s3-bucket-name';  // Bucket where image will be uploaded
const REGION = 'your-region';             // e.g., us-east-1
const API_URL = 'https://your-api-id.execute-api.region.amazonaws.com/prod/analyze'; // API Gateway URL

// AWS SDK Setup
AWS.config.region = REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'your-identity-pool-id', // if using Cognito, else skip auth
});

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

async function uploadAndAnalyze() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return alert('Please select an image.');

  const key = Date.now() + "_" + file.name;

  // Upload image to S3
  const uploadParams = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: file.type,
  };

  try {
    document.getElementById("result").innerHTML = "Uploading image...";
    
    await s3.upload(uploadParams).promise();

    document.getElementById("preview").src = URL.createObjectURL(file);

    // Call backend API to analyze
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ bucket: S3_BUCKET, image_key: key }),
    });

    const data = await response.json();

    // Display detected emotions
    if (Array.isArray(data.body)) {
      const emotions = data.body.map(item => {
        return ${item.Type} (${Math.round(item.Confidence)}%);
      }).join('<br>');
      document.getElementById('result').innerHTML = <strong>Detected Emotions:</strong><br>${emotions};
    } else {
      document.getElementById('result').innerText = 'No face detected or invalid response.';
    }

  } catch (err) {
    console.error(err);
    alert('Error during upload or analysis. See console.');
  }
}