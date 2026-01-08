import { readFileSync } from 'fs';
import path from 'path';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const dependencyName = 'expo-location';
const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
  const fileContents = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(fileContents) as PackageJson;
  const dependencyVersion = packageJson.dependencies?.[dependencyName] ?? packageJson.devDependencies?.[dependencyName];

  if (!dependencyVersion) {
    console.log(`[expo-location] ${dependencyName} is not listed in dependencies or devDependencies.`);
  } else {
    console.log(`[expo-location] Declared range: ${dependencyVersion}`);
  }
} catch (error) {
  console.error('[expo-location] Failed to read package.json', error);
}
