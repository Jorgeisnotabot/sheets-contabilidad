import * as fs from 'fs/promises';
import * as path from 'path';
import { main } from '../src/utils/xml-parser'; 


describe('main function', () => {
    const projectRoot = path.resolve(__dirname, '..');
    const inputDir = path.join(projectRoot, 'input');
    let testFilePath: string;
  
    beforeAll(async () => {
      // Ensure the input directory exists
      await fs.mkdir(inputDir, { recursive: true });
  
      // Find an XML file in the input directory
      const files = await fs.readdir(inputDir);
      const xmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.xml');
  
      if (xmlFiles.length === 0) {
        throw new Error('No XML files found in the input folder');
      }
  
      // Use the first XML file found for testing
      testFilePath = path.join(inputDir, xmlFiles[0]);
    });
  
    // it('should parse an actual XML file in the input directory', async () => {
    //   const parseCFDI = jest.fn().mockResolvedValue({ parsed: 'data' });
    //   jest.doMock('../utils/your-parser-module', () => ({ parseCFDI }));
  
    //   console.log = jest.fn();
  
    //   await main();
  
    //   expect(fs.readdir).toHaveBeenCalledWith(inputDir);
    //   expect(fs.readFile).toHaveBeenCalledWith(testFilePath, 'utf-8');
    //   expect(parseCFDI).toHaveBeenCalledWith(expect.any(String));
    //   expect(console.log).toHaveBeenCalledWith(JSON.stringify({ parsed: 'data' }, null, 2));
    // });
  
    // it('should handle errors during XML parsing', async () => {
    //   const parseCFDI = jest.fn().mockRejectedValue(new Error('Parsing error'));
    //   jest.doMock('../utils/your-parser-module', () => ({ parseCFDI }));
  
    //   console.error = jest.fn();
  
    //   await main();
  
    //   expect(console.error).toHaveBeenCalledWith('Error parsing CFDI:', expect.any(Error));
    // });
  });