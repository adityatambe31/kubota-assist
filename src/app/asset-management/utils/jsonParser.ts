import { Asset } from './csvParser';

export interface JsonAssetData {
  conversion_info: {
    source_file: string;
    conversion_date: string;
    total_assets: number;
    asset_types_count: number;
  };
  assets_by_type: {
    [key: string]: Array<{
      id: string;
      asset_name: string;
      department: string;
      model: string;
      user_name: string;
      serial_number: string;
      location: string;
      date_purchased?: string;
    }>;
  };
}

// Map asset types to emojis/icons
const assetTypeIcons: { [key: string]: string } = {
  'Zebra Wireless Printer Charger': '🔌',
  'Wireless': '📡',
  'WebCam': '📷',
  'VOIP devices': '☎️',
  'Virtual Machines - Test Workstations': '💻',
  'VideoConferencing System': '📹',
  'UPS': '🔋',
  'TV': '📺',
  'Training Dept': '🎓',
  'Tablets': '📱',
  'Switch': '🔀',
  'Servers': '🖥️',
  'Scanners': '📄',
  'Printers': '🖨️',
  'Monitors': '🖥️',
  'Mobile Phones': '📱',
  'Laptops': '💻',
  'Keyboards': '⌨️',
  'Docking Stations': '🔗',
  'Desktop Computers': '🖥️',
  'Cameras': '📸',
  // Add more mappings as needed
};

// Helper function to determine asset status based on data
function determineAssetStatus(assetName: string, department: string, location: string, userName: string): Asset['status'] {
  const lowerAssetName = assetName.toLowerCase();
  const lowerDepartment = department.toLowerCase();
  const lowerLocation = location.toLowerCase();
  const lowerUserName = userName.toLowerCase();

  // Check for inactive/spare status
  if (lowerDepartment.includes('spare') || lowerUserName.includes('spare')) {
    return 'Inactive';
  }

  // Check for maintenance status
  if (lowerLocation.includes('maintenance') || 
      lowerLocation.includes('repair') ||
      lowerUserName.includes('garbage')) {
    return 'Maintenance';
  }

  // Check for retired status
  if (lowerAssetName.includes('retired') || 
      lowerLocation.includes('retired') ||
      lowerUserName.includes('retired')) {
    return 'Retired';
  }

  // Check for RMA or replacement (might be maintenance)
  if (lowerAssetName.includes('rma') || 
      lowerAssetName.includes('replacement')) {
    return 'Maintenance';
  }

  // Default to Active for most assets
  return 'Active';
}

export function parseJsonAssets(jsonData: JsonAssetData): Asset[] {
  const assets: Asset[] = [];

  Object.entries(jsonData.assets_by_type).forEach(([assetType, assetList]) => {
    const icon = assetTypeIcons[assetType] || '📦'; // Default icon

    assetList.forEach((asset) => {
      const parsedAsset: Asset = {
        id: asset.id,
        assetTypeIcon: icon,
        assetName: asset.asset_name,
        department: asset.department,
        model: asset.model,
        userName: asset.user_name,
        serialNumber: asset.serial_number,
        location: asset.location,
        datePurchased: asset.date_purchased || '',
        status: determineAssetStatus(
          asset.asset_name,
          asset.department,
          asset.location,
          asset.user_name
        ),
      };

      assets.push(parsedAsset);
    });
  });

  return assets;
}

export function getAssetTypeStatistics(jsonData: JsonAssetData): { [key: string]: number } {
  const stats: { [key: string]: number } = {};
  
  Object.entries(jsonData.assets_by_type).forEach(([assetType, assetList]) => {
    stats[assetType] = assetList.length;
  });

  return stats;
}

export function getDepartmentStatistics(assets: Asset[]): { [key: string]: number } {
  const stats: { [key: string]: number } = {};
  
  assets.forEach(asset => {
    stats[asset.department] = (stats[asset.department] || 0) + 1;
  });

  return stats;
}