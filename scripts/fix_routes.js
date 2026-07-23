const fs = require('fs');
const files = [
  'backend/routes/noteRoutes.js',
  'backend/routes/quizRoutes.js',
  'backend/routes/quizAttemptRoutes.js',
  'backend/routes/conversationRoutes.js',
  'backend/routes/historyRoutes.js',
  'backend/routes/streakRoutes.js'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('requireAuth')) {
    content = content.replace(
      'const router = express.Router();',
      'const router = express.Router();\nconst { requireAuth } = require("../middleware/auth.js");\n\nrouter.use(requireAuth);'
    );
    fs.writeFileSync(file, content);
  }
}
console.log("Done");
