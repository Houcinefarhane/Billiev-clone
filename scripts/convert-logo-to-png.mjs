import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public', 'logo-billieve.svg');
const pngPath = join(projectRoot, 'public', 'logo-billieve.png');

async function convertSvgToPng() {
  try {
    console.log('Conversion du SVG en PNG...');
    
    // Lire le SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convertir en PNG avec les dimensions désirées (1200x450px comme défini dans Logo.tsx)
    await sharp(svgBuffer)
      .resize(1200, 450, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Fond transparent
      })
      .png()
      .toFile(pngPath);
    
    console.log(`✅ PNG créé : ${pngPath}`);
    console.log('Dimensions : 1200x450px');
  } catch (error) {
    console.error('❌ Erreur lors de la conversion :', error);
    process.exit(1);
  }
}

convertSvgToPng();

