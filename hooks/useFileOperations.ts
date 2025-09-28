
import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Shape } from '../types';

export interface ProjectData {
  version: string;
  name: string;
  createdAt: string;
  shapes: Shape[];
}

export const useFileOperations = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveProject = useCallback(async (shapes: Shape[], projectName?: string) => {
    try {
      setIsSaving(true);
      console.log('Starting project save...');

      if (!shapes || !Array.isArray(shapes)) {
        console.error('Invalid shapes data provided');
        return { success: false, error: 'Invalid shapes data' };
      }

      const projectData: ProjectData = {
        version: '1.0.0',
        name: projectName || `GRANTIC_Project_${new Date().toISOString().split('T')[0]}`,
        createdAt: new Date().toISOString(),
        shapes: shapes.map(shape => ({
          ...shape,
          selected: false // Don't save selection state
        }))
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const fileName = `${projectData.name}.grantic`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      console.log('Project saved to:', fileUri);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save GRANTIC Project',
        });
        console.log('File shared successfully');
      } else {
        console.log('Sharing not available on this platform');
      }

      return { success: true, fileName, fileUri };
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadProject = useCallback(async (): Promise<{ success: boolean; data?: ProjectData; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Starting project load...');

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('File selection cancelled');
        return { success: false, error: 'File selection cancelled' };
      }

      if (!result.assets || result.assets.length === 0) {
        console.error('No file selected');
        return { success: false, error: 'No file selected' };
      }

      const file = result.assets[0];
      console.log('Selected file:', file.name, file.uri);

      // Check if it's a .grantic file
      if (!file.name.endsWith('.grantic') && !file.name.endsWith('.json')) {
        return { success: false, error: 'Please select a .grantic or .json file' };
      }

      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      if (!fileContent || fileContent.trim() === '') {
        return { success: false, error: 'File is empty or corrupted' };
      }

      let projectData: ProjectData;
      try {
        projectData = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return { success: false, error: 'Invalid JSON format in file' };
      }

      // Validate the project data structure
      if (!projectData || typeof projectData !== 'object') {
        return { success: false, error: 'Invalid project file format' };
      }

      if (!projectData.shapes || !Array.isArray(projectData.shapes)) {
        return { success: false, error: 'Invalid project file format - missing shapes array' };
      }

      console.log('Project loaded successfully:', projectData.name || 'Unnamed Project');
      return { success: true, data: projectData };
    } catch (error) {
      console.error('Error loading project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project file';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportProject = useCallback(async (shapes: Shape[], projectName?: string) => {
    try {
      console.log('Starting project export...');

      if (!shapes || !Array.isArray(shapes)) {
        console.error('Invalid shapes data provided for export');
        return { success: false, error: 'Invalid shapes data' };
      }

      const projectData: ProjectData = {
        version: '1.0.0',
        name: projectName || `GRANTIC_Export_${new Date().toISOString().split('T')[0]}`,
        createdAt: new Date().toISOString(),
        shapes: shapes.map(shape => ({
          ...shape,
          selected: false
        }))
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const fileName = `${projectData.name}.grantic`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export GRANTIC Project',
        });
        console.log('Project exported successfully');
        return { success: true, fileName };
      } else {
        console.log('Sharing not available');
        return { success: false, error: 'Sharing not available on this platform' };
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const saveAsFile = useCallback(async (shapes: Shape[], fileName?: string) => {
    try {
      setIsSaving(true);
      console.log('Starting save as file...');

      if (!shapes || !Array.isArray(shapes) || shapes.length === 0) {
        return { success: false, error: 'No shapes to save' };
      }

      const projectData: ProjectData = {
        version: '1.0.0',
        name: fileName || `GRANTIC_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        shapes: shapes.map(shape => ({
          ...shape,
          selected: false
        }))
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const finalFileName = `${projectData.name}.grantic`;
      const fileUri = `${FileSystem.cacheDirectory}${finalFileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      console.log('File saved to:', fileUri);

      // Automatically share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save GRANTIC Project As...',
        });
        console.log('File shared for saving');
      } else {
        console.log('Sharing not available on this platform');
      }

      return { success: true, fileName: finalFileName, fileUri };
    } catch (error) {
      console.error('Error in save as file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save file';
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveProject,
    loadProject,
    exportProject,
    saveAsFile,
    isSaving,
    isLoading,
  };
};
