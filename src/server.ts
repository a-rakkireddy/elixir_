import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation Swagger: http://localhost:${PORT}/api-docs`);
});
