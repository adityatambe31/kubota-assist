export interface Asset {
  id: string;
  assetTypeIcon: string;
  assetName: string;
  department: string;
  model: string;
  userName: string;
  serialNumber: string;
  location: string;
  datePurchased: string;
  // Computed field for status based on data analysis
  status?: "Active" | "Inactive" | "Maintenance" | "Retired";
}

export function parseCSV(csvText: string): Asset[] {
  const lines = csvText.trim().split("\n");

  if (lines.length === 0) {
    return [];
  }

  // Get headers (first line)
  const headers = lines[0].split(",").map((header) => header.trim());

  // Parse data lines
  const assets: Asset[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((value) => value.trim().replace(/"/g, ""));

    if (values.length >= 8) {
      // At least 8 columns required
      const asset: Asset = {
        assetTypeIcon: values[0] || "",
        id: values[1] || "",
        assetName: values[2] || "",
        department: values[3] || "",
        model: values[4] || "",
        userName: values[5] || "",
        serialNumber: values[6] || "",
        location: values[7] || "",
        datePurchased: values[8] || "",
        // Determine status based on asset name or other criteria
        status: determineAssetStatus(values[2], values[3], values[7]),
      };

      assets.push(asset);
    }
  }

  return assets;
}

// Helper function to determine asset status based on available data
function determineAssetStatus(
  assetName: string,
  department: string,
  location: string
): Asset["status"] {
  // Simple logic to assign status - you can modify this based on your business rules
  if (
    assetName.toLowerCase().includes("spare") ||
    location.toLowerCase().includes("spare")
  ) {
    return "Inactive";
  }

  if (
    location.toLowerCase().includes("maintenance") ||
    location.toLowerCase().includes("repair")
  ) {
    return "Maintenance";
  }

  if (
    assetName.toLowerCase().includes("retired") ||
    location.toLowerCase().includes("retired")
  ) {
    return "Retired";
  }

  // Default to Active for most assets
  return "Active";
}

export function validateAsset(asset: Partial<Asset>): asset is Asset {
  return !!(
    asset.id &&
    asset.assetName &&
    asset.department &&
    asset.model &&
    asset.userName &&
    asset.serialNumber &&
    asset.location &&
    asset.datePurchased
  );
}
