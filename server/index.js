import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Crear directorios si no existen
const uploadsDir = path.join(__dirname, 'uploads');
const vehiculosDir = path.join(uploadsDir, 'vehiculos');
const docsDir = path.join(uploadsDir, 'docs');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(vehiculosDir)) fs.mkdirSync(vehiculosDir);
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

// Configurar storage de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'documentoPdf') {
      cb(null, docsDir);
    } else {
      cb(null, vehiculosDir);
    }
  },
  filename: function (req, file, cb) {
    // Sanitizar nombre de archivo
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uuidv4()}_${safeName}`);
  }
});

const upload = multer({ storage: storage });

// Servir archivos estáticamente
app.use('/uploads', express.static(uploadsDir));

// Endpoint para subir archivos
// Puede recibir múltiples fotos (campo 'fotos') y un documento (campo 'documentoPdf')
app.post('/upload', upload.fields([
  { name: 'fotos', maxCount: 20 },
  { name: 'documentoPdf', maxCount: 1 }
]), (req, res) => {
  try {
    const urlsFotos = [];
    let urlDocumento = null;

    if (req.files['fotos']) {
      req.files['fotos'].forEach(file => {
        urlsFotos.push(`http://localhost:${PORT}/uploads/vehiculos/${file.filename}`);
      });
    }

    if (req.files['documentoPdf'] && req.files['documentoPdf'].length > 0) {
      urlDocumento = `http://localhost:${PORT}/uploads/docs/${req.files['documentoPdf'][0].filename}`;
    }

    res.json({ success: true, fotos: urlsFotos, documento: urlDocumento });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ success: false, error: 'Failed to upload files' });
  }
});

app.listen(PORT, () => {
  console.log(`Local file server running at http://localhost:${PORT}`);
});
